/**
 * api.client.ts
 *
 * Two Axios client factories for the ERPNext / Frappe backend:
 *
 *   getPublicApiClient()  — unauthenticated, for whitelisted catalogue APIs
 *   getAuthApiClient()    — session-based auth (withCredentials: true), for all
 *                           cart, order, customer, and payment operations.
 *
 * The base URL is read from store.config.ts. When running on localhost the
 * Vite dev-server proxy handles the path (/api/*) so baseURL is left empty.
 *
 * CSRF note: Frappe requires the X-Frappe-CSRF-Token header on all mutating
 * (POST/PUT/DELETE) requests when using session cookies. We read the token
 * from /api/method/frappe.auth.get_csrf_token and cache it for the session.
 */

import axios, { AxiosInstance } from 'axios';
import { STORE_CONFIG } from '../config/store.config';

// ─── CSRF Token Cache ────────────────────────────────────────────────────────
let _csrfToken: string | null = null;

const fetchCsrfToken = async (): Promise<string> => {
  if (_csrfToken) return _csrfToken;
  try {
    const res = await axios.get(
      `${getBaseURL()}/api/method/frappe.auth.get_csrf_token`,
      { withCredentials: true }
    );
    _csrfToken = res.data?.csrf_token || res.data?.message?.csrf_token || '';
  } catch {
    _csrfToken = '';
  }
  return _csrfToken || '';
};

/** Invalidate the cached CSRF token (call after login/logout). */
export const clearCsrfToken = () => { _csrfToken = null; };

// ─── Base URL ────────────────────────────────────────────────────────────────
const getBaseURL = (): string => {
  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';
  return isLocalhost ? '' : STORE_CONFIG.erpnextUrl;
};

// ─── Request retry helper ────────────────────────────────────────────────────
const withRetry = (client: AxiosInstance, MAX_RETRIES = 2) => {
  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      const { config, response } = error;
      // Don't retry 4xx client errors — they're definitive
      if (response && response.status >= 400 && response.status < 500) {
        return Promise.reject(error);
      }
      if (!config) return Promise.reject(error);
      config.retryCount = config.retryCount || 0;
      if (config.retryCount < MAX_RETRIES) {
        config.retryCount += 1;
        const delay = Math.pow(2, config.retryCount) * 500;
        await new Promise((r) => setTimeout(r, delay));
        return client(config);
      }
      return Promise.reject(error);
    }
  );
};

// ─── PUBLIC client ───────────────────────────────────────────────────────────
/**
 * Used for whitelisted ERPNext APIs that require NO authentication.
 * Covers: products, categories, brands, images, and public catalogue data.
 */
export const getPublicApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: getBaseURL(),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    withCredentials: false,
    timeout: 15000,
  });
  withRetry(client);
  return client;
};

// ─── AUTHENTICATED client ────────────────────────────────────────────────────
/**
 * Used for all operations requiring a logged-in customer session:
 * cart, orders, payments, addresses, profile, loyalty points, etc.
 *
 * Authentication is entirely session/cookie-based (Frappe's sid cookie set
 * after calling /api/method/login). No API key or secret is stored here.
 *
 * CSRF tokens are fetched once and cached, then attached to every mutating
 * request automatically via a request interceptor.
 */
export const getAuthApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: getBaseURL(),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    withCredentials: true,   // ← sends the Frappe sid session cookie
    timeout: 30000,
  });

  // Attach CSRF token to every mutating request
  client.interceptors.request.use(async (config) => {
    const method = (config.method || '').toLowerCase();
    if (method === 'post' || method === 'put' || method === 'delete' || method === 'patch') {
      const csrf = await fetchCsrfToken();
      if (csrf) {
        config.headers = config.headers || {};
        config.headers['X-Frappe-CSRF-Token'] = csrf;
      }
    }
    return config;
  });

  // On 401/403 clear the cached CSRF token so next login will fetch a fresh one
  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      const { response } = error;
      if (response && (response.status === 401 || response.status === 403)) {
        clearCsrfToken();
        return Promise.reject(error);
      }
      return Promise.reject(error);
    }
  );

  withRetry(client, 1); // fewer retries for auth calls
  return client;
};

// ─── Deprecated alias ────────────────────────────────────────────────────────
/** @deprecated Use getPublicApiClient() or getAuthApiClient() */
export const getApiClient = getPublicApiClient;

// ─── Latency simulation (mock mode only) ─────────────────────────────────────
export const simulateLatency = <T>(data: T, delay = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), delay));

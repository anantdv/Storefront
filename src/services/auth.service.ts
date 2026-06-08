/**
 * auth.service.ts
 *
 * Uses Frappe's standard authentication endpoints.
 * All calls use withCredentials: true so the session cookie is
 * stored and automatically forwarded on every subsequent request.
 *
 * Endpoints:
 *   POST /api/method/login                  — standard Frappe login → sets sid cookie
 *   POST /api/method/logout                 — invalidates the session server-side
 */

import { STORE_CONFIG } from '../config/store.config';
import { getAuthApiClient, clearCsrfToken, simulateLatency } from './api.client';
import { MOCK_USER } from './mockData';
import { UserProfile } from '../types/shop.types';

// ─── Frappe error extractor ────────────────────────────────────────────────────────
const extractAuthError = (err: any): string => {
  const data = err?.response?.data;
  if (data) {
    if (data._server_messages) {
      try {
        const msgs: string[] = JSON.parse(data._server_messages);
        const parsed = msgs
          .map((m: string) => { try { return JSON.parse(m).message; } catch { return m; } })
          .filter(Boolean);
        if (parsed.length > 0) return parsed.join(' | ');
      } catch { /* fall through */ }
    }
    if (data.message && typeof data.message === 'string') return data.message;
    if (data.exception && typeof data.exception === 'string') {
      return data.exception.split('\n').find((l: string) => l.trim()) || data.exception;
    }
  }
  return err?.message || 'Authentication failed. Please try again.';
};

export const authService = {

  /**
   * Log in using Frappe's standard /api/method/login.
   * On success, Frappe sets the `sid` session cookie (withCredentials ensures
   * the browser stores and forwards it on all future requests).
   */
  async login(email: string, password?: string): Promise<{ token: string; user: UserProfile }> {
    if (STORE_CONFIG.useMock) {
      if (email.includes('error')) throw new Error('Invalid email or password');
      return simulateLatency({
        token: `mock-jwt-token-${Math.random().toString(36).slice(2)}`,
        user: { ...MOCK_USER, email, name: email.split('@')[0].toUpperCase() },
      });
    }

    const client = getAuthApiClient();

    // Standard Frappe login — sets the session sid cookie automatically
    try {
      await client.post('/api/method/login', {
        usr: email,   // Frappe uses 'usr', not 'email'
        pwd: password,
      });
      // New session → clear cached CSRF so next POST fetches a fresh token
      clearCsrfToken();
    } catch (err: any) {
      throw new Error(extractAuthError(err));
    }

    // Resolve display name from User doctype
    let name = email.split('@')[0];
    try {
      const detailRes = await client.get(`/api/resource/User/${email}`);
      const d = detailRes.data?.data;
      if (d) name = d.full_name || d.first_name || name;
    } catch (e) {
      console.warn('Could not fetch User profile, using email prefix as name:', e);
    }

    // Try to fetch loyalty points from the linked Customer record
    let loyaltyPoints = 0;
    try {
      const custRes = await client.get('/api/resource/Customer', {
        params: {
          fields: JSON.stringify(['name', 'loyalty_points']),
          filters: JSON.stringify([['Customer', 'email_id', '=', email]]),
          limit_page_length: 1,
        },
      });
      if (custRes.data?.data?.length > 0) {
        loyaltyPoints = custRes.data.data[0].loyalty_points || 0;
      }
    } catch (e) {
      console.warn('Could not fetch Customer loyalty details:', e);
    }

    return {
      token: 'session_active',
      user: { email, name, loyaltyPoints, addresses: [] },
    };
  },

  /**
   * Register a new customer account.
   */
  async register(
    name: string,
    email: string,
    password?: string
  ): Promise<{ success: boolean; message: string }> {
    if (STORE_CONFIG.useMock) {
      return simulateLatency({ success: true, message: 'Registration successful! Please login.' });
    }

    const client = getAuthApiClient();

    try {
      /**
       * frappe.core.doctype.user.user.sign_up is the standard whitelisted
       * guest-accessible registration endpoint in Frappe / ERPNext.
       *
       * Parameters:
       *   email       — new user's email address
       *   full_name   — display name
       *   redirect_to — URL to redirect to after email verification (optional)
       *
       * On success, Frappe sends a verification email. The user must click the
       * link in that email to set their password and activate the account.
       */
      const response = await client.post(
        '/api/method/erpnext.api.register_customer',
        {
          email,
          full_name: name.trim(),
        }
      );

      // Frappe returns [0|1, message_string] where 1 = success, 0 = already exists
      const result = response.data?.message;
      if (Array.isArray(result)) {
        const [status, msg] = result;
        if (status === 0) {
          throw new Error(msg || 'An account with this email already exists.');
        }
      }
    } catch (err: any) {
      // Re-throw only if it's not already an Error we constructed above
      if (err instanceof Error && !err.message.startsWith('[object')) throw err;
      throw new Error(extractAuthError(err));
    }

    return {
      success: true,
      message: 'Registration successful! Please check your email to verify your account and set your password.',
    };

  },

  /**
   * Logout: invalidates the server-side Frappe session.
   */
  async logout(): Promise<void> {
    if (STORE_CONFIG.useMock) return;
    try {
      const client = getAuthApiClient();
      await client.get('/api/method/logout');
    } catch (e) {
      console.warn('Server logout call failed (session may already be expired):', e);
    } finally {
      clearCsrfToken();
    }
  },
};

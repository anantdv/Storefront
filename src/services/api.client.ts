import axios from 'axios';
import { useConfigStore } from '../store/useConfigStore';

// Dynamic axios client builder
export const getApiClient = () => {
  const { erpnextUrl, apiKey, apiSecret } = useConfigStore.getState();

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const baseURL = isLocalhost ? '' : erpnextUrl;

  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    withCredentials: true,
    timeout: 10000,
  });

  // Attach token authentication if credentials are provided (via request interceptor)
  client.interceptors.request.use((config: any) => {
    if (!config._retryWithoutAuth && apiKey && apiSecret) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `token ${apiKey}:${apiSecret}`;
    }
    return config;
  });

  // Retry handler with Auth fallback
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { config, response } = error;
      const anyConfig = config as any;
      
      // If authentication fails (401, 403, or 500 Auth Error), retry as a Guest (no token)
      if (
        response &&
        (response.status === 401 ||
          response.status === 403 ||
          (response.status === 500 && JSON.stringify(response.data).includes('AuthenticationError')))
      ) {
        if (anyConfig && !anyConfig._retryWithoutAuth) {
          anyConfig._retryWithoutAuth = true;
          if (anyConfig.headers) {
            delete anyConfig.headers['Authorization'];
          }
          console.warn('API authentication failed; retrying request as Guest.');
          return client(anyConfig);
        }
      }

      if (!config || !config.retryCount) {
        config.retryCount = 0;
      }
      
      const MAX_RETRIES = 2;
      if (config.retryCount < MAX_RETRIES) {
        config.retryCount += 1;
        // Exponential backoff delay
        const delay = Math.pow(2, config.retryCount) * 500;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return client(config);
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// Delay simulation for realistic mockup experience
export const simulateLatency = <T>(data: T, delay = 400): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};

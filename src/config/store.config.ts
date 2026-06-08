/**
 * store.config.ts — Backend-only ERPNext storefront configuration.
 *
 * This file is the single source of truth for deployment settings.
 * Do NOT expose sensitive values here — this config is bundled into
 * the client-side JS. Only put public, non-secret values here.
 *
 * To change settings: edit this file and redeploy/rebuild the app.
 * There is no runtime UI to modify these values.
 */

export const STORE_CONFIG = {
  /**
   * The base URL of your ERPNext / Frappe site.
   * Example: 'https://courtsdemo.advtinni.com'
   */
  erpnextUrl: 'https://courtsdemo.advtinni.com',

  /**
   * Display name of the store shown in the header, footer, and page titles.
   */
  storeName: 'Courts',

  /**
   * Default currency symbol displayed on prices before the ERPNext API
   * overrides it with the live value from the price list.
   */
  defaultCurrency: 'K',

  /**
   * Set to true to use local mock data instead of calling the live ERPNext APIs.
   * Useful during local development when the ERPNext site is not available.
   */
  useMock: false,
} as const;

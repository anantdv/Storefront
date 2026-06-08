import { create } from 'zustand';
import { STORE_CONFIG } from '../config/store.config';

/**
 * Runtime state derived from STORE_CONFIG.
 *
 * All deployment settings (ERPNext URL, store name, mock flag) come exclusively
 * from src/config/store.config.ts and are read-only at runtime.
 *
 * The only mutable field is `currency`, which can be auto-updated when the
 * ERPNext API returns the live price-list currency symbol.
 */
interface ConfigState {
  readonly erpnextUrl: string;
  readonly storeName: string;
  readonly useMock: boolean;
  currency: string;
  /** Internal: update the detected live currency symbol from the price list. */
  setCurrency: (symbol: string) => void;
}

export const useConfigStore = create<ConfigState>()((set) => ({
  erpnextUrl: STORE_CONFIG.erpnextUrl,
  storeName: STORE_CONFIG.storeName,
  useMock: STORE_CONFIG.useMock,
  currency: STORE_CONFIG.defaultCurrency,
  setCurrency: (symbol) => set({ currency: symbol }),
}));

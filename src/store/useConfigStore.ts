import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ConfigState {
  erpnextUrl: string;
  apiKey: string;
  apiSecret: string;
  storeName: string;
  currency: string;
  useMock: boolean;
  setConfigs: (configs: Partial<Omit<ConfigState, 'setConfigs'>>) => void;
  resetConfigs: () => void;
}

const DEFAULT_CONFIGS = {
  erpnextUrl: 'https://courtsdemo.advtinni.com',
  apiKey: '',
  apiSecret: '',
  storeName: 'Courts',
  currency: 'K',
  useMock: false,
};

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      ...DEFAULT_CONFIGS,
      setConfigs: (configs) => set((state) => ({ ...state, ...configs })),
      resetConfigs: () => set(DEFAULT_CONFIGS),
    }),
    {
      name: 'erpnext-ecommerce-config',
    }
  )
);

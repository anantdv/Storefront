import { create } from 'zustand';

interface UIState {
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAuthModalOpen: false,
  authModalTab: 'login',
  openAuthModal: (tab = 'login') => set({ isAuthModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
}));

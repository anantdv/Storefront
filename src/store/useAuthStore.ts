import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, Address } from '../types/shop.types';
import { MOCK_USER } from '../services/mockData';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: UserProfile | null;
  login: (email: string, token: string, user?: UserProfile) => void;
  logout: () => void;
  updateProfile: (name: string, phone?: string) => void;
  addAddress: (address: Address) => void;
  updateAddress: (addressId: string, address: Partial<Address>) => void;
  deleteAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
  addLoyaltyPoints: (points: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      login: (email, token, user) => set({
        isAuthenticated: true,
        token,
        user: user || { ...MOCK_USER, email, name: email.split('@')[0] }
      }),
      logout: () => {
        set({ isAuthenticated: false, token: null, user: null });
        // Trigger full page reload to clear memory caches as per secure coder guidelines
        window.location.href = '/';
      },
      updateProfile: (name, phone) => set((state) => {
        if (!state.user) return {};
        return {
          user: { ...state.user, name, phone }
        };
      }),
      addAddress: (address) => set((state) => {
        if (!state.user) return {};
        const addresses = [...state.user.addresses];
        if (address.isDefault) {
          addresses.forEach(a => a.isDefault = false);
        }
        return {
          user: { ...state.user, addresses: [...addresses, address] }
        };
      }),
      updateAddress: (addressId, updatedFields) => set((state) => {
        if (!state.user) return {};
        const addresses = state.user.addresses.map(a => {
          if (a.id === addressId) {
            const updated = { ...a, ...updatedFields };
            return updated;
          }
          if (updatedFields.isDefault) {
            return { ...a, isDefault: false };
          }
          return a;
        });
        return {
          user: { ...state.user, addresses }
        };
      }),
      deleteAddress: (addressId) => set((state) => {
        if (!state.user) return {};
        return {
          user: {
            ...state.user,
            addresses: state.user.addresses.filter(a => a.id !== addressId)
          }
        };
      }),
      setDefaultAddress: (addressId) => set((state) => {
        if (!state.user) return {};
        return {
          user: {
            ...state.user,
            addresses: state.user.addresses.map(a => ({
              ...a,
              isDefault: a.id === addressId
            }))
          }
        };
      }),
      addLoyaltyPoints: (points) => set((state) => {
        if (!state.user) return {};
        return {
          user: {
            ...state.user,
            loyaltyPoints: state.user.loyaltyPoints + points
          }
        };
      })
    }),
    {
      name: 'erpnext-ecommerce-auth',
    }
  )
);

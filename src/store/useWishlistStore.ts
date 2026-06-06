import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types/shop.types';

interface WishlistState {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleWishlist: (product) => set((state) => {
        const exists = state.items.some(item => item.id === product.id);
        if (exists) {
          return {
            items: state.items.filter(item => item.id !== product.id)
          };
        }
        return {
          items: [...state.items, product]
        };
      }),
      isInWishlist: (productId) => {
        return get().items.some(item => item.id === productId);
      },
      clearWishlist: () => set({ items: [] })
    }),
    {
      name: 'erpnext-ecommerce-wishlist'
    }
  )
);

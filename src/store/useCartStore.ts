import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../types/shop.types';
import { MOCK_COUPONS } from '../services/mockData';

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  discountPercent: number;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  clearCart: () => void;
  getTotals: () => {
    subtotal: number;
    discountAmount: number;
    tax: number;
    shipping: number;
    total: number;
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      discountPercent: 0,
      addToCart: (product, quantity = 1) => set((state) => {
        const existingItem = state.items.find(item => item.product.id === product.id);
        if (existingItem) {
          return {
            items: state.items.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
                : item
            )
          };
        }
        return {
          items: [...state.items, { product, quantity: Math.min(quantity, product.stock) }]
        };
      }),
      updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map(item =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(1, Math.min(quantity, item.product.stock)) }
            : item
        )
      })),
      removeFromCart: (productId) => set((state) => ({
        items: state.items.filter(item => item.product.id !== productId)
      })),
      applyCoupon: (code) => {
        const uppercaseCode = code.toUpperCase().trim();
        const coupon = MOCK_COUPONS[uppercaseCode];
        if (!coupon) {
          return { success: false, message: 'Invalid coupon code' };
        }
        const subtotal = get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        if (subtotal < coupon.minSpend) {
          return { success: false, message: `Minimum spend of $${coupon.minSpend} required` };
        }
        set({ couponCode: uppercaseCode, discountPercent: coupon.discountPercent });
        return { success: true, message: 'Coupon applied successfully!' };
      },
      removeCoupon: () => set({ couponCode: null, discountPercent: 0 }),
      clearCart: () => set({ items: [], couponCode: null, discountPercent: 0 }),
      getTotals: () => {
        const items = get().items;
        const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        const discountPercent = get().discountPercent;
        const discountAmount = subtotal * (discountPercent / 100);
        const taxRate = 0.08; // 8% sales tax
        const tax = (subtotal - discountAmount) * taxRate;
        const shipping = subtotal > 50 || subtotal === 0 ? 0 : 5.99; // Free shipping over $50
        const total = subtotal - discountAmount + tax + shipping;

        return {
          subtotal,
          discountAmount,
          tax,
          shipping,
          total
        };
      }
    }),
    {
      name: 'erpnext-ecommerce-cart',
    }
  )
);

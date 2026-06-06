import { getApiClient, simulateLatency } from './api.client';
import { useConfigStore } from '../store/useConfigStore';
import { CartItem } from '../types/shop.types';

export const cartService = {
  async getCart(): Promise<CartItem[]> {
    const { useMock } = useConfigStore.getState();
    if (useMock) {
      return [];
    }

    const client = getApiClient();
    try {
      const response = await client.get('/api/method/erpnext.api.get_cart');
      const rawItems = response.data?.message || [];
      if (!Array.isArray(rawItems)) return [];

      const cartItems: CartItem[] = [];
      const { productService } = await import('./product.service');
      
      for (const item of rawItems) {
        const itemCode = item.item_code || item.item;
        const qty = item.qty || item.quantity || 1;
        if (!itemCode) continue;

        try {
          const product = await productService.getProductById(itemCode);
          if (product) {
            cartItems.push({ product, quantity: qty });
          }
        } catch (e) {
          console.warn('Failed to resolve cart item details:', itemCode, e);
        }
      }
      return cartItems;
    } catch (e) {
      console.error('Failed to get cart from ERPNext', e);
      return [];
    }
  },

  async addToCart(itemCode: string, qty: number): Promise<boolean> {
    const { useMock } = useConfigStore.getState();
    if (useMock) return true;

    const client = getApiClient();
    try {
      await client.post('/api/method/erpnext.api.add_to_cart', {
        item_code: itemCode,
        qty
      });
      return true;
    } catch (e) {
      console.error('Failed to add to cart in ERPNext', e);
      return false;
    }
  },

  async removeFromCart(itemCode: string): Promise<boolean> {
    const { useMock } = useConfigStore.getState();
    if (useMock) return true;

    const client = getApiClient();
    try {
      await client.post('/api/method/erpnext.api.remove_from_cart', {
        item_code: itemCode
      });
      return true;
    } catch (e) {
      console.error('Failed to remove from cart in ERPNext', e);
      return false;
    }
  },

  async updateCart(itemCode: string, qty: number): Promise<boolean> {
    const { useMock } = useConfigStore.getState();
    if (useMock) return true;

    const client = getApiClient();
    try {
      await client.post('/api/method/erpnext.api.update_cart', {
        item_code: itemCode,
        qty
      });
      return true;
    } catch (e) {
      console.error('Failed to update cart in ERPNext', e);
      return false;
    }
  },

  async syncCartWithErp(items: CartItem[]): Promise<boolean> {
    const { useMock } = useConfigStore.getState();
    if (useMock) {
      return simulateLatency(true);
    }

    const client = getApiClient();
    try {
      await client.post('/api/method/erpnext.api.update_cart', {
        cart_items: JSON.stringify(
          items.map(item => ({
            item_code: item.product.id,
            qty: item.quantity
          }))
        )
      });
      return true;
    } catch (e) {
      console.error('Failed to sync shopping cart session with ERPNext', e);
      return false;
    }
  }
};

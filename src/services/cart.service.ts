/**
 * cart.service.ts
 *
 * Uses ERPNext's built-in e-commerce / shopping-cart API endpoints.
 * All calls go through getAuthApiClient() (withCredentials: true) so the
 * logged-in customer's Frappe session cookie is forwarded automatically.
 *
 * Endpoints used:
 *   GET  /api/method/erpnext.api.get_cart
 *   POST /api/method/erpnext.api.add_to_cart  (add / update qty)
 *   POST /api/method/erpnext.api.remove_from_cart (remove item)
 */

import { STORE_CONFIG } from '../config/store.config';
import { getAuthApiClient, simulateLatency } from './api.client';
import { CartItem } from '../types/shop.types';

// ─── Frappe error extractor ────────────────────────────────────────────────────────
const extractError = (err: any, fallback: string): string => {
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
  return err?.message || fallback;
};

// ─── Service ───────────────────────────────────────────────────────────────
export const cartService = {

  /**
   * Fetch the current cart quotation from ERPNext.
   */
  async getCart(): Promise<CartItem[]> {
    if (STORE_CONFIG.useMock) return [];

    const client = getAuthApiClient();
    try {
      const response = await client.get(
        '/api/method/erpnext.api.get_cart'
      );
      const doc = response.data?.message?.doc;
      const rawItems: any[] = doc?.items || [];
      if (!rawItems.length) return [];

      const cartItems: CartItem[] = [];
      const { productService } = await import('./product.service');

      for (const item of rawItems) {
        const itemCode = item.item_code;
        const qty = item.qty || 1;
        if (!itemCode) continue;
        try {
          const product = await productService.getProductById(itemCode);
          if (product) cartItems.push({ product, quantity: qty });
        } catch (e) {
          console.warn('Failed to resolve cart item product details:', itemCode, e);
        }
      }
      return cartItems;
    } catch (e: any) {
      console.error('getCart failed:', extractError(e, 'Failed to load cart'));
      return [];
    }
  },

  /**
   * Add an item to the ERPNext cart quotation.
   * update_cart handles both add and quantity-update in one call.
   */
  async addToCart(itemCode: string, qty: number): Promise<boolean> {
    if (STORE_CONFIG.useMock) return true;

    const client = getAuthApiClient();
    try {
      await client.post(
        '/api/method/erpnext.api.add_to_cart',
        { item_code: itemCode, qty }
      );
      return true;
    } catch (e: any) {
      console.error('addToCart failed:', extractError(e, 'Failed to add item to cart'));
      return false;
    }
  },

  /**
   * Remove an item from the cart by setting qty to 0.
   */
  async removeFromCart(itemCode: string): Promise<boolean> {
    if (STORE_CONFIG.useMock) return true;

    const client = getAuthApiClient();
    try {
      await client.post(
        '/api/method/erpnext.api.remove_from_cart',
        { item_code: itemCode }
      );
      return true;
    } catch (e: any) {
      console.error('removeFromCart failed:', extractError(e, 'Failed to remove item from cart'));
      return false;
    }
  },

  /**
   * Update the quantity of a specific item. qty=0 removes it.
   */
  async updateCart(itemCode: string, qty: number): Promise<boolean> {
    if (STORE_CONFIG.useMock) return true;

    const client = getAuthApiClient();
    try {
      await client.post(
        '/api/method/erpnext.api.add_to_cart',
        { item_code: itemCode, qty }
      );
      return true;
    } catch (e: any) {
      console.error('updateCart failed:', extractError(e, 'Failed to update cart'));
      return false;
    }
  },

  /**
   * Sync the entire local cart to ERPNext after login.
   */
  async syncCartWithErp(items: CartItem[]): Promise<boolean> {
    if (STORE_CONFIG.useMock) return simulateLatency(true);

    const client = getAuthApiClient();
    let allOk = true;
    for (const item of items) {
      try {
        await client.post(
          '/api/method/erpnext.api.add_to_cart',
          {
            item_code: item.product.itemCode || item.product.id,
            qty: item.quantity,
          }
        );
      } catch (e: any) {
        console.error(
          `syncCartWithErp: failed for item ${item.product.id}:`,
          extractError(e, 'Sync error')
        );
        allOk = false;
      }
    }
    return allOk;
  },
};

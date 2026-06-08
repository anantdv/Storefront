/**
 * order.service.ts
 *
 * Uses ERPNext's built-in e-commerce / shopping-cart API endpoints.
 * All calls go through getAuthApiClient() (withCredentials: true) so the
 * logged-in customer's Frappe session cookie is forwarded automatically.
 *
 * Checkout flow:
 *   1. POST add_to_cart for each item  — syncs items into server-side Quotation
 *   2. POST create_order               — converts Quotation → confirmed Sales Order
 *
 * Order history:
 *   GET /api/resource/Sales Order     — filtered to current customer
 *   GET /api/resource/Sales Order/<n> — full order detail with line items
 */

import { STORE_CONFIG } from '../config/store.config';
import { getAuthApiClient, simulateLatency } from './api.client';
import { Order, CartItem, Address, OrderStatus } from '../types/shop.types';

// ─── Frappe error extractor ────────────────────────────────────────────────────────
const extractOrderError = (err: any): string => {
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
  return err?.message || 'Failed to place order. Please try again.';
};

// ─── Mock database (only used when useMock = true) ──────────────────────────────────
const mockOrderDatabase: Order[] = [];

// ─── Service ───────────────────────────────────────────────────────────────
export const orderService = {

  /**
   * Place a Sales Order via ERPNext's shopping cart workflow:
   * 1. Sync each cart item into the server Quotation via update_cart.
   * 2. Call place_order to convert the Quotation to a Sales Order.
   */
  async createSalesOrder(params: {
    items: CartItem[];
    shippingAddress: Address;
    paymentMethod: string;
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    couponCode?: string;
  }): Promise<{ success: boolean; orderId: string; invoiceId?: string }> {

    // ── Mock mode ──────────────────────────────────────────────────────────────
    if (STORE_CONFIG.useMock) {
      const orderId = `SO-${Math.floor(100000 + Math.random() * 900000)}`;
      const invoiceId = `SINV-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date();
      const newOrder: Order = {
        id: orderId,
        date: now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        items: params.items,
        subtotal: params.subtotal,
        tax: params.tax,
        shipping: params.shipping,
        discount: params.discount,
        total: params.total,
        status: 'Placed',
        timeline: [
          { status: 'Placed',    timestamp: now.toLocaleTimeString(), completed: true,  details: 'Order successfully created.' },
          { status: 'Paid',      timestamp: now.toLocaleTimeString(), completed: true,  details: `Payment confirmed via ${params.paymentMethod}.` },
          { status: 'Picking',   timestamp: '', completed: false },
          { status: 'Packing',   timestamp: '', completed: false },
          { status: 'Shipped',   timestamp: '', completed: false },
          { status: 'Delivered', timestamp: '', completed: false },
        ],
        shippingAddress: params.shippingAddress,
        paymentMethod: params.paymentMethod,
        couponCode: params.couponCode,
      };
      mockOrderDatabase.unshift(newOrder);
      return simulateLatency({ success: true, orderId, invoiceId });
    }

    // ── Live ERPNext flow ────────────────────────────────────────────────────
    const client = getAuthApiClient();

    try {
      // Step 1 — Sync each cart item into the server-side Quotation.
      // update_cart is idempotent: it upserts the item in the active quotation.
      for (const item of params.items) {
        await client.post(
          '/api/method/erpnext.api.add_to_cart',
          {
            item_code: item.product.itemCode || item.product.id,
            qty: item.quantity,
          }
        );
      }

      // Step 2 — Place the order.
      // ERPNext converts the open Quotation into a Sales Order.
      const placeRes = await client.post(
        '/api/method/erpnext.api.create_order'
      );

      const message = placeRes.data?.message;

      // Frappe's place_order returns the Sales Order name as message (string)
      // or as an object with a `name` field depending on version.
      const orderId =
        (typeof message === 'string' ? message : null) ||
        message?.name ||
        message?.sales_order ||
        '';

      if (!orderId) {
        throw new Error('Order was placed but no order ID was returned by ERPNext.');
      }

      return { success: true, orderId };

    } catch (err: any) {
      throw new Error(extractOrderError(err));
    }
  },

  /**
   * Fetch the logged-in customer's order history.
   */
  async getOrderHistory(customerName: string): Promise<Order[]> {
    if (STORE_CONFIG.useMock) return simulateLatency(mockOrderDatabase);

    const client = getAuthApiClient();
    try {
      const response = await client.get('/api/method/erpnext.api.get_orders', {
        params: { customer: customerName }
      });

      const orders: any[] = response.data?.message || response.data?.data || [];
      return orders.map((so: any) => ({
        id: so.name,
        date: new Date(so.creation).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        }),
        items: [],
        subtotal: so.grand_total || 0,
        tax: so.total_taxes_and_charges || 0,
        shipping: 0,
        discount: so.discount_amount || 0,
        total: so.grand_total || 0,
        status: this.mapErpNextStatus(so.status),
        timeline: [],
        shippingAddress: {
          id: '',
          name: 'Default Address',
          recipientName: so.customer || customerName,
          phone: '',
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          isDefault: true,
        },
        paymentMethod: so.payment_terms_template || 'Credit Card',
      }));
    } catch (e: any) {
      console.error('getOrderHistory failed:', extractOrderError(e));
      return [];
    }
  },

  /**
   * Fetch full details for a single Sales Order.
   */
  async getOrderDetails(orderId: string): Promise<Order | null> {
    if (STORE_CONFIG.useMock) return mockOrderDatabase.find(o => o.id === orderId) || null;

    const client = getAuthApiClient();
    try {
      const response = await client.get('/api/method/erpnext.api.get_order_details', {
        params: { order_id: orderId }
      });
      const so = response.data?.message || response.data?.data;
      if (!so) return null;

      return {
        id: so.name,
        date: new Date(so.creation || Date.now()).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        }),
        items: (so.items || []).map((it: any) => ({
          product: {
            id: it.item_code,
            itemCode: it.item_code,
            name: it.item_name || it.item_code,
            price: it.rate || 0,
            image: '',
            gallery: [],
            category: '',
            brand: '',
            rating: 5,
            reviewCount: 0,
            stock: 1,
            specifications: {},
            tags: [],
          },
          quantity: it.qty || 1,
        })),
        subtotal: so.grand_total || so.net_total || 0,
        tax: so.total_taxes_and_charges || 0,
        shipping: 0,
        discount: so.discount_amount || 0,
        total: so.grand_total || 0,
        status: this.mapErpNextStatus(so.status),
        timeline: [],
        shippingAddress: {
          id: so.shipping_address_name || '',
          name: 'Shipping Address',
          recipientName: so.customer || '',
          phone: '',
          street: so.shipping_address || '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          isDefault: true,
        },
        paymentMethod: so.payment_terms_template || 'Credit Card',
      };
    } catch (e: any) {
      console.error('getOrderDetails failed:', extractOrderError(e));
      return null;
    }
  },

  mapErpNextStatus(erpStatus: string): OrderStatus {
    switch (erpStatus) {
      case 'Draft':
      case 'On Hold':              return 'Placed';
      case 'To Deliver and Bill':  return 'Paid';
      case 'To Deliver':           return 'Picking';
      case 'To Bill':              return 'Shipped';
      case 'Completed':            return 'Delivered';
      default:                     return 'Placed';
    }
  },
};

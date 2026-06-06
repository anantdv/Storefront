import { getApiClient, simulateLatency } from './api.client';
import { useConfigStore } from '../store/useConfigStore';
import { Order, CartItem, Address, OrderStatus } from '../types/shop.types';

const mockOrderDatabase: Order[] = [];

export const orderService = {
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
    const { useMock } = useConfigStore.getState();
    const orderId = `SO-${Math.floor(100000 + Math.random() * 900000)}`;
    const invoiceId = `SINV-${Math.floor(100000 + Math.random() * 900000)}`;

    if (useMock) {
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      
      const newOrder: Order = {
        id: orderId,
        date: formattedDate,
        items: params.items,
        subtotal: params.subtotal,
        tax: params.tax,
        shipping: params.shipping,
        discount: params.discount,
        total: params.total,
        status: 'Placed',
        timeline: [
          { status: 'Placed', timestamp: now.toLocaleTimeString(), completed: true, details: 'Order successfully created via marketplace.' },
          { status: 'Paid', timestamp: now.toLocaleTimeString(), completed: true, details: `Payment confirmed via ${params.paymentMethod}.` },
          { status: 'Picking', timestamp: '', completed: false },
          { status: 'Packing', timestamp: '', completed: false },
          { status: 'Shipped', timestamp: '', completed: false },
          { status: 'Delivered', timestamp: '', completed: false }
        ],
        shippingAddress: params.shippingAddress,
        paymentMethod: params.paymentMethod,
        couponCode: params.couponCode
      };

      mockOrderDatabase.unshift(newOrder);
      return simulateLatency({ success: true, orderId, invoiceId });
    }

    const client = getApiClient();
    
    // First try the new custom API endpoint
    try {
      const response = await client.post('/api/method/erpnext.api.create_order', {
        shipping_address: params.shippingAddress,
        payment_method: params.paymentMethod,
        coupon_code: params.couponCode,
        items: params.items.map(item => ({
          item_code: item.product.id,
          qty: item.quantity
        }))
      });
      if (response.data?.message) {
        return {
          success: true,
          orderId: response.data.message.name || response.data.message.id || response.data.data?.name,
          invoiceId: response.data.message.invoice_id || undefined
        };
      }
    } catch (err) {
      console.warn('erpnext.api.create_order failed, falling back to standard Sales Order resource API:', err);
    }

    // Standard Fallback
    const salesOrderData = {
      customer: params.shippingAddress.recipientName,
      delivery_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      items: params.items.map(item => ({
        item_code: item.product.id,
        qty: item.quantity,
        rate: item.product.price
      })),
      shipping_address_name: params.shippingAddress.id,
      payment_method: params.paymentMethod,
      coupon_code: params.couponCode
    };

    const response = await client.post('/api/resource/Sales Order', salesOrderData);
    
    let erpInvoiceId = '';
    if (params.paymentMethod !== 'Bank Transfer') {
      try {
        const invoiceRes = await client.post(`/api/method/erpnext.selling.doctype.sales_order.sales_order.make_sales_invoice`, {
          source_name: response.data.data.name
        });
        erpInvoiceId = invoiceRes.data.message?.name || '';
      } catch (err) {
        console.error('Invoice creation failed, order is preserved', err);
      }
    }

    return {
      success: true,
      orderId: response.data.data.name,
      invoiceId: erpInvoiceId || undefined
    };
  },

  async getOrderHistory(customerName: string): Promise<Order[]> {
    const { useMock } = useConfigStore.getState();
    if (useMock) {
      return simulateLatency(mockOrderDatabase);
    }

    const client = getApiClient();
    
    // First try the new custom API endpoint
    try {
      const response = await client.get('/api/method/erpnext.api.get_orders');
      const ordersList = response.data?.message || [];
      if (Array.isArray(ordersList)) {
        return ordersList.map((so: any) => ({
          id: so.name || so.id,
          date: new Date(so.creation || so.date || Date.now()).toLocaleDateString(),
          items: so.items ? so.items.map((it: any) => ({
            product: {
              id: it.item_code,
              name: it.item_name || it.item_code,
              price: it.rate || 0,
              image: '',
              gallery: [],
              category: '',
              rating: 5,
              reviewCount: 0,
              stock: 1,
              specifications: {},
              tags: []
            },
            quantity: it.qty || 1
          })) : [],
          subtotal: so.grand_total || so.total || 0,
          tax: so.total_taxes_and_charges || 0,
          shipping: 0,
          discount: so.discount_amount || 0,
          total: so.grand_total || so.total || 0,
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
            isDefault: true
          },
          paymentMethod: so.payment_method || 'Credit Card'
        }));
      }
    } catch (e) {
      console.warn('erpnext.api.get_orders failed, falling back to resource endpoint:', e);
    }

    // Standard Fallback
    const response = await client.get('/api/resource/Sales Order', {
      params: {
        fields: '["name", "creation", "status", "grand_total", "customer"]',
        filters: `[["customer", "=", "${customerName}"]]`,
        order_by: 'creation desc'
      }
    });

    return response.data.data.map((so: any) => ({
      id: so.name,
      date: new Date(so.creation).toLocaleDateString(),
      items: [],
      subtotal: so.grand_total,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: so.grand_total,
      status: this.mapErpNextStatus(so.status),
      timeline: [],
      shippingAddress: {
        id: '',
        name: 'Default Address',
        recipientName: so.customer,
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        isDefault: true
      },
      paymentMethod: 'Credit Card'
    }));
  },

  async getOrderDetails(orderId: string): Promise<Order | null> {
    const { useMock } = useConfigStore.getState();
    if (useMock) {
      return mockOrderDatabase.find(o => o.id === orderId) || null;
    }

    const client = getApiClient();
    try {
      const response = await client.get('/api/method/erpnext.api.get_order_details', {
        params: { order_id: orderId, name: orderId }
      });
      const so = response.data?.message;
      if (so) {
        return {
          id: so.name || so.id,
          date: new Date(so.creation || so.date || Date.now()).toLocaleDateString(),
          items: so.items ? so.items.map((it: any) => ({
            product: {
              id: it.item_code,
              name: it.item_name || it.item_code,
              price: it.rate || 0,
              image: '',
              gallery: [],
              category: '',
              rating: 5,
              reviewCount: 0,
              stock: 1,
              specifications: {},
              tags: []
            },
            quantity: it.qty || 1
          })) : [],
          subtotal: so.grand_total || so.total || 0,
          tax: so.total_taxes_and_charges || 0,
          shipping: 0,
          discount: so.discount_amount || 0,
          total: so.grand_total || so.total || 0,
          status: this.mapErpNextStatus(so.status),
          timeline: [],
          shippingAddress: {
            id: '',
            name: 'Default Address',
            recipientName: so.customer || '',
            phone: '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
            isDefault: true
          },
          paymentMethod: so.payment_method || 'Credit Card'
        };
      }
    } catch (e) {
      console.warn('erpnext.api.get_order_details failed:', e);
    }
    return null;
  },

  mapErpNextStatus(erpStatus: string): OrderStatus {
    switch (erpStatus) {
      case 'Draft':
        return 'Placed';
      case 'On Hold':
        return 'Placed';
      case 'To Deliver and Bill':
        return 'Paid';
      case 'To Deliver':
        return 'Picking';
      case 'To Bill':
        return 'Shipped';
      case 'Completed':
        return 'Delivered';
      case 'Cancelled':
        return 'Placed';
      default:
        return 'Placed';
    }
  }
};

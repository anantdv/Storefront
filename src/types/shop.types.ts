export interface Product {
  id: string; // SKU or item_code
  itemCode?: string; // real item code if id is route
  name: string; // item_name
  brand?: string;
  category: string; // item_group
  description?: string;
  price: number;
  originalPrice?: number;
  discount?: number; // percentage
  image: string;
  gallery: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  specifications: Record<string, string>;
  tags: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Address {
  id: string;
  name: string; // e.g. "Home", "Office"
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserProfile {
  email: string;
  name: string;
  phone?: string;
  imageUrl?: string;
  loyaltyPoints: number;
  addresses: Address[];
}

export type OrderStatus = 'Placed' | 'Paid' | 'Picking' | 'Packing' | 'Shipped' | 'Delivered';

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  completed: boolean;
  details?: string;
}

export interface Order {
  id: string; // Sales Order Name in ERPNext
  date: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: OrderStatus;
  timeline: OrderTimelineEvent[];
  shippingAddress: Address;
  paymentMethod: string;
  couponCode?: string;
}

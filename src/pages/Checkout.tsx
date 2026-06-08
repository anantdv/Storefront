import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useConfigStore } from '../store/useConfigStore';
import { useUIStore } from '../store/useUIStore';
import { orderService } from '../services/order.service';
import { getPublicApiClient } from '../services/api.client';
import { StepIndicator } from '../components/checkout/StepIndicator';
import { Address } from '../types/shop.types';
import { CheckCircle2, Landmark, Loader2, Truck } from 'lucide-react';

const fetchWarehouses = async (): Promise<string[]> => {
  try {
    const client = getPublicApiClient();
    const res = await client.get('/api/resource/Warehouse', {
      params: {
        fields: '["name", "warehouse_name"]',
        filters: '[["disabled", "=", 0]]'
      }
    });
    if (res.data?.data) {
      return res.data.data.map((w: any) => w.warehouse_name || w.name);
    }
  } catch (e) {
    console.warn('Failed to fetch Warehouses, using default list:', e);
  }
  return [
    'Courts Port Moresby Store',
    'Courts Lae Store',
    'Courts Mt Hagen Store',
    'Courts Kokopo Store'
  ];
};

export const Checkout: React.FC = () => {
  const { items, couponCode, getTotals, clearCart } = useCartStore();
  const { isAuthenticated, user, addAddress } = useAuthStore();
  const { currency } = useConfigStore();

  const navigate = useNavigate();
  const { openAuthModal } = useUIStore();

  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    user?.addresses.find(a => a.isDefault) || user?.addresses[0] || null
  );
  
  // Custom Address Form states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
    name: 'Home',
    recipientName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'PNG',
    isDefault: false
  });

  const [deliveryMethod, setDeliveryMethod] = useState<'Shipping' | 'Store Pick up'>('Shipping');
  const [warehouses, setWarehouses] = useState<string[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [placedOrderInfo, setPlacedOrderInfo] = useState<{ orderId: string; invoiceId?: string } | null>(null);
  
  // Customer info inputs
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderLoading, setOrderLoading] = useState(false);

  const totals = getTotals();

  useEffect(() => {
    const loadWarehouses = async () => {
      const list = await fetchWarehouses();
      setWarehouses(list);
      if (list.length > 0) {
        setSelectedWarehouse(list[0]);
      }
    };
    loadWarehouses();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', '/checkout');
      openAuthModal('login');
      navigate('/cart', { replace: true });
    }
  }, [isAuthenticated, navigate, openAuthModal]);

  const handleNextStep = () => {
    setErrors({});
    if (step === 1) {
      if (!customerInfo.name || !customerInfo.email) {
        setErrors({ general: 'Please enter your name and email.' });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedAddress) {
        setErrors({ general: 'Please select or add a shipping address.' });
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.recipientName || !newAddress.street || !newAddress.city || !newAddress.zipCode) {
      setErrors({ address: 'Please fill in all required address fields.' });
      return;
    }
    const createdAddress: Address = {
      ...newAddress,
      id: `addr_${Math.random().toString(36).substr(2, 9)}`
    };
    addAddress(createdAddress);
    setSelectedAddress(createdAddress);
    setShowAddressForm(false);
    setErrors({});
  };

  const handlePlaceOrder = async () => {
    setErrors({});
    setOrderLoading(true);
    try {
      const method = deliveryMethod === 'Store Pick up' 
        ? `Store Pickup - ${selectedWarehouse}` 
        : 'Shipping';

      const res = await orderService.createSalesOrder({
        items,
        shippingAddress: selectedAddress!,
        paymentMethod: method,
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: 0,
        discount: totals.discountAmount,
        total: totals.subtotal - totals.discountAmount + totals.tax,
        couponCode: couponCode || undefined
      });

      if (res.success) {
        setPlacedOrderInfo(res);
        setStep(4);
        clearCart();
      }
    } catch (e: any) {
      console.error(e);
      setErrors({ general: e.message || 'Failed to place order. Please try again.' });
    } finally {
      setOrderLoading(false);
    }
  };

  const stepsList = ['Contact Info', 'Address', 'Delivery', 'Order Placed'];

  if (items.length === 0 && step < 4) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Checkout is empty</h2>
        <p className="text-xs text-slate-400 mt-1">Please add items to your cart before proceeding.</p>
        <Link to="/catalog" className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <StepIndicator currentStep={step} steps={stepsList} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-6">
        
        {/* Main Wizard Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* STEP 1: Customer Contact Information */}
          {step === 1 && (
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xxs space-y-4">
              <h3 className="text-base font-extrabold text-slate-800">Contact Information</h3>
              <div className="space-y-3.5">
                <div>
                  <label className="text-xxs font-extrabold text-slate-400 uppercase">Full Name</label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-semibold focus:border-indigo-500 focus:bg-white focus:outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="text-xxs font-extrabold text-slate-400 uppercase">Email Address</label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-semibold focus:border-indigo-500 focus:bg-white focus:outline-none"
                    placeholder="john.doe@example.com"
                  />
                </div>
                <div>
                  <label className="text-xxs font-extrabold text-slate-400 uppercase">Phone Number</label>
                  <input
                    type="text"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-semibold focus:border-indigo-500 focus:bg-white focus:outline-none"
                    placeholder="+1 (555) 019-2834"
                  />
                </div>
              </div>
              {errors.general && <p className="text-xxs font-bold text-red-500">{errors.general}</p>}
              
              <button
                onClick={handleNextStep}
                className="mt-6 w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-xs font-black transition-colors"
              >
                Proceed to Shipping Address
              </button>
            </div>
          )}

          {/* STEP 2: Shipping Address */}
          {step === 2 && (
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xxs space-y-4">
              <h3 className="text-base font-extrabold text-slate-800">Shipping Address</h3>
              
              {user?.addresses && user.addresses.length > 0 && !showAddressForm && (
                <div className="space-y-3">
                  {user.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr)}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all flex items-start justify-between ${
                        selectedAddress?.id === addr.id
                          ? 'border-indigo-650 bg-indigo-50/20 ring-2 ring-indigo-50'
                          : 'border-slate-100 hover:border-slate-250 bg-slate-50/50'
                      }`}
                    >
                      <div className="text-left font-semibold">
                        <span className="inline-block text-xxs font-extrabold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 mb-1.5 uppercase">
                          {addr.name}
                        </span>
                        <p className="text-xs text-slate-800 font-bold">{addr.recipientName}</p>
                        <p className="text-xs text-slate-500 mt-1 font-medium">{addr.street}</p>
                        <p className="text-xs text-slate-550 font-medium">
                          {addr.city}, {addr.state} {addr.zipCode}
                        </p>
                      </div>
                      <input
                        type="radio"
                        checked={selectedAddress?.id === addr.id}
                        onChange={() => setSelectedAddress(addr)}
                        className="h-4.5 w-4.5 text-indigo-600"
                      />
                    </div>
                  ))}

                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="w-full text-center border-2 border-dashed border-slate-200 hover:border-indigo-400 py-3.5 rounded-2xl text-xs font-bold text-slate-650 hover:text-indigo-600 transition-colors"
                  >
                    + Add New Address
                  </button>
                </div>
              )}

              {(showAddressForm || !user?.addresses || user.addresses.length === 0) && (
                <form onSubmit={handleAddAddressSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xxs font-extrabold text-slate-400 uppercase">Label Name</label>
                      <input
                        type="text"
                        value={newAddress.name}
                        onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-semibold focus:outline-none"
                        placeholder="e.g. Home, Office"
                      />
                    </div>
                    <div>
                      <label className="text-xxs font-extrabold text-slate-400 uppercase">Recipient Name</label>
                      <input
                        type="text"
                        value={newAddress.recipientName}
                        onChange={(e) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-semibold focus:outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xxs font-extrabold text-slate-400 uppercase">Street Address</label>
                    <input
                      type="text"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-semibold focus:outline-none"
                      placeholder="123 Pine St"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xxs font-extrabold text-slate-400 uppercase">City</label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-semibold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xxs font-extrabold text-slate-400 uppercase">State</label>
                      <input
                        type="text"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-semibold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xxs font-extrabold text-slate-400 uppercase">ZIP Code</label>
                      <input
                        type="text"
                        value={newAddress.zipCode}
                        onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-semibold focus:outline-none"
                      />
                    </div>
                  </div>
                  {errors.address && <p className="text-xxs font-bold text-red-500">{errors.address}</p>}
                  
                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="submit"
                      className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 transition-colors"
                    >
                      Save Address
                    </button>
                    {user?.addresses && user.addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold px-4 py-2 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}

              {errors.general && <p className="text-xxs font-bold text-red-500">{errors.general}</p>}
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handlePrevStep}
                  className="rounded-xl border border-slate-200 text-slate-650 hover:bg-slate-50 text-xs font-bold py-2.5 px-4 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-bold transition-colors"
                >
                  Proceed to Delivery Method
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Delivery Options */}
          {step === 3 && (
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xxs space-y-4">
              <h3 className="text-base font-extrabold text-slate-800">Delivery Method</h3>
              
              <div className="space-y-3">
                <div
                  onClick={() => setDeliveryMethod('Shipping')}
                  className={`cursor-pointer rounded-2xl border p-4.5 transition-all flex items-center justify-between ${
                    deliveryMethod === 'Shipping'
                      ? 'border-indigo-650 bg-indigo-50/20 ring-2 ring-indigo-50'
                      : 'border-slate-100 hover:border-slate-250 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="h-6 w-6 text-slate-500 shrink-0" />
                    <div className="text-left font-semibold">
                      <p className="text-sm text-slate-800 font-bold">Shipping</p>
                      <p className="text-xs text-slate-400 mt-0.5">Delivery direct to your saved address</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setDeliveryMethod('Store Pick up')}
                  className={`cursor-pointer rounded-2xl border p-4.5 transition-all flex flex-col gap-3 ${
                    deliveryMethod === 'Store Pick up'
                      ? 'border-indigo-650 bg-indigo-50/20 ring-2 ring-indigo-50'
                      : 'border-slate-100 hover:border-slate-250 bg-slate-50/50'
                  }`}
                >
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Landmark className="h-6 w-6 text-indigo-600 shrink-0" />
                      <div className="text-left font-semibold">
                        <p className="text-sm text-slate-800 font-bold">Store Pick up</p>
                        <p className="text-xs text-slate-400 mt-0.5">Collect order in-store at your nearest location</p>
                      </div>
                    </div>
                  </div>

                  {deliveryMethod === 'Store Pick up' && (
                    <div className="w-full pt-2 text-left" onClick={(e) => e.stopPropagation()}>
                      <label className="text-xxs font-extrabold text-slate-400 uppercase">Select Pick up Warehouse</label>
                      <select
                        value={selectedWarehouse}
                        onChange={(e) => setSelectedWarehouse(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-slate-700 outline-none"
                      >
                        {warehouses.map((w, idx) => (
                          <option key={idx} value={w}>{w}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {errors.general && <p className="text-xxs font-bold text-red-500">{errors.general}</p>}

              <div className="flex gap-3 pt-6 border-t border-slate-100">
                <button
                  onClick={handlePrevStep}
                  className="rounded-xl border border-slate-200 text-slate-650 hover:bg-slate-50 text-xs font-bold py-2.5 px-4 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={orderLoading}
                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-2.5 text-xs font-black shadow-md shadow-emerald-150 transition-colors flex items-center justify-center gap-2"
                >
                  {orderLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Placing Order…
                    </>
                  ) : (
                    'Place Sales Order'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Order Placed Success */}
          {step === 4 && placedOrderInfo && (
            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xxs text-center space-y-5">
              <div className="rounded-full bg-emerald-50 border border-emerald-100 h-16 w-16 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-none">Order Placed Successfully!</h2>
                <p className="text-xs text-slate-400 mt-2">
                  Your Sales Order has been generated inside ERPNext. Let's get processing!
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 max-w-sm mx-auto space-y-2 text-xs font-semibold text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400">Sales Order Code:</span>
                  <span className="text-slate-800 font-extrabold">{placedOrderInfo.orderId}</span>
                </div>
                {placedOrderInfo.invoiceId && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sales Invoice Code:</span>
                    <span className="text-slate-800 font-extrabold">{placedOrderInfo.invoiceId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivery Type:</span>
                  <span className="text-slate-800 font-extrabold">
                    {deliveryMethod === 'Store Pick up' ? `Store Pickup (${selectedWarehouse})` : 'Shipping'}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/account?tab=orders"
                  className="rounded-2xl bg-indigo-650 hover:bg-indigo-755 text-white text-xs font-bold px-6 py-3 transition-colors"
                >
                  Track in Account
                </Link>
                <Link
                  to="/catalog"
                  className="rounded-2xl border border-slate-200 text-slate-650 hover:bg-slate-50 text-xs font-bold px-6 py-3 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}

        </div>

        {/* Sidebar cart items review */}
        {step < 4 && (
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xxs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-50 pb-2.5">
              Order Basket
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pb-2 scrollbar-thin">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3 items-center">
                  <img src={item.product.image} alt={item.product.name} className="h-11 w-11 rounded-lg object-cover bg-slate-50" />
                  <div className="flex-1 min-w-0 font-semibold text-left">
                    <p className="text-xs text-slate-800 truncate">{item.product.name}</p>
                    <p className="text-xxs text-slate-400 mt-0.5">Qty {item.quantity} × {currency}{item.product.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-850 font-extrabold">{currency}{totals.subtotal.toFixed(2)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Promo Save</span>
                  <span>-{currency}{totals.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Sales Tax</span>
                <span className="text-slate-850 font-extrabold">{currency}{totals.tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline font-black text-slate-800">
              <span className="text-xs">Final Due</span>
              <span className="text-base text-indigo-650">
                {currency}{(totals.subtotal - totals.discountAmount + totals.tax).toFixed(2)}
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

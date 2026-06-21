import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useConfigStore } from '../store/useConfigStore';
import { orderService } from '../services/order.service';
import { authService } from '../services/auth.service';
import { UserAvatar } from '../components/common/UserAvatar';
import { ProductCard } from '../components/product/ProductCard';
import { TrackingTimeline } from '../components/order/TrackingTimeline';
import { Order, Address } from '../types/shop.types';
import { User, Package, MapPin, Heart, Award, ArrowRight, ShieldCheck, Mail, Lock, CreditCard, ReceiptText, FileText } from 'lucide-react';

export const Account: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user, login, logout, updateProfile, addAddress, deleteAddress } = useAuthStore();
  const { items: wishlistItems } = useWishlistStore();
  const { currency } = useConfigStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'wishlist'>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Authentication inputs
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Profile forms
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileMessage, setProfileMessage] = useState('');

  // Address forms
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
    name: 'Home',
    recipientName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    isDefault: false
  });

  // Sync tab from query parameter e.g., ?tab=orders
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'orders') setActiveTab('orders');
    else if (tabParam === 'wishlist') setActiveTab('wishlist');
    else if (tabParam === 'login') setAuthTab('login');
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const loadOrders = async () => {
        try {
          const history = await orderService.getOrderHistory(user.name);
          setOrders(history);
        } catch (e) {
          console.error(e);
        }
      };
      loadOrders();
    }
  }, [isAuthenticated, user]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!authEmail || !authPassword) {
      setAuthError('Please fill in all credentials.');
      return;
    }
    try {
      const res = await authService.login(authEmail, authPassword);
      login(authEmail, res.token, res.user);
      setProfileName(res.user.name);
      setProfilePhone(res.user.phone || '');
    } catch (err: any) {
      setAuthError(err.message || 'Login failed.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    if (!authName || !authEmail || !authPassword) {
      setAuthError('All fields are required.');
      return;
    }
    try {
      const res = await authService.register(authName, authEmail, authPassword);
      setAuthSuccess(res.message);
      setAuthTab('login');
      setAuthPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed.');
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage('');
    updateProfile(profileName, profilePhone);
    setProfileMessage('Profile successfully updated!');
    setTimeout(() => setProfileMessage(''), 3000);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.recipientName || !newAddress.street || !newAddress.city || !newAddress.zipCode) {
      alert('Please fill out all address fields.');
      return;
    }
    const created: Address = {
      ...newAddress,
      id: `addr_${Math.random().toString(36).substr(2, 9)}`
    };
    addAddress(created);
    setShowAddressForm(false);
    setNewAddress({
      name: 'Home',
      recipientName: user?.name || '',
      phone: user?.phone || '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      isDefault: false
    });
  };

  const handleInvoiceDownload = (orderId: string) => {
    alert(`Downloading Sales Invoice pdf copy for order: ${orderId} in background.`);
  };

  const handleReturnRequest = (orderId: string) => {
    alert(`Return request submitted successfully for sales order: ${orderId}. Customer team will inspect.`);
  };

  // IF NOT AUTHENTICATED: RENDER LOGIN/REGISTER FORMS
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-md">
          {/* Form Tabs */}
          <div className="flex border-b border-slate-150 gap-4 mb-6">
            <button
              onClick={() => { setAuthTab('login'); setAuthError(''); }}
              className={`pb-2.5 text-sm font-bold transition-all border-b-2 -mb-0.5 ${
                authTab === 'login' ? 'border-indigo-650 text-indigo-650 font-black' : 'border-transparent text-slate-400'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthTab('register'); setAuthError(''); }}
              className={`pb-2.5 text-sm font-bold transition-all border-b-2 -mb-0.5 ${
                authTab === 'register' ? 'border-indigo-650 text-indigo-650 font-black' : 'border-transparent text-slate-400'
              }`}
            >
              Create Account
            </button>
          </div>

          {authSuccess && (
            <div className="mb-4 bg-emerald-50 border border-emerald-150 rounded-xl p-3 text-xxs font-bold text-emerald-700">
              {authSuccess}
            </div>
          )}

          {authTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-xs font-semibold focus:border-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="password"
                  placeholder="Password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-xs font-semibold focus:border-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>
              {authError && <p className="text-xxs font-bold text-red-500">{authError}</p>}
              <button
                type="submit"
                className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-xs font-black transition-colors shadow-md shadow-indigo-150"
              >
                Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-xs font-semibold focus:border-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-xs font-semibold focus:border-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="password"
                  placeholder="Strong Password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-xs font-semibold focus:border-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>
              {authError && <p className="text-xxs font-bold text-red-500">{authError}</p>}
              <button
                type="submit"
                className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-xs font-black transition-colors"
              >
                Create Account
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none mb-8 margin-0">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        
        {/* Navigation Sidebar Tabs */}
        <aside className="space-y-1.5 md:col-span-1">
          {[
            { id: 'profile', label: 'Profile Settings', icon: <User className="h-4.5 w-4.5" /> },
            { id: 'orders', label: 'Orders & Tracking', icon: <Package className="h-4.5 w-4.5" /> },
            { id: 'addresses', label: 'Address Book', icon: <MapPin className="h-4.5 w-4.5" /> },
            { id: 'wishlist', label: 'My Wishlist', icon: <Heart className="h-4.5 w-4.5" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setSelectedOrder(null); }}
              className={`flex w-full items-center gap-3.5 rounded-2xl px-4.5 py-3 text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-55 bg-indigo-600 text-white shadow-md shadow-indigo-150'
                  : 'text-slate-650 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
          <button
            onClick={logout}
            className="flex w-full items-center gap-3.5 rounded-2xl px-4.5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors mt-4"
          >
            Logout
          </button>

          <div className="pt-4">
            <p className="px-4 pb-2 text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">More Options</p>
            <div className="space-y-1.5">
              <Link
                to="/hire-purchase"
                className="flex w-full items-center gap-3.5 rounded-2xl px-4.5 py-3 text-sm font-semibold text-slate-650 transition-all hover:bg-slate-50"
              >
                <CreditCard className="h-4.5 w-4.5 text-[#1357d9]" />
                <span>Hire Purchase</span>
              </Link>
              <Link
                to="/account?tab=orders"
                className="flex w-full items-center gap-3.5 rounded-2xl px-4.5 py-3 text-sm font-semibold text-slate-650 transition-all hover:bg-slate-50"
              >
                <ReceiptText className="h-4.5 w-4.5 text-[#1357d9]" />
                <span>Statements</span>
              </Link>
              <Link
                to="/hire-purchase#documents"
                className="flex w-full items-center gap-3.5 rounded-2xl px-4.5 py-3 text-sm font-semibold text-slate-650 transition-all hover:bg-slate-50"
              >
                <FileText className="h-4.5 w-4.5 text-[#1357d9]" />
                <span>Documentation</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Tab Detail Pane */}
        <main className="md:col-span-3">
          
          {/* PROFILE SETTINGS */}
          {activeTab === 'profile' && user && (
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xxs space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-5">
                <UserAvatar
                  name={user.name}
                  imageUrl={user.imageUrl}
                  className="h-14 w-14 rounded-2xl border border-indigo-100 bg-indigo-50"
                  fallbackClassName="bg-indigo-50 text-indigo-700 text-xl font-black"
                  imageClassName="object-cover"
                />
                <div>
                  <h3 className="text-base font-extrabold text-slate-850">{user.name}</h3>
                  <p className="text-xs text-slate-400 font-semibold">{user.email}</p>
                </div>
              </div>

              {/* Loyalty Widget */}
              <div className="rounded-2xl bg-indigo-50/20 border border-indigo-100 p-4.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="h-6 w-6 text-indigo-650 animate-pulse" />
                  <div>
                    <h4 className="text-xs font-black text-indigo-700">ERP Loyalty Rewards</h4>
                    <p className="text-xxs font-semibold text-indigo-500">Collect points during checkout checks</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-indigo-650">{user.loyaltyPoints}</p>
                  <p className="text-4xs font-bold uppercase tracking-wider text-slate-400">Total Points</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md pt-2">
                <div>
                  <label className="text-xxs font-extrabold text-slate-400 uppercase">Change Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xxs font-extrabold text-slate-400 uppercase">Phone Number</label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                {profileMessage && <p className="text-xxs font-bold text-emerald-600">{profileMessage}</p>}
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 transition-colors"
                >
                  Save Settings
                </button>
              </form>
            </div>
          )}

          {/* ORDERS & TRACKING */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {!selectedOrder ? (
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xxs">
                  <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-50 pb-3.5">Placed Sales Orders</h3>
                  
                  {orders.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-xs text-slate-400 font-semibold">No sales order records retrieved.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {orders.map((ord) => (
                        <div key={ord.id} className="py-4.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <span className="text-xxs font-extrabold text-indigo-650 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                              {ord.id}
                            </span>
                            <p className="text-xs font-bold text-slate-800 mt-2">Placed: {ord.date}</p>
                            <p className="text-xs font-semibold text-slate-450 mt-0.5">Payment: {ord.paymentMethod}</p>
                          </div>
                          
                          <div className="flex items-center gap-4 self-end sm:self-center">
                            <div className="text-right">
                              <p className="text-sm font-black text-slate-900">{currency}{ord.total.toFixed(2)}</p>
                              <span className="text-xxs font-bold text-slate-400">({ord.items.length} items)</span>
                            </div>
                            
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-3.5 transition-all flex items-center gap-1"
                            >
                              Track Details
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xxs space-y-6">
                  {/* Order Track detailed view */}
                  <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                    >
                      ← Back to Orders list
                    </button>
                    <span className="text-xxs font-extrabold text-slate-400">Code: {selectedOrder.id}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Progress tracking timeline */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Order Cycle Status</h4>
                      <TrackingTimeline timeline={selectedOrder.timeline} />
                    </div>

                    {/* Order metadata and subitems */}
                    <div className="space-y-5">
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-2.5 font-semibold text-xs text-slate-550">
                        <h4 className="text-xxs font-extrabold uppercase tracking-wider text-slate-400 mb-1">Receipt Summary</h4>
                        <div className="flex justify-between">
                          <span>Items Total:</span>
                          <span className="text-slate-800 font-extrabold">{currency}{selectedOrder.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Discount Rules:</span>
                          <span className="text-rose-650 font-bold">-{currency}{selectedOrder.discount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax Collected:</span>
                          <span className="text-slate-800 font-extrabold">{currency}{selectedOrder.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-2 font-black text-slate-800">
                          <span>Paid Total:</span>
                          <span className="text-indigo-650">{currency}{selectedOrder.total.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* PDF Invoice & returns actions */}
                      <div className="flex gap-2.5">
                        <button
                          onClick={() => handleInvoiceDownload(selectedOrder.id)}
                          className="flex-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold py-2.5 text-center text-slate-650 transition-colors"
                        >
                          Get PDF Invoice
                        </button>
                        <button
                          onClick={() => handleReturnRequest(selectedOrder.id)}
                          className="flex-1 rounded-xl bg-red-50 hover:bg-red-100 text-xs font-bold py-2.5 text-center text-red-600 transition-colors"
                        >
                          Submit Return Request
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ADDRESS BOOK */}
          {activeTab === 'addresses' && (
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xxs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <h3 className="text-base font-extrabold text-slate-800">Saved Shipping Addresses</h3>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 transition-colors"
                  >
                    + Add New
                  </button>
                )}
              </div>

              {showAddressForm ? (
                <form onSubmit={handleAddAddress} className="space-y-4 max-w-md">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xxs font-extrabold text-slate-400 uppercase">Label Name</label>
                      <input
                        type="text"
                        value={newAddress.name}
                        onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-semibold focus:outline-none"
                        placeholder="e.g. Home"
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
                      <label className="text-xxs font-extrabold text-slate-400 uppercase">ZIP</label>
                      <input
                        type="text"
                        value={newAddress.zipCode}
                        onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-semibold focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <button type="submit" className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2">
                      Save
                    </button>
                    <button type="button" onClick={() => setShowAddressForm(false)} className="rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold px-4 py-2">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user?.addresses.map((addr) => (
                    <div key={addr.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4.5 relative text-left">
                      <span className="inline-block text-xxs font-extrabold text-indigo-755 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded uppercase mb-2">
                        {addr.name} {addr.isDefault && '(Default)'}
                      </span>
                      <p className="text-xs font-bold text-slate-800">{addr.recipientName}</p>
                      <p className="text-xs text-slate-500 font-medium mt-1">{addr.street}</p>
                      <p className="text-xs text-slate-550 font-medium">
                        {addr.city}, {addr.state} {addr.zipCode}
                      </p>
                      <button
                        onClick={() => deleteAddress(addr.id)}
                        className="absolute top-4 right-4 text-xxs font-bold text-red-500 hover:text-red-650"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xxs space-y-6">
              <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-50 pb-4">My Wishlist</h3>
              
              {wishlistItems.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-xs text-slate-400 font-semibold">Your wishlist is empty.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {wishlistItems.map((item) => (
                    <ProductCard key={item.id} product={item} />
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

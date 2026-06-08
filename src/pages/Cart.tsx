import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Tag, Percent, LogIn } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useConfigStore } from '../store/useConfigStore';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, couponCode, applyCoupon, removeCoupon, getTotals } = useCartStore();
  const { currency } = useConfigStore();
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const totals = getTotals();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    if (!couponInput.trim()) return;

    const result = applyCoupon(couponInput);
    if (result.success) {
      setCouponSuccess(result.message);
      setCouponInput('');
    } else {
      setCouponError(result.message);
    }
  };

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', '/checkout');
      openAuthModal('login');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="rounded-full bg-slate-50 border border-slate-100 h-16 w-16 flex items-center justify-center mx-auto mb-5 shadow-inner">
          <ShoppingBag className="h-7 w-7 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Your shopping cart is empty</h2>
        <p className="text-xs text-slate-450 mt-1 max-w-xs mx-auto">
          Explore our trending catalog to add products, electronic items, accessories, and organic groceries.
        </p>
        <Link
          to="/catalog"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-black text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-150"
        >
          Explore Products
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-none mb-8 margin-0">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xxs space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex gap-4 py-4.5 border-b border-slate-50 last:border-none items-center">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-20 w-20 rounded-2xl object-cover shrink-0 bg-slate-50 border border-slate-100"
                />
                
                <div className="flex-1 min-w-0">
                  <span className="text-xxs font-extrabold uppercase tracking-wider text-indigo-500">
                    {item.product.brand || 'Generic'}
                  </span>
                  <Link to={`/product/${item.product.id}`}>
                    <h3 className="text-sm font-bold text-slate-850 truncate hover:text-indigo-650 transition-colors">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-xs font-black text-slate-900 mt-1.5">{currency}{item.product.price.toFixed(2)}</p>
                </div>

                {/* Quantity Control */}
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg font-bold hover:bg-slate-200 text-slate-600"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg font-bold hover:bg-slate-200 text-slate-600"
                  >
                    +
                  </button>
                </div>

                {/* Remove Trigger */}
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Summary Panel */}
        <div className="space-y-6">
          
          {/* Coupon Code Section */}
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xxs">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-3.5">Promo Coupon</h3>
            
            {couponCode ? (
              <div className="flex items-center justify-between bg-indigo-50 border border-indigo-150 p-3.5 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Percent className="h-4.5 w-4.5 text-indigo-600 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-indigo-700">{couponCode}</p>
                    <p className="text-xxs font-semibold text-indigo-500">Coupon applied successfully</p>
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-indigo-650 hover:text-red-500"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. WELCOME10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3.5 text-xs font-semibold text-slate-800 focus:border-indigo-550 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-xxs font-bold text-red-500 px-1">{couponError}</p>}
                {couponSuccess && <p className="text-xxs font-bold text-emerald-600 px-1">{couponSuccess}</p>}
                <div className="bg-slate-55 bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xxs font-semibold text-slate-400 space-y-1">
                  <p>Try: <span className="font-extrabold text-slate-700">WELCOME10</span> (10% off)</p>
                  <p>Try: <span className="font-extrabold text-slate-700">ERPRETAIL20</span> (20% off over {currency}100)</p>
                </div>
              </form>
            )}
          </div>

          {/* Pricing Totals */}
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xxs space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-50 pb-3">Order Summary</h3>
            
            <div className="space-y-2.5 text-xs font-semibold text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-800 font-extrabold">{currency}{totals.subtotal.toFixed(2)}</span>
              </div>
              
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Discount</span>
                  <span>-{currency}{totals.discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Sales Tax (8%)</span>
                <span className="text-slate-800 font-extrabold">{currency}{totals.tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping Estimate</span>
                <span className="text-slate-800 font-extrabold">
                  {totals.shipping === 0 ? 'FREE' : `${currency}${totals.shipping.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-between items-baseline">
              <span className="text-sm font-extrabold text-slate-800">Total Order Cost</span>
              <span className="text-xl font-black text-indigo-650">{currency}{totals.total.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-sm font-black transition-all shadow-md shadow-indigo-150"
            >
              {isAuthenticated ? (
                <>Checkout Order <ArrowRight className="h-4.5 w-4.5" /></>
              ) : (
                <>
                  <LogIn className="h-4.5 w-4.5" />
                  Sign in to Checkout
                </>
              )}
            </button>
            {!isAuthenticated && (
              <p className="mt-2 text-center text-xxs font-semibold text-slate-400">
                You must be logged in to place an order.
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Settings, Menu, X, LogOut, Package, ShieldCheck, Store, Headphones, CreditCard, ShoppingBag, Bot } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useConfigStore } from '../../store/useConfigStore';
import { productService } from '../../services/product.service';

interface NavbarProps {
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu }) => {
  const navigate = useNavigate();
  const { items } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { storeName } = useConfigStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ products: string[]; categories: string[] }>({ products: [], categories: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showHelpDropdown, setShowHelpDropdown] = useState(false);
  
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const helpMenuRef = useRef<HTMLDivElement>(null);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const res = await productService.getSearchSuggestions(searchQuery);
          setSuggestions({ products: res.productSuggestions, categories: res.categorySuggestions });
          setShowSuggestions(true);
        } catch (e) {
          console.error(e);
        }
      } else {
        setSuggestions({ products: [], categories: [] });
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (helpMenuRef.current && !helpMenuRef.current.contains(event.target as Node)) {
        setShowHelpDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (type: 'product' | 'category', value: string) => {
    setSearchQuery(value);
    setShowSuggestions(false);
    if (type === 'category') {
      navigate(`/catalog?category=${value.toLowerCase().replace(/\s+/g, '-')}`);
    } else {
      navigate(`/catalog?search=${encodeURIComponent(value)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0060a9] border-b border-[#005596] shadow-md transition-all duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            <button 
              onClick={onToggleMobileMenu} 
              className="rounded-lg p-2 text-white hover:bg-white/10 md:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="flex items-center gap-2 hover:opacity-95">
              <img src="/logo.png" alt="Courts Logo" className="h-9 w-auto object-contain" />
            </Link>
          </div>

          {/* Instant Search Bar */}
          <div className="relative flex-1 max-w-md hidden md:block">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search brand, category, or product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim().length > 1 && setShowSuggestions(true)}
                  className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-4 pr-10 text-sm font-medium text-slate-800 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                <button type="submit" className="absolute right-3 top-2.5 text-slate-400 hover:text-indigo-600">
                  <Search className="h-4.5 w-4.5" />
                </button>
              </div>
            </form>

            {/* Suggestions Overlay */}
            {showSuggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
              <div ref={suggestionsRef} className="absolute left-0 mt-2 w-full rounded-2xl bg-white p-3 shadow-xl border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                {suggestions.categories.length > 0 && (
                  <div className="mb-2">
                    <h4 className="px-3 py-1 text-xxs font-bold uppercase tracking-wider text-slate-400">Categories</h4>
                    {suggestions.categories.map((cat, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick('category', cat)}
                        className="flex w-full items-center px-3 py-1.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 text-left"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
                {suggestions.products.length > 0 && (
                  <div>
                    <h4 className="px-3 py-1 text-xxs font-bold uppercase tracking-wider text-slate-400">Products</h4>
                    {suggestions.products.map((prod, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick('product', prod)}
                        className="flex w-full items-center px-3 py-1.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 text-left truncate"
                      >
                        {prod}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Catalog Link */}
            <Link 
              to="/catalog" 
              className="flex items-center gap-1.5 text-sm font-bold text-white hover:text-white/90 py-2 px-3 rounded-lg hover:bg-white/10 transition-colors hidden sm:flex"
            >
              <ShoppingBag className="h-4 w-4 text-white" />
              <span>Shop Catalog</span>
            </Link>

            {/* Store Locator */}
            <Link 
              to="/store-locator" 
              className="flex items-center gap-1.5 text-sm font-bold text-white hover:text-white/90 py-2 px-3 rounded-lg hover:bg-white/10 transition-colors hidden lg:flex"
            >
              <Store className="h-4 w-4 text-white" />
              <span>Store Locator</span>
            </Link>

            {/* Help Center */}
            <div className="relative" ref={helpMenuRef}>
              <button 
                onClick={() => setShowHelpDropdown(!showHelpDropdown)}
                className="flex items-center gap-1.5 text-sm font-bold text-white hover:text-white/90 py-2 px-3 rounded-lg hover:bg-white/10 transition-colors hidden lg:flex cursor-pointer outline-none border-none bg-transparent"
              >
                <div className="relative">
                  <Headphones className="h-4 w-4 text-white" />
                  <span className="absolute -left-0.5 top-1.5 h-1.5 w-1 bg-red-500 rounded-full"></span>
                  <span className="absolute -right-0.5 top-1.5 h-1.5 w-1 bg-red-500 rounded-full"></span>
                </div>
                <span>Help Center</span>
              </button>

              {showHelpDropdown && (
                <div className="absolute left-0 mt-2 w-52 rounded-2xl bg-white p-2 shadow-xl border border-slate-100 text-slate-800 text-xs font-semibold space-y-1 z-50 animate-in fade-in duration-200">
                  <button 
                    onClick={() => {
                      setShowHelpDropdown(false);
                      if ((window as any).openTinniChat) {
                        (window as any).openTinniChat();
                      }
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left rounded-xl hover:bg-indigo-50 text-[#0060a9] hover:text-[#005596] font-bold transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <Bot className="h-4 w-4" />
                    Chat with Tinni (AI)
                  </button>
                  <button 
                    onClick={() => {
                      setShowHelpDropdown(false);
                      alert("Connecting you to a real customer support agent. A representative will join shortly.");
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left rounded-xl hover:bg-emerald-50 text-emerald-650 hover:text-emerald-700 font-bold transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <User className="h-4 w-4" />
                    Chat with Real Agent
                  </button>
                </div>
              )}
            </div>

            {/* Hire Purchase */}
            <Link 
              to="/hire-purchase" 
              className="flex items-center gap-1.5 text-sm font-bold text-white hover:text-white/90 py-2 px-3 rounded-lg hover:bg-white/10 transition-colors hidden lg:flex"
            >
              <CreditCard className="h-4 w-4 text-white" />
              <span>Hire Purchase</span>
            </Link>

            {/* Admin Config Button */}
            <Link
              to="/admin"
              className="rounded-full p-2 text-white hover:bg-white/10 transition-all"
              title="Admin ERP Configuration"
            >
              <Settings className="h-5.5 w-5.5" />
            </Link>

            {/* Wishlist Icon */}
            <Link
              to="/account?tab=wishlist"
              className="relative rounded-full p-2 text-white hover:bg-white/10 transition-all"
              title="Wishlist"
            >
              <Heart className="h-5.5 w-5.5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-xxs font-bold text-white ring-2 ring-[#0060a9]">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart Icon */}
            <Link
              to="/cart"
              className="relative rounded-full p-2 text-white hover:bg-white/10 transition-all"
              title="Cart"
            >
              <ShoppingCart className="h-5.5 w-5.5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-amber-400 text-xxs font-black text-slate-900 ring-2 ring-[#0060a9]">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account / Profile Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-1.5 rounded-full bg-white/10 p-1 pr-3 hover:bg-white/20 border border-white/10 transition-all text-white"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-[#0060a9]">
                      {user?.name ? user.name[0] : <User className="h-4 w-4" />}
                    </div>
                    <span className="text-xs font-bold text-white hidden sm:inline-block max-w-[80px] truncate">
                      {user?.name.split(' ')[0]}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2.5 shadow-xl border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-3 py-2 border-b border-slate-50">
                        <p className="text-xs font-semibold text-slate-400">Signed in as</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{user?.email}</p>
                      </div>
                      <div className="mt-1.5 space-y-0.5">
                        <Link
                          to="/account"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                        >
                          <User className="h-4.5 w-4.5" />
                          My Account
                        </Link>
                        <Link
                          to="/account?tab=orders"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                        >
                          <Package className="h-4.5 w-4.5" />
                          Order History
                        </Link>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            logout();
                          }}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-semibold text-red-600 rounded-xl hover:bg-red-50 transition-colors text-left"
                        >
                          <LogOut className="h-4.5 w-4.5" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/account?tab=login"
                  className="flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 py-1.5 px-3.5 transition-all text-white"
                >
                  <User className="h-4 w-4 text-white" />
                  <span className="text-xs font-bold text-white">Login</span>
                </Link>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};

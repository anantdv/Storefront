import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, X, LogOut, Package, Store, Headphones, CreditCard, ShoppingBag, Bot } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useConfigStore } from '../../store/useConfigStore';
import { useUIStore } from '../../store/useUIStore';
import { productService } from '../../services/product.service';
import { getAssetUrl } from '../../utils/assets';

interface NavbarProps {
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu }) => {
  const navigate = useNavigate();
  const { items } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { storeName } = useConfigStore();
  const { openAuthModal } = useUIStore();
  
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
    <header className="sticky top-0 z-40 w-full">
      <div className="market-ribbon h-1 w-full" />
      <div className="market-panel border-x-0 border-t-0 border-b border-white/10 text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-18 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleMobileMenu}
                className="rounded-xl p-2 text-white/90 transition-colors hover:bg-white/10 md:hidden"
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6" />
              </button>
              <Link to="/" className="flex items-center gap-3 hover:opacity-95">
                <img src={getAssetUrl('/logo.png')} alt="Courts Logo" className="h-[4.25rem] w-auto object-contain" />
              </Link>
            </div>

            <div className="relative hidden max-w-md flex-1 md:block">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search brand, category, or product..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.trim().length > 1 && setShowSuggestions(true)}
                    className="market-input w-full rounded-full py-2.5 pl-4 pr-10 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#ffcb2f]/35"
                  />
                  <button type="submit" className="absolute right-3 top-2.5 text-slate-500 hover:text-[#1357d9]">
                    <Search className="h-4.5 w-4.5" />
                  </button>
                </div>
              </form>

              {showSuggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
                <div ref={suggestionsRef} className="absolute left-0 mt-2 w-full rounded-3xl border border-white/10 bg-[#0b0d10] p-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                  {suggestions.categories.length > 0 && (
                    <div className="mb-2">
                      <h4 className="px-3 py-1 text-xxs font-black uppercase tracking-[0.25em] text-[#ffcb2f]">Categories</h4>
                      {suggestions.categories.map((cat, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick('category', cat)}
                          className="flex w-full items-center rounded-2xl px-3 py-2 text-left text-sm font-medium text-white/90 transition-colors hover:bg-white/8 hover:text-[#ffcb2f]"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                  {suggestions.products.length > 0 && (
                    <div>
                      <h4 className="px-3 py-1 text-xxs font-black uppercase tracking-[0.25em] text-[#ffcb2f]">Products</h4>
                      {suggestions.products.map((prod, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick('product', prod)}
                          className="flex w-full items-center truncate rounded-2xl px-3 py-2 text-left text-sm font-medium text-white/90 transition-colors hover:bg-white/8 hover:text-[#ffcb2f]"
                        >
                          {prod}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3">
              <Link
                to="/catalog"
                className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10 sm:flex"
              >
                <ShoppingBag className="h-4 w-4 text-[#ffcb2f]" />
                <span>Shop Catalog</span>
              </Link>

              <Link
                to="/store-locator"
                className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10 lg:flex"
              >
                <Store className="h-4 w-4 text-[#ffcb2f]" />
                <span>Store Locator</span>
              </Link>

              <div className="relative" ref={helpMenuRef}>
                <button
                  onClick={() => setShowHelpDropdown(!showHelpDropdown)}
                  className="hidden cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10 lg:flex outline-none border-none"
                >
                  <div className="relative">
                    <Headphones className="h-4 w-4 text-[#ffcb2f]" />
                    <span className="absolute -left-0.5 top-1.5 h-1.5 w-1 rounded-full bg-[#f11d2b]" />
                    <span className="absolute -right-0.5 top-1.5 h-1.5 w-1 rounded-full bg-[#f11d2b]" />
                  </div>
                  <span>Help Center</span>
                </button>

                {showHelpDropdown && (
                  <div className="absolute left-0 z-50 mt-2 w-56 space-y-1 rounded-3xl border border-white/10 bg-[#0b0d10] p-2 text-xs font-semibold text-white shadow-2xl animate-in fade-in duration-200">
                    <button
                      onClick={() => {
                        setShowHelpDropdown(false);
                        if ((window as any).openTinniChat) {
                          (window as any).openTinniChat();
                        }
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-2xl border-none bg-transparent px-3 py-2 text-left font-bold text-white transition-colors hover:bg-white/8 hover:text-[#ffcb2f]"
                    >
                      <Bot className="h-4 w-4" />
                      Chat with Tinni (AI)
                    </button>
                    <button
                      onClick={() => {
                        setShowHelpDropdown(false);
                        alert('Connecting you to a real customer support agent. A representative will join shortly.');
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-2xl border-none bg-transparent px-3 py-2 text-left font-bold text-white transition-colors hover:bg-white/8 hover:text-[#1357d9]"
                    >
                      <User className="h-4 w-4" />
                      Chat with Real Agent
                    </button>
                  </div>
                )}
              </div>

              <Link
                to="/hire-purchase"
                className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10 lg:flex"
              >
                <CreditCard className="h-4 w-4 text-[#ffcb2f]" />
                <span>Hire Purchase</span>
              </Link>

              <Link
                to="/account?tab=wishlist"
                className="relative rounded-full p-2 text-white transition-all hover:bg-white/10"
                title="Wishlist"
              >
                <Heart className="h-5.5 w-5.5" />
                {wishlistCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#f11d2b] text-xxs font-bold text-white ring-2 ring-[#0b0d10]">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className="relative rounded-full p-2 text-white transition-all hover:bg-white/10"
                title="Cart"
              >
                <ShoppingCart className="h-5.5 w-5.5" />
                {cartCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#ffcb2f] text-xxs font-black text-[#0b0d10] ring-2 ring-[#0b0d10]">
                    {cartCount}
                  </span>
                )}
              </Link>

              <div className="relative" ref={profileMenuRef}>
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 p-1 pr-3 text-white transition-all hover:bg-white/10"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ffcb2f] text-xs font-bold text-[#0b0d10]">
                        {user?.name ? user.name[0] : <User className="h-4 w-4" />}
                      </div>
                      <span className="hidden max-w-[80px] truncate text-xs font-bold text-white sm:inline-block">
                        {user?.name.split(' ')[0]}
                      </span>
                    </button>

                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-56 rounded-3xl border border-white/10 bg-[#0b0d10] p-2.5 text-white shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="border-b border-white/10 px-3 py-2">
                          <p className="text-xs font-semibold text-white/55">Signed in as</p>
                          <p className="truncate text-sm font-bold text-white">{user?.email}</p>
                        </div>
                        <div className="mt-1.5 space-y-0.5">
                          <Link
                            to="/account"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/8 hover:text-[#ffcb2f]"
                          >
                            <User className="h-4.5 w-4.5" />
                            My Account
                          </Link>
                          <Link
                            to="/account?tab=orders"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/8 hover:text-[#ffcb2f]"
                          >
                            <Package className="h-4.5 w-4.5" />
                            Order History
                          </Link>
                          <button
                            onClick={() => {
                              setShowProfileMenu(false);
                              logout();
                            }}
                            className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-left text-sm font-semibold text-[#ffcb2f] transition-colors hover:bg-white/8"
                          >
                            <LogOut className="h-4.5 w-4.5" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => openAuthModal('login')}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-white transition-all hover:bg-white/10"
                  >
                    <User className="h-4 w-4 text-[#ffcb2f]" />
                    <span className="text-xs font-bold text-white">Login</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { X, User, Package, Settings, LogOut, BookOpen, Compass, Store, Headphones, CreditCard, Bot } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { productService } from '../../services/product.service';
import { Category } from '../../types/shop.types';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [categories, setCategories] = React.useState<Category[]>([]);

  React.useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await productService.getCategories();
        setCategories(res);
      } catch (e) {
        console.error('Failed to load categories in MobileNav:', e);
      }
    };
    if (isOpen) {
      fetchCats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200">
      {/* Dark Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer Content */}
      <div className="relative flex w-full max-w-xs flex-col bg-white pb-4 shadow-xl animate-in slide-in-from-left duration-300 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-[#0060a9] border-b border-[#005596]">
          <Link to="/" onClick={onClose} className="hover:opacity-95">
            <img src="/logo.png" alt="Courts Logo" className="h-7 w-auto object-contain" />
          </Link>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white hover:bg-white/10 cursor-pointer border-none bg-transparent">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Profile Hook */}
        <div className="p-4 bg-slate-50 border-b border-slate-100">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                {user?.name[0]}
              </div>
              <div className="truncate">
                <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-2">Welcome to our store!</p>
              <Link
                to="/account?tab=login"
                onClick={onClose}
                className="flex w-full items-center justify-center rounded-xl bg-indigo-600 py-2 text-center text-sm font-bold text-white shadow-md shadow-indigo-150 hover:bg-indigo-700 transition-colors"
              >
                Sign In / Register
              </Link>
            </div>
          )}
        </div>

        {/* Categories / Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Shopping Pages</h3>
            <div className="space-y-1">
              <Link
                to="/catalog"
                onClick={onClose}
                className="flex items-center gap-2.5 py-2 px-3 text-sm font-semibold text-slate-700 rounded-lg hover:bg-slate-50"
              >
                <Compass className="h-4.5 w-4.5 text-slate-500" />
                Browse Catalog
              </Link>
              <Link
                to="/store-locator"
                onClick={onClose}
                className="flex items-center gap-2.5 py-2 px-3 text-sm font-semibold text-slate-700 rounded-lg hover:bg-slate-50"
              >
                <Store className="h-4.5 w-4.5 text-slate-500" />
                Store Locator
              </Link>
              <Link
                to="/hire-purchase"
                onClick={onClose}
                className="flex items-center gap-2.5 py-2 px-3 text-sm font-semibold text-slate-700 rounded-lg hover:bg-slate-50"
              >
                <CreditCard className="h-4.5 w-4.5 text-slate-500" />
                Hire Purchase
              </Link>
              <button
                onClick={() => {
                  onClose();
                  if ((window as any).openTinniChat) {
                    (window as any).openTinniChat();
                  }
                }}
                className="flex w-full items-center gap-2.5 py-2 px-3 text-sm font-semibold text-slate-700 rounded-lg hover:bg-slate-50 text-left cursor-pointer border-none bg-transparent"
              >
                <Bot className="h-4.5 w-4.5 text-[#0060a9]" />
                <span>Chat with Tinni (AI)</span>
              </button>
              <Link
                to="/admin"
                onClick={onClose}
                className="flex items-center gap-2.5 py-2 px-3 text-sm font-semibold text-slate-700 rounded-lg hover:bg-slate-50"
              >
                <Settings className="h-4.5 w-4.5 text-slate-500" />
                ERP Configuration
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Shop Categories</h3>
            <div className="grid grid-cols-1 gap-1">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/catalog?category=${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={onClose}
                  className="flex items-center gap-2.5 py-2 px-3 text-sm font-semibold text-slate-605 rounded-lg hover:bg-slate-50"
                >
                  <span className="text-base">{cat.icon || '📦'}</span>
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {isAuthenticated && (
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 transition-colors"
            >
              <LogOut className="h-4.5 w-4.5" />
              Sign Out
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

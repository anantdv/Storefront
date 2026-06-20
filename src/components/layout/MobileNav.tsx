import React from 'react';
import { Link } from 'react-router-dom';
import { X, LogOut, Compass, Store, CreditCard, Bot } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { productService } from '../../services/product.service';
import { Category } from '../../types/shop.types';
import { getAssetUrl } from '../../utils/assets';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { openAuthModal } = useUIStore();
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
      <div className="fixed inset-0 bg-[#090b10]/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex w-full max-w-xs flex-col overflow-hidden bg-[#0b0d10] pb-4 text-white shadow-2xl animate-in slide-in-from-left duration-300">
        <div className="market-ribbon h-1 w-full" />
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <Link to="/" onClick={onClose} className="hover:opacity-95">
            <img src={getAssetUrl('/logo.png')} alt="Courts Logo" className="h-10 w-auto object-contain" />
          </Link>
          <button onClick={onClose} className="rounded-lg border-none bg-transparent p-1.5 text-white/80 hover:bg-white/10 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-white/10 p-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1357d9] text-sm font-black text-white">
                {user?.name[0]}
              </div>
              <div className="truncate">
                <p className="text-sm font-bold text-white">{user?.name}</p>
                <p className="truncate text-xs text-white/55">{user?.email}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-white/70">Welcome to our store!</p>
              <button
                onClick={() => {
                  onClose();
                  openAuthModal('login');
                }}
                className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#f11d2b] to-[#ffcb2f] py-2.5 text-center text-sm font-black text-[#0b0d10] shadow-lg transition-colors cursor-pointer border-none"
              >
                Sign In / Register
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          <div>
            <h3 className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-[#ffcb2f]">Shopping Pages</h3>
            <div className="space-y-1">
              <Link to="/catalog" onClick={onClose} className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-semibold text-white/85 hover:bg-white/8">
                <Compass className="h-4.5 w-4.5 text-[#ffcb2f]" />
                Browse Catalog
              </Link>
              <Link to="/store-locator" onClick={onClose} className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-semibold text-white/85 hover:bg-white/8">
                <Store className="h-4.5 w-4.5 text-[#ffcb2f]" />
                Store Locator
              </Link>
              <Link to="/hire-purchase" onClick={onClose} className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-semibold text-white/85 hover:bg-white/8">
                <CreditCard className="h-4.5 w-4.5 text-[#ffcb2f]" />
                Hire Purchase
              </Link>
              <button
                onClick={() => {
                  onClose();
                  if ((window as any).openTinniChat) {
                    (window as any).openTinniChat();
                  }
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-2xl border-none bg-transparent px-3 py-2 text-left text-sm font-semibold text-white/85 hover:bg-white/8"
              >
                <Bot className="h-4.5 w-4.5 text-[#1357d9]" />
                <span>Chat with Tinni (AI)</span>
              </button>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-[#ffcb2f]">Shop Categories</h3>
            <div className="grid grid-cols-1 gap-1">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/catalog?category=${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={onClose}
                  className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/8"
                >
                  <span className="text-base">{cat.icon || '📦'}</span>
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {isAuthenticated && (
          <div className="border-t border-white/10 p-4">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f11d2b]/12 py-2.5 text-sm font-black text-[#ffcb2f] hover:bg-[#f11d2b]/20 transition-colors"
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

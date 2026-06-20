import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Product } from '../../types/shop.types';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useConfigStore } from '../../store/useConfigStore';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { currency } = useConfigStore();

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const wishlisted = isInWishlist(product.id);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[1.4rem] border border-black/10 bg-white shadow-[0_18px_40px_rgba(11,13,16,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#1357d9]/25 sm:rounded-[1.75rem]">
      <div className="h-1 bg-gradient-to-r from-[#f11d2b] via-[#ffcb2f] to-[#1357d9]" />

      <Link to={`/product/${product.id}`} className="relative block aspect-square w-full overflow-hidden bg-[#f4f5f7]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {product.discount && product.discount > 0 && (
          <div className="absolute left-4 top-4 rounded-full bg-[#0b0d10] px-3 py-1 text-[10px] font-black tracking-[0.2em] text-[#ffcb2f] shadow-lg">
            -{product.discount}% OFF
          </div>
        )}

        <button
          onClick={handleWishlistClick}
          className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/90 shadow-sm backdrop-blur-xs transition-colors hover:bg-white hover:text-[#f11d2b] focus:outline-none sm:right-4 sm:top-4 sm:h-10 sm:w-10 ${
            wishlisted ? 'text-[#f11d2b]' : 'text-slate-400'
          }`}
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4 sm:h-5 sm:w-5" fill={wishlisted ? 'currentColor' : 'none'} />
        </button>

        {product.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0b0d10]/55 backdrop-blur-xs">
            <span className="rounded-full bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-[#0b0d10] shadow-md sm:px-4 sm:py-2 sm:text-[10px] sm:tracking-[0.25em]">
              Out Of Stock
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <div className="flex-1">
          <div className="mb-1.5 flex items-center justify-between gap-1">
            <span className="max-w-[64px] truncate text-[9px] font-black uppercase tracking-[0.18em] text-[#1357d9] sm:max-w-[80px] sm:text-[10px] sm:tracking-[0.25em]" title={product.category}>
              {product.category || 'General'}
            </span>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="rounded-full bg-[#ffcb2f]/20 px-1.5 py-0.5 text-[9px] font-black text-[#0b0d10] sm:px-2 sm:text-[10px]">
                {product.stock} Left
              </span>
            )}
            {product.stock > 5 && (
              <span className="rounded-full bg-[#1357d9]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#1357d9] sm:px-2 sm:text-[10px]">
                In Stock
              </span>
            )}
          </div>

          <Link to={`/product/${product.id}`} className="block">
            <h3 className="line-clamp-2 h-8 text-[11px] font-black leading-tight text-slate-900 transition-colors group-hover:text-[#f11d2b] sm:h-10 sm:text-sm sm:font-black sm:line-clamp-2">
              {product.name}
            </h3>
          </Link>

          <div className="mt-1 flex items-center gap-1">
            <div className="flex items-center gap-0.5 rounded-full bg-[#ffcb2f]/15 px-1.5 py-0.5 sm:px-2">
              <Star className="h-2 w-2 fill-current text-[#f11d2b] sm:h-2.5 sm:w-2.5" />
              <span className="text-[9px] font-black text-[#0b0d10] sm:text-[10px]">{product.rating}</span>
            </div>
            <span className="text-[9px] font-semibold text-slate-400 sm:text-[10px]">({product.reviewCount})</span>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-1.5 border-t border-slate-100 pt-2.5 sm:mt-3 sm:pt-3">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[11px] font-black text-slate-900 sm:text-sm">
                {currency}{product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[9px] font-semibold text-slate-400 line-through sm:text-[10px]">
                  {currency}{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="flex h-7 w-7 items-center justify-center rounded-2xl bg-[#0b0d10] text-[#ffcb2f] transition-all hover:bg-[#1357d9] hover:text-white sm:h-8 sm:w-8"
              title="Add to Cart"
            >
              <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

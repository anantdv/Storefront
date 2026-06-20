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
    <div className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-black/10 bg-white shadow-[0_18px_40px_rgba(11,13,16,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#1357d9]/25">
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
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/90 shadow-sm backdrop-blur-xs transition-colors hover:bg-white hover:text-[#f11d2b] focus:outline-none ${
            wishlisted ? 'text-[#f11d2b]' : 'text-slate-400'
          }`}
          aria-label="Add to wishlist"
        >
          <Heart className="h-5 w-5" fill={wishlisted ? 'currentColor' : 'none'} />
        </button>

        {product.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0b0d10]/55 backdrop-blur-xs">
            <span className="rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#0b0d10] shadow-md">
              Out Of Stock
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between gap-1.5">
            <span className="max-w-[80px] truncate text-[10px] font-black uppercase tracking-[0.25em] text-[#1357d9]" title={product.category}>
              {product.category || 'General'}
            </span>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="rounded-full bg-[#ffcb2f]/20 px-2 py-0.5 text-[10px] font-black text-[#0b0d10]">
                {product.stock} Left
              </span>
            )}
            {product.stock > 5 && (
              <span className="rounded-full bg-[#1357d9]/10 px-2 py-0.5 text-[10px] font-bold text-[#1357d9]">
                In Stock
              </span>
            )}
          </div>

          <Link to={`/product/${product.id}`} className="block">
            <h3 className="h-10 text-sm font-black leading-tight text-slate-900 transition-colors group-hover:text-[#f11d2b] sm:text-base line-clamp-2">
              {product.name}
            </h3>
          </Link>

          <div className="mt-1.5 flex items-center gap-1">
            <div className="flex items-center gap-0.5 rounded-full bg-[#ffcb2f]/15 px-2 py-0.5">
              <Star className="h-2.5 w-2.5 fill-current text-[#f11d2b]" />
              <span className="text-[10px] font-black text-[#0b0d10]">{product.rating}</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">({product.reviewCount})</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-1.5 border-t border-slate-100 pt-3">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black text-slate-900">
                {currency}{product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[10px] font-semibold text-slate-400 line-through">
                  {currency}{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#0b0d10] text-[#ffcb2f] transition-all hover:bg-[#1357d9] hover:text-white"
              title="Add to Cart"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

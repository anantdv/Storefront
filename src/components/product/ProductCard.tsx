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
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xxs transition-all duration-300 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-lg hover:shadow-slate-100/50">
      
      {/* Product Image & Badges */}
      <Link to={`/product/${product.id}`} className="relative block aspect-square w-full overflow-hidden bg-slate-50">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Discount Badge */}
        {product.discount && product.discount > 0 && (
          <div className="absolute top-4 left-4 rounded-xl bg-red-500 px-2.5 py-1 text-xxs font-bold text-white shadow-sm shadow-red-200">
            -{product.discount}% OFF
          </div>
        )}

        {/* Wishlist Heart Overlay */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-xs transition-colors hover:bg-white hover:text-rose-500 focus:outline-none ${
            wishlisted ? 'text-rose-500' : 'text-slate-400'
          }`}
          aria-label="Add to wishlist"
        >
          <Heart className="h-5 w-5" fill={wishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Out of Stock Overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
            <span className="rounded-xl bg-white px-4 py-2 text-xs font-extrabold tracking-wider text-slate-800 uppercase shadow-md">
              Out Of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Card Info */}
      <div className="flex flex-1 flex-col p-3">
        <div className="flex-1">
          {/* Item Group & Stock Status */}
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <span className="text-3xs font-extrabold uppercase tracking-wider text-indigo-600 truncate max-w-[80px]" title={product.category}>
              {product.category || 'General'}
            </span>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="text-3xs font-extrabold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm animate-pulse">
                {product.stock} Left!
              </span>
            )}
            {product.stock > 5 && (
              <span className="text-3xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                In Stock
              </span>
            )}
          </div>

          {/* Product Name */}
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="line-clamp-2 text-sm sm:text-base font-black text-slate-800 group-hover:text-indigo-600 transition-colors h-10 leading-tight">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex items-center gap-0.5 rounded-md bg-amber-50 px-1 py-0.5">
              <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
              <span className="text-3xs font-black text-amber-700">{product.rating}</span>
            </div>
            <span className="text-3xs font-semibold text-slate-400">
              ({product.reviewCount})
            </span>
          </div>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="mt-2.5 flex items-center justify-between gap-1.5 pt-2 border-t border-slate-50">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-extrabold text-slate-900">
                {currency}{product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-3xs font-semibold text-slate-400 line-through">
                  {currency}{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-all hover:bg-indigo-600 hover:text-white"
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

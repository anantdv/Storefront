import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Shield, RotateCcw, Truck, Star, CheckCircle, Database } from 'lucide-react';
import { ProductGallery } from '../components/product/ProductGallery';
import { ProductCard } from '../components/product/ProductCard';
import { productService } from '../services/product.service';
import { inventoryService, WarehouseStock } from '../services/inventory.service';
import { Product } from '../types/shop.types';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useConfigStore } from '../store/useConfigStore';
import { useAuthStore } from '../store/useAuthStore';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { currency } = useConfigStore();
  const { user } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [warehouseStocks, setWarehouseStocks] = useState<WarehouseStock[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'stock' | 'reviews'>('details');

  const [reviewsList, setReviewsList] = useState<{
    reviewerName: string;
    reviewerEmail: string;
    rating: number;
    review: string;
    date: string;
  }[]>([
    { reviewerName: 'Maea K.', reviewerEmail: 'maea@example.com', rating: 5, review: 'Fantastic quality and extremely fast delivery. Highly recommend this for home setups.', date: 'May 12, 2026' },
    { reviewerName: 'Andrew L.', reviewerEmail: 'andrew@example.com', rating: 4, review: 'Very robust build and performance. Satisfied with the purchase.', date: 'April 20, 2026' }
  ]);

  const [newReview, setNewReview] = useState({
    name: user?.name || '',
    email: user?.email || '',
    rating: 5,
    review: ''
  });
  
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.email || !newReview.review || !product) {
      setReviewError('Please fill in all review fields.');
      return;
    }
    
    setSubmittingReview(true);
    setReviewError(null);
    setReviewSuccess(false);

    try {
      const ok = await productService.addProductReview({
        itemCode: product.itemCode || product.id,
        rating: newReview.rating,
        review: newReview.review,
        reviewerName: newReview.name,
        reviewerEmail: newReview.email
      });

      if (ok) {
        setReviewSuccess(true);
        setReviewsList(prev => [
          {
            reviewerName: newReview.name,
            reviewerEmail: newReview.email,
            rating: newReview.rating,
            review: newReview.review,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          },
          ...prev
        ]);
        setNewReview(prev => ({
          ...prev,
          review: ''
        }));
      } else {
        setReviewError('Failed to submit review. Please try again.');
      }
    } catch (err) {
      setReviewError('An unexpected error occurred during review submission.');
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    const loadProductData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const prod = await productService.getProductById(id);
        if (prod) {
          setProduct(prod);
          // Check live warehouse stocks from ERPNext
          const stocks = await inventoryService.getItemStock(prod.itemCode || prod.id);
          setWarehouseStocks(stocks);
          
          // Load related products from catalog
          const related = await productService.getProducts({ category: prod.category });
          setRelatedProducts(related.filter(p => p.id !== prod.id));

          // Fetch reviews from ERPNext
          const reviews = await productService.getProductReviews(prod.itemCode || prod.id);
          setReviewsList(reviews);
        } else {
          setProduct(null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadProductData();
    setQuantity(1);
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square rounded-[1.75rem] bg-slate-200" />
          <div className="space-y-4">
            <div className="h-4 w-1/4 rounded bg-slate-200" />
            <div className="h-8 w-3/4 rounded bg-slate-200" />
            <div className="h-6 w-1/3 rounded bg-slate-200" />
            <div className="h-20 w-full rounded bg-slate-200" />
            <div className="h-10 w-1/2 rounded bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-black text-slate-900">Product Not Found</h2>
        <p className="mt-1 text-xs text-slate-500">The product code you requested does not exist or has been disabled.</p>
        <Link to="/catalog" className="mt-6 inline-block rounded-full bg-[#0b0d10] px-5 py-2.5 text-xs font-black text-[#ffcb2f] hover:bg-[#1357d9]">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const sanitizeDescription = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('script, iframe, object, embed, link, meta').forEach((node) => node.remove());
    doc.querySelectorAll('a').forEach((anchor) => {
      const span = doc.createElement('span');
      span.innerHTML = anchor.innerHTML;
      anchor.replaceWith(span);
    });
    doc.querySelectorAll('*').forEach((node) => {
      Array.from(node.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = attr.value.trim().toLowerCase();
        if (name.startsWith('on') || name === 'style') {
          node.removeAttribute(attr.name);
        }
        if ((name === 'href' || name === 'src') && value.startsWith('javascript:')) {
          node.removeAttribute(attr.name);
        }
      });
    });
    return doc.body.innerHTML;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Product Detail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
        
        {/* Gallery Column */}
        <div>
          <ProductGallery images={product.gallery.length > 0 ? product.gallery : [product.image]} />
        </div>

        {/* Info Column */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                {product.brand || 'Brand Brand'}
              </span>
              <span className="text-xs font-semibold text-slate-500">SKU: {product.id}</span>
            </div>
            <h1 className="text-3xl font-black leading-tight text-slate-900 sm:text-4xl margin-0">{product.name}</h1>
            
            {/* Rating Stars */}
            <div className="flex items-center gap-2 pt-1.5">
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-slate-200'}`} />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700">{product.rating}</span>
              <span className="text-xs font-semibold text-slate-400">({product.reviewCount} customer reviews)</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="rounded-[1.75rem] border border-black/10 bg-white p-5 space-y-2 shadow-sm">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{currency}{product.price.toFixed(2)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-sm font-semibold text-slate-400 line-through">
                    {currency}{product.originalPrice.toFixed(2)}
                  </span>
                  <span className="rounded-full bg-[#f11d2b]/10 px-2 py-0.5 text-xs font-black text-[#f11d2b]">
                    -{product.discount}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="text-xxs font-semibold text-slate-500">Inclusive of all local sales taxes.</p>
          </div>

          {/* Quantity selector & Actions */}
          <div className="space-y-4 pt-2">
            {product.stock > 0 ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex shrink-0 self-start items-center rounded-2xl border border-black/10 bg-white p-1">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl font-extrabold text-slate-600 hover:bg-slate-100"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-black text-slate-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl font-extrabold text-slate-600 hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>

                <div className="flex flex-1 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[#1357d9] bg-white py-3 text-sm font-black text-[#1357d9] transition-colors hover:bg-[#1357d9]/8"
                  >
                    <ShoppingCart className="h-4.5 w-4.5" />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-[#f11d2b] to-[#ffcb2f] py-3 text-sm font-black text-[#0b0d10] transition-all shadow-lg hover:opacity-95"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-[1.75rem] border border-[#f11d2b]/20 bg-[#f11d2b]/8 p-4 text-center">
                <p className="text-sm font-black text-[#f11d2b]">Out of Stock</p>
                <p className="mt-0.5 text-xs text-slate-500">This item is currently unavailable. Please check back later.</p>
              </div>
            )}

            <button
              onClick={() => toggleWishlist(product)}
              className={`flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider py-1.5 transition-colors focus:outline-none ${
                wishlisted ? 'text-[#f11d2b]' : 'text-slate-500 hover:text-[#f11d2b]'
              }`}
            >
              <Heart className="h-4 w-4" fill={wishlisted ? 'currentColor' : 'none'} />
              {wishlisted ? 'Added to Wishlist' : 'Add to Wishlist'}
            </button>
          </div>

          {/* Shipping Features */}
          <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-6">
            <div className="flex flex-col items-center text-center space-y-1">
              <Truck className="h-5 w-5 text-[#1357d9]" />
              <span className="text-xxs font-black text-slate-800">Free Shipping</span>
              <span className="text-4xs text-slate-400 font-bold uppercase">Orders over {currency}50</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-1">
              <RotateCcw className="h-5 w-5 text-[#1357d9]" />
              <span className="text-xxs font-black text-slate-800">Easy Returns</span>
              <span className="text-4xs text-slate-400 font-bold uppercase">30-day window</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-1">
              <Shield className="h-5 w-5 text-[#1357d9]" />
              <span className="text-xxs font-black text-slate-800">Secure Checkout</span>
              <span className="text-4xs text-slate-400 font-bold uppercase">Stripe, Razorpay</span>
            </div>
          </div>

        </div>

      </div>

      {/* Tabs description specifications & warehouse levels */}
      <div className="border-t border-slate-100 pt-8">
        <div className="flex border-b border-slate-200 gap-6">
          {(['details', 'specs', 'stock', 'reviews'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 -mb-0.5 ${
                activeTab === tab ? 'border-indigo-650 text-indigo-650 font-black' : 'border-transparent text-slate-400 hover:text-slate-650'
              }`}
            >
              {tab === 'details' && 'Product Details'}
              {tab === 'specs' && 'Specifications'}
              {tab === 'stock' && 'Live Warehouse Stock'}
              {tab === 'reviews' && 'Reviews & Ratings'}
            </button>
          ))}
        </div>

        <div className="py-6">
          {activeTab === 'details' && (
            <div 
              className="max-w-3xl prose prose-base text-base sm:text-lg text-slate-600 font-medium leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizeDescription(product.description || 'No detailed description specified in ERPNext Item document.') }}
            />
          )}

          {activeTab === 'specs' && (
            <div className="max-w-xl overflow-hidden rounded-2xl border border-slate-100">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <tbody className="divide-y divide-slate-100 bg-white">
                  {Object.entries(product.specifications).length > 0 ? (
                    Object.entries(product.specifications).map(([key, val]) => (
                      <tr key={key}>
                        <td className="px-4 py-3 font-bold text-slate-400 w-1/3 bg-slate-50">{key}</td>
                        <td className="px-4 py-3 font-bold text-slate-700">{val}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-3 text-slate-400 text-center">No technical specifications provided.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'stock' && (
            <div className="max-w-xl space-y-4">
              <div className="overflow-hidden rounded-2xl border border-slate-100">
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                  <thead className="bg-slate-50 text-xxs font-extrabold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-4 py-3 text-left">Warehouse Location</th>
                      <th className="px-4 py-3 text-right">Available Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-semibold">
                    {warehouseStocks.map((stock, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 text-slate-700">{stock.warehouse}</td>
                        <td className={`px-4 py-3 text-right ${stock.actualQty > 0 ? 'text-emerald-600 font-bold' : 'text-red-500'}`}>
                          {stock.actualQty > 0 ? `${stock.actualQty} units` : 'Out of Stock'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Existing Reviews List */}
              <div className="space-y-4">
                <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-2">Customer Reviews</h4>
                {reviewsList.length === 0 ? (
                  <p className="text-xs text-slate-400">No reviews have been written for this product yet.</p>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                    {reviewsList.map((rev, idx) => (
                      <div key={idx} className="rounded-2xl border border-slate-100 p-4 space-y-2 bg-white">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{rev.reviewerName}</span>
                          <span className="text-xxs text-slate-400">{rev.date}</span>
                        </div>
                        <div className="flex text-amber-500 gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`} />
                          ))}
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{rev.review}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submission Form */}
              <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6 space-y-4">
                <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Write a Review</h4>
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xxs font-extrabold text-slate-400 uppercase">Your Name</label>
                      <input
                        type="text"
                        value={newReview.name}
                        onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold focus:outline-none"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xxs font-extrabold text-slate-400 uppercase">Email Address</label>
                      <input
                        type="email"
                        value={newReview.email}
                        onChange={(e) => setNewReview({ ...newReview, email: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold focus:outline-none"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xxs font-extrabold text-slate-400 uppercase">Rating</label>
                    <div className="flex text-amber-500 gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const starVal = i + 1;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setNewReview({ ...newReview, rating: starVal })}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star className={`h-6 w-6 ${starVal <= newReview.rating ? 'fill-current' : 'text-slate-200'}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xxs font-extrabold text-slate-400 uppercase">Comments</label>
                    <textarea
                      value={newReview.review}
                      onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold focus:outline-none h-24 resize-none"
                      placeholder="Share your thoughts on the product quality..."
                      required
                    />
                  </div>

                  {reviewError && <p className="text-xxs font-bold text-red-500">{reviewError}</p>}
                  {reviewSuccess && <p className="text-xxs font-bold text-emerald-600">Review submitted successfully! Synced with ERPNext.</p>}

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 transition-colors disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-slate-100 pt-10 space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Customers Also Bought</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.slice(0, 4).map(prod => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { ProductFilter } from '../components/product/ProductFilter';
import { ProductCard } from '../components/product/ProductCard';
import { productService } from '../services/product.service';
import { Product, Category } from '../types/shop.types';

const INITIAL_FILTERS = {
  category: '',
  brand: '',
  priceMin: 0,
  priceMax: 2000,
  inStockOnly: false,
  minRating: 0
};

export const Catalog: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 2000 });
  
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState('popularity');
  const [totalPages, setTotalPages] = useState(1);
  const [isServerPaginated, setIsServerPaginated] = useState(false);

  // Load filter metadata
  useEffect(() => {
    const fetchFilterMetadata = async () => {
      try {
        const cats = await productService.getCategories();
        setCategories(cats);
        const brs = await productService.getBrands();
        setBrands(brs);

        // Fetch dynamic price bounds from the live products
        const allProds = await productService.getProducts({ page_size: 100 });
        const prices = allProds.map(p => p.price).filter(p => p > 0);
        if (prices.length > 0) {
          const minP = Math.floor(Math.min(...prices));
          const maxP = Math.ceil(Math.max(...prices));
          setPriceBounds({ min: minP, max: maxP });
          setFilters(prev => ({
            ...prev,
            priceMin: prev.priceMin === 0 ? minP : prev.priceMin,
            priceMax: prev.priceMax === 2000 ? maxP : prev.priceMax
          }));
        }
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    fetchFilterMetadata();
  }, []);

  // Synchronize category or search from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category') || '';
    const searchParam = searchParams.get('search') || '';
    
    setFilters(prev => ({
      ...prev,
      category: categoryParam,
      search: searchParam
    }));
    setCurrentPage(1);
  }, [searchParams]);

  useEffect(() => {
    const loadFilteredProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const searchParam = searchParams.get('search') || '';
        const results = await productService.getProducts({
          category: filters.category || undefined,
          search: searchParam || undefined,
          brand: filters.brand || undefined,
          minPrice: filters.priceMin || undefined,
          maxPrice: filters.priceMax || undefined,
          page: currentPage,
          page_size: 24
        });

        let updatedResults = [...results];
        
        // Client side additional filters
        if (filters.inStockOnly) {
          updatedResults = updatedResults.filter(p => p.stock > 0);
        }
        if (filters.minRating > 0) {
          updatedResults = updatedResults.filter(p => p.rating >= filters.minRating);
        }

        // Sorting logic
        if (sortBy === 'price-low-high') {
          updatedResults.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high-low') {
          updatedResults.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'rating') {
          updatedResults.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'newest') {
          updatedResults.sort((a, b) => b.id.localeCompare(a.id));
        }

        setProducts(updatedResults);

        if (results.pagination) {
          setTotalPages(results.pagination.pages || 1);
          setIsServerPaginated(true);
        } else {
          setTotalPages(Math.ceil(updatedResults.length / 24) || 1);
          setIsServerPaginated(false);
        }
      } catch (e: any) {
        console.error(e);
        setError(e.message || 'An unexpected error occurred while loading products.');
      } finally {
        setLoading(false);
      }
    };

    loadFilteredProducts();
  }, [filters, sortBy, searchParams, currentPage]);

  const handleClearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      priceMin: priceBounds.min,
      priceMax: priceBounds.max,
      inStockOnly: false,
      minRating: 0
    });
    setCurrentPage(1);
  };

  const paginatedProducts = isServerPaginated 
    ? products 
    : products.slice((currentPage - 1) * 24, currentPage * 24);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb / Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-none margin-0">
            {filters.category ? `${filters.category.charAt(0).toUpperCase()}${filters.category.slice(1)} Products` : 'All Shop Products'}
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            Showing {products.length} products found
          </p>
        </div>

        {/* Sort & Mobile Filters Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>

          <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3.5 py-1.5">
            <span className="text-xxs font-extrabold text-slate-400 uppercase">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer focus:ring-0"
            >
              <option value="popularity">Popularity</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="rating">Best Rating</option>
              <option value="newest">New Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* Sidebar Filters Desktop */}
        <aside className="w-64 shrink-0 hidden md:block">
          <ProductFilter
            filters={filters}
            onChange={(newFilters) => {
              setFilters(newFilters);
              setCurrentPage(1);
            }}
            onClear={handleClearFilters}
            categories={categories}
            brands={brands}
          />
        </aside>

        {/* Mobile Filters Drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
            <div className="relative flex w-full max-w-xs flex-col bg-white p-5 shadow-xl overflow-y-auto animate-in slide-in-from-left duration-300">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <h3 className="font-extrabold text-sm text-slate-800 uppercase">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="rounded-lg p-1 hover:bg-slate-50 font-bold text-slate-400">Close</button>
              </div>
              <ProductFilter
                filters={filters}
                onChange={(newFilters) => {
                  setFilters(newFilters);
                  setCurrentPage(1);
                }}
                onClear={handleClearFilters}
                categories={categories}
                brands={brands}
              />
            </div>
          </div>
        )}

        {/* Product Grid Area */}
        <main className="flex-1">
          {error ? (
            <div className="text-center py-16 rounded-3xl bg-rose-50 border border-rose-100 p-8">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 text-rose-650 mb-4 font-black">!</div>
              <h3 className="text-base font-bold text-slate-800">Connection Error</h3>
              <p className="text-xs text-rose-600 font-semibold mt-2 max-w-md mx-auto bg-white/60 p-3.5 rounded-xl border border-rose-100">
                {error}
              </p>
              <button
                onClick={() => {
                  setError(null);
                  setFilters(prev => ({ ...prev }));
                }}
                className="mt-6 rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-xs font-bold text-white transition-colors"
              >
                Retry Request
              </button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-3xl border border-slate-100 bg-white p-5 space-y-4">
                  <div className="aspect-square w-full rounded-2xl bg-slate-150" />
                  <div className="h-4 w-2/3 rounded-md bg-slate-150" />
                  <div className="h-3 w-1/2 rounded-md bg-slate-150" />
                  <div className="flex items-center justify-between pt-3">
                    <div className="h-4 w-1/3 rounded-md bg-slate-150" />
                    <div className="h-8 w-8 rounded-xl bg-slate-150" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 rounded-3xl bg-white border border-slate-100 p-8">
              <SlidersHorizontal className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-base font-bold text-slate-700">No products match your filters</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Try widening your price filters, selecting a different category, or resetting all criteria.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {paginatedProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
              
              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1.5 pt-6 border-t border-slate-100">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage(prev => Math.max(1, prev - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentPage(idx + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`h-7.5 w-7.5 rounded-lg text-xs font-bold transition-all ${
                        currentPage === idx + 1
                          ? 'bg-indigo-600 text-white font-black'
                          : 'border border-slate-200 bg-white text-slate-650 hover:bg-slate-50'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage(prev => Math.min(totalPages, prev + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

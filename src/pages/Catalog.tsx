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
    <div className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Breadcrumb / Title */}
      <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-black leading-none tracking-tight text-white sm:text-3xl">
            {filters.category ? `${filters.category.charAt(0).toUpperCase()}${filters.category.slice(1)} Products` : 'All Shop Products'}
          </h1>
          <p className="mt-1 text-xs font-semibold text-white/70">
            Showing {products.length} products found
          </p>
        </div>

        {/* Sort & Mobile Filters Trigger */}
        <div className="grid gap-3 sm:grid-cols-[auto,1fr] md:flex md:items-center">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black text-slate-800 shadow-sm hover:bg-[#ffcb2f]/10 md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>

          <div className="flex items-center justify-between gap-2 rounded-full border border-black/10 bg-white px-3.5 py-1.5 shadow-sm">
            <span className="text-xxs font-black uppercase text-slate-500">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="min-w-0 cursor-pointer border-none bg-transparent text-xs font-bold text-slate-800 outline-none focus:ring-0"
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

      <div className="flex flex-col gap-6 md:flex-row md:items-start lg:gap-8">
        {/* Sidebar Filters Desktop */}
        <aside className="hidden w-72 shrink-0 md:block">
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
            <div className="fixed inset-0 bg-[#090b10]/75 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
            <div className="relative flex h-full w-full flex-col overflow-y-auto bg-white p-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-sm font-black uppercase tracking-[0.25em] text-slate-900">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="rounded-full px-3 py-1.5 text-xs font-black text-slate-500 hover:bg-slate-50">Close</button>
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
            <div className="rounded-[1.75rem] border border-[#f11d2b]/20 bg-[#f11d2b]/8 p-8 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f11d2b]/20 font-black text-[#f11d2b]">!</div>
              <h3 className="text-base font-black text-slate-900">Connection Error</h3>
              <p className="mx-auto mt-2 max-w-md rounded-2xl border border-[#f11d2b]/15 bg-white/70 p-3.5 text-xs font-semibold text-slate-700">
                {error}
              </p>
              <button
                onClick={() => {
                  setError(null);
                  setFilters(prev => ({ ...prev }));
                }}
                className="mt-6 rounded-full bg-[#0b0d10] px-5 py-2.5 text-xs font-black text-[#ffcb2f] transition-colors hover:bg-[#1357d9]"
              >
                Retry Request
              </button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-4 rounded-[1.75rem] border border-black/10 bg-white p-5 animate-pulse">
                  <div className="aspect-square w-full rounded-2xl bg-slate-200" />
                  <div className="h-4 w-2/3 rounded-md bg-slate-200" />
                  <div className="h-3 w-1/2 rounded-md bg-slate-200" />
                  <div className="flex items-center justify-between pt-3">
                    <div className="h-4 w-1/3 rounded-md bg-slate-200" />
                    <div className="h-8 w-8 rounded-xl bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-[1.75rem] border border-black/10 bg-white p-8 text-center">
              <SlidersHorizontal className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <h3 className="text-base font-black text-slate-900">No products match your filters</h3>
              <p className="mx-auto mt-1 max-w-xs text-xs text-slate-500">
                Try widening your price filters, selecting a different category, or resetting all criteria.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-6 rounded-full bg-[#1357d9] px-5 py-2.5 text-xs font-black text-white transition-colors hover:bg-[#f11d2b]"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {paginatedProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
              
              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-slate-100 pt-6">
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
                          ? 'bg-[#0b0d10] text-[#ffcb2f] font-black'
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

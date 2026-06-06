import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { productService } from '../../services/product.service';
import { Category } from '../../types/shop.types';

export const CategoryCarousel: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const list = await productService.getCategories();
        setCategories(list);
      } catch (e) {
        console.error('Failed to load categories in carousel:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const getIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('mobile') || lower.includes('tab') || lower.includes('phone')) return '📱';
    if (lower.includes('kitchen') || lower.includes('cook')) return '🍳';
    if (lower.includes('home') || lower.includes('appliance')) return '🏠';
    if (lower.includes('computer') || lower.includes('tech')) return '💻';
    return '📦';
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white py-6 border-y border-slate-100 shadow-xxs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-4 w-32 bg-slate-100 animate-pulse rounded mb-4" />
          <div className="flex gap-4 overflow-x-auto pb-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 min-w-[100px] bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white py-6 border-y border-slate-100 shadow-xxs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Shop by Category</h3>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 transition-colors shadow-xxs focus:outline-none"
              aria-label="Previous categories"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 transition-colors shadow-xxs focus:outline-none"
              aria-label="Next categories"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory scrollbar-thin"
        >
          {categories.map((cat) => {
            const categorySlug = cat.name.toLowerCase().replace(/\s+/g, '-');
            return (
              <button
                key={cat.id}
                onClick={() => navigate(`/catalog?category=${categorySlug}`)}
                className="flex min-w-[100px] sm:min-w-[120px] snap-start flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-150 hover:bg-indigo-50/20 hover:shadow-md hover:shadow-indigo-100/50 group focus:outline-none"
              >
                <span className="text-3xl sm:text-4xl mb-2 transition-transform duration-300 group-hover:scale-110">
                  {getIcon(cat.name)}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-700 transition-colors group-hover:text-indigo-600 text-center truncate w-full">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

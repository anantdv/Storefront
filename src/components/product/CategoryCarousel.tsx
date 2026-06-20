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
      <div className="w-full border-y border-black/10 bg-white py-6 shadow-[0_18px_40px_rgba(11,13,16,0.06)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="flex gap-4 overflow-x-auto pb-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 min-w-[100px] animate-pulse rounded-3xl bg-slate-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border-y border-black/10 bg-white py-6 shadow-[0_18px_40px_rgba(11,13,16,0.06)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-slate-500">Shop by Category</h3>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition-colors hover:bg-[#ffcb2f]/15 focus:outline-none"
              aria-label="Previous categories"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition-colors hover:bg-[#ffcb2f]/15 focus:outline-none"
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
                className="group flex min-w-[100px] snap-start flex-col items-center justify-center rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#1357d9]/30 hover:bg-[#1357d9]/8 hover:shadow-lg hover:shadow-[#1357d9]/10 sm:min-w-[120px] focus:outline-none"
              >
                <span className="text-3xl sm:text-4xl mb-2 transition-transform duration-300 group-hover:scale-110">
                  {getIcon(cat.name)}
                </span>
                <span className="w-full truncate text-center text-xs font-bold text-slate-700 transition-colors group-hover:text-[#f11d2b] sm:text-sm">
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

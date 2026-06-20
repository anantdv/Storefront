import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Product } from '../../types/shop.types';

interface ProductSliderSectionProps {
  title: string;
  icon?: React.ReactNode;
  products: Product[];
}

export const ProductSliderSection: React.FC<ProductSliderSectionProps> = ({ title, icon, products }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  if (products.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-black/10 pb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">{title}</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition-colors hover:bg-[#ffcb2f]/15 focus:outline-none"
            aria-label="Previous items"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition-colors hover:bg-[#ffcb2f]/15 focus:outline-none"
            aria-label="Next items"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory scrollbar-thin select-none"
      >
        {products.map((prod) => (
          <div key={prod.id} className="min-w-[170px] sm:min-w-[200px] md:min-w-[220px] lg:min-w-[240px] snap-start">
            <ProductCard product={prod} />
          </div>
        ))}
      </div>
    </div>
  );
};

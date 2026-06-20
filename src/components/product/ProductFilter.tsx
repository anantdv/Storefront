import React from 'react';
import { Star } from 'lucide-react';
import { Category } from '../../types/shop.types';

interface FilterState {
  category: string;
  brand: string;
  priceMin: number;
  priceMax: number;
  inStockOnly: boolean;
  minRating: number;
}

interface ProductFilterProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  categories: Category[];
  brands: string[];
}

export const ProductFilter: React.FC<ProductFilterProps> = ({ filters, onChange, onClear, categories, brands }) => {
  const [categorySearch, setCategorySearch] = React.useState('');
  const [brandSearch, setBrandSearch] = React.useState('');
  
  const handleCategoryChange = (catId: string) => {
    onChange({ ...filters, category: filters.category === catId ? '' : catId });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'priceMin' | 'priceMax') => {
    const val = Number(e.target.value);
    onChange({ ...filters, [field]: val });
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, inStockOnly: e.target.checked });
  };

  const handleRatingChange = (rating: number) => {
    onChange({ ...filters, minRating: filters.minRating === rating ? 0 : rating });
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredBrands = brands.filter(brand => 
    brand.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <div className="space-y-5 rounded-[1.5rem] border border-black/10 bg-white p-4 shadow-[0_18px_40px_rgba(11,13,16,0.08)] sm:space-y-6 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-black uppercase tracking-[0.25em] text-[#0b0d10]">Filters</h3>
        <button onClick={onClear} className="text-xs font-black text-[#1357d9] transition-colors hover:text-[#f11d2b]">
          Clear All
        </button>
      </div>

      <div className="border-t border-slate-100 pt-4 sm:pt-5">
        <h4 className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Category</h4>
        <input
          type="text"
          placeholder="Search categories..."
          value={categorySearch}
          onChange={(e) => setCategorySearch(e.target.value)}
          className="mb-3 w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#1357d9] focus:bg-white focus:outline-none"
        />
        <div className="max-h-[350px] space-y-1.5 overflow-y-auto pr-1 scrollbar-thin sm:max-h-[650px]">
          {filteredCategories.slice(0, 20).map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-xs font-bold transition-all ${
                filters.category === cat.id
                  ? 'border-[#1357d9] bg-[#1357d9]/10 text-[#1357d9]'
                  : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{cat.name}</span>
              <span>{cat.icon}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 sm:pt-5">
        <h4 className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Brand</h4>
        <input
          type="text"
          placeholder="Search brands..."
          value={brandSearch}
          onChange={(e) => setBrandSearch(e.target.value)}
          className="mb-3 w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#1357d9] focus:bg-white focus:outline-none"
        />
        <div className="max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {filteredBrands.slice(0, 20).map((brand) => (
              <button
                key={brand}
                onClick={() => onChange({ ...filters, brand: filters.brand === brand ? '' : brand })}
                className={`rounded-2xl border px-2 py-1.5 text-[10px] font-bold text-center truncate transition-all ${
                  filters.brand === brand
                    ? 'border-[#f11d2b] bg-[#f11d2b]/10 text-[#f11d2b]'
                    : 'border-slate-200 bg-slate-50/80 text-slate-650 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 sm:pt-5">
        <h4 className="mb-3.5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Price Range</h4>
        <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_auto_1fr]">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin || ''}
            onChange={(e) => handlePriceChange(e, 'priceMin')}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#1357d9] focus:bg-white focus:outline-none"
          />
          <span className="hidden text-xs font-semibold text-slate-400 sm:block">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax || ''}
            onChange={(e) => handlePriceChange(e, 'priceMax')}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#1357d9] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 sm:pt-5">
        <label className="flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={handleStockChange}
            className="h-4.5 w-4.5 rounded-md border-slate-200 text-[#1357d9] focus:ring-[#1357d9]"
          />
          <span className="text-xs font-bold text-slate-700">In Stock Only</span>
        </label>
      </div>

      <div className="border-t border-slate-100 pt-4 sm:pt-5">
        <h4 className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Customer Rating</h4>
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((stars) => (
            <button
              key={stars}
              onClick={() => handleRatingChange(stars)}
              className={`flex w-full items-center gap-2 rounded-2xl border px-2.5 py-1.5 text-xs font-semibold transition-all ${
                filters.minRating === stars
                  ? 'border-[#ffcb2f] bg-[#ffcb2f]/15 text-[#0b0d10]'
                  : 'border-transparent text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex text-[#f11d2b]">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
                {Array.from({ length: 5 - stars }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 text-slate-200" />
                ))}
              </div>
              <span>{stars === 5 ? 'Only' : '& Up'}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

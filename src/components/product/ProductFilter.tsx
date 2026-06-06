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
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xxs space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Filters</h3>
        <button
          onClick={onClear}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Categories */}
      <div className="border-t border-slate-50 pt-5">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">Category</h4>
        <input
          type="text"
          placeholder="Search categories..."
          value={categorySearch}
          onChange={(e) => setCategorySearch(e.target.value)}
          className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-1.5 text-xs font-semibold text-slate-855 focus:border-indigo-500 focus:bg-white focus:outline-none mb-3"
        />
        <div className="space-y-1.5 max-h-[650px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredCategories.slice(0, 20).map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs font-bold transition-all border ${
                filters.category === cat.id
                  ? 'bg-indigo-55 bg-indigo-50 border-indigo-200 text-indigo-700 font-black shadow-xs'
                  : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <span>{cat.name}</span>
              <span>{cat.icon}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="border-t border-slate-50 pt-5">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">Brand</h4>
        <input
          type="text"
          placeholder="Search brands..."
          value={brandSearch}
          onChange={(e) => setBrandSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-1.5 text-xs font-semibold text-slate-855 focus:border-indigo-500 focus:bg-white focus:outline-none mb-3"
        />
        <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
          <div className="grid grid-cols-2 gap-1.5">
            {filteredBrands.slice(0, 20).map((brand) => (
              <button
                key={brand}
                onClick={() => onChange({ ...filters, brand: filters.brand === brand ? '' : brand })}
                className={`rounded-xl border px-2 py-1.5 text-xxs font-bold text-center truncate transition-all ${
                  filters.brand === brand
                    ? 'border-[#0060a9] bg-indigo-50 text-indigo-700 font-black shadow-xs'
                    : 'border-slate-100 bg-slate-50/50 text-slate-650 hover:border-slate-200 hover:text-slate-800'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Price Range */}
      <div className="border-t border-slate-50 pt-5">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3.5">Price Range</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin || ''}
            onChange={(e) => handlePriceChange(e, 'priceMin')}
            className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
          />
          <span className="text-slate-400 text-xs font-semibold">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax || ''}
            onChange={(e) => handlePriceChange(e, 'priceMax')}
            className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Availability */}
      <div className="border-t border-slate-50 pt-5">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={handleStockChange}
            className="h-4.5 w-4.5 rounded-md border-slate-200 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-xs font-bold text-slate-700">In Stock Only</span>
        </label>
      </div>

      {/* Rating */}
      <div className="border-t border-slate-50 pt-5">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Customer Rating</h4>
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((stars) => (
            <button
              key={stars}
              onClick={() => handleRatingChange(stars)}
              className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all border ${
                filters.minRating === stars
                  ? 'bg-indigo-50 border-indigo-150 text-indigo-700 font-black'
                  : 'border-transparent text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex text-amber-500">
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

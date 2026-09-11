import React from 'react';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { ProductCategory } from '../types';

interface CategoryFilterProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'featured' | 'price_asc' | 'price_desc' | 'newest';
  onSortChange: (sort: 'featured' | 'price_asc' | 'price_desc' | 'newest') => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}) => {
  const categories: { id: string; label: string; sub: string }[] = [
    { id: 'all', label: 'All Items', sub: 'Collection' },
    { id: 'shoes', label: 'Shoes', sub: 'Unisex' },
    { id: 'bags', label: 'Bags', sub: 'Female' },
    { id: 'jewelry', label: 'Jewelry', sub: 'Female' },
    { id: 'watches', label: 'Watches', sub: 'Male & Female' },
    { id: 'perfumes', label: 'Perfumes', sub: 'Unisex' },
  ];

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-[#E5E5E5]">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              id={`cat-filter-btn-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 px-4 py-3 flex flex-col items-start transition-all border-b-2 -mb-[2px] ${
                isActive
                  ? 'border-[#111111] text-[#111111] bg-white'
                  : 'border-transparent text-[#737373] hover:text-[#111111] hover:border-[#D4D4D4]'
              }`}
            >
              <span className="text-xs uppercase tracking-wider font-semibold">
                {cat.label}
              </span>
              <span className="text-[10px] text-[#A3A3A3] tracking-wide mt-0.5 font-light">
                {cat.sub}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]" />
          <input
            id="product-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, leather, notes..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E5E5E5] text-xs text-[#111111] placeholder-[#A3A3A3] focus:outline-none focus:border-[#111111] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase text-[#737373] hover:text-black"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <ArrowUpDown size={14} className="text-[#737373]" />
          <span className="text-[11px] uppercase tracking-wider text-[#737373] font-medium">Sort:</span>
          <select
            id="product-sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="bg-white border border-[#E5E5E5] text-xs text-[#111111] py-2 px-3 focus:outline-none focus:border-[#111111] cursor-pointer"
          >
            <option value="featured">Curated (Featured)</option>
            <option value="newest">New Arrivals First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  );
};

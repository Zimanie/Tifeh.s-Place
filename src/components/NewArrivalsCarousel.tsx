import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface NewArrivalsProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const NewArrivalsCarousel: React.FC<NewArrivalsProps> = ({ products, onSelectProduct }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const newArrivals = products.filter((p) => p.is_new_arrival);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (newArrivals.length === 0) return null;

  return (
    <section className="py-12 md:py-16 border-b border-[#E5E5E5] bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] tracking-[0.25em] uppercase text-[#C5A059] font-medium mb-1">
              <Sparkles size={13} />
              <span>Recently Added</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#111111]">
              New Arrivals Capsule
            </h2>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              id="scroll-left-new-arrivals-btn"
              onClick={() => handleScroll('left')}
              className="p-2 border border-[#E5E5E5] hover:border-[#111111] bg-white text-[#111111] transition-all rounded-xs"
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              id="scroll-right-new-arrivals-btn"
              onClick={() => handleScroll('right')}
              className="p-2 border border-[#E5E5E5] hover:border-[#111111] bg-white text-[#111111] transition-all rounded-xs"
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Carousel Row */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory"
        >
          {newArrivals.map((product) => (
            <div
              key={product.id}
              className="w-[260px] sm:w-[290px] shrink-0 snap-start"
            >
              <ProductCard product={product} onSelectProduct={onSelectProduct} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

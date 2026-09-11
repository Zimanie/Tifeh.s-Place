import React from 'react';
import { ArrowRight, Shield, Truck } from 'lucide-react';

interface HeroProps {
  onShopClick: () => void;
  onExploreNewArrivals: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopClick, onExploreNewArrivals }) => {
  return (
    <section className="relative border-b border-[#E5E5E5] bg-[#FAFAFA] overflow-hidden">
      {/* Subtle luxury editorial banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F0F0F0] border border-[#E5E5E5] text-[11px] tracking-[0.25em] uppercase font-medium text-[#404040]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
              New 2025 Niche Fragrance & Extrait Capsule
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light text-[#111111] leading-[1.1] tracking-tight">
              Understated Luxury, <br />
              <span className="italic font-normal">Timeless Precision.</span>
            </h2>

            <p className="text-[#525252] text-base sm:text-lg max-w-xl font-light leading-relaxed">
              Curated artisanal shoes, bespoke leather bags, fine jewelry, precision timepieces, and niche extraits de parfum crafted for the modern Nigerian connoisseur.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                id="hero-shop-collection-btn"
                onClick={onShopClick}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#111111] text-[#FAFAFA] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#262626] transition-all"
              >
                <span>Shop Collection</span>
                <ArrowRight size={15} />
              </button>

              <button
                id="hero-new-arrivals-btn"
                onClick={onExploreNewArrivals}
                className="inline-flex items-center justify-center px-7 py-4 border border-[#111111] text-[#111111] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#111111] hover:text-[#FAFAFA] transition-all"
              >
                <span>New Arrivals</span>
              </button>
            </div>
          </div>

          {/* Right Visual Trio Feature */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-4/5 max-w-md mx-auto overflow-hidden bg-[#F5F5F5] border border-[#E5E5E5] shadow-xs">
              <img
                src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=85"
                alt="Tifeh's Place Luxury Bag"
                className="w-full h-full object-cover luxury-hover-img"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-[#FAFAFA]">
                <div className="text-[10px] tracking-[0.25em] uppercase text-[#E5E5E5]">Featured Handbag</div>
                <div className="text-xl font-serif">The Vendôme Box Crossbody</div>
                <div className="text-xs text-[#D4D4D4] mt-0.5">Hand-stitched Saffiano Leather • ₦74,000</div>
              </div>
            </div>
          </div>
        </div>

        {/* Luxury Guarantees */}
        <div className="mt-14 pt-8 border-t border-[#E5E5E5] grid grid-cols-1 sm:grid-cols-2 gap-6 text-center sm:text-left max-w-3xl">
          <div className="flex items-center justify-center sm:justify-start gap-3.5">
            <div className="p-2.5 bg-[#F5F5F5] border border-[#E5E5E5] text-[#111111]">
              <Truck size={18} />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-[#111111]">Swift Nigeria Delivery</h4>
              <p className="text-xs text-[#737373]">24-48h Lagos Express Delivery</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3.5">
            <div className="p-2.5 bg-[#F5F5F5] border border-[#E5E5E5] text-[#111111]">
              <Shield size={18} />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-[#111111]">Authenticity Verified</h4>
              <p className="text-xs text-[#737373]">100% Genuine Materials & High-Grade Craft</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

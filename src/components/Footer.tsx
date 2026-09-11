import React from 'react';
import { Mail, Phone } from 'lucide-react';

interface FooterProps {
  onSelectCategory: (cat: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
}) => {
  return (
    <footer className="bg-[#111111] text-[#FAFAFA] border-t border-[#262626] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#262626]">
          {/* Brand Column */}
          <div className="md:col-span-7 space-y-4">
            <h3 className="text-2xl font-serif tracking-[0.2em] uppercase font-light text-white">
              Tifeh.s Place
            </h3>
            <p className="text-xs text-[#A3A3A3] leading-relaxed max-w-md">
              An atelier of understated distinction in Lagos, Nigeria. Curating bespoke footwear, sculpted leather goods, fine 18K vermeil jewelry, horological timepieces, and niche extraits de parfum.
            </p>
            <div className="pt-2 text-[11px] text-[#737373] space-y-1.5 font-light">
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-[#C5A059]" />
                <span>+234 (0) 812 000 0000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-[#C5A059]" />
                <span>concierge@tifehsplace.ng</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="md:col-span-5 space-y-3">
            <h4 className="text-xs uppercase tracking-[0.25em] text-[#E5E5E5] font-semibold">
              The Collections
            </h4>
            <ul className="space-y-2 text-xs text-[#A3A3A3]">
              <li>
                <button
                  onClick={() => onSelectCategory('shoes')}
                  className="hover:text-white transition-colors"
                >
                  Shoes (Unisex Calfskin & Mules)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('bags')}
                  className="hover:text-white transition-colors"
                >
                  Bags (Female Totes & Pouches)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('jewelry')}
                  className="hover:text-white transition-colors"
                >
                  Jewelry (18K Vermeil & Pearls)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('watches')}
                  className="hover:text-white transition-colors"
                >
                  Watches (Surgical Steel & Automatic)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('perfumes')}
                  className="hover:text-white transition-colors"
                >
                  Perfumes (Niche Extraits & Oud)
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#737373] gap-4">
          <div>
            © {new Date().getFullYear()} Tifeh.s Place Luxury Limited. All rights reserved. Registered in Nigeria.
          </div>
          <div className="flex items-center gap-6">
            <span>Prices listed in Nigerian Naira (₦)</span>
            <span>•</span>
            <span>Lagos, Nigeria</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

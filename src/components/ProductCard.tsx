import React from 'react';
import { ShoppingBag, Eye } from 'lucide-react';
import { Product } from '../types';
import { formatNaira } from '../lib/format';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct }) => {
  const { addToCart } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, product.sizes[0], product.colors[0], 1);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onSelectProduct(product)}
      className="group cursor-pointer flex flex-col bg-[#FAFAFA] border border-[#E5E5E5] hover:border-[#111111] transition-all duration-300 relative"
    >
      {/* Product Image Container */}
      <div className="relative aspect-4/5 w-full overflow-hidden bg-[#F2F2F2]">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center luxury-hover-img transition-transform duration-700"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.is_new_arrival && (
            <span className="bg-[#111111] text-[#FAFAFA] text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 font-medium">
              New
            </span>
          )}
          <span className="bg-[#FAFAFA]/90 backdrop-blur-xs text-[#525252] text-[9px] uppercase tracking-[0.18em] px-2 py-0.5 border border-[#E5E5E5]">
            {product.category}
          </span>
        </div>

        {/* Hover Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 gap-2">
          <button
            onClick={handleQuickAdd}
            className="flex-1 bg-[#111111] hover:bg-black text-[#FAFAFA] text-[11px] uppercase tracking-wider py-2.5 px-3 flex items-center justify-center gap-1.5 font-medium shadow-md transition-all active:scale-[0.98]"
            title="Quick add default variant to bag"
          >
            <ShoppingBag size={13} />
            <span>Quick Bag</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="bg-[#FAFAFA] hover:bg-[#F0F0F0] text-[#111111] p-2.5 flex items-center justify-center shadow-md transition-all"
            title="View Details"
          >
            <Eye size={14} />
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white/40">
        <div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-[#737373] font-medium mb-1">
            {product.material.split('&')[0]}
          </div>
          <h3 className="font-serif text-lg text-[#111111] font-normal leading-snug group-hover:text-[#C5A059] transition-colors line-clamp-1">
            {product.name}
          </h3>
        </div>

        <div className="mt-3 pt-3 border-t border-[#F0F0F0] flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight text-[#111111]">
            {formatNaira(product.price)}
          </span>
          <span className="text-[11px] text-[#737373] tracking-wider uppercase font-medium">
            {product.sizes.length} {product.sizes.length === 1 ? 'Size' : 'Sizes'}
          </span>
        </div>
      </div>
    </div>
  );
};

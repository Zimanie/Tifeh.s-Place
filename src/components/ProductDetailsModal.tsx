import React, { useState, useEffect } from 'react';
import { X, Check, ShoppingBag, Shield, Truck, Sparkles, Share2 } from 'lucide-react';
import { Product } from '../types';
import { formatNaira } from '../lib/format';
import { useCart } from '../context/CartContext';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || 'Standard');
      setSelectedColor(product.colors[0] || 'Default');
      setQuantity(1);
      setAddedNotice(false);
    }
  }, [product]);

  if (!product) return null;

  const handleAdd = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#FAFAFA] border border-[#E5E5E5] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-product-detail-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white text-[#111111] border border-[#E5E5E5] rounded-full transition-all"
          aria-label="Close product details"
        >
          <X size={18} />
        </button>

        {/* Left: High-Res Image Display */}
        <div className="md:w-1/2 relative bg-[#F5F5F5] min-h-[320px] md:min-h-[520px] overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
          {product.is_new_arrival && (
            <div className="absolute top-4 left-4 bg-[#111111] text-[#FAFAFA] text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 font-medium">
              New Arrival Capsule
            </div>
          )}
          <div className="absolute bottom-4 left-4">
            <span className="text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 bg-white/90 backdrop-blur-xs text-[#111111] border border-[#E5E5E5]">
              Category: {product.category}
            </span>
          </div>
        </div>

        {/* Right: Product Details & Action Area */}
        <div className="md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between text-[11px] tracking-[0.2em] uppercase text-[#737373] font-medium mb-1">
                <span>Tifeh.s Place Exclusive</span>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1 text-[#525252] hover:text-[#111111]"
                  title="Share product link"
                >
                  <Share2 size={13} />
                  <span>{copiedLink ? 'Copied' : 'Share'}</span>
                </button>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#111111] leading-snug">
                {product.name}
              </h2>
              <div className="text-xl sm:text-2xl font-semibold text-[#111111] mt-2">
                {formatNaira(product.price)}
              </div>
            </div>

            {/* Material details */}
            <div className="p-3 bg-[#F0F0F0] border-l-2 border-[#111111] text-xs">
              <span className="font-semibold text-[#111111] uppercase tracking-wider block text-[10px] mb-0.5">
                Material & Craftsmanship:
              </span>
              <p className="text-[#404040]">{product.material}</p>
            </div>

            {/* Description */}
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#737373] font-semibold block mb-1">
                Description
              </span>
              <p className="text-xs text-[#525252] leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Color selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="uppercase tracking-wider text-[#111111] font-medium">Color:</span>
                  <span className="text-[#737373] font-light">{selectedColor}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 text-xs border transition-all ${
                          isSelected
                            ? 'border-[#111111] bg-[#111111] text-[#FAFAFA] font-medium'
                            : 'border-[#E5E5E5] bg-white text-[#404040] hover:border-[#111111]'
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="uppercase tracking-wider text-[#111111] font-medium">
                    {product.category === 'shoes' ? 'Available Size (EUR):' : 'Available Size:'}
                  </span>
                  <span className="text-[#737373] font-light">{selectedSize}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[44px] px-3 py-2 text-xs border text-center transition-all ${
                          isSelected
                            ? 'border-[#111111] bg-[#111111] text-[#FAFAFA] font-semibold'
                            : 'border-[#E5E5E5] bg-white text-[#404040] hover:border-[#111111]'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div>
              <span className="text-xs uppercase tracking-wider text-[#111111] font-medium block mb-2">
                Quantity:
              </span>
              <div className="inline-flex items-center border border-[#E5E5E5] bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-1.5 text-sm hover:bg-[#F5F5F5] transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3.5 py-1.5 text-sm hover:bg-[#F5F5F5] transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Actions & Shipping Guarantee */}
          <div className="space-y-4 pt-4 border-t border-[#E5E5E5]">
            <button
              id="add-to-bag-detail-btn"
              onClick={handleAdd}
              className="w-full py-4 bg-[#111111] text-[#FAFAFA] text-xs uppercase tracking-[0.2em] font-medium hover:bg-black transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {addedNotice ? (
                <>
                  <Check size={16} className="text-[#C5A059]" />
                  <span>Added To Shopping Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  <span>Add To Shopping Bag • {formatNaira(product.price * quantity)}</span>
                </>
              )}
            </button>

            {/* Shipping notes */}
            <div className="space-y-2 text-[11px] text-[#737373]">
              <div className="flex items-center gap-2">
                <Truck size={13} className="text-[#111111]" />
                <span>Express Lagos delivery within 24–48 hours.</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={13} className="text-[#111111]" />
                <span>Strictly verified authentic luxury. Bank transfer or Cash on Delivery terms apply.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

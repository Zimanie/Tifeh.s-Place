import React from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../lib/format';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    totalItems,
    totalAmount,
    openCheckout,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAFAFA] border-l border-[#E5E5E5] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[#E5E5E5] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-[#111111]" />
              <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-[#111111]">
                Shopping Bag ({totalItems})
              </h2>
            </div>
            <button
              id="close-cart-drawer-btn"
              onClick={closeCart}
              className="p-1.5 text-[#737373] hover:text-[#111111] transition-colors rounded-full hover:bg-[#F5F5F5]"
              aria-label="Close cart"
            >
              <X size={18} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-[#737373] space-y-4">
                <div className="p-4 rounded-full bg-[#F0F0F0] border border-[#E5E5E5]">
                  <ShoppingBag size={28} className="text-[#A3A3A3]" />
                </div>
                <div>
                  <h3 className="text-base font-serif text-[#111111]">Your bag is empty</h3>
                  <p className="text-xs text-[#737373] mt-1 max-w-xs">
                    Explore our curated collection of shoes, bags, jewelry, watches, and perfumes.
                  </p>
                </div>
                <button
                  onClick={closeCart}
                  className="px-6 py-2.5 bg-[#111111] text-[#FAFAFA] text-xs uppercase tracking-wider font-medium hover:bg-black transition-all"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${index}`}
                  className="flex gap-4 p-3 bg-white border border-[#E5E5E5] relative"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-24 bg-[#F2F2F2] shrink-0 overflow-hidden border border-[#E5E5E5]">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-medium text-[#111111] line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() =>
                            removeFromCart(item.product.id, item.selectedSize, item.selectedColor)
                          }
                          className="text-[#A3A3A3] hover:text-red-600 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="text-[11px] text-[#737373] mt-0.5 flex flex-wrap gap-x-2">
                        <span>Size: <strong className="text-[#111111]">{item.selectedSize}</strong></span>
                        <span>•</span>
                        <span>Color: <strong className="text-[#111111]">{item.selectedColor}</strong></span>
                      </div>

                      <div className="text-xs font-semibold text-[#111111] mt-1">
                        {formatNaira(item.product.price)}
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#F5F5F5]">
                      <div className="inline-flex items-center border border-[#E5E5E5] bg-[#FAFAFA]">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.selectedSize, item.selectedColor, -1)
                          }
                          className="p-1 hover:bg-[#E5E5E5] text-[#525252] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="px-2.5 text-[11px] font-semibold">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.selectedSize, item.selectedColor, 1)
                          }
                          className="p-1 hover:bg-[#E5E5E5] text-[#525252] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      <span className="text-xs font-semibold text-[#111111]">
                        {formatNaira(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout CTA */}
          {items.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-[#E5E5E5] bg-white space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#737373]">
                  <span>Subtotal</span>
                  <span>{formatNaira(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[#737373]">
                  <span>Shipping Estimate</span>
                  <span className="text-[#111111]">Calculated at Checkout</span>
                </div>
                <div className="pt-2 border-t border-[#E5E5E5] flex justify-between text-sm font-semibold text-[#111111]">
                  <span>Estimated Total</span>
                  <span>{formatNaira(totalAmount)}</span>
                </div>
              </div>

              <button
                id="cart-proceed-checkout-btn"
                onClick={openCheckout}
                className="w-full py-4 bg-[#111111] text-[#FAFAFA] text-xs uppercase tracking-[0.2em] font-medium hover:bg-black transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <span>Proceed To Checkout</span>
                <ArrowRight size={15} />
              </button>

              <p className="text-[10px] text-center text-[#737373] tracking-wide">
                Direct Nigerian Bank Transfer & WhatsApp Confirmation
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

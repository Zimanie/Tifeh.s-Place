import React, { useState } from 'react';
import { X, CheckCircle2, Copy, MessageSquare, AlertCircle, Building2, Mail } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { orderService } from '../lib/supabase';
import { Order, OrderItem } from '../types';
import { formatNaira } from '../lib/format';

import { UserSession } from '../lib/auth';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
  currentUserSession?: UserSession | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
  currentUserSession,
}) => {
  const { items, totalAmount, clearCart } = useCart();

  const [formData, setFormData] = useState({
    name: currentUserSession?.name || '',
    phone: '',
    whatsapp: '',
    email: currentUserSession?.email || '',
    deliveryAddress: '',
    paymentMethod: 'bank_transfer' as 'bank_transfer' | 'cash_on_delivery',
    notes: '',
  });

  // Sync user profile when modal opens
  React.useEffect(() => {
    if (currentUserSession && isOpen) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || currentUserSession.name || '',
        email: prev.email || currentUserSession.email || '',
      }));
    }
  }, [currentUserSession, isOpen]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedBankInfo, setCopiedBankInfo] = useState(false);

  if (!isOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);

    const orderItems: OrderItem[] = items.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      category: item.product.category,
      price: item.product.price,
      quantity: item.quantity,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
      image_url: item.product.image_url,
    }));

    try {
      const createdOrder = await orderService.create({
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_whatsapp: formData.whatsapp || formData.phone,
        customer_email: formData.email,
        delivery_address: formData.deliveryAddress,
        items: orderItems,
        total_amount: totalAmount,
        payment_method: formData.paymentMethod,
      });

      // Simulate notification email to Admin Gmail
      console.info('Order notification email dispatched to admin (tifehsplace@gmail.com):', {
        orderId: createdOrder.id,
        customer: formData.name,
        email: formData.email,
        phone: formData.phone,
        itemsCount: orderItems.length,
        total: totalAmount,
      });

      setCompletedOrder(createdOrder);
      onOrderSuccess(createdOrder);
      clearCart();
    } catch (err) {
      console.error('Failed to submit order', err);
      alert('Unable to process order. Please try again or contact via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyBankDetails = () => {
    const text = `Tifeh's Place Bank Details:
Bank: Guaranty Trust Bank (GTBank)
Account Name: Tifeh's Place Enterprises
Account Number: 0284918274
Reference: ${completedOrder?.id || 'TIFEHS-ORDER'}`;
    navigator.clipboard.writeText(text);
    setCopiedBankInfo(true);
    setTimeout(() => setCopiedBankInfo(false), 2500);
  };

  // Generate pre-filled WhatsApp message for Nigerian direct confirmation
  const getWhatsAppLink = () => {
    if (!completedOrder) return '#';
    const itemsList = completedOrder.items
      .map((i) => `• ${i.name} (${i.selectedSize}, ${i.selectedColor}) x${i.quantity} = ₦${(i.price * i.quantity).toLocaleString()}`)
      .join('\n');

    const msg = `Hello Tifeh's Place! I have just placed Order #${completedOrder.id}.

*Customer Details:*
Name: ${completedOrder.customer_name}
Phone: ${completedOrder.customer_phone}
Delivery Address: ${completedOrder.delivery_address}
Payment Method: ${completedOrder.payment_method === 'bank_transfer' ? 'Bank Transfer' : 'Cash on Delivery'}

*Order Items:*
${itemsList}

*Total Amount:* ₦${completedOrder.total_amount.toLocaleString()}

Please confirm availability and share payment receipt instructions!`;

    return `https://wa.me/2348120000000?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FAFAFA] border border-[#E5E5E5] shadow-2xl p-6 sm:p-8 my-auto">
        {/* Close Button */}
        <button
          id="close-checkout-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#737373] hover:text-[#111111] transition-colors rounded-full hover:bg-[#F0F0F0]"
          aria-label="Close checkout"
        >
          <X size={18} />
        </button>

        {!completedOrder ? (
          /* ================= Checkout Form ================= */
          <div>
            <div className="mb-6">
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#737373] font-semibold block mb-1">
                Tifeh.s Place • Direct Checkout
              </span>
              <h2 className="text-2xl font-serif font-light text-[#111111]">
                Customer Delivery Information
              </h2>
              <p className="text-xs text-[#737373] mt-1">
                Please provide accurate contact and delivery details. Our sales team verifies every order directly via WhatsApp or Call.
              </p>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#111111] font-medium mb-1">
                    Full Name *
                  </label>
                  <input
                    id="checkout-name-input"
                    type="text"
                    required
                    placeholder="e.g. Olumide Adeleke"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5E5] text-xs focus:outline-none focus:border-[#111111]"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#111111] font-medium mb-1">
                    Email Address *
                  </label>
                  <input
                    id="checkout-email-input"
                    type="email"
                    required
                    placeholder="e.g. olumide@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5E5] text-xs focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone Number */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#111111] font-medium mb-1">
                    Phone Number (Voice) *
                  </label>
                  <input
                    id="checkout-phone-input"
                    type="tel"
                    required
                    placeholder="e.g. 0803 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5E5] text-xs focus:outline-none focus:border-[#111111]"
                  />
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#111111] font-medium mb-1">
                    WhatsApp Number *
                  </label>
                  <input
                    id="checkout-whatsapp-input"
                    type="tel"
                    required
                    placeholder="e.g. 0803 123 4567"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5E5] text-xs focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#111111] font-medium mb-1">
                  Delivery Address & State in Nigeria *
                </label>
                <textarea
                  id="checkout-address-input"
                  required
                  rows={2}
                  placeholder="e.g. Flat 4B, Admiralty Way, Lekki Phase 1, Lagos State"
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-[#E5E5E5] text-xs focus:outline-none focus:border-[#111111]"
                />
              </div>

              {/* Payment Method Radio */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#111111] font-medium mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`flex items-start gap-3 p-3 border cursor-pointer transition-all ${
                    formData.paymentMethod === 'bank_transfer'
                      ? 'border-[#111111] bg-white'
                      : 'border-[#E5E5E5] bg-[#F9F9F9]'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={formData.paymentMethod === 'bank_transfer'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'bank_transfer' })}
                      className="mt-0.5 accent-black"
                    />
                    <div>
                      <span className="text-xs font-semibold text-[#111111] block">
                        Nigerian Bank Transfer (Preferred)
                      </span>
                      <span className="text-[10px] text-[#737373]">
                        Instant transfer to GTBank / Zenith. Fast dispatch upon receipt.
                      </span>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3 border cursor-pointer transition-all ${
                    formData.paymentMethod === 'cash_on_delivery'
                      ? 'border-[#111111] bg-white'
                      : 'border-[#E5E5E5] bg-[#F9F9F9]'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={formData.paymentMethod === 'cash_on_delivery'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'cash_on_delivery' })}
                      className="mt-0.5 accent-black"
                    />
                    <div>
                      <span className="text-xs font-semibold text-[#111111] block">
                        Cash / POS on Delivery
                      </span>
                      <span className="text-[10px] text-[#737373]">
                        Available strictly for select Lagos Island & Mainland locations.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order summary snippet */}
              <div className="p-3.5 bg-[#F0F0F0] border border-[#E5E5E5] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#737373]">Total Payable:</span>
                  <div className="text-base font-semibold text-[#111111]">
                    {formatNaira(totalAmount)}
                  </div>
                </div>
                <div className="text-right text-[11px] text-[#737373]">
                  <span>{items.length} unique item(s)</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                id="submit-order-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#111111] text-[#FAFAFA] text-xs uppercase tracking-[0.2em] font-medium hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Saving Order & Preparing Transfer Slip...</span>
                ) : (
                  <span>Place Order • {formatNaira(totalAmount)}</span>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* ================= Order Success View ================= */
          <div className="text-center space-y-6 animate-in fade-in duration-300">
            <div className="inline-flex p-3 rounded-full bg-[#F0F9F1] border border-green-200 text-green-700">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#737373] font-semibold block">
                Order Successfully Registered
              </span>
              <h2 className="text-2xl font-serif text-[#111111] mt-1">
                Thank You, {completedOrder.customer_name}!
              </h2>
              <p className="text-xs text-[#737373] mt-1">
                Order Reference: <strong className="text-[#111111]">{completedOrder.id}</strong>
              </p>
            </div>

            {/* Bank Transfer Instructions Card */}
            {completedOrder.payment_method === 'bank_transfer' ? (
              <div className="bg-white border border-[#E5E5E5] p-5 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#111111] uppercase tracking-wider">
                    <Building2 size={15} className="text-[#C5A059]" />
                    <span>Official Bank Transfer Details</span>
                  </div>
                  <button
                    onClick={copyBankDetails}
                    className="text-[11px] text-[#525252] hover:text-[#111111] flex items-center gap-1 font-medium"
                  >
                    <Copy size={12} />
                    <span>{copiedBankInfo ? 'Copied' : 'Copy Details'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#737373] text-[10px] uppercase tracking-wider block">Bank Name</span>
                    <strong className="text-[#111111]">Guaranty Trust Bank (GTBank)</strong>
                  </div>
                  <div>
                    <span className="text-[#737373] text-[10px] uppercase tracking-wider block">Account Name</span>
                    <strong className="text-[#111111]">Tifeh's Place Enterprises</strong>
                  </div>
                  <div>
                    <span className="text-[#737373] text-[10px] uppercase tracking-wider block">Account Number</span>
                    <strong className="text-[#111111] text-base font-mono tracking-wider">0284918274</strong>
                  </div>
                  <div>
                    <span className="text-[#737373] text-[10px] uppercase tracking-wider block">Amount to Transfer</span>
                    <strong className="text-[#C5A059] text-base font-bold">{formatNaira(completedOrder.total_amount)}</strong>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-[#737373] border-t border-[#F0F0F0] flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 text-[#C5A059] mt-0.5" />
                  <span>Please use <strong>{completedOrder.id}</strong> as your payment reference/narration, then send the payment receipt via WhatsApp below.</span>
                </div>
              </div>
            ) : (
              <div className="bg-[#F9F9F9] border border-[#E5E5E5] p-4 text-left text-xs space-y-2">
                <span className="font-semibold text-[#111111] block">Cash on Delivery Terms:</span>
                <p className="text-[#525252]">
                  Our logistics representative will contact you at <strong>{completedOrder.customer_phone}</strong> to confirm your address before dispatch. Please prepare exact cash or POS card for payment.
                </p>
              </div>
            )}

            {/* Email dispatch notice */}
            <div className="p-3 bg-[#F0F0F0] text-[11px] text-[#525252] flex items-center justify-center gap-2">
              <Mail size={14} className="text-[#111111]" />
              <span>A detailed summary was dispatched to <strong>{completedOrder.customer_email}</strong> and boutique admin.</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <a
                id="whatsapp-confirm-order-link"
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-[#25D366] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageSquare size={16} />
                <span>Confirm Order on WhatsApp (+234)</span>
              </a>

              <button
                onClick={onClose}
                className="w-full py-3 border border-[#111111] text-[#111111] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#111111] hover:text-[#FAFAFA] transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

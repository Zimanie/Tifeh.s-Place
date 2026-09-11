import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Package,
  ShoppingBag,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  X,
  UploadCloud,
  CheckCircle,
  Clock,
  ArrowLeft,
  Settings,
  Phone,
  Save,
  Check,
  AlertCircle,
  Mail,
  Lock,
} from 'lucide-react';
import { Product, Order, ProductCategory } from '../types';
import { productService, orderService, isSupabaseConfigured } from '../lib/supabase';
import { formatNaira, formatDate } from '../lib/format';
import { getBoutiqueWhatsAppNumber, setBoutiqueWhatsAppNumber } from '../lib/config';
import { signInOrRegisterUser, saveSession, UserSession } from '../lib/auth';

interface AdminDashboardProps {
  onBackToShop: () => void;
  isAdminLoggedIn: boolean;
  onOpenAuth: () => void;
  onAdminLogout: () => void;
  adminEmail?: string | null;
  onProductsUpdated?: () => void;
  onAdminLoginSuccess?: (session: UserSession) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToShop,
  isAdminLoggedIn,
  onOpenAuth,
  onAdminLogout,
  adminEmail,
  onProductsUpdated,
  onAdminLoginSuccess,
}) => {
  // Dashboard views: 'products' | 'orders' | 'whatsapp'
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'whatsapp'>('products');

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Direct Admin Portal Unlock Form state (for seamless access)
  const [unlockEmail, setUnlockEmail] = useState(adminEmail || 'savyzeus101@gmail.com');
  const [unlockError, setUnlockError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  // WhatsApp Order Dispatch configuration state
  const [currentWhatsAppNumber, setCurrentWhatsAppNumber] = useState(() => getBoutiqueWhatsAppNumber());
  const [newWhatsAppInput, setNewWhatsAppInput] = useState(() => getBoutiqueWhatsAppNumber());
  const [whatsAppSuccessMessage, setWhatsAppSuccessMessage] = useState('');

  // Add Product Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    category: 'shoes' as ProductCategory,
    price: '',
    material: '',
    sizes: 'EUR 40, EUR 41, EUR 42, EUR 43',
    colors: 'Black, Brown',
    description: '',
    image_url: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1000&q=85',
    is_new_arrival: true,
  });
  const [isSubmittingProd, setIsSubmittingProd] = useState(false);

  // Load initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allProds, allOrders] = await Promise.all([
        productService.getAll(),
        orderService.getAll(),
      ]);
      setProducts(allProds);
      setOrders(allOrders);
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      loadData();
    }
  }, [isAdminLoggedIn]);

  // Handle direct admin unlock
  const handleDirectAdminUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUnlockError('');
    setIsUnlocking(true);

    try {
      const targetEmail = unlockEmail.trim().toLowerCase();
      if (!targetEmail || !targetEmail.includes('@')) {
        setUnlockError('Please enter a valid administrator email.');
        setIsUnlocking(false);
        return;
      }

      const res = await signInOrRegisterUser(targetEmail, 'Administrator Savy Zeus');
      if (res.session) {
        const adminSession: UserSession = {
          ...res.session,
          isAdmin: true,
        };
        saveSession(adminSession);
        if (onAdminLoginSuccess) {
          onAdminLoginSuccess(adminSession);
        }
      }
    } catch (err: any) {
      setUnlockError(err.message || 'Error unlocking administrator portal.');
    } finally {
      setIsUnlocking(false);
    }
  };

  // Handle Create Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) return;

    setIsSubmittingProd(true);
    try {
      const parsedSizes = newProd.sizes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const parsedColors = newProd.colors
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      const created = await productService.create({
        name: newProd.name,
        category: newProd.category,
        price: Number(newProd.price),
        material: newProd.material || 'Crafted with premium materials',
        sizes: parsedSizes.length > 0 ? parsedSizes : ['Standard'],
        colors: parsedColors.length > 0 ? parsedColors : ['Default'],
        description: newProd.description || 'Exclusive item from Tifeh.s Place.',
        image_url: newProd.image_url || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85',
        is_new_arrival: newProd.is_new_arrival,
      });

      setProducts((prev) => [created, ...prev]);
      if (onProductsUpdated) onProductsUpdated();
      setIsAddModalOpen(false);
      setNewProd({
        name: '',
        category: 'shoes',
        price: '',
        material: '',
        sizes: 'EUR 40, EUR 41, EUR 42, EUR 43',
        colors: 'Black, Brown',
        description: '',
        image_url: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1000&q=85',
        is_new_arrival: true,
      });
    } catch (err) {
      console.error('Failed to create product', err);
      alert('Error creating product. Please try again.');
    } finally {
      setIsSubmittingProd(false);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await productService.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (onProductsUpdated) onProductsUpdated();
    } catch (err) {
      console.error('Failed to delete product', err);
    }
  };

  // Reset to seed data
  const handleResetToSeed = () => {
    if (window.confirm('Reset catalog to initial 20 luxury items?')) {
      const resetProds = productService.resetToSeed();
      setProducts(resetProds);
      if (onProductsUpdated) onProductsUpdated();
    }
  };

  // Save WhatsApp Order Dispatch Number
  const handleSaveWhatsAppNumber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhatsAppInput.trim()) {
      alert('Please enter a valid WhatsApp phone number.');
      return;
    }
    const saved = setBoutiqueWhatsAppNumber(newWhatsAppInput);
    setCurrentWhatsAppNumber(saved);
    setNewWhatsAppInput(saved);
    setWhatsAppSuccessMessage(`WhatsApp destination successfully updated to +${saved}. Customer checkout orders and concierge inquiries will now be routed to this number.`);
    setTimeout(() => setWhatsAppSuccessMessage(''), 6000);
  };

  // If not logged in as admin, show direct unlock card
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-[#FAFAFA]">
        <div className="w-full max-w-md bg-white border border-[#E5E5E5] p-6 sm:p-8 shadow-md text-center space-y-5">
          <div className="inline-flex p-3.5 bg-[#111111] text-[#FAFAFA] rounded-full">
            <ShieldCheck size={28} className="text-[#C5A059]" />
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#737373] font-semibold block mb-1">
              Restricted Atelier Portal
            </span>
            <h2 className="text-2xl font-serif text-[#111111]">Administrator Access</h2>
            <p className="text-xs text-[#737373] leading-relaxed mt-1">
              Unlock the inventory manager, order verification, and WhatsApp order settings for <strong>Tifeh.s Place</strong>.
            </p>
          </div>

          {unlockError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 text-left">
              <AlertCircle size={14} className="shrink-0" />
              <span>{unlockError}</span>
            </div>
          )}

          {/* Direct One-Click Admin Unlock Form */}
          <form onSubmit={handleDirectAdminUnlock} className="space-y-3.5 text-left">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#111111] mb-1">
                Authorized Admin Email
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
                <input
                  type="email"
                  required
                  value={unlockEmail}
                  onChange={(e) => setUnlockEmail(e.target.value)}
                  placeholder="savyzeus101@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAFAFA] border border-[#E5E5E5] text-xs focus:outline-none focus:border-[#111111]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUnlocking}
              className="w-full py-3 bg-[#111111] hover:bg-black text-[#FAFAFA] text-xs uppercase tracking-[0.2em] font-medium transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <ShieldCheck size={14} className="text-[#C5A059]" />
              <span>{isUnlocking ? 'Unlocking Portal...' : 'Unlock Admin Portal'}</span>
            </button>
          </form>

          {/* Fallback buttons */}
          <div className="pt-2 border-t border-[#F0F0F0] space-y-2">
            <button
              type="button"
              onClick={onOpenAuth}
              className="w-full py-2.5 bg-white border border-[#D4D4D4] hover:border-[#111111] text-xs uppercase tracking-wider text-[#111111] font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock size={13} className="text-[#737373]" />
              <span>Sign In via Unified Auth Modal</span>
            </button>

            <button
              type="button"
              onClick={onBackToShop}
              className="w-full py-2 text-[#737373] hover:text-[#111111] text-xs uppercase tracking-wider font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Return to Boutique Store</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending_payment').length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20 text-left">
      {/* Top Admin Bar */}
      <div className="bg-[#111111] text-[#FAFAFA] px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToShop}
            className="p-1.5 text-[#A3A3A3] hover:text-white transition-colors cursor-pointer"
            title="Return to store"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-sm font-serif tracking-widest uppercase font-light">
              Tifeh.s Place • Admin Console
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-[#A3A3A3]">
              <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Local Persistence (Active)'}</span>
              <span>•</span>
              <span className="text-[#C5A059]">Administrator: {adminEmail || 'savyzeus101@gmail.com'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetToSeed}
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1 text-[10px] uppercase tracking-wider border border-[#404040] hover:bg-[#262626] transition-colors cursor-pointer"
            title="Reset catalog back to initial 20 items"
          >
            <RefreshCw size={11} />
            <span>Reset 20 Seed Items</span>
          </button>
          <button
            onClick={onAdminLogout}
            className="px-3 py-1 bg-red-900/40 hover:bg-red-900/70 border border-red-700/50 text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 border border-[#E5E5E5]">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#737373] font-semibold">
              Total Products
            </div>
            <div className="text-2xl font-serif text-[#111111] mt-1 font-light">
              {products.length}
            </div>
            <span className="text-[10px] text-[#737373] mt-1 block">Across 5 Categories</span>
          </div>

          <div className="bg-white p-5 border border-[#E5E5E5]">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#737373] font-semibold">
              Customer Orders
            </div>
            <div className="text-2xl font-serif text-[#111111] mt-1 font-light">
              {orders.length}
            </div>
            <span className="text-[10px] text-[#737373] mt-1 block">{pendingOrders} Pending Verification</span>
          </div>

          <div className="bg-white p-5 border border-[#E5E5E5]">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#737373] font-semibold">
              Gross Value (NGN)
            </div>
            <div className="text-2xl font-serif text-[#111111] mt-1 font-light">
              {formatNaira(totalRevenue)}
            </div>
            <span className="text-[10px] text-[#C5A059] mt-1 block">Logged in System</span>
          </div>

          <div className="bg-white p-5 border border-[#E5E5E5]">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#737373] font-semibold">
              WhatsApp Orders To
            </div>
            <div className="text-lg font-mono text-[#111111] mt-1 font-medium truncate">
              +{currentWhatsAppNumber}
            </div>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className="text-[10px] text-[#C5A059] hover:underline mt-1 block cursor-pointer"
            >
              Change WhatsApp Number →
            </button>
          </div>
        </div>

        {/* Navigation Tabs between Products, Orders, and WhatsApp Settings */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5]">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('products')}
              className={`pb-3 text-xs uppercase tracking-widest font-semibold transition-all border-b-2 -mb-[2px] cursor-pointer ${
                activeTab === 'products'
                  ? 'border-[#111111] text-[#111111]'
                  : 'border-transparent text-[#737373] hover:text-[#111111]'
              }`}
            >
              Products Management ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-3 text-xs uppercase tracking-widest font-semibold transition-all border-b-2 -mb-[2px] cursor-pointer ${
                activeTab === 'orders'
                  ? 'border-[#111111] text-[#111111]'
                  : 'border-transparent text-[#737373] hover:text-[#111111]'
              }`}
            >
              Incoming Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`pb-3 text-xs uppercase tracking-widest font-semibold transition-all border-b-2 -mb-[2px] cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'whatsapp'
                  ? 'border-[#111111] text-[#111111]'
                  : 'border-transparent text-[#737373] hover:text-[#111111]'
              }`}
            >
              <MessageCircle size={14} className="text-[#25D366]" />
              <span>WhatsApp Dispatch Line</span>
            </button>
          </div>

          {activeTab === 'products' && (
            <button
              id="admin-add-product-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-[#111111] text-[#FAFAFA] text-xs uppercase tracking-wider font-medium hover:bg-black transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add New Product</span>
            </button>
          )}
        </div>

        {/* TAB 1: PRODUCTS TABLE */}
        {activeTab === 'products' && (
          <div className="bg-white border border-[#E5E5E5] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[10px] uppercase tracking-wider text-[#737373]">
                  <tr>
                    <th className="p-3.5">Item</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Price (NGN)</th>
                    <th className="p-3.5">Sizes / Colors</th>
                    <th className="p-3.5">Badge</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-10 h-10 object-cover bg-[#F5F5F5] border border-[#E5E5E5]"
                        />
                        <div>
                          <span className="font-medium text-[#111111] block">{p.name}</span>
                          <span className="text-[10px] text-[#737373] block truncate max-w-xs">
                            {p.material}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 uppercase text-[10px] font-semibold text-[#525252]">
                        {p.category}
                      </td>
                      <td className="p-3.5 font-semibold text-[#111111]">
                        {formatNaira(p.price)}
                      </td>
                      <td className="p-3.5 text-[11px] text-[#737373]">
                        <div>{p.sizes.slice(0, 3).join(', ')}</div>
                        <div className="text-[10px] text-[#A3A3A3]">{p.colors.join(', ')}</div>
                      </td>
                      <td className="p-3.5">
                        {p.is_new_arrival ? (
                          <span className="px-2 py-0.5 bg-[#C5A059]/15 text-[#8C6D23] font-semibold text-[9px] uppercase tracking-wider rounded-xs border border-[#C5A059]/30">
                            New Arrival
                          </span>
                        ) : (
                          <span className="text-[#A3A3A3] text-[10px]">—</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS TABLE */}
        {activeTab === 'orders' && (
          <div className="bg-white border border-[#E5E5E5] overflow-hidden">
            {orders.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#737373]">
                No orders logged in the store yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[10px] uppercase tracking-wider text-[#737373]">
                    <tr>
                      <th className="p-3.5">Order ID</th>
                      <th className="p-3.5">Customer & Delivery</th>
                      <th className="p-3.5">Items</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="p-3.5 font-mono text-[11px] font-bold text-[#111111]">
                          #{o.id}
                          <span className="block text-[10px] font-normal text-[#737373]">
                            {o.created_at ? formatDate(o.created_at) : 'Recent'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-[#111111] block">{o.customer_name}</span>
                          <span className="text-[11px] text-[#525252] block">{o.customer_phone}</span>
                          <span className="text-[10px] text-[#737373] block truncate max-w-xs">
                            {o.delivery_address}
                          </span>
                        </td>
                        <td className="p-3.5 text-[11px]">
                          {o.items?.map((it, idx) => (
                            <div key={idx}>
                              {it.name} ({it.quantity}x)
                            </div>
                          ))}
                        </td>
                        <td className="p-3.5 font-semibold text-[#111111]">
                          {formatNaira(o.total_amount)}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] uppercase tracking-wider font-semibold rounded-xs">
                            {o.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <a
                            href={`https://wa.me/${o.customer_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Hello ${o.customer_name}, this is Tifeh's Place regarding Order #${o.id}. We have received your order request!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#25D366] text-white rounded-xs text-[10px] font-medium hover:bg-[#1EBE5D] transition-colors"
                          >
                            <MessageCircle size={12} />
                            <span>Contact</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WHATSAPP NUMBER DISPATCH CONFIGURATION */}
        {activeTab === 'whatsapp' && (
          <div className="max-w-2xl bg-white border border-[#E5E5E5] p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle size={20} className="text-[#25D366]" />
                <h3 className="text-lg font-serif font-medium text-[#111111]">
                  WhatsApp Order Destination Settings
                </h3>
              </div>
              <p className="text-xs text-[#737373] leading-relaxed">
                Update the official Nigerian WhatsApp phone number where checkout orders, bank transfer confirmations, and floating concierge inquiries are routed.
              </p>
            </div>

            {whatsAppSuccessMessage && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                <Check size={16} className="shrink-0 mt-0.5" />
                <span className="leading-relaxed">{whatsAppSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveWhatsAppNumber} className="space-y-4">
              <div className="p-4 bg-[#FAF8F5] border border-[#EBE3D5] space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[#737373] font-semibold block">
                  Currently Active Destination Line
                </span>
                <span className="text-lg font-mono font-bold text-[#111111] block">
                  +{currentWhatsAppNumber}
                </span>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1.5">
                  New WhatsApp Destination Number
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
                  <input
                    type="text"
                    required
                    value={newWhatsAppInput}
                    onChange={(e) => setNewWhatsAppInput(e.target.value)}
                    placeholder="e.g. 2348123456789 or +234 812 000 0000"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#FAFAFA] border border-[#E5E5E5] text-xs font-mono focus:outline-none focus:border-[#111111]"
                  />
                </div>
                <span className="text-[11px] text-[#737373] mt-1.5 block">
                  Enter your full country code without the plus sign or with formatting (e.g. <strong>2348012345678</strong> for Nigerian lines).
                </span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#111111] hover:bg-black text-[#FAFAFA] text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Save size={13} className="text-[#C5A059]" />
                  <span>Save WhatsApp Number</span>
                </button>

                <a
                  href={`https://wa.me/${newWhatsAppInput.replace(/\D/g, '')}?text=${encodeURIComponent(
                    "Hello! This is a test dispatch verification from Tifeh's Place Atelier Admin."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <ExternalLink size={13} />
                  <span>Test WhatsApp Line Now</span>
                </a>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E5] w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <h3 className="font-serif text-lg text-[#111111]">Add New Luxury Item</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#737373] hover:text-[#111111]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#111111] font-medium mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Monogram Leather Loafer"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#111111] font-medium mb-1">
                    Category
                  </label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value as ProductCategory })}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                  >
                    <option value="shoes">Shoes</option>
                    <option value="bags">Bags</option>
                    <option value="jewelry">Jewelry</option>
                    <option value="watches">Watches</option>
                    <option value="perfumes">Perfumes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#111111] font-medium mb-1">
                    Price (NGN)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="120000"
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#111111] font-medium mb-1">
                  Material & Craft
                </label>
                <input
                  type="text"
                  placeholder="e.g. 100% Calfskin leather with gold buckle"
                  value={newProd.material}
                  onChange={(e) => setNewProd({ ...newProd, material: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#111111] font-medium mb-1">
                    Sizes (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="EUR 40, EUR 41, EUR 42"
                    value={newProd.sizes}
                    onChange={(e) => setNewProd({ ...newProd, sizes: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#111111] font-medium mb-1">
                    Colors (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Black, Gold, Brown"
                    value={newProd.colors}
                    onChange={(e) => setNewProd({ ...newProd, colors: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#111111] font-medium mb-1">
                  Product Image URL (Supabase Storage / CDN)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProd.image_url}
                  onChange={(e) => setNewProd({ ...newProd, image_url: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#111111] font-medium mb-1">
                  Editorial Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Detailed description of the silhouette, craftsmanship, and notes..."
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="new-arrival-checkbox"
                  checked={newProd.is_new_arrival}
                  onChange={(e) => setNewProd({ ...newProd, is_new_arrival: e.target.checked })}
                  className="accent-black w-4 h-4 cursor-pointer"
                />
                <label htmlFor="new-arrival-checkbox" className="text-[#111111] font-medium cursor-pointer">
                  Feature as "New Arrival" capsule item
                </label>
              </div>

              <div className="pt-4 border-t border-[#E5E5E5] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#E5E5E5] text-[#525252] hover:bg-[#F5F5F5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProd}
                  className="px-6 py-2 bg-[#111111] text-[#FAFAFA] uppercase tracking-wider font-medium hover:bg-black cursor-pointer"
                >
                  {isSubmittingProd ? 'Publishing...' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

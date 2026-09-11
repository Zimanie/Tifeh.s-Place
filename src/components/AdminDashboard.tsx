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
} from 'lucide-react';
import { Product, Order, ProductCategory } from '../types';
import { productService, orderService, isSupabaseConfigured } from '../lib/supabase';
import { formatNaira, formatDate } from '../lib/format';

interface AdminDashboardProps {
  onBackToShop: () => void;
  isAdminLoggedIn: boolean;
  onOpenAuth: () => void;
  onAdminLogout: () => void;
  adminEmail?: string | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToShop,
  isAdminLoggedIn,
  onOpenAuth,
  onAdminLogout,
  adminEmail,
}) => {
  // Dashboard views: 'products' | 'orders'
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    } catch (err) {
      console.error('Failed to delete product', err);
    }
  };

  // Reset to seed data
  const handleResetToSeed = () => {
    if (window.confirm('Reset catalog to initial 20 luxury items?')) {
      const resetProds = productService.resetToSeed();
      setProducts(resetProds);
    }
  };

  // If not logged in as admin, show access guard directing to the unified profile login
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 bg-[#FAFAFA]">
        <div className="w-full max-w-md bg-white border border-[#E5E5E5] p-8 shadow-sm text-center">
          <div className="inline-flex p-3.5 bg-[#111111] text-[#FAFAFA] rounded-full mb-4">
            <ShieldCheck size={28} className="text-[#C5A059]" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#737373] font-semibold block mb-1">
            Restricted Atelier Portal
          </span>
          <h2 className="text-2xl font-serif text-[#111111] mb-2">Administrator Access Only</h2>
          <p className="text-xs text-[#737373] leading-relaxed mb-6">
            The management console requires authentication with your authorized admin Gmail. Please sign in via the profile icon in the navigation bar.
          </p>

          <div className="space-y-3">
            <button
              onClick={onOpenAuth}
              className="w-full py-3 bg-[#111111] text-[#FAFAFA] text-xs uppercase tracking-[0.2em] font-medium hover:bg-black transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck size={14} className="text-[#C5A059]" />
              <span>Sign In with Admin Gmail</span>
            </button>
            <button
              onClick={onBackToShop}
              className="w-full py-2.5 border border-[#E5E5E5] text-[#525252] hover:text-[#111111] hover:border-[#111111] text-xs uppercase tracking-wider font-medium transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={13} />
              <span>Return to Boutique</span>
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
    <div className="min-h-screen bg-[#FAFAFA] pb-20">
      {/* Top Admin Bar */}
      <div className="bg-[#111111] text-[#FAFAFA] px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToShop}
            className="p-1.5 text-[#A3A3A3] hover:text-white transition-colors"
            title="Return to store"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-sm font-serif tracking-widest uppercase font-light">
              Tifeh.s Place • Admin Console
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-[#A3A3A3]">
              <span>{isSupabaseConfigured ? 'Connected to Supabase' : 'Local Persistence (Active)'}</span>
              <span>•</span>
              <span className="text-[#C5A059]">Authenticated as Admin</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetToSeed}
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1 text-[10px] uppercase tracking-wider border border-[#404040] hover:bg-[#262626] transition-colors"
            title="Reset catalog back to initial 20 items"
          >
            <RefreshCw size={11} />
            <span>Reset 20 Seed Items</span>
          </button>
          <button
            onClick={onAdminLogout}
            className="px-3 py-1 bg-red-900/40 hover:bg-red-900/70 border border-red-700/50 text-[11px] uppercase tracking-wider transition-colors"
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
              Target Currency
            </div>
            <div className="text-2xl font-serif text-[#111111] mt-1 font-light">
              NGN (₦)
            </div>
            <span className="text-[10px] text-[#737373] mt-1 block">Nigerian Bank Transfer</span>
          </div>
        </div>

        {/* Navigation Tabs between Products and Orders */}
        <div className="flex items-center justify-between border-b border-[#E5E5E5]">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('products')}
              className={`pb-3 text-xs uppercase tracking-widest font-semibold transition-all border-b-2 -mb-[2px] ${
                activeTab === 'products'
                  ? 'border-[#111111] text-[#111111]'
                  : 'border-transparent text-[#737373] hover:text-[#111111]'
              }`}
            >
              Products Management ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-3 text-xs uppercase tracking-widest font-semibold transition-all border-b-2 -mb-[2px] ${
                activeTab === 'orders'
                  ? 'border-[#111111] text-[#111111]'
                  : 'border-transparent text-[#737373] hover:text-[#111111]'
              }`}
            >
              Incoming Orders ({orders.length})
            </button>
          </div>

          {activeTab === 'products' && (
            <button
              id="admin-add-product-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-[#111111] text-[#FAFAFA] text-xs uppercase tracking-wider font-medium hover:bg-black transition-all flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Add New Product</span>
            </button>
          )}
        </div>

        {/* Tab 1: Products Table */}
        {activeTab === 'products' && (
          <div className="bg-white border border-[#E5E5E5] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[10px] uppercase tracking-wider text-[#737373]">
                  <tr>
                    <th className="p-3.5">Item</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Material</th>
                    <th className="p-3.5">Variants</th>
                    <th className="p-3.5 text-center">New Arrival</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-10 h-12 object-cover border border-[#E5E5E5] shrink-0"
                          />
                          <div>
                            <strong className="text-[#111111] font-medium block">{p.name}</strong>
                            <span className="text-[10px] text-[#737373] font-mono">{p.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 uppercase tracking-wider text-[11px] font-medium text-[#525252]">
                        {p.category}
                      </td>
                      <td className="p-3.5 font-semibold text-[#111111]">
                        {formatNaira(p.price)}
                      </td>
                      <td className="p-3.5 text-[#525252] max-w-[180px] truncate" title={p.material}>
                        {p.material}
                      </td>
                      <td className="p-3.5 text-[#737373]">
                        <div>{p.sizes.length} sizes</div>
                        <div className="text-[10px]">{p.colors.join(', ')}</div>
                      </td>
                      <td className="p-3.5 text-center">
                        {p.is_new_arrival ? (
                          <span className="px-2 py-0.5 bg-[#111111] text-[#FAFAFA] text-[9px] uppercase tracking-wider">
                            Yes
                          </span>
                        ) : (
                          <span className="text-[#A3A3A3] text-[10px]">No</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 text-[#A3A3A3] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Instant delete product"
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

        {/* Tab 2: Orders Table */}
        {activeTab === 'orders' && (
          <div className="bg-white border border-[#E5E5E5] overflow-hidden">
            {orders.length === 0 ? (
              <div className="p-12 text-center text-[#737373] space-y-2">
                <ShoppingBag size={28} className="mx-auto text-[#A3A3A3]" />
                <h3 className="text-sm font-serif text-[#111111]">No customer orders yet</h3>
                <p className="text-xs">
                  Orders submitted through the checkout drawer will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[10px] uppercase tracking-wider text-[#737373]">
                    <tr>
                      <th className="p-3.5">Order ID & Date</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">WhatsApp / Phone</th>
                      <th className="p-3.5">Delivery Address</th>
                      <th className="p-3.5">Items Ordered</th>
                      <th className="p-3.5">Total & Payment</th>
                      <th className="p-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="p-3.5">
                          <strong className="font-mono text-[#111111]">{o.id}</strong>
                          <div className="text-[10px] text-[#737373]">{formatDate(o.created_at)}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-[#111111]">{o.customer_name}</div>
                          <div className="text-[10px] text-[#737373]">{o.customer_email}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="text-[#111111]">{o.customer_phone}</div>
                          <a
                            href={`https://wa.me/${o.customer_whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${o.customer_name}, this is Tifeh's Place regarding your Order #${o.id}.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-[#25D366] hover:underline font-medium mt-0.5"
                          >
                            <MessageCircle size={11} />
                            <span>WhatsApp Chat</span>
                          </a>
                        </td>
                        <td className="p-3.5 text-[#525252] max-w-[200px] text-[11px]">
                          {o.delivery_address}
                        </td>
                        <td className="p-3.5 text-[11px] text-[#525252]">
                          {o.items.map((it, idx) => (
                            <div key={idx}>
                              • {it.name} ({it.selectedSize}, {it.selectedColor}) x{it.quantity}
                            </div>
                          ))}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-[#111111]">
                            {formatNaira(o.total_amount)}
                          </div>
                          <span className="text-[10px] uppercase text-[#737373]">
                            {o.payment_method === 'bank_transfer' ? 'Bank Transfer' : 'Cash on Delivery'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                            {o.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= Add Product Modal ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-white border border-[#E5E5E5] p-6 sm:p-8 my-auto shadow-2xl">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-[#737373] hover:text-[#111111]"
            >
              <X size={18} />
            </button>

            <div className="mb-5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#737373] font-semibold block">
                Catalog Management
              </span>
              <h3 className="text-xl font-serif text-[#111111]">
                Add New Luxury Product
              </h3>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#111111] font-medium mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Venetian Leather Derby"
                    value={newProd.name}
                    onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#111111] font-medium mb-1">
                    Category *
                  </label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                  >
                    <option value="shoes">Shoes (Unisex)</option>
                    <option value="bags">Bags (Female)</option>
                    <option value="jewelry">Jewelry (Female)</option>
                    <option value="watches">Watches (Male & Female)</option>
                    <option value="perfumes">Perfumes (Unisex)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#111111] font-medium mb-1">
                    Price in NGN (₦) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="e.g. 85000"
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#111111] font-medium mb-1">
                    Material / Craft *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Italian Box Calfskin"
                    value={newProd.material}
                    onChange={(e) => setNewProd({ ...newProd, material: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#111111] font-medium mb-1">
                    Sizes (Comma Separated)
                  </label>
                  <input
                    type="text"
                    placeholder="EUR 40, EUR 41, EUR 42, EUR 43"
                    value={newProd.sizes}
                    onChange={(e) => setNewProd({ ...newProd, sizes: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E5E5E5] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#111111] font-medium mb-1">
                    Colors (Comma Separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Noir Black, Tan, Gold"
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
                  className="accent-black w-4 h-4"
                />
                <label htmlFor="new-arrival-checkbox" className="text-[#111111] font-medium">
                  Feature as "New Arrival" capsule item
                </label>
              </div>

              <div className="pt-4 border-t border-[#E5E5E5] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#E5E5E5] text-[#525252] hover:bg-[#F5F5F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProd}
                  className="px-6 py-2 bg-[#111111] text-[#FAFAFA] uppercase tracking-wider font-medium hover:bg-black"
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

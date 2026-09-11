import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  User,
  LogOut,
  ArrowRight,
  ShoppingBag,
  Mail,
  Sparkles,
  Clock,
  Eye,
  Settings,
  Check,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Package,
} from 'lucide-react';
import {
  UserSession,
  MODERN_AVATARS,
  updateUserProfile,
  deleteUserAccount,
  getRecentlyViewedIds,
  clearRecentlyViewed,
} from '../lib/auth';
import { orderService } from '../lib/supabase';
import { Order, Product } from '../types';
import { formatNaira } from '../lib/format';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession | null;
  onSignOut: () => void;
  currentView: 'shop' | 'admin';
  onNavigate: (view: 'shop' | 'admin') => void;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onSessionUpdate: (updatedSession: UserSession) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  session,
  onSignOut,
  currentView,
  onNavigate,
  allProducts,
  onSelectProduct,
  onSessionUpdate,
}) => {
  // Navigation Tabs inside User Profile
  const [activeTab, setActiveTab] = useState<'orders' | 'viewed' | 'settings'>('orders');

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Settings form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState('');
  const [settingsErrorMsg, setSettingsErrorMsg] = useState('');

  // Delete account confirmation
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Recently viewed products
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (isOpen && session) {
      setEditName(session.name || '');
      setEditEmail(session.email || '');
      setSelectedAvatar(session.avatar || MODERN_AVATARS[0]);

      // Load user order history
      fetchUserOrders(session.email);

      // Load recently viewed
      const ids = getRecentlyViewedIds();
      const viewed = ids
        .map((id) => allProducts.find((p) => p.id === id))
        .filter(Boolean) as Product[];
      setRecentlyViewedProducts(viewed);
    }
  }, [isOpen, session, allProducts]);

  const fetchUserOrders = async (email: string) => {
    setLoadingOrders(true);
    try {
      const allOrders = await orderService.getAll();
      const userOrders = allOrders.filter(
        (o) =>
          o.customer_email?.trim().toLowerCase() === email.trim().toLowerCase() ||
          o.customer_name?.toLowerCase() === (session?.name || '').toLowerCase()
      );
      setOrders(userOrders);
    } catch (e) {
      console.error('Failed to fetch user orders', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (!isOpen || !session) return null;

  // Handle saving profile changes
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsErrorMsg('');
    setSettingsSuccessMsg('');

    if (!editName.trim()) {
      setSettingsErrorMsg('Please provide a valid full name.');
      return;
    }

    if (!editEmail.trim() || !editEmail.includes('@')) {
      setSettingsErrorMsg('Please provide a valid email/Gmail address.');
      return;
    }

    setIsSavingSettings(true);
    try {
      const { session: updated, error } = await updateUserProfile(session.email, {
        name: editName,
        email: editEmail,
        avatar: selectedAvatar,
      });

      if (error) {
        setSettingsErrorMsg(error);
      } else {
        onSessionUpdate(updated);
        setSettingsSuccessMsg('Profile information updated successfully.');
        setTimeout(() => setSettingsSuccessMsg(''), 3500);
      }
    } catch (err: any) {
      setSettingsErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') {
      setSettingsErrorMsg('Please type DELETE in capital letters to confirm.');
      return;
    }

    try {
      await deleteUserAccount(session.email);
      onSignOut();
      onClose();
    } catch (err: any) {
      setSettingsErrorMsg(err.message || 'Failed to delete account.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-[#E5E5E5] my-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5] bg-[#FAFAFA]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={session.avatar || MODERN_AVATARS[0]}
                alt={session.name}
                className="w-10 h-10 rounded-full object-cover border border-[#E5E5E5] shadow-xs"
              />
              {session.isAdmin && (
                <span
                  title="Atelier Administrator"
                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#111111] text-[#C5A059] rounded-full flex items-center justify-center border border-[#C5A059] shadow-xs"
                >
                  <ShieldCheck size={10} />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif font-medium text-[#111111]">
                  {session.name || 'Boutique Member'}
                </h3>
                {session.isAdmin ? (
                  <span className="px-2 py-0.5 bg-[#111111] text-[#C5A059] border border-[#C5A059]/40 text-[9px] uppercase tracking-wider font-semibold rounded-xs">
                    Admin
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-[#F5F5F5] text-[#737373] text-[9px] uppercase tracking-wider rounded-xs">
                    Client
                  </span>
                )}
              </div>
              <p className="text-xs text-[#737373] flex items-center gap-1.5 mt-0.5">
                <Mail size={11} />
                <span>{session.email}</span>
                {session.provider === 'google' && (
                  <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 text-[9px] font-mono rounded-xs border border-blue-200">
                    Gmail
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#737373] hover:text-[#111111] rounded-full transition-colors"
            aria-label="Close profile modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Administrator Quick Switch Banner (if logged in as admin) */}
        {session.isAdmin && (
          <div className="px-6 py-2.5 bg-[#111111] text-[#FAFAFA] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-[#C5A059]" />
              <span className="tracking-wide">Administrator Privileges Active</span>
            </div>
            {currentView === 'admin' ? (
              <button
                onClick={() => {
                  onNavigate('shop');
                  onClose();
                }}
                className="text-[11px] uppercase tracking-wider text-[#C5A059] hover:text-white underline underline-offset-2 flex items-center gap-1"
              >
                <ShoppingBag size={12} />
                <span>Switch to Store</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onNavigate('admin');
                  onClose();
                }}
                className="text-[11px] uppercase tracking-wider text-[#C5A059] hover:text-white underline underline-offset-2 flex items-center gap-1"
              >
                <ShieldCheck size={12} />
                <span>Open Admin Portal</span>
              </button>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E5E5E5] px-6 bg-white gap-8 text-xs font-medium uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'orders'
                ? 'border-[#111111] text-[#111111] font-semibold'
                : 'border-transparent text-[#737373] hover:text-[#111111]'
            }`}
          >
            <Clock size={14} />
            <span>Order History ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('viewed')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'viewed'
                ? 'border-[#111111] text-[#111111] font-semibold'
                : 'border-transparent text-[#737373] hover:text-[#111111]'
            }`}
          >
            <Eye size={14} />
            <span>Recently Viewed ({recentlyViewedProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'settings'
                ? 'border-[#111111] text-[#111111] font-semibold'
                : 'border-transparent text-[#737373] hover:text-[#111111]'
            }`}
          >
            <Settings size={14} />
            <span>Account Settings</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: ORDER HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-serif font-medium text-[#111111]">
                    Your Purchase History
                  </h4>
                  <p className="text-xs text-[#737373]">
                    Orders placed with {session.email}
                  </p>
                </div>
                <button
                  onClick={() => fetchUserOrders(session.email)}
                  className="p-1.5 text-[#737373] hover:text-[#111111]"
                  title="Refresh orders"
                >
                  <RefreshCw size={13} className={loadingOrders ? 'animate-spin' : ''} />
                </button>
              </div>

              {loadingOrders ? (
                <div className="py-12 text-center">
                  <div className="inline-block w-6 h-6 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="text-xs text-[#737373]">Retrieving order history...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center bg-[#FAFAFA] border border-[#E5E5E5] p-6 space-y-2">
                  <Package size={28} className="mx-auto text-[#A3A3A3] mb-1" />
                  <p className="text-sm font-medium text-[#111111]">No orders yet</p>
                  <p className="text-xs text-[#737373] max-w-xs mx-auto">
                    When you purchase luxury essentials from Tifeh's Place, your delivery tracking and invoices will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-[#E5E5E5] bg-[#FAFAFA] p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-xs text-[#111111]">
                              {order.id}
                            </span>
                            <span
                              className={`text-[9px] uppercase tracking-wider px-2 py-0.5 font-medium rounded-xs ${
                                order.status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : order.status === 'dispatched'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {order.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#737373] mt-0.5">
                            Placed on {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-semibold text-[#111111]">
                            {formatNaira(order.total_amount)}
                          </span>
                          <p className="text-[10px] text-[#737373] uppercase tracking-wider">
                            {order.payment_method.replace('_', ' ')}
                          </p>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="pt-2 border-t border-[#E5E5E5]/60 flex flex-wrap gap-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 bg-white border border-[#E5E5E5] px-2 py-1 rounded-xs"
                          >
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-7 h-7 object-cover rounded-2xs"
                            />
                            <div className="text-[11px] leading-tight">
                              <span className="font-medium text-[#111111] block">
                                {item.name}
                              </span>
                              <span className="text-[10px] text-[#737373]">
                                Qty: {item.quantity} • {item.selectedSize}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-[11px] text-[#737373] pt-1">
                        <span className="font-medium text-[#525252]">Delivery:</span>{' '}
                        {order.delivery_address}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RECENTLY VIEWED ITEMS */}
          {activeTab === 'viewed' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-serif font-medium text-[#111111]">
                    Recently Viewed Essentials
                  </h4>
                  <p className="text-xs text-[#737373]">
                    Products you've browsed during your sessions
                  </p>
                </div>
                {recentlyViewedProducts.length > 0 && (
                  <button
                    onClick={() => {
                      clearRecentlyViewed();
                      setRecentlyViewedProducts([]);
                    }}
                    className="text-[11px] text-[#737373] hover:text-[#111111] underline"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {recentlyViewedProducts.length === 0 ? (
                <div className="py-12 text-center bg-[#FAFAFA] border border-[#E5E5E5] p-6 space-y-2">
                  <Eye size={26} className="mx-auto text-[#A3A3A3] mb-1" />
                  <p className="text-sm font-medium text-[#111111]">No recently viewed items</p>
                  <p className="text-xs text-[#737373] max-w-xs mx-auto">
                    Browse luxury shoes, bags, perfumes, watches, and jewelry to view them quickly here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {recentlyViewedProducts.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        onSelectProduct(prod);
                        onClose();
                      }}
                      className="group cursor-pointer border border-[#E5E5E5] hover:border-[#111111] bg-[#FAFAFA] p-2.5 transition-all"
                    >
                      <div className="aspect-square w-full overflow-hidden bg-[#F5F5F5] mb-2">
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <span className="text-[9px] uppercase tracking-wider text-[#737373] block">
                        {prod.category}
                      </span>
                      <h5 className="text-xs font-serif font-medium text-[#111111] truncate">
                        {prod.name}
                      </h5>
                      <span className="text-xs font-semibold text-[#111111] block mt-0.5">
                        {formatNaira(prod.price)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SETTINGS (PROFILE PIC, CHANGE NAME & GMAIL, DELETE ACCOUNT) */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {settingsSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <Check size={14} className="shrink-0" />
                  <span>{settingsSuccessMsg}</span>
                </div>
              )}

              {settingsErrorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{settingsErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* 1. Modern Avatar Picker (No legacy file uploads) */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
                    Profile Avatar
                  </label>
                  <p className="text-xs text-[#737373] mb-3">
                    Choose from modern studio portraits:
                  </p>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                    {MODERN_AVATARS.map((avatarUrl, idx) => {
                      const isSelected = selectedAvatar === avatarUrl;
                      return (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setSelectedAvatar(avatarUrl)}
                          className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all p-0.5 ${
                            isSelected
                              ? 'border-[#111111] scale-105 shadow-sm'
                              : 'border-transparent hover:border-[#D4D4D4] opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={avatarUrl}
                            alt={`Preset avatar ${idx + 1}`}
                            className="w-full h-full object-cover rounded-full"
                          />
                          {isSelected && (
                            <span className="absolute inset-0 bg-black/25 flex items-center justify-center text-white">
                              <Check size={14} strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Change Name */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]"
                    />
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="e.g. Tifeh Balogun"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FAFAFA] border border-[#E5E5E5] text-xs focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                </div>

                {/* 3. Change Gmail / Email Account */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
                    Gmail / Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]"
                    />
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FAFAFA] border border-[#E5E5E5] text-xs focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                  <span className="text-[10px] text-[#737373] mt-1 block">
                    Changing this email updates your active boutique session. If you enter your admin address ({session.email}), admin privileges persist.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full py-2.5 bg-[#111111] hover:bg-black text-white text-xs uppercase tracking-[0.18em] font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Check size={14} />
                  <span>{isSavingSettings ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </form>

              {/* 4. Delete Account Section */}
              <div className="pt-6 border-t border-[#E5E5E5] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs uppercase tracking-wider font-semibold text-red-700 flex items-center gap-1.5">
                      <AlertTriangle size={13} />
                      <span>Delete Account</span>
                    </h5>
                    <p className="text-[11px] text-[#737373] mt-0.5">
                      Permanently terminate your profile, preferences, and session data.
                    </p>
                  </div>

                  {!isConfirmingDelete && (
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDelete(true)}
                      className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium rounded-xs transition-colors"
                    >
                      Delete Account
                    </button>
                  )}
                </div>

                {isConfirmingDelete && (
                  <div className="p-4 bg-red-50 border border-red-200 space-y-3 animate-in fade-in duration-200">
                    <p className="text-xs text-red-800">
                      This action cannot be undone. To proceed, please type{' '}
                      <span className="font-mono font-bold">DELETE</span> below:
                    </p>
                    <input
                      type="text"
                      value={deleteConfirmationText}
                      onChange={(e) => setDeleteConfirmationText(e.target.value)}
                      placeholder="Type DELETE"
                      className="w-full px-3 py-2 bg-white border border-red-300 text-xs focus:outline-none font-mono"
                    />

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs uppercase tracking-wider font-medium"
                      >
                        Confirm Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsConfirmingDelete(false);
                          setDeleteConfirmationText('');
                        }}
                        className="px-3 py-2 text-xs text-[#525252] hover:text-[#111111]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between text-xs">
          <span className="text-[#737373] text-[11px]">
            Tifeh.s Place Atelier Member Profile
          </span>
          <button
            onClick={() => {
              onSignOut();
              onClose();
            }}
            className="text-red-700 hover:text-red-800 font-medium flex items-center gap-1.5 transition-colors uppercase tracking-wider text-[11px]"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

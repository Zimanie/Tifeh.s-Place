import React, { useState, useEffect, useRef } from 'react';
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
  Camera,
  UploadCloud,
  Phone,
  MapPin,
  Database,
} from 'lucide-react';
import {
  UserSession,
  MODERN_AVATARS,
  updateUserProfile,
  deleteUserAccount,
  getRecentlyViewedIds,
  clearRecentlyViewed,
  getSavedUserProfile,
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
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState('');
  const [settingsErrorMsg, setSettingsErrorMsg] = useState('');

  // Delete account confirmation
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Recently viewed products
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<Product[]>([]);

  // Hidden file input for uploading profile picture from gallery/camera
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session) {
      // Rehydrate fields from session and saved profile store
      const saved = getSavedUserProfile(session.email);
      setEditName(session.name || saved?.name || '');
      setEditEmail(session.email || '');
      setEditPhone(session.phone || saved?.phone || '');
      setEditAddress(session.deliveryAddress || saved?.deliveryAddress || '');
      setSelectedAvatar(session.avatar || saved?.avatar || MODERN_AVATARS[0]);

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

  /**
   * Handle uploading image from phone/computer gallery
   * Compresses to clean avatar dimension and updates database immediately
   */
  const handleImageFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const img = new Image();
      img.onload = async () => {
        // Create canvas to resize to crisp avatar square (320x320)
        const canvas = document.createElement('canvas');
        const size = 320;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Cover crop to circle/square
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

        setSelectedAvatar(dataUrl);

        // Instantly save to database & active session so it persists permanently
        try {
          const { session: updated, error } = await updateUserProfile(session.email, {
            avatar: dataUrl,
          });
          if (!error && updated) {
            onSessionUpdate(updated);
            setSettingsSuccessMsg('Profile picture uploaded from gallery and saved to database.');
            setTimeout(() => setSettingsSuccessMsg(''), 4000);
          }
        } catch (err) {
          console.error('Failed to auto-save uploaded avatar', err);
        }
      };
      img.src = uploadEvent.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Reset input value so same file can be reselected if needed
    e.target.value = '';
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
        phone: editPhone,
        deliveryAddress: editAddress,
      });

      if (error) {
        setSettingsErrorMsg(error);
      } else {
        onSessionUpdate(updated);
        setSettingsSuccessMsg('Profile information & preferences saved to database.');
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
      {/* Hidden input to upload from gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileSelected}
      />

      <div className="relative w-full max-w-2xl bg-white border border-[#E5E5E5] my-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top bar with Clickable Profile Picture */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5] bg-[#FAFAFA]">
          <div className="flex items-center gap-3">
            {/* Clickable Avatar with Camera hover overlay */}
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload profile photo from gallery / camera"
            >
              <img
                src={session.avatar || MODERN_AVATARS[0]}
                alt={session.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-[#111111] group-hover:opacity-75 transition-opacity shadow-xs"
              />
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={15} className="text-white" />
              </div>
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
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <p className="text-xs text-[#737373] flex items-center gap-1.5">
                  <Mail size={11} />
                  <span>{session.email}</span>
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[10px] text-[#C5A059] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Camera size={10} />
                  <span>Change Photo</span>
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#737373] hover:text-[#111111] rounded-full transition-colors cursor-pointer"
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
              <span className="text-[11px] uppercase tracking-widest text-[#E5E5E5]">
                Administrator Privileges Active
              </span>
            </div>
            <button
              onClick={() => {
                onNavigate(currentView === 'admin' ? 'shop' : 'admin');
                onClose();
              }}
              className="px-3 py-1 bg-[#C5A059] text-[#111111] font-semibold text-[10px] uppercase tracking-wider hover:bg-[#D4AF37] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{currentView === 'admin' ? 'Switch to Boutique Store' : 'Go to Admin Portal'}</span>
              <ArrowRight size={11} />
            </button>
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-[#E5E5E5] px-6 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-4 text-xs font-medium uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#737373] hover:text-[#111111]'
            }`}
          >
            <ShoppingBag size={14} />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('viewed')}
            className={`py-3 px-4 text-xs font-medium uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'viewed'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#737373] hover:text-[#111111]'
            }`}
          >
            <Eye size={14} />
            <span>Recently Viewed ({recentlyViewedProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 text-xs font-medium uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#737373] hover:text-[#111111]'
            }`}
          >
            <Settings size={14} />
            <span>Profile & Picture</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 text-left space-y-6">
          {/* TAB 1: ORDER HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-serif font-medium text-[#111111]">
                    Purchase History & Receipts
                  </h4>
                  <p className="text-xs text-[#737373]">
                    Track orders submitted from this client account or verified on WhatsApp.
                  </p>
                </div>
                <button
                  onClick={() => fetchUserOrders(session.email)}
                  className="p-1.5 text-[#737373] hover:text-[#111111] transition-colors rounded-xs cursor-pointer"
                  title="Refresh order history"
                >
                  <RefreshCw size={14} className={loadingOrders ? 'animate-spin' : ''} />
                </button>
              </div>

              {loadingOrders ? (
                <div className="py-12 text-center text-xs text-[#737373]">
                  Fetching boutique order records...
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 px-4 border border-dashed border-[#E5E5E5] text-center space-y-3">
                  <Package size={28} className="mx-auto text-[#A3A3A3]" />
                  <p className="text-xs text-[#525252]">No orders recorded under this account yet.</p>
                  <button
                    onClick={() => {
                      onNavigate('shop');
                      onClose();
                    }}
                    className="px-4 py-2 bg-[#111111] text-[#FAFAFA] text-xs uppercase tracking-wider font-medium hover:bg-black transition-colors cursor-pointer"
                  >
                    Browse Collections
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 border border-[#E5E5E5] bg-[#FAFAFA] hover:border-[#D4D4D4] transition-all space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-[#111111]">
                          #{order.id}
                        </span>
                        <span className="text-[11px] text-[#737373]">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>

                      <div className="text-xs text-[#525252] space-y-1">
                        <div>
                          <strong>Items:</strong>{' '}
                          {order.items?.map((item) => `${item.name} (${item.quantity})`).join(', ')}
                        </div>
                        <div>
                          <strong>Delivery Address:</strong> {order.delivery_address}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#EAEAEA] flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#111111]">
                          Total: {formatNaira(order.total_amount)}
                        </span>
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] uppercase tracking-wider font-semibold rounded-xs">
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RECENTLY VIEWED */}
          {activeTab === 'viewed' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-serif font-medium text-[#111111]">
                    Recently Viewed Pieces
                  </h4>
                  <p className="text-xs text-[#737373]">
                    Your private atelier viewing history.
                  </p>
                </div>
                {recentlyViewedProducts.length > 0 && (
                  <button
                    onClick={() => {
                      clearRecentlyViewed();
                      setRecentlyViewedProducts([]);
                    }}
                    className="text-[11px] text-[#737373] hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {recentlyViewedProducts.length === 0 ? (
                <div className="py-12 border border-dashed border-[#E5E5E5] text-center space-y-2">
                  <Eye size={24} className="mx-auto text-[#A3A3A3]" />
                  <p className="text-xs text-[#737373]">No recently viewed items yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {recentlyViewedProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        onSelectProduct(product);
                        onClose();
                      }}
                      className="group cursor-pointer border border-[#E5E5E5] p-2 hover:border-[#111111] transition-all bg-white"
                    >
                      <div className="aspect-square bg-[#F5F5F5] overflow-hidden mb-2">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="text-xs">
                        <p className="font-medium text-[#111111] truncate">{product.name}</p>
                        <p className="text-[#C5A059] font-semibold mt-0.5">
                          {formatNaira(product.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACCOUNT & PROFILE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Persistence notice */}
              <div className="p-3 bg-[#FAF8F5] border border-[#EBE3D5] flex items-center gap-2.5 text-xs text-[#737373]">
                <Database size={15} className="text-[#C5A059] shrink-0" />
                <span>
                  All changes are automatically synced to your persistent database profile and remain intact across logins.
                </span>
              </div>

              {settingsSuccessMsg && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                  <Check size={14} className="shrink-0" />
                  <span>{settingsSuccessMsg}</span>
                </div>
              )}

              {settingsErrorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{settingsErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4">
                {/* 1. Custom Profile Picture Upload from Gallery */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1.5">
                    Profile Picture
                  </label>
                  
                  {/* Dedicated Gallery Upload Box */}
                  <div className="p-3.5 bg-white border border-[#E5E5E5] flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="relative group cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                        title="Click to choose from photo gallery"
                      >
                        <img
                          src={selectedAvatar || session.avatar || MODERN_AVATARS[0]}
                          alt="Current avatar preview"
                          className="w-12 h-12 rounded-full object-cover border-2 border-[#111111] group-hover:opacity-75 transition-opacity shadow-xs"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera size={14} className="text-white" />
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[#111111] block">
                          Upload Custom Photo
                        </span>
                        <span className="text-[10px] text-[#737373] block">
                          Select any image from your phone gallery or computer.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2 bg-[#111111] text-white hover:bg-black text-[11px] uppercase tracking-wider font-medium flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <UploadCloud size={13} className="text-[#C5A059]" />
                      <span>Choose From Gallery</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-[#737373] mb-2">
                    Or select from our atelier studio collection:
                  </p>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                    {MODERN_AVATARS.map((avatarUrl, idx) => {
                      const isSelected = selectedAvatar === avatarUrl;
                      return (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setSelectedAvatar(avatarUrl)}
                          className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all p-0.5 cursor-pointer ${
                            isSelected
                              ? 'border-[#111111] scale-105 shadow-xs'
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

                {/* 2. Full Name */}
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

                {/* 3. Phone Number (Persistent) */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <div className="relative">
                    <Phone
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]"
                    />
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="e.g. +234 812 000 0000"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FAFAFA] border border-[#E5E5E5] text-xs focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                  <span className="text-[10px] text-[#737373] mt-0.5 block">
                    Used for auto-filling quick checkout deliveries.
                  </span>
                </div>

                {/* 4. Delivery Address (Persistent) */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
                    Default Delivery Address
                  </label>
                  <div className="relative">
                    <MapPin
                      size={14}
                      className="absolute left-3 top-3 text-[#737373]"
                    />
                    <textarea
                      rows={2}
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      placeholder="e.g. 14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria"
                      className="w-full pl-9 pr-3 py-2 bg-[#FAFAFA] border border-[#E5E5E5] text-xs focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                </div>

                {/* 5. Email Account */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#111111] mb-1">
                    Email Address
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
                    Changing this email updates your active session. Admin privileges automatically apply to recognized admin emails.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full py-2.5 bg-[#111111] hover:bg-black text-white text-xs uppercase tracking-[0.18em] font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check size={14} />
                  <span>{isSavingSettings ? 'Saving to Database...' : 'Save Profile Changes'}</span>
                </button>
              </form>

              {/* 6. Delete Account Section */}
              <div className="pt-6 border-t border-[#E5E5E5] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs uppercase tracking-wider font-semibold text-red-700 flex items-center gap-1.5">
                      <AlertTriangle size={13} />
                      <span>Delete Account</span>
                    </h5>
                    <p className="text-[11px] text-[#737373] mt-0.5">
                      Permanently terminate your profile and clear saved preferences.
                    </p>
                  </div>

                  {!isConfirmingDelete && (
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDelete(true)}
                      className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium rounded-xs transition-colors cursor-pointer"
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
                        className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs uppercase tracking-wider font-medium cursor-pointer"
                      >
                        Confirm Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsConfirmingDelete(false);
                          setDeleteConfirmationText('');
                        }}
                        className="px-3 py-2 text-xs text-[#525252] hover:text-[#111111] cursor-pointer"
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
            className="text-red-700 hover:text-red-800 font-medium flex items-center gap-1.5 transition-colors uppercase tracking-wider text-[11px] cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

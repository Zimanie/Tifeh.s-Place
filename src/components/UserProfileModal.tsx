import React, { useState } from 'react';
import { X, ShieldCheck, User, LogOut, ArrowRight, ShoppingBag, Mail, Sparkles } from 'lucide-react';
import { UserSession, getCustomAdminGmail, setCustomAdminGmail } from '../lib/auth';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession | null;
  onSignOut: () => void;
  currentView: 'shop' | 'admin';
  onNavigate: (view: 'shop' | 'admin') => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  session,
  onSignOut,
  currentView,
  onNavigate,
}) => {
  const [editingAdminEmail, setEditingAdminEmail] = useState(false);
  const [customAdminInput, setCustomAdminInput] = useState('');
  const [adminSaveNotice, setAdminSaveNotice] = useState('');

  if (!isOpen || !session) return null;

  const handleSaveCustomAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAdminInput || !customAdminInput.includes('@')) return;
    setCustomAdminGmail(customAdminInput);
    setAdminSaveNotice(`Admin Gmail registered as ${customAdminInput.trim().toLowerCase()}`);
    setEditingAdminEmail(false);
    setTimeout(() => setAdminSaveNotice(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-[#E5E5E5] p-6 sm:p-8 my-auto shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#737373] hover:text-[#111111]"
          aria-label="Close profile"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex p-3.5 bg-[#111111] text-[#FAFAFA] rounded-full mb-3 shadow-sm">
            {session.isAdmin ? <ShieldCheck size={26} className="text-[#C5A059]" /> : <User size={26} />}
          </div>

          <span className="text-[10px] uppercase tracking-[0.25em] text-[#737373] font-semibold block mb-1">
            Account Profile
          </span>
          <h2 className="text-2xl font-serif text-[#111111]">
            {session.name || 'Boutique Member'}
          </h2>

          <div className="flex items-center justify-center gap-1.5 text-xs text-[#525252] mt-1">
            <Mail size={13} className="text-[#737373]" />
            <span>{session.email}</span>
            {session.provider === 'google' && (
              <span className="ml-1 px-1.5 py-0.5 bg-[#F5F5F5] border border-[#E5E5E5] text-[10px] uppercase tracking-wider text-[#525252] rounded-xs font-mono">
                Gmail
              </span>
            )}
          </div>

          {/* Role Pill */}
          <div className="mt-3 flex justify-center">
            {session.isAdmin ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#111111] text-[#C5A059] border border-[#C5A059]/40 text-[11px] uppercase tracking-[0.18em] font-medium rounded-full">
                <ShieldCheck size={13} />
                <span>Atelier Administrator</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5F5F5] text-[#525252] border border-[#E5E5E5] text-[11px] uppercase tracking-[0.15em] font-medium rounded-full">
                <User size={13} />
                <span>Valued Client</span>
              </span>
            )}
          </div>
        </div>

        {/* Admin Navigation Action if user is Admin */}
        {session.isAdmin && (
          <div className="mb-6 p-4 bg-[#FAFAFA] border border-[#C5A059]/30 rounded-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-[#111111] uppercase tracking-wider">
                <Sparkles size={14} className="text-[#C5A059]" />
                <span>Admin Privileges Active</span>
              </div>
              <span className="text-[10px] text-[#737373]">Via Admin Gmail</span>
            </div>
            <p className="text-xs text-[#737373] leading-relaxed">
              You are authenticated as store management. You can manage products, view customer orders, and update catalog inventory.
            </p>

            {currentView === 'admin' ? (
              <button
                onClick={() => {
                  onNavigate('shop');
                  onClose();
                }}
                className="w-full py-2.5 bg-[#111111] text-white text-xs uppercase tracking-[0.18em] font-medium hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag size={14} />
                <span>Switch to Boutique Store</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onNavigate('admin');
                  onClose();
                }}
                className="w-full py-2.5 bg-[#111111] text-[#FAFAFA] text-xs uppercase tracking-[0.18em] font-medium hover:bg-black transition-all flex items-center justify-center gap-2 border border-[#C5A059]/50"
              >
                <ShieldCheck size={14} className="text-[#C5A059]" />
                <span>Open Admin Dashboard</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        )}

        {adminSaveNotice && (
          <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            {adminSaveNotice}
          </div>
        )}

        {/* Sign Out & Secondary Actions */}
        <div className="space-y-3 pt-3 border-t border-[#E5E5E5]">
          <button
            onClick={() => {
              onSignOut();
              onClose();
            }}
            className="w-full py-3 border border-[#E5E5E5] text-[#111111] text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#F5F5F5] hover:border-[#111111] transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

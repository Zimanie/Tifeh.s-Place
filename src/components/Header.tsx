import React, { useState, useEffect } from 'react';
import { ShoppingBag, User, Menu, X, Sparkles, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { UserSession } from '../lib/auth';

interface HeaderProps {
  currentView: 'shop' | 'admin' | 'product_detail';
  onNavigate: (view: 'shop' | 'admin') => void;
  onOpenAuth: () => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  isAdminLoggedIn: boolean;
  currentUserEmail: string | null;
  currentUserSession?: UserSession | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onSelectCategory,
  isAdminLoggedIn,
  currentUserEmail,
  currentUserSession,
}) => {
  const { totalItems, openCart, cartBumpCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isBumping, setIsBumping] = useState(false);

  // Trigger animation effect on header cart whenever items are added to bag
  useEffect(() => {
    if (cartBumpCount > 0) {
      setIsBumping(true);
      const timer = setTimeout(() => setIsBumping(false), 700);
      return () => clearTimeout(timer);
    }
  }, [cartBumpCount]);

  const navLinks = [
    { label: 'All Items', cat: 'all' },
    { label: 'Shoes', cat: 'shoes' },
    { label: 'Bags', cat: 'bags' },
    { label: 'Jewelry', cat: 'jewelry' },
    { label: 'Watches', cat: 'watches' },
    { label: 'Perfumes', cat: 'perfumes' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAFA]/95 backdrop-blur-md border-b border-[#E5E5E5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 min-h-[4.25rem] sm:min-h-[4.75rem] flex items-center justify-between gap-2 sm:gap-4 relative">
        {/* Left: Mobile hamburger & desktop primary nav */}
        <div className="flex items-center gap-4 sm:gap-6 flex-1 justify-start min-w-0">
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#111111] hover:text-black focus:outline-none -ml-2 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <nav className="hidden md:flex items-center space-x-6 text-[13px] tracking-widest uppercase font-medium">
            <button
              onClick={() => {
                onNavigate('shop');
                onSelectCategory('all');
              }}
              className="text-[#111111] hover:opacity-60 transition-opacity cursor-pointer"
            >
              Collection
            </button>
            <button
              onClick={() => {
                onNavigate('shop');
                onSelectCategory('new_arrivals');
              }}
              className="text-[#111111] hover:opacity-60 transition-opacity flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={13} className="text-[#C5A059]" />
              New Arrivals
            </button>
          </nav>
        </div>

        {/* Center: Brand Logo */}
        <div
          className="flex-shrink-0 text-center cursor-pointer flex flex-col items-center justify-center px-1 sm:px-3"
          onClick={() => onNavigate('shop')}
        >
          <h1 className="text-[17px] sm:text-2xl md:text-3xl tracking-[0.12em] sm:tracking-[0.2em] font-serif font-light text-[#111111] uppercase hover:opacity-85 transition-opacity whitespace-nowrap leading-tight">
            Tifeh.s Place
          </h1>
          <span className="block text-[7.5px] sm:text-[9px] md:text-[10px] tracking-[0.16em] sm:tracking-[0.3em] text-[#737373] uppercase mt-0.5 sm:mt-1 whitespace-nowrap leading-tight">
            Lagos • Luxury Essentials
          </span>
        </div>

        {/* Right: Actions, Admin Shortcut, Profile & Animated Cart */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end min-w-0">
          {/* Administrator Portal Toggle Button */}
          {isAdminLoggedIn ? (
            <button
              onClick={() => onNavigate(currentView === 'admin' ? 'shop' : 'admin')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-wider font-medium rounded-xs border transition-all cursor-pointer ${
                currentView === 'admin'
                  ? 'bg-[#111111] text-[#C5A059] border-[#C5A059]'
                  : 'bg-white text-[#111111] border-[#D4D4D4] hover:border-[#111111]'
              }`}
              title={currentView === 'admin' ? 'Return to Boutique storefront' : 'Open Administrator Portal'}
            >
              <ShieldCheck size={13} className="text-[#C5A059]" />
              <span>{currentView === 'admin' ? 'View Store' : 'Admin'}</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('admin')}
              className="hidden lg:flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#737373] hover:text-[#111111] transition-colors cursor-pointer px-1.5 py-1"
              title="Administrator access to inventory and order records"
            >
              <ShieldCheck size={11} className="text-[#A3A3A3]" />
              <span>Admin</span>
            </button>
          )}

          {/* User Account / Profile Picture (Clickable to open profile & upload) */}
          <button
            id="header-auth-btn"
            onClick={onOpenAuth}
            title={
              currentUserEmail
                ? isAdminLoggedIn
                  ? `Administrator: ${currentUserEmail} (Click to manage profile)`
                  : `Signed in as ${currentUserEmail} (Click to manage profile)`
                : 'Account Sign In / Register'
            }
            className={`relative p-0.5 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
              currentUserEmail
                ? isAdminLoggedIn
                  ? 'border-[#C5A059] ring-2 ring-[#C5A059]/40'
                  : 'border-[#111111] hover:ring-2 hover:ring-black/20'
                : 'border-[#E5E5E5] text-[#404040] hover:text-[#111111] hover:border-[#111111] bg-white p-2 sm:p-2.5'
            }`}
            aria-label="User account"
          >
            {currentUserSession?.avatar ? (
              <img
                src={currentUserSession.avatar}
                alt={currentUserSession.name || 'User'}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
              />
            ) : (
              <User size={18} />
            )}
            {isAdminLoggedIn && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#C5A059] border-2 border-white rounded-full flex items-center justify-center" />
            )}
          </button>

          {/* Cart Bag Icon with dynamic bounce/pulse animation effect */}
          <div className="relative">
            <motion.button
              id="header-cart-btn"
              onClick={openCart}
              animate={
                isBumping
                  ? {
                      scale: [1, 1.25, 0.92, 1.12, 1],
                      rotate: [0, -10, 10, -5, 0],
                    }
                  : { scale: 1, rotate: 0 }
              }
              transition={{ duration: 0.6, ease: 'easeOut' }}
              aria-label="Open shopping bag"
              className={`relative p-2 sm:p-2.5 rounded-full transition-colors flex items-center justify-center cursor-pointer shadow-xs ${
                isBumping
                  ? 'bg-[#C5A059] text-[#111111] ring-4 ring-[#C5A059]/40'
                  : 'bg-[#111111] text-[#FAFAFA] hover:bg-[#262626]'
              }`}
            >
              <ShoppingBag size={18} />
              
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key={`cart-badge-${totalItems}`}
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: isBumping ? [1, 1.45, 1] : 1, opacity: 1 }}
                    exit={{ scale: 0.3, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'backOut' }}
                    className="absolute -top-1 -right-1 bg-[#C5A059] text-[#111111] font-bold text-[10px] min-w-4.5 h-4.5 px-1 rounded-full flex items-center justify-center shadow-xs border border-white"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Glowing ripple wave effect when product is added to bag */}
            {isBumping && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="pointer-events-none absolute inset-0 rounded-full border-2 border-[#C5A059]"
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E5E5] bg-[#FAFAFA] px-6 py-5 space-y-4 animate-in fade-in duration-200">
          <div className="text-[11px] tracking-[0.2em] uppercase text-[#737373] font-semibold mb-2">
            Categories
          </div>
          <div className="grid grid-cols-2 gap-3">
            {navLinks.map((link) => (
              <button
                key={link.cat}
                onClick={() => {
                  onNavigate('shop');
                  onSelectCategory(link.cat);
                  setMobileMenuOpen(false);
                }}
                className="text-left text-xs uppercase tracking-wider py-2 text-[#404040] hover:text-[#111111] font-medium"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E5E5E5] flex flex-col gap-2.5">
            <button
              onClick={() => {
                onNavigate('shop');
                onSelectCategory('new_arrivals');
                setMobileMenuOpen(false);
              }}
              className="text-left text-xs uppercase tracking-wider text-[#C5A059] font-medium flex items-center gap-1.5 py-1"
            >
              <Sparkles size={13} />
              <span>New Arrivals Capsule</span>
            </button>

            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className="text-left text-xs uppercase tracking-wider text-[#111111] font-medium flex items-center gap-1.5 py-1"
            >
              <ShieldCheck size={13} className="text-[#C5A059]" />
              <span>Administrator Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

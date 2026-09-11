import React, { useState } from 'react';
import { ShoppingBag, ShieldCheck, User, Code2, Menu, X, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  currentView: 'shop' | 'admin' | 'product_detail';
  onNavigate: (view: 'shop' | 'admin') => void;
  onOpenAuth: () => void;
  onOpenExportGuide: () => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  isAdminLoggedIn: boolean;
  currentUserEmail: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenExportGuide,
  onSelectCategory,
  isAdminLoggedIn,
  currentUserEmail,
}) => {
  const { totalItems, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            className="md:hidden p-2 text-[#111111] hover:text-black focus:outline-none -ml-2"
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
              className="text-[#111111] hover:opacity-60 transition-opacity"
            >
              Collection
            </button>
            <button
              onClick={() => {
                onNavigate('shop');
                onSelectCategory('new_arrivals');
              }}
              className="text-[#111111] hover:opacity-60 transition-opacity flex items-center gap-1.5"
            >
              <Sparkles size={13} className="text-[#C5A059]" />
              New Arrivals
            </button>
          </nav>
        </div>

        {/* Center: Brand Logo - perfectly aligned & strictly contained */}
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

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-1 justify-end min-w-0">
          {/* Developer / Next.js Guide */}
          <button
            id="open-nextjs-guide-btn"
            onClick={onOpenExportGuide}
            title="View Next.js Architecture & Supabase SQL"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-[11px] tracking-wider uppercase border border-[#D4D4D4] rounded-sm text-[#404040] hover:bg-[#F0F0F0] hover:text-[#111111] transition-all"
          >
            <Code2 size={13} />
            <span>Next.js Code & SQL</span>
          </button>

          {/* Admin Dashboard link (desktop only to prevent mobile overlap) */}
          <button
            id="header-admin-btn"
            onClick={() => onNavigate(currentView === 'admin' ? 'shop' : 'admin')}
            title={isAdminLoggedIn ? 'Admin Dashboard (Active)' : 'Admin Login'}
            className={`hidden sm:flex p-1.5 sm:p-2 rounded-full border transition-all ${
              currentView === 'admin'
                ? 'bg-[#111111] text-[#FAFAFA] border-[#111111]'
                : 'border-[#E5E5E5] text-[#404040] hover:text-[#111111] hover:border-[#111111]'
            }`}
          >
            <ShieldCheck size={18} />
          </button>

          {/* User Account */}
          <button
            id="header-auth-btn"
            onClick={onOpenAuth}
            title={currentUserEmail ? `Signed in as ${currentUserEmail}` : 'Customer Sign In'}
            className="p-1.5 sm:p-2 rounded-full border border-[#E5E5E5] text-[#404040] hover:text-[#111111] hover:border-[#111111] transition-all"
          >
            <User size={18} />
          </button>

          {/* Cart Bag Icon with badge */}
          <button
            id="header-cart-btn"
            onClick={openCart}
            aria-label="Open shopping bag"
            className="relative p-2 sm:p-2.5 bg-[#111111] text-[#FAFAFA] hover:bg-[#262626] rounded-full transition-all flex items-center justify-center"
          >
            <ShoppingBag size={18} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C5A059] text-[#111111] font-semibold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
                {totalItems}
              </span>
            )}
          </button>
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
                className="text-left text-sm py-1.5 text-[#111111] hover:text-[#C5A059] transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="pt-3 border-t border-[#E5E5E5] flex flex-col gap-2">
            <button
              onClick={() => {
                onNavigate('shop');
                onSelectCategory('new_arrivals');
                setMobileMenuOpen(false);
              }}
              className="text-left text-sm py-1 font-medium text-[#111111] flex items-center gap-2"
            >
              <Sparkles size={14} className="text-[#C5A059]" />
              New Arrivals
            </button>
            <button
              onClick={() => {
                onNavigate(currentView === 'admin' ? 'shop' : 'admin');
                setMobileMenuOpen(false);
              }}
              className="text-left text-sm py-1 text-[#525252] hover:text-[#111111] flex items-center gap-2"
            >
              <ShieldCheck size={14} className="text-[#C5A059]" />
              <span>{isAdminLoggedIn ? 'Admin Dashboard (Active)' : 'Admin Login'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

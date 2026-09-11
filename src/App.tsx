import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CartProvider, useCart } from './context/CartContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { NewArrivalsCarousel } from './components/NewArrivalsCarousel';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { Footer } from './components/Footer';
import { Product, Order } from './types';
import { productService, supabase, isSupabaseConfigured } from './lib/supabase';
import {
  UserSession,
  getStoredSession,
  saveSession,
  clearSession,
  addRecentlyViewed,
  isAdminEmail,
  MODERN_AVATARS,
} from './lib/auth';
import { getBoutiqueWhatsAppNumber } from './lib/config';
import { MessageCircle, ShoppingBag, Sparkles } from 'lucide-react';
import { formatNaira } from './lib/format';

function ShopContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'shop' | 'admin'>('shop');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'newest'>('featured');

  // Unified Authentication Session
  const [session, setSession] = useState<UserSession | null>(() => getStoredSession());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Cart Context & Flying animation effect
  const { isCheckoutOpen, closeCheckout, lastAddedItem, dismissToast, openCart, cartBumpCount } = useCart();
  const [flyingParticle, setFlyingParticle] = useState<{ id: number } | null>(null);

  useEffect(() => {
    if (cartBumpCount > 0) {
      setFlyingParticle({ id: cartBumpCount });
      const timer = setTimeout(() => {
        setFlyingParticle(null);
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [cartBumpCount]);

  // Load products
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const items = await productService.getAll();
      setProducts(items);
    } catch (e) {
      console.error('Error fetching products', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Supabase Google Auth Session Listener
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // Check existing Supabase session (handles Google OAuth redirect)
    supabase.auth.getSession().then(({ data: { session: supaSession } }) => {
      if (supaSession?.user) {
        const user = supaSession.user;
        const email = user.email || '';
        const meta = user.user_metadata || {};
        const name = meta.full_name || meta.name || email.split('@')[0];
        const avatar = meta.avatar_url || meta.picture || MODERN_AVATARS[0];
        const provider = user.app_metadata?.provider === 'google' ? 'google' : 'email';

        const updatedSession: UserSession = {
          id: user.id,
          email,
          name,
          avatar,
          isAdmin: isAdminEmail(email),
          provider,
        };
        saveSession(updatedSession);
        setSession(updatedSession);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, supaSession) => {
      if (supaSession?.user) {
        const user = supaSession.user;
        const email = user.email || '';
        const meta = user.user_metadata || {};
        const name = meta.full_name || meta.name || email.split('@')[0];
        const avatar = meta.avatar_url || meta.picture || MODERN_AVATARS[0];
        const provider = user.app_metadata?.provider === 'google' ? 'google' : 'email';

        const updatedSession: UserSession = {
          id: user.id,
          email,
          name,
          avatar,
          isAdmin: isAdminEmail(email),
          provider,
        };
        saveSession(updatedSession);
        setSession(updatedSession);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (activeCategory === 'new_arrivals') {
          if (!p.is_new_arrival) return false;
        } else if (activeCategory !== 'all' && p.category !== activeCategory) {
          return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchMaterial = p.material.toLowerCase().includes(q);
          const matchCategory = p.category.toLowerCase().includes(q);
          return matchName || matchDesc || matchMaterial || matchCategory;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        // 'featured'
        if (a.is_new_arrival && !b.is_new_arrival) return -1;
        if (!a.is_new_arrival && b.is_new_arrival) return 1;
        return 0;
      });
  }, [products, activeCategory, searchQuery, sortBy]);

  const handleOrderSuccess = (newOrder: Order) => {
    console.log('Order registered successfully:', newOrder.id);
  };

  const handleLoginSuccess = (newSession: UserSession) => {
    saveSession(newSession);
    setSession(newSession);

    if (newSession.isAdmin) {
      setCurrentView('admin');
    }
  };

  const handleSignOut = () => {
    clearSession();
    setSession(null);
    setCurrentView('shop');
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    addRecentlyViewed(product.id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#111111] relative">
      {/* Navigation Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onOpenAuth={() => {
          if (session) {
            setIsProfileModalOpen(true);
          } else {
            setIsAuthModalOpen(true);
          }
        }}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        isAdminLoggedIn={Boolean(session?.isAdmin)}
        currentUserEmail={session ? session.email : null}
        currentUserSession={session}
      />

      {/* Main Content Router: Shop vs Admin */}
      {currentView === 'admin' ? (
        <AdminDashboard
          onBackToShop={() => setCurrentView('shop')}
          isAdminLoggedIn={Boolean(session?.isAdmin)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onAdminLogout={handleSignOut}
          adminEmail={session?.email || 'savyzeus101@gmail.com'}
          onProductsUpdated={loadProducts}
          onAdminLoginSuccess={handleLoginSuccess}
        />
      ) : (
        <main className="flex-1">
          {/* Hero Section */}
          <Hero
            onShopNow={() => {
              const el = document.getElementById('catalog-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* New Arrivals Horizontal Carousel */}
          <NewArrivalsCarousel
            products={products}
            onSelectProduct={handleSelectProduct}
          />

          {/* Main Boutique Catalog */}
          <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="text-center mb-8">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#737373] font-semibold block mb-1">
                Curated Luxury
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#111111]">
                {activeCategory === 'all'
                  ? 'The Entire Collection'
                  : activeCategory === 'new_arrivals'
                  ? 'Exclusive New Arrivals'
                  : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Gallery`}
              </h2>
              <div className="w-12 h-px bg-[#111111] mx-auto mt-4" />
            </div>

            {/* Filter and Search Bar */}
            <CategoryFilter
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            {/* Products Grid */}
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <div className="w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs uppercase tracking-widest text-[#737373]">
                  Loading Boutique Collection...
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-20 text-center bg-white border border-[#E5E5E5] p-8 space-y-3">
                <p className="font-serif text-lg text-[#111111]">No luxury pieces match your selection.</p>
                <p className="text-xs text-[#737373]">Try adjusting your search keywords or switching category filters.</p>
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchQuery('');
                  }}
                  className="mt-2 px-4 py-2 bg-[#111111] text-[#FAFAFA] text-xs uppercase tracking-wider font-medium hover:bg-black transition-colors"
                >
                  View All Pieces
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onOpenDetails={handleSelectProduct}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Boutique Brand Story / Atelier Craftsmanship */}
          <section className="bg-white border-t border-[#E5E5E5] py-16">
            <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#C5A059] font-bold block">
                Atelier Philosophy
              </span>
              <h2 className="text-3xl font-serif text-[#111111] font-light">
                Uncompromising Nigerian Craftsmanship & Timeless Elegance
              </h2>
              <p className="text-xs sm:text-sm text-[#737373] leading-relaxed max-w-2xl mx-auto">
                Every piece in Tifeh.s Place is personally inspected and selected to embody subtle prestige.
                From hand-buffed calfskin shoes to meticulously sculpted jewelry and bespoke horology, we deliver
                exceptional luxury directly across Nigeria and internationally.
              </p>
            </div>
          </section>
        </main>
      )}

      {/* Footer */}
      <Footer
        onCategorySelect={(cat) => {
          setCurrentView('shop');
          setActiveCategory(cat);
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={closeCheckout}
        onOrderSuccess={handleOrderSuccess}
        currentUserSession={session}
      />

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Unified Customer & Admin Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        session={session}
        onSignOut={handleSignOut}
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        allProducts={products}
        onSelectProduct={handleSelectProduct}
        onSessionUpdate={(updated) => setSession(updated)}
      />

      {/* Dynamic Floating WhatsApp Concierge Button */}
      <a
        id="floating-whatsapp-btn"
        href={`https://wa.me/${getBoutiqueWhatsAppNumber()}?text=${encodeURIComponent(
          "Hello Tifeh's Place! I would like to inquire about your luxury collection."
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-40 p-3.5 bg-[#25D366] text-white rounded-full shadow-xl hover:scale-105 transition-all flex items-center gap-2 group cursor-pointer"
        title={`Chat with Tifeh's Place on WhatsApp (+${getBoutiqueWhatsAppNumber()})`}
      >
        <MessageCircle size={22} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-xs uppercase tracking-wider font-semibold whitespace-nowrap">
          WhatsApp Concierge
        </span>
      </a>

      {/* Tiny Animated Particle flying to the Header Cart when added to bag */}
      <AnimatePresence>
        {flyingParticle && (
          <motion.div
            key={flyingParticle.id}
            initial={{
              position: 'fixed',
              bottom: '60px',
              left: '50%',
              x: '-50%',
              scale: 1.2,
              opacity: 1,
              zIndex: 9999,
            }}
            animate={{
              bottom: 'calc(100vh - 45px)',
              left: 'calc(100vw - 42px)',
              x: 0,
              scale: 0.25,
              opacity: [1, 1, 0.9, 0],
            }}
            transition={{
              duration: 0.65,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="pointer-events-none"
          >
            <div className="w-8 h-8 rounded-full bg-[#111111] text-[#C5A059] border-2 border-[#C5A059] shadow-2xl flex items-center justify-center ring-4 ring-[#C5A059]/30">
              <ShoppingBag size={14} className="text-[#C5A059]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Added to Bag Toast Notification with View Bag option */}
      {lastAddedItem && (
        <div className="fixed bottom-5 left-5 z-50 bg-[#111111] text-[#FAFAFA] border border-[#333333] shadow-2xl p-3.5 max-w-sm flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#C5A059] shrink-0" />
            <div className="text-xs">
              <span className="font-semibold block">{lastAddedItem.product.name}</span>
              <span className="text-[10px] text-[#A3A3A3]">
                {lastAddedItem.size} • {lastAddedItem.color} • {formatNaira(lastAddedItem.product.price)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                dismissToast();
                openCart();
              }}
              className="text-[10px] uppercase tracking-wider px-2.5 py-1 bg-[#C5A059] text-[#111111] font-semibold hover:bg-[#D8B46E] transition-colors cursor-pointer"
            >
              View Bag
            </button>
            <button
              onClick={dismissToast}
              className="text-[10px] uppercase tracking-wider px-2 py-1 bg-[#262626] hover:bg-[#333333] text-[#A3A3A3] hover:text-white cursor-pointer"
              title="Close notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <ShopContent />
    </CartProvider>
  );
}

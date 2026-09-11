import { createClient } from '@supabase/supabase-js';
import { Product, Order } from '../types';
import { INITIAL_PRODUCTS } from '../data/seedProducts';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://'));

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local persistence fallback keys
const PRODUCTS_STORAGE_KEY = 'tifahs_place_products_v2';
const ORDERS_STORAGE_KEY = 'tifahs_place_orders_v1';

// Helper to ensure shoe sizes have EUR prefix
function normalizeProduct(p: Product): Product {
  if (p.category === 'shoes' && Array.isArray(p.sizes)) {
    return {
      ...p,
      sizes: p.sizes.map((s) => (s.startsWith('EUR') ? s : `EUR ${s}`)),
    };
  }
  return p;
}

// Initialize local cache with seed data if not present
function initializeLocalStorage() {
  if (typeof window === 'undefined') return;
  const existing = localStorage.getItem(PRODUCTS_STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
  }
}

initializeLocalStorage();

export const productService = {
  async getAll(): Promise<Product[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return (data as Product[]).map(normalizeProduct);
        }
      } catch (e) {
        console.warn('Supabase fetch failed, falling back to local store:', e);
      }
    }

    // Local fallback
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Product[];
          return parsed.map(normalizeProduct);
        } catch {
          return INITIAL_PRODUCTS;
        }
      }
    }
    return INITIAL_PRODUCTS;
  },

  async getById(id: string): Promise<Product | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        if (!error && data) return data as Product;
      } catch (e) {
        console.warn('Supabase getById error:', e);
      }
    }

    const all = await this.getAll();
    return all.find((p) => p.id === id) || null;
  },

  async create(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: 'prod-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .insert([newProduct])
          .select()
          .single();
        if (!error && data) return data as Product;
      } catch (e) {
        console.warn('Supabase insert failed, storing locally:', e);
      }
    }

    // Local update
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      const list: Product[] = stored ? JSON.parse(stored) : [...INITIAL_PRODUCTS];
      list.unshift(newProduct);
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(list));
    }
    return newProduct;
  },

  async delete(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) {
          // also delete from local
        }
      } catch (e) {
        console.warn('Supabase delete error:', e);
      }
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (stored) {
        const list: Product[] = JSON.parse(stored);
        const filtered = list.filter((p) => p.id !== id);
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(filtered));
      }
    }
    return true;
  },

  resetToSeed(): Product[] {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    }
    return INITIAL_PRODUCTS;
  }
};

export const orderService = {
  async getAll(): Promise<Order[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return data as Order[];
      } catch (e) {
        console.warn('Supabase orders fetch error:', e);
      }
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return [];
        }
      }
    }
    return [];
  },

  async create(orderData: Omit<Order, 'id' | 'created_at' | 'status'>): Promise<Order> {
    const orderId = 'TP-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      status: 'pending_payment',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .insert([newOrder])
          .select()
          .single();
        if (!error && data) return data as Order;
      } catch (e) {
        console.warn('Supabase createOrder error, storing locally:', e);
      }
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
      const list: Order[] = stored ? JSON.parse(stored) : [];
      list.unshift(newOrder);
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(list));
    }
    return newOrder;
  }
};

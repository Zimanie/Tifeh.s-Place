import React, { useState } from 'react';
import { X, Copy, Check, Code2, Database, Terminal, FileText, Layers } from 'lucide-react';

interface NextJsExportGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NextJsExportGuide: React.FC<NextJsExportGuideProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<
    'files' | 'supabase_js' | 'product_page' | 'admin_page' | 'globals_css' | 'sql' | 'setup'
  >('files');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (text: string, tabId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabId);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const fileTreeText = `tifehs-place/
├── app/
│   ├── layout.js                     # Root layout with fonts, metadata, CartProvider
│   ├── page.js                       # Home page (Hero, New Arrivals, Category Tabs, Product Grid)
│   ├── globals.css                   # Ultra-minimalist Vanilla CSS styling
│   ├── products/
│   │   └── [id]/
│   │       └── page.js               # Dynamic product details page
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.js               # Admin authentication screen
│   │   └── dashboard/
│   │       └── page.js               # Admin Console (Add/Delete products, View Orders)
│   ├── login/
│   │   └── page.js                   # Customer Login
│   └── signup/
│       └── page.js                   # Customer Registration
├── components/
│   ├── Header.jsx                    # Navigation, Logo, Cart badge
│   ├── Hero.jsx                      # Luxury editorial hero banner
│   ├── NewArrivals.jsx               # Horizontal carousel of recent arrivals
│   ├── CategoryFilter.jsx            # Category tabs & search
│   ├── ProductCard.jsx               # Minimalist product card
│   ├── CartDrawer.jsx                # Slide-out shopping bag drawer
│   └── CheckoutModal.jsx             # Checkout form with WhatsApp & Bank details
├── context/
│   └── CartContext.jsx               # Shopping bag context
├── lib/
│   ├── supabase.js                   # Supabase client configuration
│   └── format.js                     # Naira currency (₦) and date helpers
├── supabase-schema.sql               # Supabase database script & 20 initial items
├── .env.local                        # Local Supabase credentials
├── package.json
└── README.md`;

  const supabaseJsCode = `// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Set them in .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper for server-side fetches
export async function getProducts(category = 'all') {
  let query = supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function createOrder(orderPayload) {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderPayload])
    .select()
    .single();

  if (error) throw error;
  return data;
}`;

  const productPageCode = `// app/products/[id]/page.js
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { formatNaira } from '@/lib/format';

export default function ProductDetailPage({ params }) {
  const { id } = params;
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }
      setProduct(data);
      setSelectedSize(data.sizes?.[0] || 'Standard');
      setSelectedColor(data.colors?.[0] || 'Default');
      setLoading(false);
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xs uppercase tracking-widest text-[#737373]">Loading luxury silhouette...</p>
      </div>
    );
  }

  if (!product) return notFound();

  const handleAdd = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Link href="/" className="text-xs uppercase tracking-widest text-[#737373] hover:text-black mb-8 inline-block">
        ← Back to Collection
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Optimized Image */}
        <div className="relative aspect-4/5 bg-[#F5F5F5] border border-[#E5E5E5] overflow-hidden">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Specifications */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#737373]">
              Category: {product.category}
            </span>
            <h1 className="text-3xl font-serif text-[#111111]">{product.name}</h1>
            <div className="text-2xl font-semibold text-[#111111]">
              {formatNaira(product.price)}
            </div>

            <div className="p-3 bg-[#F0F0F0] border-l-2 border-[#111111] text-xs">
              <span className="font-semibold block uppercase text-[10px]">Material Details:</span>
              <p className="text-[#525252] mt-0.5">{product.material}</p>
            </div>

            <p className="text-xs text-[#525252] leading-relaxed">{product.description}</p>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div>
                <span className="text-xs uppercase tracking-wider block mb-2 font-medium">Color</span>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={\`px-3 py-1.5 text-xs border \${
                        selectedColor === c ? 'border-[#111111] bg-[#111111] text-white' : 'border-[#E5E5E5] bg-white'
                      }\`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div>
                <span className="text-xs uppercase tracking-wider block mb-2 font-medium">Size</span>
                <div className="flex gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={\`px-3.5 py-1.5 text-xs border \${
                        selectedSize === s ? 'border-[#111111] bg-[#111111] text-white' : 'border-[#E5E5E5] bg-white'
                      }\`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleAdd}
            className="w-full py-4 bg-[#111111] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-black"
          >
            {added ? 'Added To Bag' : \`Add To Bag • \${formatNaira(product.price * quantity)}\`}
          </button>
        </div>
      </div>
    </div>
  );
}`;

  const adminDashboardCode = `// app/admin/dashboard/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatNaira } from '@/lib/format';

export default function AdminDashboardPage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('shoes');
  const [price, setPrice] = useState('');
  const [material, setMaterial] = useState('');
  const [sizes, setSizes] = useState('40, 41, 42, 43');
  const [colors, setColors] = useState('Black, Brown');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isNewArrival, setIsNewArrival] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    const { data: prods } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    const { data: ords } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setProducts(prods || []);
    setOrders(ords || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const parsedSizes = sizes.split(',').map((s) => s.trim()).filter(Boolean);
    const parsedColors = colors.split(',').map((c) => c.trim()).filter(Boolean);

    const { data, error } = await supabase.from('products').insert([
      {
        name,
        category,
        price: parseFloat(price),
        material,
        sizes: parsedSizes,
        colors: parsedColors,
        image_url: imageUrl,
        description,
        is_new_arrival: isNewArrival,
      },
    ]).select();

    if (!error && data) {
      setProducts([data[0], ...products]);
      setName('');
      setPrice('');
      setMaterial('');
      setImageUrl('');
      setDescription('');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      <h1 className="text-3xl font-serif">Tifeh's Place Admin Console</h1>

      {/* Add Product Form */}
      <div className="bg-white p-6 border border-[#E5E5E5]">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4">Add New Luxury Product</h2>
        <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <input required placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} className="p-2 border" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 border">
            <option value="shoes">Shoes</option>
            <option value="bags">Bags</option>
            <option value="jewelry">Jewelry</option>
            <option value="watches">Watches</option>
            <option value="perfumes">Perfumes</option>
          </select>
          <input required type="number" placeholder="Price (NGN)" value={price} onChange={(e) => setPrice(e.target.value)} className="p-2 border" />
          <input required placeholder="Material / Craft" value={material} onChange={(e) => setMaterial(e.target.value)} className="p-2 border" />
          <input placeholder="Sizes (comma separated)" value={sizes} onChange={(e) => setSizes(e.target.value)} className="p-2 border" />
          <input placeholder="Colors (comma separated)" value={colors} onChange={(e) => setColors(e.target.value)} className="p-2 border" />
          <input required placeholder="Image URL (Supabase Storage / CDN)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="p-2 border col-span-2" />
          <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="p-2 border col-span-2" rows={2} />
          <label className="flex items-center gap-2 col-span-2">
            <input type="checkbox" checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} />
            <span>Mark as New Arrival Capsule Item</span>
          </label>
          <button type="submit" className="col-span-2 py-3 bg-[#111111] text-white uppercase tracking-widest text-xs">
            Publish Product
          </button>
        </form>
      </div>

      {/* Product List */}
      <div className="bg-white p-6 border border-[#E5E5E5]">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4">Product Catalog ({products.length})</h2>
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Name</th>
              <th className="py-2">Category</th>
              <th className="py-2">Price</th>
              <th className="py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="py-2">{p.name}</td>
                <td className="py-2 uppercase">{p.category}</td>
                <td className="py-2">{formatNaira(p.price)}</td>
                <td className="py-2 text-right">
                  <button onClick={() => handleDeleteProduct(p.id)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Orders Viewer */}
      <div className="bg-white p-6 border border-[#E5E5E5]">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4">Customer Orders ({orders.length})</h2>
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Order ID</th>
              <th className="py-2">Customer</th>
              <th className="py-2">Phone / WhatsApp</th>
              <th className="py-2">Total Amount</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b">
                <td className="py-2 font-mono">{o.id}</td>
                <td className="py-2">{o.customer_name}</td>
                <td className="py-2">{o.customer_phone}</td>
                <td className="py-2 font-bold">{formatNaira(o.total_amount)}</td>
                <td className="py-2 uppercase">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}`;

  const globalsCssCode = `/* app/globals.css - Minimalist Luxury Vanilla CSS */
:root {
  --bg-primary: #FAFAFA;
  --text-primary: #111111;
  --text-muted: #737373;
  --border-light: #E5E5E5;
  --accent-gold: #C5A059;
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  letter-spacing: -0.01em;
  overflow-x: hidden;
}

h1, h2, h3, h4, .font-serif {
  font-family: var(--font-serif);
  font-weight: 400;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  cursor: pointer;
  font-family: inherit;
}

/* Subtle luxury card transition */
.product-card {
  border: 1px solid var(--border-light);
  background: #FAFAFA;
  transition: border-color 0.3s ease;
}

.product-card:hover {
  border-color: var(--text-primary);
}

.product-img {
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.product-card:hover .product-img {
  transform: scale(1.03);
}

/* Minimalist Scrollbar */
::-webkit-scrollbar {
  width: 5px;
}
::-webkit-scrollbar-track {
  background: var(--bg-primary);
}
::-webkit-scrollbar-thumb {
  background: #D4D4D4;
}
::-webkit-scrollbar-thumb:hover {
  background: #A3A3A3;
}`;

  const setupGuideText = `# Complete Step-by-Step Setup Guide

### Step 1: Clone or Copy the Repository
Place the files into your project folder.

### Step 2: Set up Supabase
1. Create a free account at https://supabase.com and start a new project.
2. Under "SQL Editor", paste the entire contents of "supabase-schema.sql" and click RUN.
3. This creates:
   - "products" table
   - "orders" table
   - "product-images" storage bucket
   - RLS policies
   - All 20 seeded luxury products (5 shoes, 5 bags, 5 jewelry, 5 watches, 5 perfumes).
4. Go to Project Settings -> API to copy your:
   - Project URL
   - Anon public key

### Step 3: Configure Environment Variables
Create a file named \`.env.local\` in the project root:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_ADMIN_GMAIL=tifehsplace@gmail.com
NEXT_PUBLIC_WHATSAPP_NUMBER=2348120000000
\`\`\`

### Step 4: Install Dependencies & Run
\`\`\`bash
npm install
npm run dev
\`\`\`
The application will boot at http://localhost:3000.

### Step 5: Test Features
- Browse Homepage: Hero, New Arrivals Carousel, Category filters.
- Open any product to test Size and Color selection.
- Add items to Cart Drawer and click "Proceed to Checkout".
- Place an order to test:
  1. Database record creation in "orders" table.
  2. Local GTBank transfer instructions.
  3. Pre-filled WhatsApp direct confirmation link.
- Visit /admin/login (email: admin@tifehsplace.ng) to manage products and view orders!`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#FAFAFA] border border-[#E5E5E5] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E5E5E5] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#111111] text-[#FAFAFA] rounded-xs">
              <Code2 size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wider uppercase text-[#111111]">
                Next.js App Router & Supabase Implementation Suite
              </h2>
              <span className="text-[10px] text-[#737373] tracking-wide">
                Production-ready code snippets, database schemas, and setup instructions
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#737373] hover:text-[#111111] rounded-full hover:bg-[#F0F0F0]"
            aria-label="Close export guide"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto no-scrollbar border-b border-[#E5E5E5] bg-[#F5F5F5] px-4">
          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-3 text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-all border-b-2 -mb-[2px] ${
              activeTab === 'files'
                ? 'border-[#111111] text-[#111111] bg-white'
                : 'border-transparent text-[#737373] hover:text-[#111111]'
            }`}
          >
            File Structure
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-3 text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-all border-b-2 -mb-[2px] flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-[#111111] text-[#111111] bg-white'
                : 'border-transparent text-[#737373] hover:text-[#111111]'
            }`}
          >
            <Database size={13} className="text-[#C5A059]" />
            <span>Supabase SQL Script</span>
          </button>
          <button
            onClick={() => setActiveTab('supabase_js')}
            className={`px-4 py-3 text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-all border-b-2 -mb-[2px] ${
              activeTab === 'supabase_js'
                ? 'border-[#111111] text-[#111111] bg-white'
                : 'border-transparent text-[#737373] hover:text-[#111111]'
            }`}
          >
            lib/supabase.js
          </button>
          <button
            onClick={() => setActiveTab('product_page')}
            className={`px-4 py-3 text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-all border-b-2 -mb-[2px] ${
              activeTab === 'product_page'
                ? 'border-[#111111] text-[#111111] bg-white'
                : 'border-transparent text-[#737373] hover:text-[#111111]'
            }`}
          >
            products/[id]/page.js
          </button>
          <button
            onClick={() => setActiveTab('admin_page')}
            className={`px-4 py-3 text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-all border-b-2 -mb-[2px] ${
              activeTab === 'admin_page'
                ? 'border-[#111111] text-[#111111] bg-white'
                : 'border-transparent text-[#737373] hover:text-[#111111]'
            }`}
          >
            admin/dashboard/page.js
          </button>
          <button
            onClick={() => setActiveTab('globals_css')}
            className={`px-4 py-3 text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-all border-b-2 -mb-[2px] ${
              activeTab === 'globals_css'
                ? 'border-[#111111] text-[#111111] bg-white'
                : 'border-transparent text-[#737373] hover:text-[#111111]'
            }`}
          >
            app/globals.css
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-4 py-3 text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-all border-b-2 -mb-[2px] ${
              activeTab === 'setup'
                ? 'border-[#111111] text-[#111111] bg-white'
                : 'border-transparent text-[#737373] hover:text-[#111111]'
            }`}
          >
            Setup Guide (.env.local)
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#1E1E1E] text-[#E0E0E0] font-mono text-xs relative">
          {/* File Structure */}
          {activeTab === 'files' && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[#A3A3A3] text-[11px]">Recommended Next.js 14/15 App Router Structure:</span>
                <button
                  onClick={() => copyCode(fileTreeText, 'files')}
                  className="px-2.5 py-1 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-[#FAFAFA] text-[10px] uppercase flex items-center gap-1.5 rounded-xs"
                >
                  {copiedTab === 'files' ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  <span>{copiedTab === 'files' ? 'Copied' : 'Copy Tree'}</span>
                </button>
              </div>
              <pre className="overflow-x-auto leading-relaxed text-[#D4D4D4]">{fileTreeText}</pre>
            </div>
          )}

          {/* Supabase SQL */}
          {activeTab === 'sql' && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[#C5A059] text-[11px] font-sans font-medium">
                  supabase-schema.sql (Tables, RLS policies, Storage bucket, and 20 Seed Products)
                </span>
                <button
                  onClick={() => {
                    // copy the SQL content from the schema file
                    fetch('/supabase-schema.sql')
                      .then((r) => r.text())
                      .then((txt) => copyCode(txt, 'sql'))
                      .catch(() => copyCode('-- Check supabase-schema.sql in root directory', 'sql'));
                  }}
                  className="px-2.5 py-1 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-[#FAFAFA] text-[10px] uppercase flex items-center gap-1.5 rounded-xs"
                >
                  {copiedTab === 'sql' ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  <span>{copiedTab === 'sql' ? 'Copied' : 'Copy Entire SQL'}</span>
                </button>
              </div>
              <p className="text-[11px] font-sans text-[#A3A3A3] mb-3">
                The full SQL script is stored in <code className="text-white">/supabase-schema.sql</code> at the project root. You can paste it directly into your Supabase SQL Editor.
              </p>
              <pre className="overflow-x-auto leading-relaxed text-[#9CDCFE]">
                {`-- Run in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('shoes', 'bags', 'jewelry', 'watches', 'perfumes')),
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    material TEXT NOT NULL,
    sizes TEXT[] NOT NULL DEFAULT '{}',
    colors TEXT[] NOT NULL DEFAULT '{}',
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    is_new_arrival BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_whatsapp TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_payment',
    payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- + Row Level Security, Indexes, and 20 Seed Items (See /supabase-schema.sql)`}
              </pre>
            </div>
          )}

          {/* lib/supabase.js */}
          {activeTab === 'supabase_js' && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[#A3A3A3] text-[11px]">lib/supabase.js:</span>
                <button
                  onClick={() => copyCode(supabaseJsCode, 'supabase_js')}
                  className="px-2.5 py-1 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-[#FAFAFA] text-[10px] uppercase flex items-center gap-1.5 rounded-xs"
                >
                  {copiedTab === 'supabase_js' ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  <span>{copiedTab === 'supabase_js' ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="overflow-x-auto leading-relaxed text-[#CE9178]">{supabaseJsCode}</pre>
            </div>
          )}

          {/* Product Page */}
          {activeTab === 'product_page' && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[#A3A3A3] text-[11px]">app/products/[id]/page.js:</span>
                <button
                  onClick={() => copyCode(productPageCode, 'product_page')}
                  className="px-2.5 py-1 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-[#FAFAFA] text-[10px] uppercase flex items-center gap-1.5 rounded-xs"
                >
                  {copiedTab === 'product_page' ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  <span>{copiedTab === 'product_page' ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="overflow-x-auto leading-relaxed text-[#DCDCAA]">{productPageCode}</pre>
            </div>
          )}

          {/* Admin Page */}
          {activeTab === 'admin_page' && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[#A3A3A3] text-[11px]">app/admin/dashboard/page.js:</span>
                <button
                  onClick={() => copyCode(adminDashboardCode, 'admin_page')}
                  className="px-2.5 py-1 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-[#FAFAFA] text-[10px] uppercase flex items-center gap-1.5 rounded-xs"
                >
                  {copiedTab === 'admin_page' ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  <span>{copiedTab === 'admin_page' ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="overflow-x-auto leading-relaxed text-[#4EC9B0]">{adminDashboardCode}</pre>
            </div>
          )}

          {/* globals.css */}
          {activeTab === 'globals_css' && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[#A3A3A3] text-[11px]">app/globals.css (Vanilla CSS):</span>
                <button
                  onClick={() => copyCode(globalsCssCode, 'globals_css')}
                  className="px-2.5 py-1 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-[#FAFAFA] text-[10px] uppercase flex items-center gap-1.5 rounded-xs"
                >
                  {copiedTab === 'globals_css' ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  <span>{copiedTab === 'globals_css' ? 'Copied' : 'Copy CSS'}</span>
                </button>
              </div>
              <pre className="overflow-x-auto leading-relaxed text-[#C586C0]">{globalsCssCode}</pre>
            </div>
          )}

          {/* Setup Guide */}
          {activeTab === 'setup' && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[#A3A3A3] text-[11px]">Local Setup & Deployment Instructions:</span>
                <button
                  onClick={() => copyCode(setupGuideText, 'setup')}
                  className="px-2.5 py-1 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-[#FAFAFA] text-[10px] uppercase flex items-center gap-1.5 rounded-xs"
                >
                  {copiedTab === 'setup' ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  <span>{copiedTab === 'setup' ? 'Copied' : 'Copy Guide'}</span>
                </button>
              </div>
              <pre className="overflow-x-auto leading-relaxed text-[#9CDCFE] whitespace-pre-wrap">{setupGuideText}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

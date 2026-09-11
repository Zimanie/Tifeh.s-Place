# Tifeh's Place (Lagos, Nigeria) - Minimalist Luxury E-Commerce

A clean, fast, and minimal e-commerce website for **Tifeh's Place**, a Nigerian luxury boutique catering to high-end footwear, leather bags, fine jewelry, timepieces, and niche perfumes in Nigerian Naira (NGN - ₦).

---

## 🎨 Design & Aesthetic Overview
- **Aesthetic**: Minimalist luxury (rich dark charcoal/black `#111111`, warm off-white canvas `#FAFAFA`, crisp border accents `#E5E5E5`, and gold accent `#C5A059`).
- **Typography**: Editorial serif (*Cormorant Garamond*) paired with geometric modern sans-serif (*Plus Jakarta Sans*).
- **Target Market**: Nigeria with all prices formatted in Naira (e.g. `₦78,500`).
- **Payment & Checkout**: Direct Nigerian Bank Transfer (GTBank / Zenith) + Cash/POS on delivery with automated WhatsApp direct order confirmation links and email alerts.

---

## 📁 Next.js App Router Project File Structure

```text
tifehs-place/
├── app/
│   ├── layout.js                     # Root layout (fonts, metadata, CartProvider)
│   ├── page.js                       # Home page (Hero, New Arrivals, Category Tabs, Product Grid)
│   ├── globals.css                   # Ultra-minimalist Vanilla CSS styling
│   ├── products/
│   │   └── [id]/
│   │       └── page.js               # Dynamic product details page (Server Component + Client selections)
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.js               # Admin authentication screen
│   │   └── dashboard/
│   │       └── page.js               # Protected Admin Console (Add/Delete products, View Orders)
│   ├── login/
│   │   └── page.js                   # Customer Sign-in
│   ├── signup/
│   │   └── page.js                   # Customer Registration
│   └── api/
│       ├── checkout/
│       │   └── route.js              # Order submission endpoint & email notification dispatcher
│       └── products/
│           └── route.js              # Products API handler
├── components/
│   ├── Header.jsx                    # Navigation, Logo, Cart badge, and Admin links
│   ├── Hero.jsx                      # Non-intrusive luxury editorial hero banner
│   ├── NewArrivals.jsx               # Horizontal carousel of recent arrivals
│   ├── CategoryFilter.jsx            # Category tabs (Shoes, Bags, Jewelry, Watches, Perfumes)
│   ├── ProductCard.jsx               # Minimalist product card with quick-bag button
│   ├── CartDrawer.jsx                # Slide-out shopping bag drawer
│   └── CheckoutModal.jsx             # Nigerian checkout form with Bank Transfer details & WhatsApp link
├── context/
│   └── CartContext.jsx               # Shopping bag state management with localStorage sync
├── lib/
│   ├── supabase.js                   # Supabase client configuration (Browser & Server)
│   └── format.js                     # Naira currency (₦) and date formatting helpers
├── public/
│   └── assets/                       # Static brand assets
├── supabase-schema.sql               # Supabase tables, RLS policies, storage bucket, and 20 seed items
├── .env.local                        # Local Supabase credentials
├── package.json
└── README.md
```

---

## ⚡ Quick Start & Local Setup

### 1. Prerequisites
- Node.js 18.17+ or 20+
- A Supabase project account (free at [supabase.com](https://supabase.com))

### 2. Environment Variables (`.env.local`)
Create a `.env.local` file in your root folder:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here

# Boutique Details
NEXT_PUBLIC_ADMIN_GMAIL=tifehsplace@gmail.com
NEXT_PUBLIC_WHATSAPP_NUMBER=2348120000000
NEXT_PUBLIC_BANK_NAME="Guaranty Trust Bank (GTBank)"
NEXT_PUBLIC_BANK_ACCOUNT_NO="0284918274"
NEXT_PUBLIC_BANK_ACCOUNT_NAME="Tifeh's Place Enterprises"
```

### 3. Database & Supabase Setup
1. Go to your Supabase Dashboard -> **SQL Editor**.
2. Copy and paste the entire contents of `supabase-schema.sql`.
3. Run the query. This sets up:
   - `products` table with category constraints and indices.
   - `orders` table with customer contact and JSONB items.
   - Storage bucket `product-images` for catalog uploads.
   - Row Level Security (RLS) policies.
   - **20 Seeded Luxury Products** (5 Shoes, 5 Bags, 5 Jewelry, 5 Watches, 5 Perfumes) with high-resolution imagery and authentic Nigerian Naira prices.

### 4. Run Locally
```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Production Build & Verification
```bash
# Build the production bundle
npm run build

# Run production server on port 3000
npm run start
```

---

## 🔒 Authentication & Role Protection
- **/admin/login**: Admin access portal redirecting to `/admin/dashboard`.
- **/admin/dashboard**: Allows instant catalog addition, real-time product deletion, and viewing incoming customer orders with one-click direct WhatsApp links.
- **/login & /signup**: Allows customers to save shipping addresses and access order records.

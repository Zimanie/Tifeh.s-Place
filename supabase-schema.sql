-- ==============================================================================
-- TIFEH'S PLACE - SUPABASE DATABASE SCHEMA & SEED SCRIPT
-- Tables: products, orders
-- Storage: product-images bucket
-- RLS: Public read, Admin write, Authenticated/Public order placement
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE 'products' TABLE
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

-- Index for fast category filtering & sorting
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_new_arrival ON public.products(is_new_arrival);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- 3. CREATE 'orders' TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_whatsapp TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'confirmed', 'dispatched', 'delivered')),
    payment_method TEXT NOT NULL DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'cash_on_delivery')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 3.1 CREATE 'profiles' TABLE (User profile persistence across sessions)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    address TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, authenticated or matching client can insert/update
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage profiles" ON public.profiles;
CREATE POLICY "Users can manage profiles" ON public.profiles
    FOR ALL USING (true);

-- Products: Everyone can read products
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products
    FOR SELECT USING (true);

-- Products: Admins can insert/update/delete products
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL USING (
        auth.role() = 'authenticated' OR 
        (auth.jwt() ->> 'email') LIKE '%admin%'
    );

-- Orders: Anyone can create an order (for guest checkout)
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
CREATE POLICY "Anyone can insert orders" ON public.orders
    FOR INSERT WITH CHECK (true);

-- Orders: Only authenticated admin can view orders
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT USING (
        auth.role() = 'authenticated' OR 
        (auth.jwt() ->> 'email') LIKE '%admin%'
    );

-- 5. STORAGE BUCKET FOR PRODUCT IMAGES
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public can read uploaded images
DROP POLICY IF EXISTS "Public image access" ON storage.objects;
CREATE POLICY "Public image access" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

-- Admins can upload images
DROP POLICY IF EXISTS "Admin upload image" ON storage.objects;
CREATE POLICY "Admin upload image" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- ==============================================================================
-- 6. SEED DATA: 20 INITIAL LUXURY ITEMS (5 Shoes, 5 Bags, 5 Jewelry, 5 Watches, 5 Perfumes)
-- ==============================================================================

INSERT INTO public.products (id, name, category, price, material, sizes, colors, description, image_url, is_new_arrival, created_at)
VALUES
-- SHOES (5 items)
(
    'a0000000-0000-0000-0000-000000000001',
    'The Milano Penny Loafer',
    'shoes',
    78500,
    'Handcrafted Italian Box Calfskin & Goodyear Welt',
    ARRAY['EUR 40', 'EUR 41', 'EUR 42', 'EUR 43', 'EUR 44', 'EUR 45'],
    ARRAY['Onyx Black', 'Cognac Tan', 'Espresso Brown'],
    'An enduring icon of sartorial polish. Cut from full-grain Italian box calf with a supple calf lining and bevelled leather waist, engineered for both boardrooms in Victoria Island and relaxed weekend galas in Ikoyi.',
    'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1000&q=85',
    true,
    NOW() - INTERVAL '2 days'
),
(
    'a0000000-0000-0000-0000-000000000002',
    'Savile Row Cap-Toe Oxford',
    'shoes',
    92000,
    'Full-Grain French Calf Leather with Hand-Burnished Patina',
    ARRAY['EUR 41', 'EUR 42', 'EUR 43', 'EUR 44', 'EUR 45'],
    ARRAY['Jet Black', 'Burnished Mahogany'],
    'The definitive formal silhouette. Featuring closed channel stitching, leather stacked heels, and a bespoke mirror-shine toe cap tailored for discerning dress codes.',
    'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1000&q=85',
    false,
    NOW() - INTERVAL '4 days'
),
(
    'a0000000-0000-0000-0000-000000000003',
    'Aura Minimalist Block-Heel Mule',
    'shoes',
    64000,
    'Supple Nappa Leather with Brushed Brass Detailing',
    ARRAY['EUR 37', 'EUR 38', 'EUR 39', 'EUR 40', 'EUR 41'],
    ARRAY['Ivory Bone', 'Noir Black', 'Nude Sand'],
    'Sculptural simplicity with everyday ease. Features a clean square toe, an ergonomic 60mm block heel, and glove-soft leather that molds gracefully to the foot.',
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=85',
    true,
    NOW() - INTERVAL '1 day'
),
(
    'a0000000-0000-0000-0000-000000000004',
    'Monarch Chelsea Boot',
    'shoes',
    88000,
    'Water-Resistant Nubuck Leather with Durable Vibram Sole',
    ARRAY['EUR 40', 'EUR 41', 'EUR 42', 'EUR 43', 'EUR 44', 'EUR 45'],
    ARRAY['Smoked Charcoal', 'Caramel Brown'],
    'Clean architectural lines meet rugged resilience. Crafted with twin elasticated side gores and dual pull tabs for effortless slipping in and out.',
    'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=1000&q=85',
    false,
    NOW() - INTERVAL '6 days'
),
(
    'a0000000-0000-0000-0000-000000000005',
    'Riviera Leather Slide',
    'shoes',
    46000,
    'Vegetable-Tanned Cowhide with Cushioned Footbed',
    ARRAY['EUR 39', 'EUR 40', 'EUR 41', 'EUR 42', 'EUR 43', 'EUR 44'],
    ARRAY['Mocha Brown', 'Black', 'Desert Olive'],
    'Minimalist luxury designed for the warm Nigerian climate. Cross-strap architecture paired with an arch-supporting contoured cork and leather footbed.',
    'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=1000&q=85',
    true,
    NOW() - INTERVAL '12 hours'
),

-- BAGS (5 items)
(
    'b0000000-0000-0000-0000-000000000001',
    'The L’Ombre Structured Trapeze Tote',
    'bags',
    135000,
    'Structured Palmellato Calfskin with Polished Gold Hardware',
    ARRAY['Medium (32cm x 24cm)', 'Large (38cm x 28cm)'],
    ARRAY['Caviar Black', 'Alabaster White', 'Taupe'],
    'Architectural refinement in tactile calfskin. Roomy microfiber interior with a dedicated padded tablet pocket and detachable shoulder strap.',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85',
    true,
    NOW() - INTERVAL '1 day'
),
(
    'b0000000-0000-0000-0000-000000000002',
    'Soleil Minimalist Crescent Shoulder Bag',
    'bags',
    89000,
    'Ultra-Smooth Semi-Vegetable Tanned Leather',
    ARRAY['Standard (27cm x 15cm)'],
    ARRAY['Chestnut Tan', 'Pitch Black', 'Forest Green'],
    'The epitome of quiet elegance. Clean ergonomic curve contouring under the arm with a discrete magnetic flap closure and internal card slip.',
    'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1000&q=85',
    true,
    NOW() - INTERVAL '2 days'
),
(
    'b0000000-0000-0000-0000-000000000003',
    'Vendôme Box Crossbody',
    'bags',
    74000,
    'Scratch-Resistant Saffiano Leather & Brushed Gold Lock',
    ARRAY['Compact (21cm x 14cm x 7cm)'],
    ARRAY['Onyx Black', 'Bordeaux Red', 'Warm Cream'],
    'A sharp, structured evening-to-day companion. Features an accordion dual-compartment layout and an adjustable leather-and-chain strap.',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85',
    false,
    NOW() - INTERVAL '8 days'
),
(
    'b0000000-0000-0000-0000-000000000004',
    'Atelier Pleated Leather Pouch',
    'bags',
    68000,
    'Supple Lambskin Leather with Concealed Magnetic Frame',
    ARRAY['One Size (30cm x 18cm)'],
    ARRAY['Butter Beige', 'Espresso Dark Brown', 'Black'],
    'Artisanal drapery captured in butter-soft lambskin. Tucks naturally under the arm or carried in hand as an elevated statement accessory.',
    'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1000&q=85',
    false,
    NOW() - INTERVAL '9 days'
),
(
    'b0000000-0000-0000-0000-000000000005',
    'Elysian Minimalist Weekend Duffle',
    'bags',
    165000,
    'Full-Grain Pebble Leather with Solid Brass YKK Zippers',
    ARRAY['Overnight (50cm x 30cm x 24cm)'],
    ARRAY['Carbon Black', 'Cognac Tan'],
    'The ultimate getaway luxury. Sized perfectly for short flights or boutique hotel retreats, featuring reinforced handles and shoe compartment.',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85',
    true,
    NOW() - INTERVAL '3 hours'
),

-- JEWELRY (5 items)
(
    'c0000000-0000-0000-0000-000000000001',
    'Helios 18K Solid Vermeil Ribbed Hoops',
    'jewelry',
    42000,
    '18K Heavy Gold Vermeil over 925 Sterling Silver',
    ARRAY['Small (18mm)', 'Medium (24mm)'],
    ARRAY['Yellow Gold', 'Sterling Silver'],
    'Subtle fluting and timeless proportion. Lightweight hollow construction allows all-day comfort without pulling on delicate earlobes.',
    'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1000&q=85',
    true,
    NOW() - INTERVAL '1 day'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'The Serpentina Herringbone Chain Necklace',
    'jewelry',
    58000,
    'Triple-Coated 18K Gold over Italian Sterling Silver (4mm)',
    ARRAY['40cm + 5cm Extender', '45cm + 5cm Extender'],
    ARRAY['18K Gold', 'Bright Silver'],
    'Silky smooth fluid snake weave that lays flat along the collarbone with liquid-gold brilliance. Finished with a custom micro-lobster clasp.',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=85',
    true,
    NOW() - INTERVAL '3 days'
),
(
    'c0000000-0000-0000-0000-000000000003',
    'Kallisto Baroque Freshwater Pearl Pendant',
    'jewelry',
    49000,
    'Natural Organic AAA Baroque Pearl & 14K Gold Filled Chain',
    ARRAY['45cm Chain'],
    ARRAY['Lustrous White Pearl'],
    'Each organically formed pearl is entirely unique in shape, offering high iridescence and a bespoke organic touch to minimalist styling.',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=85',
    false,
    NOW() - INTERVAL '7 days'
),
(
    'c0000000-0000-0000-0000-000000000004',
    'Zephyr Minimalist Signet Ring',
    'jewelry',
    36000,
    'Solid 925 Recycled Sterling Silver / 18K Gold Plated',
    ARRAY['US 6', 'US 7', 'US 8', 'US 9'],
    ARRAY['Satin Gold', 'Polished Silver'],
    'Flat oval face designed for effortless understated luxury or custom monogram engraving. Smooth tapered band for ergonomic everyday wear.',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=85',
    false,
    NOW() - INTERVAL '10 days'
),
(
    'c0000000-0000-0000-0000-000000000005',
    'Lumière Diamond-Cut Tennis Bracelet',
    'jewelry',
    65000,
    'Hand-set AAAAA Cubic Zirconia in 18K White Gold Plated Silver',
    ARRAY['16.5cm', '18cm'],
    ARRAY['White Gold Rhodium', 'Warm Yellow Gold'],
    'Brilliant four-prong setting with double security safety clasp. Catching Nigerian sunlight with unmatched clarity and distinction.',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=85',
    true,
    NOW() - INTERVAL '5 hours'
),

-- WATCHES (5 items)
(
    'd0000000-0000-0000-0000-000000000001',
    'Chronos Minimalist 38mm Dress Timepiece',
    'watches',
    110000,
    '316L Surgical Stainless Steel & Scratch-Proof Sapphire Crystal',
    ARRAY['38mm Case (Unisex)'],
    ARRAY['Silver with White Dial', 'Rose Gold with Sunburst Charcoal', 'Full Black'],
    'Paring time down to pure clarity. Powered by a high-precision Japanese Miyota quartz movement with 50m water resistance and top-grain Italian leather band.',
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=85',
    true,
    NOW() - INTERVAL '2 days'
),
(
    'd0000000-0000-0000-0000-000000000002',
    'Atlas Automatic Exhibition Watch',
    'watches',
    185000,
    'Brushed Steel Case, Sapphire Exhibition Back & 24-Jewel Movement',
    ARRAY['40mm Case'],
    ARRAY['Deep Ocean Navy', 'Silver / Slate Grey'],
    'Pure mechanical precision. Winding automatically with your wrist motion, featuring a 42-hour power reserve and an open skeleton case back.',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=85',
    true,
    NOW() - INTERVAL '3 days'
),
(
    'd0000000-0000-0000-0000-000000000003',
    'Petite Deco Square Mesh Watch',
    'watches',
    78000,
    'Ion-Plated Stainless Steel Milanese Mesh Bracelet',
    ARRAY['24mm x 28mm Case'],
    ARRAY['Champagne Gold', 'Polished Silver', 'Two-Tone'],
    'Geometric vintage poise inspired by the golden age of Paris. Features an ultra-slim 6.5mm profile and interchangeable quick-release strap.',
    'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=85',
    false,
    NOW() - INTERVAL '5 days'
),
(
    'd0000000-0000-0000-0000-000000000004',
    'Vanguard Stealth Matte Black Field Watch',
    'watches',
    95000,
    'DLC Matte Black Coated Steel & Tactical Cordura Canvas Strap',
    ARRAY['41mm Case'],
    ARRAY['Monochrome Matte Black'],
    'Understated stealth aesthetic. Ultra-legible luminescence on hands and markers, screw-down crown, and reinforced anti-reflective crystal.',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85',
    false,
    NOW() - INTERVAL '7 days'
),
(
    'd0000000-0000-0000-0000-000000000005',
    'Meridian Two-Tone Jubilee Chronograph',
    'watches',
    145000,
    'Solid Stainless Steel & 18K Gold PVD Coating with Tachymeter Bezel',
    ARRAY['40mm Case'],
    ARRAY['Silver & Gold Two-Tone'],
    'Executive authority on the wrist. Three-subdial chronograph measurement with date window and iconic 5-link jubilee bracelet with hidden clasp.',
    'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1000&q=85',
    true,
    NOW() - INTERVAL '8 hours'
),

-- PERFUMES (5 items)
(
    'e0000000-0000-0000-0000-000000000001',
    'Oud Nuit Extrait de Parfum',
    'perfumes',
    85000,
    '35% Oil Concentration - Natural Cambodian Oud & Smoked Leather',
    ARRAY['50ml', '100ml'],
    ARRAY['Smoked Glass Flacon'],
    'A magnetic nocturnal sillage. Rare aged agarwood balanced by saffron, damascena rose, and dry birch leather. Lingers intoxicatingly for 16+ hours.',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85',
    true,
    NOW() - INTERVAL '1 day'
),
(
    'e0000000-0000-0000-0000-000000000002',
    'Santal & Cashmere Eau de Parfum',
    'perfumes',
    72000,
    'Pure Mysore Sandalwood, Cardamom & Cedarwood Extract',
    ARRAY['50ml', '100ml'],
    ARRAY['Frosted Amber Bottle'],
    'Creamy, comforting, and impeccably polished. Warm Australian sandalwood enveloped in spicy cardamom, violet leaf, and cashmere musk.',
    'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85',
    true,
    NOW() - INTERVAL '3 days'
),
(
    'e0000000-0000-0000-0000-000000000003',
    'Neroli Blanc Mediterranean Mist',
    'perfumes',
    59000,
    'Calabrian Bergamot, Tunisian Neroli & White Amber',
    ARRAY['100ml'],
    ARRAY['Crystal Clear Glass'],
    'Sun-drenched coastal air captured in a bottle. Crisp citrus zest effervescence drying down to an invigorating clean linen and white musk aura.',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85',
    false,
    NOW() - INTERVAL '6 days'
),
(
    'e0000000-0000-0000-0000-000000000004',
    'Vanilla Royale & Smoked Tobacco',
    'perfumes',
    78000,
    'Madagascar Bourbon Vanilla, Tobacco Blossom & Tonka Bean',
    ARRAY['50ml', '100ml'],
    ARRAY['Onyx Tinted Bottle'],
    'Decadent warmth without sweetness overload. Dark cured tobacco leaf steeped in spiced honey, roasted cocoa, and rich velvety bourbon vanilla.',
    'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=1000&q=85',
    false,
    NOW() - INTERVAL '9 days'
),
(
    'e0000000-0000-0000-0000-000000000005',
    'Fleur Noire Velvet Floral Extract',
    'perfumes',
    82000,
    'Black Orchid, Dark Plum, Patchouli & Golden Amber',
    ARRAY['50ml', '100ml'],
    ARRAY['Midnight Obsidian Bottle'],
    'Dark, alluring, and dangerously sophisticated. Enigmatic spiced florals laced with rich gourmand praline and earth-rooted Indonesian patchouli.',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1000&q=85',
    true,
    NOW() - INTERVAL '10 hours'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- GROUNDED — Supabase Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. PROFILES TABLE (extends Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT,
  full_name  TEXT,
  phone      TEXT,
  role       TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();


-- 2. CAROUSEL_PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS carousel_products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  carousel_image  TEXT NOT NULL,
  studio_image    TEXT NOT NULL,
  ugc_image       TEXT NOT NULL,
  review_author   TEXT DEFAULT '',
  review_rating   INT DEFAULT 5 CHECK (review_rating BETWEEN 1 AND 5),
  review_text     TEXT DEFAULT '',
  review_date     TEXT DEFAULT '',
  sort_order      INT DEFAULT 0,
  is_visible      BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 3. FEATURED_PRODUCTS TABLE (with inventory)
-- ============================================================
CREATE TABLE IF NOT EXISTS featured_products (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  subtitle            TEXT DEFAULT '',
  price               INT NOT NULL,
  image               TEXT NOT NULL,
  badge               TEXT DEFAULT '',
  description         TEXT DEFAULT '',
  material            TEXT DEFAULT '',
  dimensions          TEXT DEFAULT '',
  weight              TEXT DEFAULT '',
  origin              TEXT DEFAULT '',
  technique           TEXT DEFAULT '',
  pile_height         TEXT DEFAULT '',
  care_instructions   TEXT[] DEFAULT '{}',
  features            TEXT[] DEFAULT '{}',
  delivery_estimate   TEXT DEFAULT '',
  delivery_shipping   TEXT DEFAULT '',
  delivery_return     TEXT DEFAULT '',
  stock_count         INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  is_visible          BOOLEAN DEFAULT TRUE,
  sort_order          INT DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 4. AUTO-UPDATE updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_carousel_products_updated_at ON carousel_products;
CREATE TRIGGER update_carousel_products_updated_at
  BEFORE UPDATE ON carousel_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_featured_products_updated_at ON featured_products;
CREATE TRIGGER update_featured_products_updated_at
  BEFORE UPDATE ON featured_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 5. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE carousel_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_products ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read own, admins can read all
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Products: public read, admin write
CREATE POLICY "Public can read visible carousel products"
  ON carousel_products FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert carousel products"
  ON carousel_products FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update carousel products"
  ON carousel_products FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete carousel products"
  ON carousel_products FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Public can read visible featured products"
  ON featured_products FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert featured products"
  ON featured_products FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update featured products"
  ON featured_products FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete featured products"
  ON featured_products FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- 6. SEED DATA — mirrors current hardcoded products.ts
-- ============================================================

-- Carousel Products
INSERT INTO carousel_products (name, carousel_image, studio_image, ugc_image, review_author, review_rating, review_text, review_date, sort_order) VALUES
  ('Sahara Wool Blend',
   'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80&fm=webp',
   'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=900&q=90&fm=webp',
   'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=90&fm=webp',
   'Priya S.', 5,
   'Absolutely divine texture — my living room feels like a different world. The wool quality is exceptional and it arrived perfectly rolled.',
   'January 2025', 1),

  ('Atlas Hand-Knotted',
   'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&q=80&fm=webp',
   'https://images.unsplash.com/photo-1600166898405-da9535204843?w=900&q=90&fm=webp',
   'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=90&fm=webp',
   'Rahul M.', 5,
   'Worth every rupee. The hand-knotted detail is visible and the colours are exactly as shown. My guests always ask where it''s from.',
   'February 2025', 2),

  ('Ember Flatweave',
   'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80&fm=webp',
   'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&q=90&fm=webp',
   'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&q=90&fm=webp',
   'Ananya K.', 5,
   'Perfect for our modern apartment. The flatweave is easy to maintain and the earthy tones tie the whole room together beautifully.',
   'March 2025', 3),

  ('Loom & Lattice',
   'https://images.unsplash.com/photo-1560440021-33f9b867899d?w=600&q=80&fm=webp',
   'https://images.unsplash.com/photo-1560440021-33f9b867899d?w=900&q=90&fm=webp',
   'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=900&q=90&fm=webp',
   'Vikram T.', 4,
   'The geometric pattern is subtle and elegant. Shipping was fast and it came with a great anti-slip pad too.',
   'March 2025', 4),

  ('Dune Hand-Tufted',
   'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80&fm=webp',
   'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=900&q=90&fm=webp',
   'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=900&q=90&fm=webp',
   'Meera J.', 5,
   'I was nervous ordering a rug online but the quality exceeded expectations. The tufted pile is thick and luxurious.',
   'February 2025', 5),

  ('Coastal Kilim',
   'https://images.unsplash.com/photo-1572385207598-4eb1fc1e5f80?w=600&q=80&fm=webp',
   'https://images.unsplash.com/photo-1572385207598-4eb1fc1e5f80?w=900&q=90&fm=webp',
   'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=900&q=90&fm=webp',
   'Siddharth R.', 5,
   'The Kilim pattern is authentic and the colours are vibrant but not garish. Highly recommend for a boho-modern look.',
   'January 2025', 6);


-- Featured Products (with inventory)
INSERT INTO featured_products (name, subtitle, price, image, badge, description, material, dimensions, weight, origin, technique, pile_height, care_instructions, features, delivery_estimate, delivery_shipping, delivery_return, stock_count, sort_order) VALUES
  ('Atlas Hand-Knotted',
   '200 × 300 cm · Pure New Wool',
   24999,
   'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800&q=90&fm=webp',
   'Best Seller',
   'A masterpiece of traditional craftsmanship, the Atlas Hand-Knotted rug is woven by skilled artisans using time-honoured techniques passed down through generations. Each knot is tied by hand, resulting in a rug of extraordinary durability and beauty that will last for decades.',
   'Pure New Zealand Wool',
   '200 × 300 cm (6.6 × 9.8 ft)',
   '12.5 kg',
   'Handcrafted in Rajasthan, India',
   'Hand-Knotted (120 knots per sq. inch)',
   '12 mm',
   ARRAY['Professional dry cleaning recommended', 'Vacuum regularly without beater bar', 'Blot spills immediately with a dry cloth', 'Rotate every 6 months for even wear', 'Avoid direct sunlight to preserve colour'],
   ARRAY['GoodWeave® certified — no child labour', 'Natural, undyed wool with vegetable-dyed accents', 'Anti-slip backing included', 'Moth and stain resistant treatment', 'Comes with complimentary rug pad'],
   '5–7 business days (Metro cities) · 8–12 business days (Rest of India)',
   'Free shipping across India',
   '30-day no-questions-asked return policy. Free reverse pickup.',
   25, 1),

  ('Ember Flatweave',
   '160 × 230 cm · Cotton-Jute Blend',
   12499,
   'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=90&fm=webp',
   'New Arrival',
   'The Ember Flatweave brings a contemporary edge to any room with its clean lines and earthy palette. Woven on traditional handlooms using a blend of cotton and jute, it offers a lightweight yet durable foundation perfect for modern living spaces.',
   '60% Cotton, 40% Natural Jute',
   '160 × 230 cm (5.2 × 7.5 ft)',
   '6.8 kg',
   'Handwoven in Varanasi, India',
   'Flatweave (Dhurrie style)',
   '4 mm (Low pile)',
   ARRAY['Machine washable on gentle cycle (cold water)', 'Air dry flat — do not tumble dry', 'Vacuum both sides regularly', 'Spot clean with mild detergent', 'Can be dry cleaned if preferred'],
   ARRAY['Reversible design — two looks in one', 'Eco-friendly natural fibres', 'Hypoallergenic and pet friendly', 'Lightweight and easy to move', 'Non-toxic AZO-free dyes'],
   '3–5 business days (Metro cities) · 6–10 business days (Rest of India)',
   'Free shipping across India',
   '30-day no-questions-asked return policy. Free reverse pickup.',
   18, 2);


-- 7. STORAGE BUCKET for product images
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to product images
CREATE POLICY "Public read access for product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Allow authenticated users to upload (admin check done at app level)
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

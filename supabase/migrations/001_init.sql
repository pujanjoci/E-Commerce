-- =========================================================
-- Premium E-Commerce — Fresh Slate Migration (with Seed Data)
-- =========================================================

-- 0. CLEANUP
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;

-- 1. CATEGORIES
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    images TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROFILES
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'user',
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USERS
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ADMIN_USERS
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    is_super_admin BOOLEAN DEFAULT FALSE,
    -- Dev bypass key (plain text). Pass as header: x-admin-key: testkey
    test_key TEXT DEFAULT 'testkey',
    -- Numeric verification key stored as bcrypt hash. Plain value: 20260409
    verification_key TEXT DEFAULT crypt('20260409', gen_salt('bf')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORDERS
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled')),
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDER_ITEMS
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase NUMERIC(12,2) NOT NULL CHECK (price_at_purchase >= 0)
);

-- RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Admin check
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users au
    JOIN public.users u ON au.user_id = u.id
    WHERE u.auth_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Policies
CREATE POLICY "Public categories are viewable" ON public.categories FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (public.is_admin());
CREATE POLICY "Public active products are viewable" ON public.products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins manage products" ON public.products FOR ALL USING (public.is_admin());
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);

-- Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');

  INSERT INTO public.users (auth_id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', TRUE) ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Image access is public" ON storage.objects;
CREATE POLICY "Image access is public" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins manage images" ON storage.objects;
CREATE POLICY "Admins manage images" ON storage.objects FOR ALL USING (bucket_id = 'product-images' AND public.is_admin());

-- =========================================================
-- SEED DATA (Premium Sample Collection)
-- =========================================================

-- Insert Categories
INSERT INTO public.categories (name, slug, image_url) VALUES
('Furniture', 'furniture', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1000'),
('Lighting', 'lighting', 'https://images.unsplash.com/photo-1543198126-a8ad8e47fb21?auto=format&fit=crop&q=80&w=1000'),
('Accessories', 'accessories', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000'),
('Decor', 'decor', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1000');

-- Insert Products
INSERT INTO public.products (name, slug, description, price, category_id, images, stock)
SELECT 'Levitation Lounge Chair', 'levitation-lounge-chair', 'The pinnacle of ergonomic design meets ethereal aesthetics. Hand-crafted from sustainable oak and premium cloud-weave fabric.', 2499.00, id, ARRAY['https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=1000'], 12 FROM public.categories WHERE slug = 'furniture';

INSERT INTO public.products (name, slug, description, price, category_id, images, stock)
SELECT 'Halo Pendant Light', 'halo-pendant-light', 'A seamless ring of pure illumination. The Halo Pendant uses advanced diffusion technology to create a shadowless glow.', 899.00, id, ARRAY['https://images.unsplash.com/photo-1543198126-a8ad8e47fb21?auto=format&fit=crop&q=80&w=1000'], 25 FROM public.categories WHERE slug = 'lighting';

INSERT INTO public.products (name, slug, description, price, category_id, images, stock)
SELECT 'Onyx Timepiece', 'onyx-timepiece', 'Precision engineered from a single block of volcanic glass. A statement of timeless minimalism.', 499.00, id, ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000'], 40 FROM public.categories WHERE slug = 'accessories';

INSERT INTO public.products (name, slug, description, price, category_id, images, stock)
SELECT 'Zenith Ceramic Set', 'zenith-ceramic-set', 'Seven uniquely textured vessels inspired by geological formations. A centerpiece for the modern home.', 320.00, id, ARRAY['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=1000'], 15 FROM public.categories WHERE slug = 'decor';

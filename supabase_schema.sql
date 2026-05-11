-- 1. PROFILES TABLE (Extensions are enabled in Supabase by default usually)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    email TEXT,
    role TEXT DEFAULT 'BUYER',
    mobile TEXT,
    address TEXT,
    city TEXT DEFAULT 'Ghotki',
    subscription_tier TEXT DEFAULT 'NONE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. SHOPS TABLE (Cascades if Owner is Deleted)
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    bazaar TEXT,
    category TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')),
    subscription_tier TEXT DEFAULT 'BASIC',
    logo_url TEXT,
    banner_url TEXT,
    mobile TEXT,
    whatsapp TEXT,
    address TEXT,
    bio TEXT,
    easypaisa_number TEXT,
    jazzcash_number TEXT,
    bank_details TEXT,
    featured BOOLEAN DEFAULT false,
    sort_priority INTEGER DEFAULT 0,
    is_top_seller BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. PRODUCTS TABLE (Cascades if Shop is Deleted)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    original_price DECIMAL(12,2),
    discount_percentage INTEGER DEFAULT 0,
    event_name TEXT,
    category TEXT,
    image_urls TEXT[],
    video_url TEXT,
    tags TEXT[],
    stock INTEGER DEFAULT 1,
    is_new_arrival BOOLEAN DEFAULT true,
    sort_priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
    items JSONB NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    delivery_fee DECIMAL(12,2) NOT NULL,
    platform_fee DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED')),
    payment_method TEXT,
    buyer_name TEXT,
    buyer_mobile TEXT,
    buyer_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. CUSTOM REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.custom_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    delivery_days INTEGER DEFAULT 7,
    image_urls TEXT[],
    customer_name TEXT,
    customer_address TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. FUNCTION: CHECK IF SELLER EXISTS WITH EMAIL
CREATE OR REPLACE FUNCTION public.check_seller_exists(checked_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE email = checked_email AND role = 'SELLER'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. SECURITY BOX: Gate for Admin access (Safe Version)
-- We avoid using this in RLS to prevent recursion.
CREATE OR REPLACE FUNCTION public.is_admin_gate(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id AND role = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. TRIGGER: AUTH TO PROFILE & SHOP SYNC (Bulletproof Version)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    role_text TEXT;
BEGIN
    -- Determine role from metadata (default to BUYER if missing)
    role_text := COALESCE(NEW.raw_user_meta_data->>'role', 'BUYER');
    
    -- FORCE ADMIN ROLE FOR THE MASTER EMAIL
    IF NEW.email = 'd46050573@gmail.com' THEN
        role_text := 'ADMIN';
    END IF;
    
    BEGIN
        -- 1. Create Profile
        INSERT INTO public.profiles (id, name, email, role, mobile, city, subscription_tier)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'full_name', 'Bazar User'),
            NEW.email,
            UPPER(role_text),
            COALESCE(NEW.raw_user_meta_data->>'mobile', ''),
            COALESCE(NEW.raw_user_meta_data->>'city', 'Ghotki'),
            COALESCE(UPPER(NEW.raw_user_meta_data->>'tier'), 'NONE')
        ) ON CONFLICT (id) DO NOTHING;

        -- 2. If Seller, Create Shop automatically
        IF UPPER(role_text) = 'SELLER' THEN
            INSERT INTO public.shops (owner_id, name, bazaar, category, status, mobile)
            VALUES (
                NEW.id,
                COALESCE(NEW.raw_user_meta_data->>'shop_name', 'My Boutique'),
                COALESCE(NEW.raw_user_meta_data->>'bazaar', 'Ladies Bazar'),
                COALESCE(NEW.raw_user_meta_data->>'category', 'Clothing'),
                'PENDING',
                COALESCE(NEW.raw_user_meta_data->>'mobile', '')
            ) ON CONFLICT (owner_id) DO NOTHING;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Log error locally if possible, but NEVER block auth insertion
        NULL;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. TRIGGER REBINDING
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. RLS ENABLEMENT
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;

-- 9.1 PUBLIC READ ACCESS
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Shops" ON public.shops FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);

-- 9.2 USER SPECIFIC ACCESS
CREATE POLICY "Users Manage Own Profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Sellers Manage Own Shop" ON public.shops FOR ALL USING (auth.uid() = owner_id);

-- 9.3 ADMIN BYPASS (Email based)
CREATE POLICY "Admins manage profiles" ON public.profiles FOR ALL TO authenticated USING ((auth.jwt() ->> 'email') = 'd46050573@gmail.com');
CREATE POLICY "Admins manage shops" ON public.shops FOR ALL TO authenticated USING ((auth.jwt() ->> 'email') = 'd46050573@gmail.com');
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated USING ((auth.jwt() ->> 'email') = 'd46050573@gmail.com');
CREATE POLICY "Admins manage orders" ON public.orders FOR ALL TO authenticated USING ((auth.jwt() ->> 'email') = 'd46050573@gmail.com');
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated USING ((auth.jwt() ->> 'email') = 'd46050573@gmail.com');
CREATE POLICY "Admins manage requests" ON public.custom_requests FOR ALL TO authenticated USING ((auth.jwt() ->> 'email') = 'd46050573@gmail.com');

-- 9.4 Business logic policies
CREATE POLICY "Sellers Manage Own Products" ON public.products FOR ALL USING (
    EXISTS (SELECT 1 FROM public.shops WHERE id = shop_id AND owner_id = auth.uid())
);
CREATE POLICY "Users Manage Own Orders" ON public.orders FOR ALL USING (auth.uid() = buyer_id);
CREATE POLICY "Sellers Manage Shop Orders" ON public.orders FOR ALL USING (
    EXISTS (SELECT 1 FROM public.shops WHERE id = seller_id AND owner_id = auth.uid())
);
CREATE POLICY "Users manage own requests" ON public.custom_requests FOR ALL USING (auth.uid() = user_id);

-- 10. REALTIME CONFIG
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- 11. SEED DATA (Default Categories)
INSERT INTO public.categories (name) VALUES 
('Women''s Clothes'),
('Men''s Clothes'),
('Women''s Footwear'),
('Men''s Footwear'),
('Cosmetics')
ON CONFLICT (name) DO NOTHING;

-- 12. ADMIN & SAMPLE DATA SEEDING
-- Note: This creates the admin user directly in auth.users
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '9777a89c-cba2-4b8f-bbdb-1a12345c325e',
    'authenticated',
    'authenticated',
    'd46050573@gmail.com',
    crypt('333333', gen_salt('bf')),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Master Admin","role":"ADMIN","city":"Ghotki"}',
    '2026-05-05 21:19:00+00',
    '2026-05-05 21:19:00+00'
) ON CONFLICT (id) DO NOTHING;

-- Force Profile to Admin
UPDATE public.profiles SET role = 'ADMIN', city = 'Ghotki' WHERE id = '9777a89c-cba2-4b8f-bbdb-1a12345c325e';
UPDATE public.profiles SET role = 'ADMIN' WHERE email = 'd46050573@gmail.com';

-- Sample Shop for Admin
INSERT INTO public.shops (owner_id, name, bazaar, category, status, mobile)
VALUES (
    '9777a89c-cba2-4b8f-bbdb-1a12345c325e', 
    'Bazar Admin Store', 
    'Main Bazar', 
    'Footwear', 
    'APPROVED',
    '03001234567'
) ON CONFLICT (owner_id) DO NOTHING;

-- Sample Products
DO $$
DECLARE
    shop_id_val UUID;
BEGIN
    SELECT id INTO shop_id_val FROM public.shops WHERE owner_id = '9777a89c-cba2-4b8f-bbdb-1a12345c325e';
    
    IF shop_id_val IS NOT NULL THEN
        INSERT INTO public.products (shop_id, name, description, price, category, is_new_arrival, image_urls)
        VALUES 
        (shop_id_val, 'Service Shoes', 'Original Service brands shoes for men.', 1500, 'Men''s Footwear', true, ARRAY['https://images.unsplash.com/photo-1549298916-b41d501d3772']),
        (shop_id_val, 'Raja Rani Shoes', 'Beautiful traditional raja rani style footwear.', 2200, 'Women''s Footwear', true, ARRAY['https://images.unsplash.com/photo-1543163521-1bf539c55dd2'])
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

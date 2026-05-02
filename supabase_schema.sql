-- 1. PROFILES TABLE (Extensions are enabled in Supabase by default usually)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'BUYER' CHECK (role IN ('ADMIN', 'SELLER', 'BUYER', 'GUEST')),
    mobile TEXT,
    address TEXT,
    city TEXT DEFAULT 'Ghotki',
    subscription_tier TEXT DEFAULT 'NONE' CHECK (subscription_tier IN ('BASIC', 'STANDARD', 'PREMIUM', 'NONE')),
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

-- 8. TRIGGER: AUTOMATIC PROFILE CREATION ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, role, mobile, subscription_tier, city, address)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.email,
        new.raw_user_meta_data->>'role',
        new.raw_user_meta_data->>'mobile',
        new.raw_user_meta_data->>'tier',
        COALESCE(new.raw_user_meta_data->>'city', 'Ghotki'),
        COALESCE(new.raw_user_meta_data->>'address', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        mobile = EXCLUDED.mobile;
    
    -- If user is a seller, also create or update a shop record
    IF new.raw_user_meta_data->>'role' = 'SELLER' THEN
        INSERT INTO public.shops (owner_id, name, bazaar, category, subscription_tier, address, mobile)
        VALUES (
            new.id,
            new.raw_user_meta_data->>'shop_name',
            new.raw_user_meta_data->>'bazaar',
            new.raw_user_meta_data->>'category',
            new.raw_user_meta_data->>'tier',
            new.raw_user_meta_data->>'address',
            new.raw_user_meta_data->>'mobile'
        )
        ON CONFLICT (owner_id) DO NOTHING; -- Keep original shop if they re-signup (unlikely)
    END IF;
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 9. RLS POLICIES (BASIC - OPEN FOR MARKETPLACE)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Shops" ON public.shops FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);

-- User specific write access
CREATE POLICY "Users Update Own Profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Sellers Manage Own Shop" ON public.shops FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Sellers Manage Own Products" ON public.products FOR ALL USING (
    EXISTS (SELECT 1 FROM public.shops WHERE id = shop_id AND owner_id = auth.uid())
);
CREATE POLICY "Users Manage Own Orders" ON public.orders FOR ALL USING (auth.uid() = buyer_id);
CREATE POLICY "Sellers Manage Shop Orders" ON public.orders FOR ALL USING (
    EXISTS (SELECT 1 FROM public.shops WHERE id = seller_id AND owner_id = auth.uid())
);

-- 10. REALTIME CONFIG
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

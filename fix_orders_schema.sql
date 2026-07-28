-- FIX FOR ORDERS TABLE COLUMNS AND RLS
-- Run this in your Supabase SQL Editor

-- 1. Safely alter seller_id and buyer_id columns to TEXT to allow string IDs (e.g. mock shops like "sukkur_s_1_1", "s1", guest IDs)
DO $$ 
BEGIN
    -- Drop FK constraints on orders if present so column type change works smoothly
    ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_buyer_id_fkey;
    ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_seller_id_fkey;

    -- Convert buyer_id and seller_id to TEXT
    ALTER TABLE public.orders ALTER COLUMN buyer_id TYPE TEXT USING buyer_id::text;
    ALTER TABLE public.orders ALTER COLUMN seller_id TYPE TEXT USING seller_id::text;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Notice: Column alter skipped or already updated.';
END $$;

-- 2. Ensure columns exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='delivery_fee') THEN
        ALTER TABLE public.orders ADD COLUMN delivery_fee DECIMAL(12,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='subtotal') THEN
        ALTER TABLE public.orders ADD COLUMN subtotal DECIMAL(12,2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='platform_fee') THEN
        ALTER TABLE public.orders ADD COLUMN platform_fee DECIMAL(12,2) DEFAULT 0;
    END IF;
END $$;

-- 3. Adjust RLS to allow guest orders (when buyer_id is NULL or string)
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
CREATE POLICY "Public can insert orders" ON public.orders 
FOR INSERT WITH CHECK (true);

-- 4. Ensure users can see their own orders (even if admin)
DROP POLICY IF EXISTS "Users Manage Own Orders" ON public.orders;
CREATE POLICY "Users Manage Own Orders" ON public.orders 
FOR SELECT USING (auth.uid()::text = buyer_id OR buyer_id IS NULL OR (auth.jwt() ->> 'email') = 'd46050573@gmail.com');

-- 5. Refresh schema cache
NOTIFY pgrst, 'reload schema';

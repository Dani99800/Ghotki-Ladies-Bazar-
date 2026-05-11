-- FIX FOR ORDERS TABLE COLUMNS AND RLS
-- Run this in your Supabase SQL Editor

-- 1. Ensure columns exist (in case they were missed)
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

-- 2. Adjust RLS to allow guest orders (when buyer_id is NULL)
-- First, drop existing if needed or just add a new one
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
CREATE POLICY "Public can insert orders" ON public.orders 
FOR INSERT WITH CHECK (true);

-- 3. Ensure users can see their own orders (even if admin)
DROP POLICY IF EXISTS "Users Manage Own Orders" ON public.orders;
CREATE POLICY "Users Manage Own Orders" ON public.orders 
FOR SELECT USING (auth.uid() = buyer_id OR (auth.jwt() ->> 'email') = 'd46050573@gmail.com');

-- 4. Refresh schema cache (Implicitly happens on DDL usually, but good to know)
-- If errors persist, go to Supabase -> Settings -> API -> PostgREST -> Reload Schema

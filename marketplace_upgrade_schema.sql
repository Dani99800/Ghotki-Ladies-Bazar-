-- GHOTKI BAZAR MARKETPLACE UPGRADE SQL
-- Run this in your Supabase SQL Editor

-- 1. Upgrade SHOPS / SELLER PROFILES table columns
DO $$ 
BEGIN
    -- Seller type: 'INDIVIDUAL' or 'BUSINESS'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='seller_type') THEN
        ALTER TABLE public.shops ADD COLUMN seller_type TEXT DEFAULT 'BUSINESS';
    END IF;

    -- Seller plan: 'INDIVIDUAL_5' or 'BUSINESS_MONTHLY'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='seller_plan') THEN
        ALTER TABLE public.shops ADD COLUMN seller_plan TEXT DEFAULT 'BUSINESS_MONTHLY';
    END IF;

    -- Payment Verification Columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='payment_status') THEN
        ALTER TABLE public.shops ADD COLUMN payment_status TEXT DEFAULT 'UNPAID';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='payment_proof_url') THEN
        ALTER TABLE public.shops ADD COLUMN payment_proof_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='payment_trx_id') THEN
        ALTER TABLE public.shops ADD COLUMN payment_trx_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='payment_method') THEN
        ALTER TABLE public.shops ADD COLUMN payment_method TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='payment_submitted_at') THEN
        ALTER TABLE public.shops ADD COLUMN payment_submitted_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='plan_expires_at') THEN
        ALTER TABLE public.shops ADD COLUMN plan_expires_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='is_verified') THEN
        ALTER TABLE public.shops ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='city') THEN
        ALTER TABLE public.shops ADD COLUMN city TEXT DEFAULT 'Ghotki';
    END IF;
END $$;

-- 2. Upgrade PRODUCTS table columns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='condition') THEN
        ALTER TABLE public.products ADD COLUMN condition TEXT DEFAULT 'New';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='subcategory') THEN
        ALTER TABLE public.products ADD COLUMN subcategory TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='location_city') THEN
        ALTER TABLE public.products ADD COLUMN location_city TEXT DEFAULT 'Ghotki';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='negotiable') THEN
        ALTER TABLE public.products ADD COLUMN negotiable BOOLEAN DEFAULT true;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='status') THEN
        ALTER TABLE public.products ADD COLUMN status TEXT DEFAULT 'APPROVED';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='report_count') THEN
        ALTER TABLE public.products ADD COLUMN report_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 3. Upgrade CUSTOM_REQUESTS table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_requests' AND column_name='budget') THEN
        ALTER TABLE public.custom_requests ADD COLUMN budget DECIMAL(12,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_requests' AND column_name='location_city') THEN
        ALTER TABLE public.custom_requests ADD COLUMN location_city TEXT DEFAULT 'Ghotki';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_requests' AND column_name='customer_mobile') THEN
        ALTER TABLE public.custom_requests ADD COLUMN customer_mobile TEXT;
    END IF;
END $$;

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

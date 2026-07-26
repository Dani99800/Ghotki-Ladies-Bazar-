-- ========================================================
-- GHOTKI ONLINE DIRECTORY & MARKETPLACE - PRICING & PLANS UPGRADE
-- Run this script in your Supabase SQL Editor to apply all database updates.
-- ========================================================

-- 1. UPDATE SHOPS TABLE SCHEMAS AND DEFAULT PLAN
DO $$ 
BEGIN
    -- Ensure seller_type column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='seller_type') THEN
        ALTER TABLE public.shops ADD COLUMN seller_type TEXT DEFAULT 'BUSINESS';
    END IF;

    -- Ensure seller_plan column exists and set default to TARGET plan 'BUSINESS_1000'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='seller_plan') THEN
        ALTER TABLE public.shops ADD COLUMN seller_plan TEXT DEFAULT 'BUSINESS_1000';
    ELSE
        ALTER TABLE public.shops ALTER COLUMN seller_plan SET DEFAULT 'BUSINESS_1000';
    END IF;

    -- Ensure portal_type column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='portal_type') THEN
        ALTER TABLE public.shops ADD COLUMN portal_type TEXT DEFAULT 'MARKETPLACE';
    END IF;

    -- Ensure payment verification columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='payment_status') THEN
        ALTER TABLE public.shops ADD COLUMN payment_status TEXT DEFAULT 'PENDING';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='payment_proof_url') THEN
        ALTER TABLE public.shops ADD COLUMN payment_proof_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='payment_trx_id') THEN
        ALTER TABLE public.shops ADD COLUMN payment_trx_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='payment_method') THEN
        ALTER TABLE public.shops ADD COLUMN payment_method TEXT DEFAULT 'Easypaisa';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='payment_submitted_at') THEN
        ALTER TABLE public.shops ADD COLUMN payment_submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='plan_expires_at') THEN
        ALTER TABLE public.shops ADD COLUMN plan_expires_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='is_verified') THEN
        ALTER TABLE public.shops ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;
END $$;


-- 2. UPDATE PROFILES TABLE SCHEMAS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='seller_type') THEN
        ALTER TABLE public.profiles ADD COLUMN seller_type TEXT DEFAULT 'BUSINESS';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='seller_plan') THEN
        ALTER TABLE public.profiles ADD COLUMN seller_plan TEXT DEFAULT 'BUSINESS_1000';
    ELSE
        ALTER TABLE public.profiles ALTER COLUMN seller_plan SET DEFAULT 'BUSINESS_1000';
    END IF;
END $$;


-- 3. MIGRATE OLD PLAN NAMES TO NEW PRICING TIERS
-- Maps legacy plan keys ('BUSINESS_MONTHLY', 'INDIVIDUAL_5') to new pricing structure
UPDATE public.shops 
SET seller_plan = 'BUSINESS_1000' 
WHERE seller_plan = 'BUSINESS_MONTHLY' OR seller_plan IS NULL;

UPDATE public.shops 
SET seller_plan = 'INDIVIDUAL_100' 
WHERE seller_plan = 'INDIVIDUAL_5';

UPDATE public.profiles 
SET seller_plan = 'BUSINESS_1000' 
WHERE seller_plan = 'BUSINESS_MONTHLY' OR seller_plan IS NULL;

UPDATE public.profiles 
SET seller_plan = 'INDIVIDUAL_100' 
WHERE seller_plan = 'INDIVIDUAL_5';


-- 4. ENSURE PAYMENT ACCOUNTS CONSTRAINTS & DEFAULTS
COMMENT ON COLUMN public.shops.seller_plan IS 'Plans: INDIVIDUAL_100 (PKR 100), SHOP_500 (PKR 500/Mo), BUSINESS_1000 (PKR 1,000/Mo - TARGET), PROPERTY_2500 (PKR 2,500/Mo)';


-- 5. RELOAD SUPABASE API CACHE
NOTIFY pgrst, 'reload schema';

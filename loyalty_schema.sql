-- LOYALTY AND POINTS SYSTEM SCHEMA
-- Run this in your Supabase SQL Editor

-- 1. Add points and loyalty info to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS loyalty_plan_id UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS loyalty_expiry TIMESTAMP WITH TIME ZONE;

-- 2. Create Loyalty Plans Table
CREATE TABLE IF NOT EXISTS public.loyalty_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(12,2) DEFAULT 0,
    discount_percentage INTEGER DEFAULT 0,
    free_delivery BOOLEAN DEFAULT false,
    gift_info TEXT,
    free_item_info TEXT,
    custom_benefits TEXT[] DEFAULT '{}',
    duration_days INTEGER DEFAULT 30,
    color TEXT DEFAULT '#ec4899',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. RLS for Loyalty Plans
ALTER TABLE public.loyalty_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Loyalty Plans" ON public.loyalty_plans FOR SELECT USING (true);
CREATE POLICY "Admins manage plans" ON public.loyalty_plans FOR ALL TO authenticated USING ((auth.jwt() ->> 'email') = 'd46050573@gmail.com');

-- 4. Initial Seed Data (Consolidated to single 500 PKR monthly card as requested)
DELETE FROM public.loyalty_plans;
INSERT INTO public.loyalty_plans (name, price, discount_percentage, free_delivery, gift_info, duration_days, color, custom_benefits)
VALUES 
('Bazar Elite Monthly', 500, 15, true, 'Surprise Gift on 1st Order', 30, '#facc15', '{"Win Umra Ticket Entry", "VIP Access", "Free Item Every 5th Order"}');

-- 5. Atomic Point Increment Function
CREATE OR REPLACE FUNCTION award_order_points(user_id UUID, points_to_add DECIMAL)
RETURNS void AS $$
BEGIN
    UPDATE public.profiles
    SET points = COALESCE(points, 0) + points_to_add
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

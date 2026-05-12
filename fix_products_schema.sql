-- FIX FOR PRODUCTS TABLE IMAGES COLUMN
-- Run this in your Supabase SQL Editor

-- 1. Ensure the 'images' column exists as an array of text
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='images') THEN
        ALTER TABLE public.products ADD COLUMN images TEXT[] DEFAULT '{}';
    END IF;
    
    -- Also ensure image_urls exists for backward compatibility if needed
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='image_urls') THEN
        ALTER TABLE public.products ADD COLUMN image_urls TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- 2. Synchronize data if one is empty
UPDATE public.products 
SET images = image_urls 
WHERE (images IS NULL OR array_length(images, 1) IS NULL) 
AND image_urls IS NOT NULL;

UPDATE public.products 
SET image_urls = images 
WHERE (image_urls IS NULL OR array_length(image_urls, 1) IS NULL) 
AND images IS NOT NULL;

-- 3. Refresh schema cache
-- Run this to tell PostgREST to reload the schema immediately
NOTIFY pgrst, 'reload schema';

-- 4. Storage Bucket Setup
-- Ensure the 'marketplace' bucket exists and is public
-- Run this in SQL Editor to check/create bucket (Note: Storage API usually preferred)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('marketplace', 'marketplace', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 5. Bucket Policies (Allow public uploads for development)
-- This allows anyone to upload to marketplace bucket
DO $$ 
BEGIN
    -- Policy for Insert
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Insert' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Public Access Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'marketplace');
    END IF;
    
    -- Policy for Select
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Select' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Public Access Select" ON storage.objects FOR SELECT USING (bucket_id = 'marketplace');
    END IF;
END $$;

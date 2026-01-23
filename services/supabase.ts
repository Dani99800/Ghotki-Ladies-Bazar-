import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Configuration
 * 
 * STORAGE INSTRUCTIONS:
 * You must create a bucket named exactly: assets
 * Do NOT use a period at the end. Just "assets".
 * Ensure the bucket is set to "Public" in your Supabase dashboard.
 */
const supabaseUrl = 
  (import.meta as any).env?.VITE_SUPABASE_URL || 
  (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL : '') || 
  'https://fiubihnroqvwaaeglcnd.supabase.co';

const supabaseAnonKey = 
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
  (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_ANON_KEY : '') || 
  'sb_publishable_P7Yj4EYFqtFuyXjyyU_RUg_gzCWbkhA';

// Initialize the Supabase client
export const supabase = (supabaseUrl && supabaseUrl !== 'YOUR_PROJECT_URL_HERE' && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Utility function to upload files to Supabase Storage
 */
export const uploadFile = async (bucket: string, path: string, file: File) => {
  if (!supabase) {
    console.error("Supabase not initialized. Cannot upload file.");
    throw new Error("Supabase connection missing.");
  }

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true
  });
  
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
};
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Configuration
 * These values connect your app to your specific database project.
 */
const supabaseUrl = 
  (import.meta as any).env?.VITE_SUPABASE_URL || 
  (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL : '') || 
  'https://fiubihnroqvwaaeglcnd.supabase.co'; // Integrated your project URL

const supabaseAnonKey = 
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
  (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_ANON_KEY : '') || 
  'sb_publishable_P7Yj4EYFqtFuyXjyyU_RUg_gzCWbkhA'; // Integrated your anon key

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
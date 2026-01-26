import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

/**
 * Supabase Configuration
 * Checks environment variables injected by Vite
 */
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fiubihnroqvwaaeglcnd.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_P7Yj4EYFqtFuyXjyyU_RUg_gzCWbkhA';

// Initialize the Supabase client
export const supabase = (
  supabaseUrl && 
  supabaseUrl !== 'YOUR_PROJECT_URL_HERE' && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'YOUR_ANON_KEY_HERE'
) ? createClient(supabaseUrl, supabaseAnonKey) : null;

/**
 * Utility function to upload files to Supabase Storage
 */
export const uploadFile = async (bucket: string, path: string, file: File) => {
  if (!supabase) {
    console.error("Supabase not initialized.");
    throw new Error("Supabase connection missing.");
  }

  // Ensure the bucket exists manually in the dashboard or via SQL
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true
  });
  
  if (error) {
    console.error("Storage Upload Error:", error);
    throw error;
  }
  
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
};
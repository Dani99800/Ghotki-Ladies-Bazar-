import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Configuration
 * Checks both import.meta.env (Vite) and process.env (Shimmed/Build-time)
 */

const getEnv = (key: string): string => {
  // @ts-ignore
  return (import.meta.env?.[key] || (typeof process !== 'undefined' ? process.env?.[key] : '') || '');
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || 'https://fiubihnroqvwaaeglcnd.supabase.co';
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || 'sb_publishable_P7Yj4EYFqtFuyXjyyU_RUg_gzCWbkhA';

// Initialize the Supabase client
// We check for placeholder strings as well as empty values
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
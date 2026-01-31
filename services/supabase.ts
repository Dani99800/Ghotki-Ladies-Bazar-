
import { createClient } from '@supabase/supabase-js';

// Prioritize VITE environment variables for browser-side execution
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://fiubihnroqvwaaeglcnd.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_P7Yj4EYFqtFuyXjyyU_RUg_gzCWbkhA';

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  console.error("CRITICAL: Invalid Supabase URL configuration detected. Please check environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

export const uploadFile = async (bucket: string, path: string, file: File) => {
  if (!supabase) throw new Error("Database connection not established.");
  
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { 
    upsert: true,
    cacheControl: '3600'
  });
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
};

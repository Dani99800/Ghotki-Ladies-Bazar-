
import { createClient } from '@supabase/supabase-js';

// Prioritize environment variables from the standard Vite/Process locations
const getEnv = (key: string) => {
  return (import.meta as any).env?.[key] || (process as any).env?.[key] || '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || 'https://fiubihnroqvwaaeglcnd.supabase.co';
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || 'sb_publishable_P7Yj4EYFqtFuyXjyyU_RUg_gzCWbkhA';

if (!supabaseUrl.startsWith('http')) {
  console.warn("Supabase URL is missing or invalid. Check environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: { 'x-application-name': 'ghotki-ladies-bazar' }
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

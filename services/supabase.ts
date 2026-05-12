
import { createClient } from '@supabase/supabase-js';

// Prioritize environment variables from the standard Vite/Process locations
const getEnv = (key: string) => {
  return (import.meta as any).env?.[key] || '';
};

const rawUrl = (getEnv('VITE_SUPABASE_URL') || 'https://fiubihnroqvwaaeglcnd.supabase.co').trim();
const supabaseUrl = rawUrl.split('/rest/v1')[0].replace(/\/+$/, '');
const supabaseAnonKey = (getEnv('VITE_SUPABASE_ANON_KEY') || 'sb_publishable_P7Yj4EYFqtFuyXjyyU_RUg_gzCWbkhA').trim();

// Production URLs for redirect handling
const SITE_URL = 'https://www.ghotkibazar.com';

if (!supabaseUrl.startsWith('http')) {
  console.warn("GLB: Supabase URL is missing or invalid. Check your environment variables.", { rawUrl, supabaseUrl });
} else {
  console.log("GLB: Supabase initialized with project:", supabaseUrl.split('//')[1]?.split('.')[0]);
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
  
  console.log(`GLB: Uploading to ${bucket}/${path}...`);
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { 
      upsert: true,
      cacheControl: '3600'
    });
    
    if (error) {
      console.error("GLB: Supabase Storage Error:", error);
      throw error;
    }
    
    if (!data) throw new Error("No data returned from upload.");
    
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    console.log(`GLB: Upload Success. Public URL: ${publicUrl}`);
    return publicUrl;
  } catch (err) {
    console.error("GLB: Storage Exception:", err);
    throw err;
  }
};

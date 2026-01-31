
import { createClient } from '@supabase/supabase-js';

// Using provided credentials directly to ensure connection
const supabaseUrl = 'https://fiubihnroqvwaaeglcnd.supabase.co';
const supabaseAnonKey = 'sb_publishable_P7Yj4EYFqtFuyXjyyU_RUg_gzCWbkhA';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("SUPABASE CONFIG ERROR: Missing URL or Anon Key.");
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const uploadFile = async (bucket: string, path: string, file: File) => {
  if (!supabase) throw new Error("Database connection not established.");
  
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
};

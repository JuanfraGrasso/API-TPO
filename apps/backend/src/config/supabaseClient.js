import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

let supabaseClient = null;

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseKey = env.supabaseServiceRoleKey || env.supabaseAnonKey;

  if (!env.supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase credentials are missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY)."
    );
  }

  supabaseClient = createClient(env.supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return supabaseClient;
}

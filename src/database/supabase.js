import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY } from "@env";

const supabaseUrl = "https://nlnrghdlevppfejhgryb.supabase.co";
const supabaseKey = SUPABASE_KEY;

// Create Supabase client with specific options
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      "x-application-name": "ListarPro",
    },
  },
});

export { supabase };

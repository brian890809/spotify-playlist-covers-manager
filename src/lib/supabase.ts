import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with the service role key for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Create a Supabase client for client-side operations (if needed later)
export const createBrowserClient = () => {
  // Use the same service role key for now since we don't have a separate anon key
  return createClient(supabaseUrl, supabaseServiceRoleKey);
};
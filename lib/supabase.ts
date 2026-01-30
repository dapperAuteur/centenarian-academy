import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Standard client for use in Client Components.
 * Respects Row Level Security (RLS) based on the user's active session.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Admin client for use in Server Actions and Edge Functions.
 * This client uses the Service Role Key to bypass RLS.
 * CRITICAL: NEVER use this in client-side code.
 */
export const getAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!serviceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
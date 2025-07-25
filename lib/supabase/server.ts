import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Server-side client for API routes
export const createServerSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Named export for compatibility
export const supabase = supabaseAdmin

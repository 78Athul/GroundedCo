import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Server-side client using service role key — bypasses RLS.
// Only use in API routes (Route Handlers) and Server Components.
export function createServerClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Anon client for server components that should respect RLS
// 4-second fetch timeout prevents hanging on slow/unreachable connections
export function createAnonServerClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: (url, options = {}) =>
          fetch(url, { ...options, signal: AbortSignal.timeout(4000) }),
      },
    }
  )
}

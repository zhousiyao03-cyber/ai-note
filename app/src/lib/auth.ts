import { createClient } from '@/lib/supabase/client'

export function getSupabaseClient() {
  return createClient()
}

export async function isAuthenticated(): Promise<boolean> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

// Synchronous check for SSR hydration guard — checks cookie presence
export function isAuthenticatedSync(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.includes('sb-')
}

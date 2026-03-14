import { envelope, errorResponse } from '@/lib/api-helpers'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      return errorResponse('AUTH_ERROR', error.message, 500)
    }

    return envelope(null)
  } catch {
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500)
  }
}

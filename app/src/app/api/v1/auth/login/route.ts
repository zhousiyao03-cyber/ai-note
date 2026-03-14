import { NextRequest } from 'next/server'
import { envelope, errorResponse, toCamelCase } from '@/lib/api-helpers'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return errorResponse('VALIDATION_ERROR', 'Email and password are required', 400)
    }

    const supabase = await createClient()

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      return errorResponse('INVALID_CREDENTIALS', 'Invalid email or password', 401)
    }

    if (!authData.user) {
      return errorResponse('AUTH_ERROR', 'Login failed', 500)
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      return envelope({ id: authData.user.id, email })
    }

    return envelope(toCamelCase(profile))
  } catch {
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500)
  }
}

import { NextRequest } from 'next/server'
import { envelope, errorResponse, toCamelCase } from '@/lib/api-helpers'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return errorResponse('VALIDATION_ERROR', 'Name, email, and password are required', 400)
    }

    const supabase = await createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

    if (authError) {
      if (authError.message.toLowerCase().includes('already registered')) {
        return errorResponse('USER_EXISTS', 'A user with this email already exists', 409)
      }
      return errorResponse('AUTH_ERROR', authError.message, 400)
    }

    if (!authData.user) {
      return errorResponse('AUTH_ERROR', 'Registration failed', 500)
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      return envelope({ id: authData.user.id, email, name })
    }

    return envelope(toCamelCase(profile))
  } catch {
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500)
  }
}

import { NextRequest } from 'next/server'
import { envelope, errorResponse } from '@/lib/api-helpers'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return errorResponse('VALIDATION_ERROR', 'Email is required', 400)
    }

    const supabase = await createClient()

    // Always return success to avoid leaking whether the email exists
    await supabase.auth.resetPasswordForEmail(email)

    return envelope({ message: 'If an account exists, a reset link has been sent' })
  } catch {
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500)
  }
}

import { NextRequest } from 'next/server'
import { envelope, errorResponse, requireAuth } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth(request)

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401)
    }

    const { password } = await request.json()

    if (!password) {
      return errorResponse('VALIDATION_ERROR', 'Password is required', 400)
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      return errorResponse('AUTH_ERROR', error.message, 400)
    }

    return envelope({ message: 'Password updated successfully' })
  } catch {
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500)
  }
}

import { NextRequest } from 'next/server'
import { envelope, errorResponse, requireAuth } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth(request)

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401)
    }

    const { oldPassword, newPassword } = await request.json()

    if (!oldPassword || !newPassword) {
      return errorResponse('VALIDATION_ERROR', 'Old password and new password are required', 400)
    }

    // Verify old password by attempting sign-in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: oldPassword,
    })

    if (verifyError) {
      return errorResponse('INVALID_CREDENTIALS', 'Current password is incorrect', 401)
    }

    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      return errorResponse('AUTH_ERROR', updateError.message, 400)
    }

    return envelope({ message: 'Password changed successfully' })
  } catch {
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500)
  }
}

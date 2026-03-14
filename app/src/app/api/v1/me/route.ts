import { type NextRequest } from 'next/server'
import { envelope, errorResponse, requireAuth, toCamelCase } from '@/lib/api-helpers'

export async function GET(_request: NextRequest) {
  const { user, supabase } = await requireAuth()
  if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401)

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return errorResponse('NOT_FOUND', 'Profile not found', 404)

  return envelope(toCamelCase({ ...profile, email: user.email }))
}

export async function PATCH(request: NextRequest) {
  const { user, supabase } = await requireAuth()
  if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401)

  const body = await request.json()
  const { name, avatar, email } = body as {
    name?: string
    avatar?: string
    email?: string
  }

  // Update profile fields
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (name !== undefined) updates.name = name
  if (avatar !== undefined) updates.avatar_url = avatar

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select('*')
    .single()

  if (error) return errorResponse('UPDATE_FAILED', error.message, 500)

  // Update auth email if provided
  if (email) {
    const { error: authError } = await supabase.auth.updateUser({ email })
    if (authError) return errorResponse('EMAIL_UPDATE_FAILED', authError.message, 500)
  }

  return envelope(toCamelCase({ ...profile, email: email ?? user.email }))
}

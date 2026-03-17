import { envelope, errorResponse, requireAuth, toCamelCase } from '@/lib/api-helpers'

type PreferenceRow = {
  user_id: string
  email_notifications: boolean
  auto_transcribe: boolean
  speaker_detection: boolean
  language: string
  theme: string
}

function toPreferencePayload(row: PreferenceRow) {
  const payload = toCamelCase(row)

  delete payload.userId

  return payload
}

export async function GET() {
  const { user, supabase } = await requireAuth()
  if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401)

  let { data, error } = await supabase
    .from('user_preferences')
    .select('user_id, email_notifications, auto_transcribe, speaker_detection, language, theme')
    .eq('user_id', user.id)
    .single<PreferenceRow>()

  if (error || !data) {
    const created = await supabase
      .from('user_preferences')
      .upsert({ user_id: user.id }, { onConflict: 'user_id' })
      .select('user_id, email_notifications, auto_transcribe, speaker_detection, language, theme')
      .single<PreferenceRow>()

    data = created.data
    error = created.error
  }

  if (error || !data) {
    return errorResponse('NOT_FOUND', 'Preferences not found', 404)
  }

  return envelope(toPreferencePayload(data))
}

export async function PATCH(request: Request) {
  const { user, supabase } = await requireAuth()
  if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401)

  const body = await request.json()
  const updates: Record<string, unknown> = {}

  if (typeof body.emailNotifications === 'boolean') updates.email_notifications = body.emailNotifications
  if (typeof body.autoTranscribe === 'boolean') updates.auto_transcribe = body.autoTranscribe
  if (typeof body.speakerDetection === 'boolean') updates.speaker_detection = body.speakerDetection
  if (typeof body.language === 'string' && body.language) updates.language = body.language
  if (typeof body.theme === 'string' && body.theme) updates.theme = body.theme

  if (Object.keys(updates).length === 0) {
    return errorResponse('BAD_REQUEST', 'No preference updates provided', 400)
  }

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({ user_id: user.id, ...updates }, { onConflict: 'user_id' })
    .select('user_id, email_notifications, auto_transcribe, speaker_detection, language, theme')
    .single<PreferenceRow>()

  if (error || !data) {
    return errorResponse('UPDATE_FAILED', error?.message ?? 'Failed to update preferences', 500)
  }

  return envelope(toPreferencePayload(data))
}

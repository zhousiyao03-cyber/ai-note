import { type NextRequest } from 'next/server'
import { envelope, errorResponse, requireAuth, toCamelCase } from '@/lib/api-helpers'
import { inngest } from '@/lib/inngest'

type Params = { params: Promise<{ fileId: string }> }

type FileRow = {
  id: string
  user_id: string
  storage_key: string
  language: string | null
  status: 'pending' | 'transcribing' | 'completed' | 'failed'
  progress: number
  error_message: string | null
}

export async function POST(request: NextRequest, { params }: Params) {
  const { fileId } = await params
  const { user, supabase } = await requireAuth()
  if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401)

  const body = await request.json().catch(() => ({}))
  const requestedLanguage = typeof body.language === 'string' ? body.language : null
  const requestedSpeakerDetection = typeof body.speakerDetection === 'boolean'
    ? body.speakerDetection
    : typeof body.speaker_detection === 'boolean'
      ? body.speaker_detection
      : null

  const { data: file, error: fileError } = await supabase
    .from('files')
    .select('id, user_id, storage_key, language, status, progress, error_message')
    .eq('id', fileId)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single<FileRow>()

  if (fileError || !file) {
    return errorResponse('NOT_FOUND', 'File not found', 404)
  }

  if (!file.storage_key) {
    return errorResponse('BAD_REQUEST', 'File has not been uploaded yet', 400)
  }

  if (file.status === 'transcribing') {
    return errorResponse('ALREADY_TRANSCRIBING', 'Transcription is already in progress', 409)
  }

  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('language, speaker_detection')
    .eq('user_id', user.id)
    .single<{ language: string | null; speaker_detection: boolean }>()

  const language = requestedLanguage ?? preferences?.language ?? file.language ?? 'auto'
  const speakerDetection = requestedSpeakerDetection ?? preferences?.speaker_detection ?? true

  const { data: updatedFile, error: updateError } = await supabase
    .from('files')
    .update({
      status: 'pending',
      progress: 0,
      error_message: null,
      language: language === 'auto' ? null : language,
    })
    .eq('id', fileId)
    .eq('user_id', user.id)
    .select('id, status, progress, error_message')
    .single()

  if (updateError || !updatedFile) {
    return errorResponse('UPDATE_FAILED', updateError?.message ?? 'Failed to queue transcription', 500)
  }

  await supabase
    .from('transcription_jobs')
    .upsert({
      file_id: fileId,
      provider: process.env.OPENAI_API_KEY ? 'openai' : 'mock',
      status: 'queued',
      progress: 0,
      attempts: 0,
      last_error: null,
      queued_at: new Date().toISOString(),
      started_at: null,
      finished_at: null,
    }, { onConflict: 'file_id' })

  await inngest.send({
    name: 'files/transcription.requested',
    data: {
      fileId,
      userId: user.id,
      language,
      speakerDetection,
    },
  })

  return envelope(toCamelCase({
    file_id: updatedFile.id,
    status: updatedFile.status,
    progress: updatedFile.progress,
    error_message: updatedFile.error_message,
  }))
}

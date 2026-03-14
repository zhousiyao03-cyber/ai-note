import { type NextRequest } from 'next/server'
import { createSignedAudioDownloadUrl, verifyAudioObject } from '@/lib/audio-storage'
import { envelope, errorResponse, requireAuth, toCamelCase } from '@/lib/api-helpers'
import { inngest } from '@/lib/inngest'

type FileRow = {
  id: string
  user_id: string
  name: string
  storage_key: string
  audio_url: string | null
  mime_type: string | null
  language: string | null
  duration_sec: number | null
  size_bytes: number
  status: 'pending' | 'transcribing' | 'completed' | 'failed'
  progress: number
  error_message: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export async function POST(request: NextRequest) {
  const { user, supabase } = await requireAuth()
  if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401)

  const body = await request.json()
  const fileId = typeof body.fileId === 'string'
    ? body.fileId
    : typeof body.file_id === 'string'
      ? body.file_id
      : ''

  if (!fileId) {
    return errorResponse('BAD_REQUEST', 'fileId is required', 400)
  }

  const { data: file, error: fileError } = await supabase
    .from('files')
    .select('*')
    .eq('id', fileId)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single<FileRow>()

  if (fileError || !file) {
    return errorResponse('NOT_FOUND', 'File not found', 404)
  }

  let signedUrl: string
  try {
    signedUrl = await verifyAudioObject(file.storage_key)
  } catch (error) {
    return errorResponse(
      'UPLOAD_NOT_FOUND',
      error instanceof Error ? error.message : 'Uploaded object was not found',
      400,
    )
  }

  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('auto_transcribe, language, speaker_detection')
    .eq('user_id', user.id)
    .single<{
      auto_transcribe: boolean
      language: string | null
      speaker_detection: boolean
    }>()

  const { data: updatedFile, error: updateError } = await supabase
    .from('files')
    .update({
      audio_url: signedUrl,
      error_message: null,
      progress: 0,
      status: 'pending',
    })
    .eq('id', fileId)
    .eq('user_id', user.id)
    .select('*')
    .single<FileRow>()

  if (updateError || !updatedFile) {
    return errorResponse('UPDATE_FILE_FAILED', updateError?.message ?? 'Failed to update file', 500)
  }

  if (preferences?.auto_transcribe !== false) {
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
        language: preferences?.language ?? updatedFile.language ?? 'auto',
        speakerDetection: preferences?.speaker_detection ?? true,
      },
    })
  }

  const freshSignedUrl = await createSignedAudioDownloadUrl(updatedFile.storage_key)

  return envelope(toCamelCase({
    ...updatedFile,
    audio_url: freshSignedUrl,
    tags: [],
  }))
}

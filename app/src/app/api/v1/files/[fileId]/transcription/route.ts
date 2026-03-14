import { type NextRequest } from 'next/server'
import { envelope, errorResponse, requireAuth, toCamelCase, transformRows } from '@/lib/api-helpers'

type Params = { params: Promise<{ fileId: string }> }

type TranscriptionRow = {
  id: string
  file_id: string
  content_html: string
  summary: string
  language: string | null
  created_at: string
  updated_at: string
}

async function getOwnedFileId(fileId: string, userId: string, supabase: Awaited<ReturnType<typeof requireAuth>>['supabase']) {
  const { data: file, error } = await supabase
    .from('files')
    .select('id')
    .eq('id', fileId)
    .eq('user_id', userId)
    .single<{ id: string }>()

  if (error || !file) return null
  return file.id
}

async function loadTranscriptionPayload(fileId: string, supabase: Awaited<ReturnType<typeof requireAuth>>['supabase']) {
  const { data: transcription, error } = await supabase
    .from('transcriptions')
    .select('*')
    .eq('file_id', fileId)
    .single<TranscriptionRow>()

  if (error || !transcription) return null

  const [{ data: speakers }, { data: segments }] = await Promise.all([
    supabase
      .from('speakers')
      .select('*')
      .eq('transcription_id', transcription.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('transcription_segments')
      .select('*')
      .eq('transcription_id', transcription.id)
      .order('sequence', { ascending: true }),
  ])

  return toCamelCase({
    ...transcription,
    speakers: transformRows((speakers ?? []) as Record<string, unknown>[]),
    segments: transformRows((segments ?? []) as Record<string, unknown>[]),
  })
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { fileId } = await params
  const { user, supabase } = await requireAuth()
  if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401)

  const ownedFileId = await getOwnedFileId(fileId, user.id, supabase)
  if (!ownedFileId) return errorResponse('NOT_FOUND', 'File not found', 404)

  const payload = await loadTranscriptionPayload(ownedFileId, supabase)
  if (!payload) return errorResponse('NOT_FOUND', 'Transcription not found', 404)

  return envelope(payload)
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { fileId } = await params
  const { user, supabase } = await requireAuth()
  if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401)

  const ownedFileId = await getOwnedFileId(fileId, user.id, supabase)
  if (!ownedFileId) return errorResponse('NOT_FOUND', 'File not found', 404)

  const body = await request.json()
  const content = typeof body.content === 'string' ? body.content : ''

  const { error: upsertError } = await supabase
    .from('transcriptions')
    .upsert({
      file_id: ownedFileId,
      content_html: content,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'file_id' })

  if (upsertError) {
    return errorResponse('SAVE_FAILED', upsertError.message, 500)
  }

  const payload = await loadTranscriptionPayload(ownedFileId, supabase)
  if (!payload) return errorResponse('NOT_FOUND', 'Transcription not found', 404)

  return envelope(payload)
}

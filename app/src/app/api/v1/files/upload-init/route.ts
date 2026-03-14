import { type NextRequest } from 'next/server'
import { buildStorageKey, createSignedAudioUploadUrl, sanitizeFileName } from '@/lib/audio-storage'
import { envelope, errorResponse, requireAuth } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  const { user, supabase } = await requireAuth()
  if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401)

  const body = await request.json()
  const fileName = typeof body.fileName === 'string'
    ? body.fileName
    : typeof body.filename === 'string'
      ? body.filename
      : ''
  const mimeType = typeof body.mimeType === 'string'
    ? body.mimeType
    : typeof body.mime_type === 'string'
      ? body.mime_type
      : ''
  const sizeBytesRaw = body.sizeBytes ?? body.size_bytes
  const sizeBytes = Number(sizeBytesRaw)

  if (!fileName) {
    return errorResponse('BAD_REQUEST', 'fileName is required', 400)
  }

  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return errorResponse('BAD_REQUEST', 'sizeBytes must be a positive number', 400)
  }

  const normalizedFileName = sanitizeFileName(fileName)
  const storageKey = buildStorageKey(user.id, normalizedFileName)

  const { data: file, error: insertError } = await supabase
    .from('files')
    .insert({
      user_id: user.id,
      name: normalizedFileName,
      storage_key: storageKey,
      mime_type: mimeType || null,
      size_bytes: sizeBytes,
      status: 'pending',
      progress: 0,
      audio_url: '',
      error_message: null,
    })
    .select('id')
    .single()

  if (insertError || !file) {
    return errorResponse('CREATE_FILE_FAILED', insertError?.message ?? 'Failed to create file', 500)
  }

  try {
    const upload = await createSignedAudioUploadUrl(storageKey)
    return envelope({
      fileId: file.id,
      url: upload.signedUrl,
      path: upload.path,
      token: upload.token,
    })
  } catch (error) {
    await supabase.from('files').delete().eq('id', file.id).eq('user_id', user.id)

    return errorResponse(
      'CREATE_UPLOAD_URL_FAILED',
      error instanceof Error ? error.message : 'Failed to create upload URL',
      500,
    )
  }
}

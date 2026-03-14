import { createAdminClient } from '@/lib/supabase/admin'

export const AUDIO_BUCKET = 'audio-files'
const DEFAULT_SIGNED_URL_TTL_SECONDS = 60 * 60

export function sanitizeFileName(fileName: string) {
  const sanitized = fileName
    .trim()
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, ' ')
    .slice(0, 120)

  return sanitized || 'audio-file'
}

export function buildStorageKey(userId: string, fileName: string) {
  const safeFileName = sanitizeFileName(fileName).replace(/\s+/g, '-')
  return `${userId}/${crypto.randomUUID()}-${safeFileName}`
}

function toAbsoluteStorageUrl(pathOrUrl: string) {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl
  return new URL(pathOrUrl, process.env.NEXT_PUBLIC_SUPABASE_URL).toString()
}

export async function createSignedAudioUploadUrl(storageKey: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from(AUDIO_BUCKET)
    .createSignedUploadUrl(storageKey)

  if (error) throw new Error(error.message)

  const signedUrl = (data as { signedUrl?: string } | null)?.signedUrl
  if (!signedUrl) throw new Error('Supabase did not return an upload URL')

  return {
    signedUrl: toAbsoluteStorageUrl(signedUrl),
    token: (data as { token?: string } | null)?.token ?? null,
    path: (data as { path?: string } | null)?.path ?? storageKey,
  }
}

export async function createSignedAudioDownloadUrl(
  storageKey: string,
  expiresIn = DEFAULT_SIGNED_URL_TTL_SECONDS,
) {
  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from(AUDIO_BUCKET)
    .createSignedUrl(storageKey, expiresIn)

  if (error) throw new Error(error.message)

  const signedUrl = (data as { signedUrl?: string } | null)?.signedUrl
  if (!signedUrl) throw new Error('Supabase did not return a download URL')

  return toAbsoluteStorageUrl(signedUrl)
}

export async function verifyAudioObject(storageKey: string) {
  const signedUrl = await createSignedAudioDownloadUrl(storageKey, 60)
  const response = await fetch(signedUrl, {
    method: 'HEAD',
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Uploaded object was not found (${response.status})`)
  }

  return signedUrl
}

import { type NextRequest } from 'next/server'
import { envelope, errorResponse, requireAuth, toCamelCase } from '@/lib/api-helpers'

type Params = { params: Promise<{ fileId: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  const { fileId } = await params
  const { user, supabase } = await requireAuth()
  if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401)

  const { data: file, error } = await supabase
    .from('files')
    .select('id, status, progress, error_message')
    .eq('id', fileId)
    .eq('user_id', user.id)
    .single()

  if (error || !file) {
    return errorResponse('NOT_FOUND', 'File not found', 404)
  }

  return envelope(toCamelCase({
    file_id: file.id,
    status: file.status,
    progress: file.progress,
    error_message: file.error_message,
  }))
}

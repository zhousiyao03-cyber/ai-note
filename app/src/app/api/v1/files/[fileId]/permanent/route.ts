import { type NextRequest } from 'next/server'
import { envelope, errorResponse, requireAuth } from '@/lib/api-helpers'

type Params = { params: Promise<{ fileId: string }> }

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { fileId } = await params
  const { user, supabase } = await requireAuth()
  if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401)

  // Fetch file to get storage_key and verify ownership
  const { data: file, error: findError } = await supabase
    .from('files')
    .select('*')
    .eq('id', fileId)
    .eq('user_id', user.id)
    .single()

  if (findError || !file) {
    return errorResponse('NOT_FOUND', 'File not found', 404)
  }

  // Delete from Supabase Storage
  if (file.storage_key) {
    const { error: storageError } = await supabase.storage
      .from('audio-files')
      .remove([file.storage_key])

    if (storageError) {
      return errorResponse('STORAGE_DELETE_FAILED', storageError.message, 500)
    }
  }

  // Hard delete the file row (cascading should handle file_tags)
  const { error: deleteError } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId)
    .eq('user_id', user.id)

  if (deleteError) {
    return errorResponse('DELETE_FAILED', deleteError.message, 500)
  }

  return envelope({ id: fileId, deleted: true })
}

import { type NextRequest } from 'next/server'
import { envelope, errorResponse, requireAuth, toCamelCase } from '@/lib/api-helpers'

type Params = { params: Promise<{ fileId: string }> }

export async function POST(_request: NextRequest, { params }: Params) {
  const { fileId } = await params
  const { user, supabase } = await requireAuth()
  if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401)

  // Verify file exists and is soft-deleted
  const { data: existing, error: findError } = await supabase
    .from('files')
    .select('*')
    .eq('id', fileId)
    .eq('user_id', user.id)
    .not('deleted_at', 'is', null)
    .single()

  if (findError || !existing) {
    return errorResponse('NOT_FOUND', 'Deleted file not found', 404)
  }

  const { data: file, error } = await supabase
    .from('files')
    .update({ deleted_at: null, updated_at: new Date().toISOString() })
    .eq('id', fileId)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error || !file) return errorResponse('RESTORE_FAILED', 'Failed to restore file', 500)

  return envelope(toCamelCase(file))
}

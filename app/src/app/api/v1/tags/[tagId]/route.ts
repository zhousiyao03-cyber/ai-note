import { type NextRequest } from 'next/server'
import { envelope, errorResponse, requireAuth } from '@/lib/api-helpers'

type Params = { params: Promise<{ tagId: string }> }

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { tagId } = await params
  const { user, supabase } = await requireAuth()
  if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401)

  // Verify ownership
  const { data: tag, error: findError } = await supabase
    .from('tags')
    .select('id')
    .eq('id', tagId)
    .eq('user_id', user.id)
    .single()

  if (findError || !tag) {
    return errorResponse('NOT_FOUND', 'Tag not found', 404)
  }

  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', tagId)
    .eq('user_id', user.id)

  if (error) return errorResponse('DELETE_FAILED', error.message, 500)

  return envelope({ id: tagId, deleted: true })
}

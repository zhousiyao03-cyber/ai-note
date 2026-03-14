import { type NextRequest } from 'next/server'
import { envelope, errorResponse, requireAuth } from '@/lib/api-helpers'

type Params = { params: Promise<{ fileId: string; tagId: string }> }

async function verifyFileOwnership(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  userId: string,
  fileId: string,
) {
  const { data, error } = await supabase
    .from('files')
    .select('id')
    .eq('id', fileId)
    .eq('user_id', userId)
    .single()

  return { owned: !!data && !error }
}

export async function POST(_request: NextRequest, { params }: Params) {
  const { fileId, tagId } = await params
  const { user, supabase } = await requireAuth()
  if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401)

  const { owned } = await verifyFileOwnership(supabase, user.id, fileId)
  if (!owned) return errorResponse('NOT_FOUND', 'File not found', 404)

  const { error } = await supabase
    .from('file_tags')
    .insert({ file_id: fileId, tag_id: tagId })

  if (error) return errorResponse('CREATE_FAILED', error.message, 500)

  return envelope({ fileId, tagId })
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { fileId, tagId } = await params
  const { user, supabase } = await requireAuth()
  if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401)

  const { owned } = await verifyFileOwnership(supabase, user.id, fileId)
  if (!owned) return errorResponse('NOT_FOUND', 'File not found', 404)

  const { error } = await supabase
    .from('file_tags')
    .delete()
    .eq('file_id', fileId)
    .eq('tag_id', tagId)

  if (error) return errorResponse('DELETE_FAILED', error.message, 500)

  return envelope({ fileId, tagId, deleted: true })
}

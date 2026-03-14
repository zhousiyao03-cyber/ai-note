import { type NextRequest } from 'next/server'
import { envelope, errorResponse, requireAuth, toCamelCase } from '@/lib/api-helpers'

type Params = { params: Promise<{ fileId: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  const { fileId } = await params
  const { user, supabase } = await requireAuth()
  if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401)

  const { data: file, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', fileId)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single()

  if (error || !file) return errorResponse('NOT_FOUND', 'File not found', 404)

  const { data: ftRows } = await supabase
    .from('file_tags')
    .select('tag_id')
    .eq('file_id', fileId)

  const tags = (ftRows ?? []).map((r: { tag_id: string }) => r.tag_id)

  return envelope(toCamelCase({ ...file, tags }))
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { fileId } = await params
  const { user, supabase } = await requireAuth()
  if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401)

  const body = await request.json()
  const { name } = body as { name?: string }

  if (!name) return errorResponse('BAD_REQUEST', 'Name is required', 400)

  const { data: file, error } = await supabase
    .from('files')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', fileId)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .select('*')
    .single()

  if (error || !file) return errorResponse('NOT_FOUND', 'File not found', 404)

  const { data: ftRows } = await supabase
    .from('file_tags')
    .select('tag_id')
    .eq('file_id', fileId)

  const tags = (ftRows ?? []).map((r: { tag_id: string }) => r.tag_id)

  return envelope(toCamelCase({ ...file, tags }))
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { fileId } = await params
  const { user, supabase } = await requireAuth()
  if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401)

  const { data: file, error } = await supabase
    .from('files')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', fileId)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .select('*')
    .single()

  if (error || !file) return errorResponse('NOT_FOUND', 'File not found', 404)

  return envelope(toCamelCase(file))
}

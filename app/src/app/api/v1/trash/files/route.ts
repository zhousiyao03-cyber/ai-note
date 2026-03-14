import { envelope, errorResponse, requireAuth, transformRows } from '@/lib/api-helpers'

export async function GET() {
  const { user, supabase } = await requireAuth()
  if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401)

  const { data: files, error } = await supabase
    .from('files')
    .select('*')
    .eq('user_id', user.id)
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false })

  if (error) return errorResponse('QUERY_FAILED', error.message, 500)

  return envelope(transformRows(files ?? []))
}

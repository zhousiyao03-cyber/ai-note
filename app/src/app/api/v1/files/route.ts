import { type NextRequest } from 'next/server'
import { envelope, errorResponse, requireAuth, transformRows } from '@/lib/api-helpers'

const SORT_FIELD_MAP: Record<string, string> = {
  name: 'name',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  duration: 'duration_sec',
  size: 'size_bytes',
  status: 'status',
}

export async function GET(request: NextRequest) {
  const { user, supabase } = await requireAuth()
  if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401)

  const url = request.nextUrl
  const search = url.searchParams.get('search')
  const status = url.searchParams.get('status')
  const sortBy = url.searchParams.get('sortBy') ?? 'createdAt'
  const sortOrder = url.searchParams.get('sortOrder') ?? 'desc'
  const skip = parseInt(url.searchParams.get('skip') ?? '0', 10)
  const limit = parseInt(url.searchParams.get('limit') ?? '50', 10)
  const tags = url.searchParams.get('tags')

  let fileIds: string[] | null = null

  // If tags filter, get matching file IDs from file_tags
  if (tags) {
    const tagIds = tags.split(',').map((t) => t.trim()).filter(Boolean)
    const { data: tagRows, error: tagError } = await supabase
      .from('file_tags')
      .select('file_id')
      .in('tag_id', tagIds)

    if (tagError) return errorResponse('QUERY_FAILED', tagError.message, 500)
    fileIds = [...new Set((tagRows ?? []).map((r: { file_id: string }) => r.file_id))]
    if (fileIds.length === 0) {
      return envelope([], { total: 0, hasMore: false })
    }
  }

  // Build query
  let query = supabase
    .from('files')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (search) query = query.ilike('name', `%${search}%`)
  if (status) query = query.eq('status', status)
  if (fileIds) query = query.in('id', fileIds)

  const dbSortField = SORT_FIELD_MAP[sortBy] ?? 'created_at'
  query = query.order(dbSortField, { ascending: sortOrder === 'asc' })
  query = query.range(skip, skip + limit - 1)

  const { data: files, count, error } = await query

  if (error) return errorResponse('QUERY_FAILED', error.message, 500)

  // Fetch tag IDs for returned files
  const ids = (files ?? []).map((f: { id: string }) => f.id)
  let fileTagMap: Record<string, string[]> = {}

  if (ids.length > 0) {
    const { data: ftRows } = await supabase
      .from('file_tags')
      .select('file_id, tag_id')
      .in('file_id', ids)

    for (const row of ftRows ?? []) {
      const r = row as { file_id: string; tag_id: string }
      if (!fileTagMap[r.file_id]) fileTagMap[r.file_id] = []
      fileTagMap[r.file_id].push(r.tag_id)
    }
  }

  const enriched = (files ?? []).map((f: Record<string, unknown>) => ({
    ...f,
    tags: fileTagMap[(f as { id: string }).id] ?? [],
  }))

  const total = count ?? 0
  return envelope(transformRows(enriched), { total, hasMore: skip + limit < total })
}

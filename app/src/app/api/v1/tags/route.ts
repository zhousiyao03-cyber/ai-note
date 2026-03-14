import { envelope, errorResponse, requireAuth, toCamelCase, transformRows } from '@/lib/api-helpers'

export async function GET() {
  const { user, supabase } = await requireAuth()
  if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401)

  const { data: tags, error } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return errorResponse('QUERY_FAILED', error.message, 500)

  return envelope(transformRows(tags ?? []))
}

export async function POST(request: Request) {
  const { user, supabase } = await requireAuth()
  if (!user) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401)

  const body = await request.json()
  const { name, color } = body as { name?: string; color?: string }

  if (!name) return errorResponse('BAD_REQUEST', 'Name is required', 400)

  const { data: tag, error } = await supabase
    .from('tags')
    .insert({ name, color: color ?? null, user_id: user.id })
    .select('*')
    .single()

  if (error) return errorResponse('CREATE_FAILED', error.message, 500)

  return envelope(toCamelCase(tag))
}

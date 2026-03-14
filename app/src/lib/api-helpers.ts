import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient, User } from '@supabase/supabase-js'

// --- Response helpers ---

export function envelope<T>(data: T, meta: Record<string, unknown> = {}) {
  return NextResponse.json({ data, meta, error: null })
}

export function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json(
    { data: null, meta: {}, error: { code, message } },
    { status },
  )
}

// --- Auth ---

export async function requireAuth(_request?: NextRequest): Promise<{
  user: User | null
  supabase: SupabaseClient
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { user, supabase }
}

// --- DTO transform ---

type SnakeToCamel<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamel<U>>}`
  : S

type CamelToSnake<S extends string> = S extends `${infer T}${infer U}`
  ? T extends Capitalize<T>
    ? `_${Lowercase<T>}${CamelToSnake<U>}`
    : `${T}${CamelToSnake<U>}`
  : S

// Field-level rename map: DB snake → frontend camel
const FIELD_MAP: Record<string, string> = {
  duration_sec: 'duration',
  size_bytes: 'size',
  audio_url: 'url',
  content_html: 'content',
  avatar_url: 'avatar',
  start_time: 'startTime',
  end_time: 'endTime',
  speaker_id: 'speakerId',
  file_id: 'fileId',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
  deleted_at: 'deletedAt',
  user_id: 'userId',
  storage_key: 'storageKey',
  mime_type: 'mimeType',
  error_message: 'errorMessage',
  current_period_end: 'currentPeriodEnd',
  cancel_at_period_end: 'cancelAtPeriodEnd',
}

const REVERSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(FIELD_MAP).map(([k, v]) => [v, k]),
)

function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

function camelToSnake(s: string): string {
  return s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
}

export function toCamelCase<T extends Record<string, unknown>>(
  row: T,
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(row)) {
    const camelKey = FIELD_MAP[key] ?? snakeToCamel(key)
    result[camelKey] = value
  }
  return result
}

export function toSnakeCase(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = REVERSE_MAP[key] ?? camelToSnake(key)
    result[snakeKey] = value
  }
  return result
}

export function transformRows<T extends Record<string, unknown>>(
  rows: T[],
): Record<string, unknown>[] {
  return rows.map(toCamelCase)
}

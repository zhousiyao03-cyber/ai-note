const requiredPublicKeys = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

export function hasSupabaseEnv() {
  return requiredPublicKeys.every((key) => {
    const value = process.env[key]
    return typeof value === 'string' && value.length > 0
  })
}

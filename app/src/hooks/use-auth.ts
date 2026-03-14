'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@/lib/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types'

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async (): Promise<User | null> => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profile) return null

      return {
        id: user.id,
        name: profile.name,
        email: user.email!,
        avatar: profile.avatar_url ?? undefined,
        plan: profile.plan,
        createdAt: profile.created_at,
      }
    },
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      navigate('/')
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({ name, email, password }: { name: string; email: string; password: string }) => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      })
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      if (data.session) {
        navigate('/')
      }
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
    },
    onSuccess: () => {
      queryClient.clear()
      navigate('/login')
    },
  })
}

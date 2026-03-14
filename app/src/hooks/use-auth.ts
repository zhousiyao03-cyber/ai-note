import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { api } from '@/services/api'
import { setToken, removeToken } from '@/lib/auth'

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: api.getCurrentUser,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.login(email, password),
    onSuccess: (data) => {
      setToken(data.token)
      queryClient.setQueryData(['currentUser'], data.user)
      navigate('/')
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      api.register(name, email, password),
    onSuccess: (data) => {
      setToken(data.token)
      queryClient.setQueryData(['currentUser'], data.user)
      navigate('/')
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return () => {
    removeToken()
    queryClient.clear()
    navigate('/login')
  }
}

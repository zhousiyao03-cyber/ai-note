import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { desktopApi } from '../../lib/api/client'

export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: desktopApi.getCurrentUser,
    staleTime: 30_000,
    retry: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: desktopApi.login,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: desktopApi.logout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['session'] })
      queryClient.removeQueries({ queryKey: ['file'] })
      queryClient.removeQueries({ queryKey: ['files'] })
      queryClient.removeQueries({ queryKey: ['transcription'] })
    },
  })
}

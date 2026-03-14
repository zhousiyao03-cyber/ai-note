import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useAppStore } from '@/stores/app-store'

export function useFiles() {
  const searchQuery = useAppStore((s) => s.searchQuery)
  const statusFilter = useAppStore((s) => s.statusFilter)
  const sortBy = useAppStore((s) => s.sortBy)
  const sortOrder = useAppStore((s) => s.sortOrder)

  return useQuery({
    queryKey: ['files', { searchQuery, statusFilter, sortBy, sortOrder }],
    queryFn: () =>
      api.getFiles({
        search: searchQuery || undefined,
        status: statusFilter,
        sortBy,
        sortOrder,
      }),
  })
}

export function useFile(id: string) {
  return useQuery({
    queryKey: ['file', id],
    queryFn: () => api.getFile(id),
    enabled: !!id,
  })
}

export function useTranscription(fileId: string) {
  return useQuery({
    queryKey: ['transcription', fileId],
    queryFn: () => api.getTranscription(fileId),
    enabled: !!fileId,
  })
}

export function useDeleteFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
    },
  })
}

export function useAskAI() {
  return useMutation({
    mutationFn: ({ fileId, question }: { fileId: string; question: string }) =>
      api.askAI(fileId, question),
  })
}

export function useUpdateTranscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ fileId, content }: { fileId: string; content: string }) =>
      api.updateTranscription(fileId, content),
    onSuccess: (_, { fileId }) => {
      queryClient.invalidateQueries({ queryKey: ['transcription', fileId] })
    },
  })
}

export function useRenameFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      api.renameFile(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
      queryClient.invalidateQueries({ queryKey: ['file'] })
    },
  })
}

export function useTrashFiles() {
  return useQuery({
    queryKey: ['trash-files'],
    queryFn: api.getTrashFiles,
  })
}

export function useRestoreFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.restoreFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash-files'] })
      queryClient.invalidateQueries({ queryKey: ['files'] })
    },
  })
}

export function usePermanentDeleteFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.permanentDeleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash-files'] })
    },
  })
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: api.getTags,
  })
}

export function useCreateTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ name, color }: { name: string; color: string }) =>
      api.createTag(name, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })
}

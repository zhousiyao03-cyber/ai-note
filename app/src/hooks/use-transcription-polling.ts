import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'

export function useTranscriptionPolling(fileId: string, isTranscribing: boolean) {
  return useQuery({
    queryKey: ['transcription-progress', fileId],
    queryFn: () => api.getTranscriptionProgress(fileId),
    enabled: isTranscribing,
    refetchInterval: isTranscribing ? 3000 : false,
  })
}

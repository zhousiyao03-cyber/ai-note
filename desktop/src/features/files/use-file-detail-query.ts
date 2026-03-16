import { useQuery } from '@tanstack/react-query'

import { desktopApi } from '../../lib/api/client'

export function useFileDetailQuery(fileId: string) {
  return useQuery({
    queryKey: ['file', fileId],
    queryFn: () => desktopApi.getFile(fileId),
    enabled: Boolean(fileId),
    refetchInterval: (query) => {
      const file = query.state.data
      return file?.status === 'transcribing' || file?.status === 'pending' ? 5000 : false
    },
  })
}

export function useTranscriptionQuery(fileId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['transcription', fileId],
    queryFn: () => desktopApi.getTranscription(fileId),
    enabled: Boolean(fileId) && enabled,
  })
}

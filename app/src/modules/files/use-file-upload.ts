import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import type { UploadProgress } from '@/types'

const ACCEPTED_FORMATS = ['audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/flac', 'audio/webm', 'audio/x-m4a']
const ACCEPTED_EXTENSIONS = ['.wav', '.mp3', '.m4a', '.ogg', '.flac', '.webm']

export function isValidAudioFile(file: File): boolean {
  if (ACCEPTED_FORMATS.includes(file.type)) return true
  return ACCEPTED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))
}

export function useFileUpload() {
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const queryClient = useQueryClient()

  const uploadFile = useCallback(async (file: File) => {
    const fileId = crypto.randomUUID()
    const progress: UploadProgress = {
      fileId,
      fileName: file.name,
      progress: 0,
      status: 'uploading',
    }

    setUploads((prev) => [...prev, progress])

    try {
      const result = await api.uploadFile(file, (pct) => {
        setUploads((prev) =>
          prev.map((u) =>
            u.fileId === fileId ? { ...u, progress: pct, status: pct === 100 ? 'processing' : 'uploading' } : u
          )
        )
      })

      setUploads((prev) =>
        prev.map((u) =>
          u.fileId === fileId ? { ...u, progress: 100, status: 'completed' } : u
        )
      )

      queryClient.invalidateQueries({ queryKey: ['files'] })
      return result
    } catch {
      setUploads((prev) =>
        prev.map((u) =>
          u.fileId === fileId ? { ...u, status: 'failed' } : u
        )
      )
    }
  }, [queryClient])

  const clearCompleted = useCallback(() => {
    setUploads((prev) => prev.filter((u) => u.status !== 'completed' && u.status !== 'failed'))
  }, [])

  return { uploads, uploadFile, clearCompleted }
}

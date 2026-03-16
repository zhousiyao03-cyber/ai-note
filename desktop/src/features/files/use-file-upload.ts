import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import type { UploadProgress } from '@plaud/shared-types'

import { desktopApi } from '../../lib/api/client'
import { notifyUploadCompleted } from '../../lib/notifications'

export function useFileUpload() {
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const queryClient = useQueryClient()

  async function uploadFile(file: File) {
    const fileId = crypto.randomUUID()
    setUploads((current) => [
      ...current,
      {
        fileId,
        fileName: file.name,
        progress: 0,
        status: 'uploading',
      },
    ])

    try {
      const createdFile = await desktopApi.uploadFile(file, (progress) => {
        setUploads((current) =>
          current.map((upload) =>
            upload.fileId === fileId
              ? {
                  ...upload,
                  progress,
                  status: progress === 100 ? 'processing' : 'uploading',
                }
              : upload,
          ),
        )
      })

      setUploads((current) =>
        current.map((upload) =>
          upload.fileId === fileId ? { ...upload, progress: 100, status: 'completed' } : upload,
        ),
      )

      await queryClient.invalidateQueries({ queryKey: ['files'] })
      await notifyUploadCompleted(file.name)
      return createdFile
    } catch (error) {
      setUploads((current) =>
        current.map((upload) =>
          upload.fileId === fileId ? { ...upload, status: 'failed' } : upload,
        ),
      )
      throw error
    }
  }

  function clearFinishedUploads() {
    setUploads((current) =>
      current.filter((upload) => upload.status === 'uploading' || upload.status === 'processing'),
    )
  }

  return {
    uploads,
    uploadFile,
    clearFinishedUploads,
  }
}

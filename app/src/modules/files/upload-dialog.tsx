import { useState, useCallback, useRef } from 'react'
import { Upload, FileAudio, CheckCircle2, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useFileUpload, isValidAudioFile } from './use-file-upload'

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploads, uploadFile, clearCompleted } = useFileUpload()
  const { t } = useTranslation()

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return
      setError(null)

      for (const file of Array.from(files)) {
        if (!isValidAudioFile(file)) {
          setError(t('upload.invalidFormat', { fileName: file.name }))
          continue
        }
        uploadFile(file)
      }
    },
    [t, uploadFile],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  const hasActiveUploads = uploads.some((upload) => upload.status === 'uploading' || upload.status === 'processing')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('upload.title')}</DialogTitle>
        </DialogHeader>

        <div
          className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">{t('upload.dragDrop')}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('upload.formats')}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => fileInputRef.current?.click()}
          >
            {t('upload.browse')}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".wav,.mp3,.m4a,.ogg,.flac,.webm,audio/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {uploads.length > 0 && (
          <div className="max-h-48 space-y-2 overflow-auto">
            {uploads.map((upload) => (
              <div key={upload.fileId} className="flex items-center gap-3 text-sm">
                {upload.status === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                ) : upload.status === 'failed' ? (
                  <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                ) : (
                  <FileAudio className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate">{upload.fileName}</p>
                  {(upload.status === 'uploading' || upload.status === 'processing') && (
                    <Progress value={upload.progress} className="mt-1 h-1.5" />
                  )}
                </div>
              </div>
            ))}
            {!hasActiveUploads && (
              <Button variant="ghost" size="sm" onClick={clearCompleted} className="w-full">
                {t('upload.clear')}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

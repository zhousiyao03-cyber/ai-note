import { useState, useCallback, useRef } from 'react'
import { Upload, FileAudio, CheckCircle2, AlertCircle } from 'lucide-react'
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

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return
      setError(null)

      for (const file of Array.from(files)) {
        if (!isValidAudioFile(file)) {
          setError(`"${file.name}" is not a supported format. Use WAV, MP3, M4A, OGG, FLAC, or WebM.`)
          continue
        }
        uploadFile(file)
      }
    },
    [uploadFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const hasActiveUploads = uploads.some((u) => u.status === 'uploading' || u.status === 'processing')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Audio Files</DialogTitle>
        </DialogHeader>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
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
          <p className="text-sm font-medium">Drag & drop audio files here</p>
          <p className="mt-1 text-xs text-muted-foreground">
            WAV, MP3, M4A, OGG, FLAC, WebM
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => fileInputRef.current?.click()}
          >
            Browse Files
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
          <div className="space-y-2 max-h-48 overflow-auto">
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
                Clear
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

import { FileAudio, RotateCcw, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTrashFiles, useRestoreFile, usePermanentDeleteFile } from '@/hooks/use-queries'

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function TrashList() {
  const { data: files, isLoading } = useTrashFiles()
  const restoreFile = useRestoreFile()
  const permanentDelete = usePermanentDeleteFile()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!files?.length) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <Trash2 className="mx-auto mb-4 h-12 w-12" />
        <p>Trash is empty</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors"
        >
          <FileAudio className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatSize(file.size)} · Deleted {file.deletedAt ? new Date(file.deletedAt).toLocaleDateString() : ''}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => restoreFile.mutate(file.id)}
            disabled={restoreFile.isPending}
            title="Restore"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => permanentDelete.mutate(file.id)}
            disabled={permanentDelete.isPending}
            title="Delete permanently"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  )
}

import { useRef, useCallback } from 'react'
import { Link } from '@/lib/navigation'
import { FileAudio, Trash2, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useDeleteFile, useTags } from '@/hooks/use-queries'
import { useInfiniteFiles } from './use-infinite-files'
import { TagBadge } from './tag-badge'

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const statusColor: Record<string, string> = {
  pending: 'text-muted-foreground',
  transcribing: 'text-yellow-600',
  completed: 'text-green-600',
  failed: 'text-destructive',
}

export function FileList() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteFiles()
  const deleteFile = useDeleteFile()
  const { data: tags } = useTags()
  const { t } = useTranslation()

  const tagMap = tags ? Object.fromEntries(tags.map((tg) => [tg.id, tg])) : {}

  // Infinite scroll observer
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastRowRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return
      if (observerRef.current) observerRef.current.disconnect()
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      })
      if (node) observerRef.current.observe(node)
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  )

  const allFiles = data?.pages?.flatMap((p) => p.data) ?? []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!allFiles.length) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <FileAudio className="mx-auto mb-4 h-12 w-12" />
        <p>{t('files.noFiles')}</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {allFiles.map((file, index) => (
        <div
          key={file.id}
          ref={index === allFiles.length - 1 ? lastRowRef : undefined}
          className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors"
        >
          <FileAudio className="h-5 w-5 shrink-0 text-muted-foreground" />
          <Link to={`/detail/${file.id}`} className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground">{file.name}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">
                {formatDuration(file.duration)} · {formatSize(file.size)} ·{' '}
                <span className={statusColor[file.status]}>
                  {t(`status.${file.status}`)}
                </span>
              </span>
              {file.tags?.map((tagId: string) => {
                const tag = tagMap[tagId]
                return tag ? <TagBadge key={tagId} tag={tag} /> : null
              })}
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteFile.mutate(file.id)}
            disabled={deleteFile.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}

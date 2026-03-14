import { useState, useMemo } from 'react'
import { useParams } from 'react-router'
import { ArrowLeft, Loader2, MessageSquare } from 'lucide-react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useFile, useTranscription } from '@/hooks/use-queries'
import { useTranscriptionPolling } from '@/hooks/use-transcription-polling'
import { useAppStore } from '@/stores/app-store'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { ShortcutsHelpDialog } from '@/components/shortcuts-help-dialog'
import { AudioPlayer } from './audio-player'
import { TranscriptionEditor } from './transcription-editor'
import { ExportMenu } from './export-menu'
import { SpeakerTimeline } from './speaker-timeline'
import { InlineRename } from '@/modules/files/inline-rename'

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

export function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: file, isLoading: fileLoading } = useFile(id!)
  const { data: transcription, isLoading: transcriptionLoading } = useTranscription(id!)
  const toggleSidebar = useAppStore((s) => s.toggleAskAiPanel)
  const askAiPanelOpen = useAppStore((s) => s.askAiPanelOpen)
  const playbackRate = useAppStore((s) => s.playbackRate)
  const setPlaybackRate = useAppStore((s) => s.setPlaybackRate)
  const { t } = useTranslation()
  const [showHelp, setShowHelp] = useState(false)

  // Transcription progress polling for transcribing files
  const isTranscribing = file?.status === 'transcribing'
  const { data: progress } = useTranscriptionPolling(id!, isTranscribing)

  // Keyboard shortcuts — we expose a ref-based play toggle via a global event
  const shortcuts = useMemo(() => ({
    onTogglePlay: () => {
      document.dispatchEvent(new CustomEvent('plaud:toggle-play'))
    },
    onSeekBack: () => {
      document.dispatchEvent(new CustomEvent('plaud:seek', { detail: -10 }))
    },
    onSeekForward: () => {
      document.dispatchEvent(new CustomEvent('plaud:seek', { detail: 10 }))
    },
    onSpeedUp: () => {
      const idx = SPEEDS.indexOf(playbackRate)
      if (idx < SPEEDS.length - 1) setPlaybackRate(SPEEDS[idx + 1])
    },
    onSpeedDown: () => {
      const idx = SPEEDS.indexOf(playbackRate)
      if (idx > 0) setPlaybackRate(SPEEDS[idx - 1])
    },
    onClosePanel: () => {
      if (askAiPanelOpen) toggleSidebar()
    },
    onShowHelp: () => setShowHelp(true),
  }), [playbackRate, setPlaybackRate, askAiPanelOpen, toggleSidebar])

  useKeyboardShortcuts(shortcuts)

  if (fileLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!file) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">File not found</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b px-6 py-4">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <InlineRename
            fileId={file.id}
            name={file.name}
            className="block truncate text-lg font-semibold cursor-text"
          />
          <p className="text-sm text-muted-foreground">
            {formatDuration(file.duration)} · {t(`status.${file.status}`)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {transcription && (
            <ExportMenu transcription={transcription} filename={file.name} />
          )}
          <Button variant="outline" size="sm" onClick={toggleSidebar}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{t('detail.askAi')}</span>
          </Button>
        </div>
      </header>

      {file.status === 'completed' && <AudioPlayer url={file.url} />}

      <div className="flex-1 overflow-auto p-6">
        {file.status === 'completed' ? (
          transcriptionLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : transcription ? (
            <div className="mx-auto max-w-3xl space-y-6">
              <section>
                <h2 className="mb-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  {t('detail.summary')}
                </h2>
                <p className="text-foreground leading-relaxed">
                  {transcription.summary}
                </p>
              </section>

              {transcription.segments?.length > 0 && (
                <section>
                  <SpeakerTimeline
                    speakers={transcription.speakers}
                    segments={transcription.segments}
                  />
                </section>
              )}

              <section>
                <TranscriptionEditor
                  fileId={id!}
                  content={transcription.content}
                />
              </section>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              {t('detail.noTranscription')}
            </p>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            {file.status === 'transcribing' && (
              <>
                <Loader2 className="mb-4 h-8 w-8 animate-spin" />
                {typeof progress === 'number' && (
                  <div className="w-48 mt-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-center mt-1">{progress}%</p>
                  </div>
                )}
              </>
            )}
            <p>
              {file.status === 'pending' && t('detail.pendingMsg')}
              {file.status === 'transcribing' && t('detail.transcribingMsg')}
              {file.status === 'failed' && t('detail.failedMsg')}
            </p>
          </div>
        )}
      </div>

      <ShortcutsHelpDialog open={showHelp} onOpenChange={setShowHelp} />
    </div>
  )
}

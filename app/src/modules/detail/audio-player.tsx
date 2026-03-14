import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useAudioPlayer } from './use-audio-player'
import { PlaybackSpeedMenu } from './playback-speed-menu'
import { useAppStore } from '@/stores/app-store'

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

interface AudioPlayerProps {
  url: string
}

export function AudioPlayer({ url }: AudioPlayerProps) {
  const { containerRef, isPlaying, isReady, currentTime, duration, togglePlay, skip } =
    useAudioPlayer({ url })
  const volume = useAppStore((s) => s.volume)
  const setVolume = useAppStore((s) => s.setVolume)

  if (!url) {
    return (
      <div className="border-b px-6 py-4 text-sm text-muted-foreground">
        No audio file available
      </div>
    )
  }

  return (
    <div className="border-b px-6 py-3 space-y-2">
      <div ref={containerRef} className="w-full" />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => skip(-10)}
            disabled={!isReady}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={togglePlay}
            disabled={!isReady}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => skip(10)}
            disabled={!isReady}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <span className="text-xs text-muted-foreground font-mono min-w-[5rem]">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <div className="flex-1" />

        <PlaybackSpeedMenu />

        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[volume * 100]}
            onValueChange={([v]) => setVolume(v / 100)}
            max={100}
            step={1}
            className="w-20"
          />
        </div>
      </div>
    </div>
  )
}

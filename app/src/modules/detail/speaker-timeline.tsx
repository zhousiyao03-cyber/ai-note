import type { Speaker, TranscriptionSegment } from '@/types'
import { SpeakerLabel } from './speaker-label'

interface SpeakerTimelineProps {
  speakers: Speaker[]
  segments: TranscriptionSegment[]
  onSeek?: (time: number) => void
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function SpeakerTimeline({ speakers, segments, onSeek }: SpeakerTimelineProps) {
  const speakerMap = Object.fromEntries(speakers.map((s) => [s.id, s]))

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        Speaker Timeline
      </h2>
      <div className="space-y-1.5">
        {segments.map((seg) => {
          const speaker = speakerMap[seg.speakerId]
          if (!speaker) return null
          return (
            <div key={seg.id} className="flex items-start gap-3">
              <button
                className="shrink-0 text-xs text-muted-foreground font-mono hover:text-primary mt-0.5"
                onClick={() => onSeek?.(seg.startTime)}
              >
                {formatTime(seg.startTime)}
              </button>
              <div>
                <SpeakerLabel speaker={speaker} />
                <p className="mt-1 text-sm text-foreground">{seg.text}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

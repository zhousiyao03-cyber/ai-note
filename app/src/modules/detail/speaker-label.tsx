import type { Speaker } from '@/types'

interface SpeakerLabelProps {
  speaker: Speaker
}

export function SpeakerLabel({ speaker }: SpeakerLabelProps) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: `${speaker.color}20`,
        color: speaker.color,
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: speaker.color }}
      />
      {speaker.name}
    </span>
  )
}

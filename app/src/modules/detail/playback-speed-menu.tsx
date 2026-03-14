import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/app-store'

const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]

export function PlaybackSpeedMenu() {
  const playbackRate = useAppStore((s) => s.playbackRate)
  const setPlaybackRate = useAppStore((s) => s.setPlaybackRate)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs font-mono min-w-[3rem]">
          {playbackRate}x
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        {speeds.map((speed) => (
          <DropdownMenuItem
            key={speed}
            onClick={() => setPlaybackRate(speed)}
            className={playbackRate === speed ? 'bg-muted' : ''}
          >
            {speed}x
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

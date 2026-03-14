import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ShortcutsHelpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const shortcuts = [
  { key: 'Space', description: 'Play / Pause' },
  { key: '←', description: 'Seek back 10s' },
  { key: '→', description: 'Seek forward 10s' },
  { key: '[', description: 'Decrease speed' },
  { key: ']', description: 'Increase speed' },
  { key: 'Esc', description: 'Close panel' },
  { key: '?', description: 'Show shortcuts' },
]

export function ShortcutsHelpDialog({ open, onOpenChange }: ShortcutsHelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{s.description}</span>
              <kbd className="rounded border bg-muted px-2 py-0.5 text-xs font-mono">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

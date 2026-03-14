import { useEffect } from 'react'

interface ShortcutHandlers {
  onTogglePlay?: () => void
  onSeekBack?: () => void
  onSeekForward?: () => void
  onSpeedUp?: () => void
  onSpeedDown?: () => void
  onClosePanel?: () => void
  onShowHelp?: () => void
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      switch (e.key) {
        case ' ':
          e.preventDefault()
          handlers.onTogglePlay?.()
          break
        case 'ArrowLeft':
          handlers.onSeekBack?.()
          break
        case 'ArrowRight':
          handlers.onSeekForward?.()
          break
        case ']':
          handlers.onSpeedUp?.()
          break
        case '[':
          handlers.onSpeedDown?.()
          break
        case 'Escape':
          handlers.onClosePanel?.()
          break
        case '?':
          handlers.onShowHelp?.()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}

import { useState, useRef, useEffect } from 'react'
import { useRenameFile } from '@/hooks/use-queries'

interface InlineRenameProps {
  fileId: string
  name: string
  className?: string
}

export function InlineRename({ fileId, name, className }: InlineRenameProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)
  const renameFile = useRenameFile()

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const handleSave = () => {
    const trimmed = value.trim()
    if (trimmed && trimmed !== name) {
      renameFile.mutate({ id: fileId, name: trimmed })
    } else {
      setValue(name)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave()
          if (e.key === 'Escape') {
            setValue(name)
            setEditing(false)
          }
        }}
        className="w-full rounded border bg-background px-1 py-0.5 text-sm outline-none focus:ring-1 focus:ring-ring"
      />
    )
  }

  return (
    <span
      className={className}
      onDoubleClick={() => setEditing(true)}
      title="Double-click to rename"
    >
      {name}
    </span>
  )
}

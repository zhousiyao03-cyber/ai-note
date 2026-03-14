import { useEffect, useState, useCallback } from 'react'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import { useUpdateTranscription } from '@/hooks/use-queries'

export function useTranscriptionEditor(fileId: string, initialContent: string) {
  const [isDirty, setIsDirty] = useState(false)
  const updateTranscription = useUpdateTranscription()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Transcription content...' }),
      Highlight,
    ],
    content: initialContent,
    onUpdate: () => {
      setIsDirty(true)
    },
  })

  useEffect(() => {
    if (editor && initialContent && !isDirty) {
      editor.commands.setContent(initialContent)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialContent])

  const save = useCallback(() => {
    if (!editor || !isDirty) return
    const html = editor.getHTML()
    updateTranscription.mutate(
      { fileId, content: html },
      { onSuccess: () => setIsDirty(false) }
    )
  }, [editor, isDirty, fileId, updateTranscription])

  return { editor, isDirty, save, isSaving: updateTranscription.isPending }
}

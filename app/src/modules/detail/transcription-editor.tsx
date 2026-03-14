import { EditorContent } from '@tiptap/react'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranscriptionEditor } from './use-transcription-editor'

interface TranscriptionEditorProps {
  fileId: string
  content: string
}

export function TranscriptionEditor({ fileId, content }: TranscriptionEditorProps) {
  const { editor, isDirty, save, isSaving } = useTranscriptionEditor(fileId, content)

  if (!editor) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Transcription
        </h2>
        {isDirty && (
          <Button
            variant="outline"
            size="sm"
            onClick={save}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            ) : (
              <Save className="mr-2 h-3 w-3" />
            )}
            Save
          </Button>
        )}
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none text-foreground [&_.tiptap]:outline-none [&_.tiptap]:min-h-[200px]"
      />
    </div>
  )
}

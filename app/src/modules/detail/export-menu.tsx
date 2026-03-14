import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { exportAsTxt, exportAsPdf, exportAsDocx, exportAsSrt } from '@/lib/export-utils'
import type { Transcription } from '@/types'

interface ExportMenuProps {
  transcription: Transcription
  filename: string
}

export function ExportMenu({ transcription, filename }: ExportMenuProps) {
  const baseName = filename.replace(/\.[^.]+$/, '')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => exportAsTxt(transcription.content, baseName)}>
          Plain Text (.txt)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportAsPdf(transcription.content, baseName)}>
          PDF (.pdf)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportAsDocx(transcription.content, baseName)}>
          Word (.docx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportAsSrt(transcription.content, baseName, transcription.segments)}>
          Subtitles (.srt)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

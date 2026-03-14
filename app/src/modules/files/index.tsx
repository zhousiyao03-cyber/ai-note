import { useState } from 'react'
import { Upload, Tags } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { FileList } from './file-list'
import { UploadDialog } from './upload-dialog'
import { SearchBar } from './search-bar'
import { TagFilter } from './tag-filter'
import { TagManager } from './tag-manager'

export function FilesPage() {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [tagManagerOpen, setTagManagerOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <h1 className="text-xl font-semibold">{t('files.title')}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setTagManagerOpen(true)}>
            <Tags className="mr-2 h-4 w-4" />
            Tags
          </Button>
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            {t('files.upload')}
          </Button>
        </div>
      </header>
      <SearchBar />
      <TagFilter />
      <div className="flex-1 overflow-auto">
        <FileList />
      </div>
      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <TagManager open={tagManagerOpen} onOpenChange={setTagManagerOpen} />
    </div>
  )
}

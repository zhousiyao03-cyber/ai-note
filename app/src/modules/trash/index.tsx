import { Trash2 } from 'lucide-react'
import { TrashList } from './trash-list'

export function TrashPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b px-6 py-4">
        <Trash2 className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Trash</h1>
      </header>
      <div className="flex-1 overflow-auto">
        <TrashList />
      </div>
    </div>
  )
}

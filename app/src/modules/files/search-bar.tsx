import { Search, ArrowUpDown, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/stores/app-store'

const statusOptions = [
  { value: null, labelKey: 'files.allStatus' },
  { value: 'pending', labelKey: 'status.pending' },
  { value: 'transcribing', labelKey: 'status.transcribing' },
  { value: 'completed', labelKey: 'status.completed' },
  { value: 'failed', labelKey: 'status.failed' },
]

const sortOptions = [
  { value: 'createdAt', labelKey: 'files.sortBy.createdAt' },
  { value: 'name', labelKey: 'files.sortBy.name' },
  { value: 'duration', labelKey: 'files.sortBy.duration' },
  { value: 'size', labelKey: 'files.sortBy.size' },
] as const

export function SearchBar() {
  const { t } = useTranslation()
  const searchQuery = useAppStore((s) => s.searchQuery)
  const setSearchQuery = useAppStore((s) => s.setSearchQuery)
  const statusFilter = useAppStore((s) => s.statusFilter)
  const setStatusFilter = useAppStore((s) => s.setStatusFilter)
  const sortBy = useAppStore((s) => s.sortBy)
  const setSortBy = useAppStore((s) => s.setSortBy)
  const sortOrder = useAppStore((s) => s.sortOrder)
  const setSortOrder = useAppStore((s) => s.setSortOrder)

  const currentStatus = statusOptions.find((option) => option.value === statusFilter)
  const currentSort = sortOptions.find((option) => option.value === sortBy)

  return (
    <div className="flex items-center gap-2 border-b px-4 py-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('files.search')}
          className="w-full rounded-md border bg-background py-1.5 pl-8 pr-3 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs">
            {currentStatus ? t(currentStatus.labelKey) : t('files.allStatus')}
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {statusOptions.map((option) => (
            <DropdownMenuItem
              key={option.value ?? 'all'}
              onClick={() => setStatusFilter(option.value)}
              className={statusFilter === option.value ? 'bg-muted' : ''}
            >
              {t(option.labelKey)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs">
            {currentSort ? t(currentSort.labelKey) : t('files.sortLabel')}
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setSortBy(option.value)}
              className={sortBy === option.value ? 'bg-muted' : ''}
            >
              {t(option.labelKey)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
      >
        <ArrowUpDown className="h-4 w-4" />
      </Button>
    </div>
  )
}

import { Search, ArrowUpDown, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/stores/app-store'

const statusOptions = [
  { value: null, label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'transcribing', label: 'Transcribing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
]

const sortOptions = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'name', label: 'Name' },
  { value: 'duration', label: 'Duration' },
  { value: 'size', label: 'Size' },
] as const

export function SearchBar() {
  const searchQuery = useAppStore((s) => s.searchQuery)
  const setSearchQuery = useAppStore((s) => s.setSearchQuery)
  const statusFilter = useAppStore((s) => s.statusFilter)
  const setStatusFilter = useAppStore((s) => s.setStatusFilter)
  const sortBy = useAppStore((s) => s.sortBy)
  const setSortBy = useAppStore((s) => s.setSortBy)
  const sortOrder = useAppStore((s) => s.sortOrder)
  const setSortOrder = useAppStore((s) => s.setSortOrder)

  const currentStatus = statusOptions.find((o) => o.value === statusFilter)
  const currentSort = sortOptions.find((o) => o.value === sortBy)

  return (
    <div className="flex items-center gap-2 border-b px-4 py-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search files..."
          className="w-full rounded-md border bg-background pl-8 pr-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs">
            {currentStatus?.label ?? 'All Status'}
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {statusOptions.map((opt) => (
            <DropdownMenuItem
              key={opt.value ?? 'all'}
              onClick={() => setStatusFilter(opt.value)}
              className={statusFilter === opt.value ? 'bg-muted' : ''}
            >
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs">
            {currentSort?.label ?? 'Sort'}
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {sortOptions.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={sortBy === opt.value ? 'bg-muted' : ''}
            >
              {opt.label}
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

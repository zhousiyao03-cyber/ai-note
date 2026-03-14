import { useInfiniteQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useAppStore } from '@/stores/app-store'

const PAGE_SIZE = 20

export function useInfiniteFiles() {
  const searchQuery = useAppStore((s) => s.searchQuery)
  const statusFilter = useAppStore((s) => s.statusFilter)
  const sortBy = useAppStore((s) => s.sortBy)
  const sortOrder = useAppStore((s) => s.sortOrder)
  const tagFilter = useAppStore((s) => s.tagFilter)

  return useInfiniteQuery({
    queryKey: ['files', { searchQuery, statusFilter, sortBy, sortOrder, tagFilter }],
    queryFn: ({ pageParam = 0 }) =>
      api.getFiles({
        search: searchQuery || undefined,
        status: statusFilter,
        sortBy,
        sortOrder,
        skip: pageParam,
        limit: PAGE_SIZE,
        tags: tagFilter.length > 0 ? tagFilter : undefined,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined
      return allPages.reduce((acc, p) => acc + p.data.length, 0)
    },
  })
}

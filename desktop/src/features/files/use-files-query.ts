import { useQuery } from '@tanstack/react-query'

import { desktopApi } from '../../lib/api/client'

export function useFilesQuery() {
  return useQuery({
    queryKey: ['files', { limit: 20, sortBy: 'updatedAt', sortOrder: 'desc' }],
    queryFn: () =>
      desktopApi.getFiles({
        limit: 20,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      }),
  })
}

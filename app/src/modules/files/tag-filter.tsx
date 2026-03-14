import { useTags } from '@/hooks/use-queries'
import { useAppStore } from '@/stores/app-store'

export function TagFilter() {
  const { data: tags } = useTags()
  const selectedTags = useAppStore((s) => s.tagFilter)
  const toggleTagFilter = useAppStore((s) => s.toggleTagFilter)

  if (!tags?.length) return null

  return (
    <div className="flex items-center gap-1.5 border-b px-4 py-2 overflow-x-auto">
      {tags.map((tag) => {
        const active = selectedTags.includes(tag.id)
        return (
          <button
            key={tag.id}
            onClick={() => toggleTagFilter(tag.id)}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap"
            style={{
              backgroundColor: active ? tag.color : `${tag.color}15`,
              color: active ? '#fff' : tag.color,
            }}
          >
            {tag.name}
          </button>
        )
      })}
    </div>
  )
}

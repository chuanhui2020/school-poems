import { useMemo } from 'react'
import Fuse from 'fuse.js'
import type { Author, Poem } from '../types/poem'

interface SearchResult {
  type: 'author' | 'poem'
  id: string
  title: string
  subtitle: string
}

export function useSearch(
  authors: Author[],
  poems: Poem[],
  query: string
): SearchResult[] {
  const fuse = useMemo(() => {
    const items: SearchResult[] = [
      ...authors.map((a) => ({
        type: 'author' as const,
        id: a.id,
        title: a.name,
        subtitle: a.courtesy_name ?? a.dynastyId,
      })),
      ...poems.map((p) => ({
        type: 'poem' as const,
        id: p.id,
        title: p.title,
        subtitle: p.authorId,
      })),
    ]
    return new Fuse(items, {
      keys: ['title', 'subtitle'],
      threshold: 0.4,
    })
  }, [authors, poems])

  return useMemo(() => {
    if (!query.trim()) return []
    return fuse.search(query, { limit: 10 }).map((r) => r.item)
  }, [fuse, query])
}

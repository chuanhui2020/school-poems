import { useMemo } from 'react'
import type { Author, Dynasty, Poem } from '../types/poem'
import type { AuthorNode, DynastyRegion } from '../types/nodes'
import { buildTimeScale, buildDynastyRegions, layoutAuthors } from '../lib/layout'

interface TimelineLayout {
  authorNodes: AuthorNode[]
  dynastyRegions: DynastyRegion[]
  timeScale: ReturnType<typeof buildTimeScale>
}

export function useTimelineLayout(
  authors: Author[],
  poems: Poem[],
  dynasties: Dynasty[]
): TimelineLayout {
  return useMemo(() => {
    const timeScale = buildTimeScale()
    const dynastyRegions = buildDynastyRegions(dynasties, timeScale)
    const authorNodes = layoutAuthors(authors, poems, timeScale)
    return { authorNodes, dynastyRegions, timeScale }
  }, [authors, poems, dynasties])
}

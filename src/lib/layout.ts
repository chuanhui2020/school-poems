import { scaleLinear } from 'd3-scale'
import type { Author, Dynasty } from '../types/poem'
import type { AuthorNode, DynastyRegion } from '../types/nodes'
import { getDynastyColor } from './colorScales'

/** World coordinate constants */
export const WORLD = {
  /** Total width of the universe canvas in world units */
  WIDTH: 8000,
  /** Total height */
  HEIGHT: 2000,
  /** Padding on edges */
  PADDING: 200,
  /** Min gap between dynasty regions */
  DYNASTY_GAP: 40,
} as const

/**
 * Build a time scale mapping years to x-coordinates.
 * Range: -1100 (before pre-Qin) to 1912 (end of Qing).
 */
export function buildTimeScale() {
  return scaleLinear()
    .domain([-1100, 1912])
    .range([WORLD.PADDING, WORLD.WIDTH - WORLD.PADDING])
}

/**
 * Compute dynasty region bounds on the canvas.
 */
export function buildDynastyRegions(
  dynasties: Dynasty[],
  timeScale: ReturnType<typeof buildTimeScale>
): DynastyRegion[] {
  return dynasties.map((d) => ({
    dynasty: d,
    x0: timeScale(d.startYear),
    x1: timeScale(d.endYear),
    color: d.color,
  }))
}

/**
 * Position authors on the canvas.
 * X = birth year on timeline. Y = spread within dynasty band to avoid overlap.
 */
export function layoutAuthors(
  authors: Author[],
  poems: { authorId: string }[],
  timeScale: ReturnType<typeof buildTimeScale>
): AuthorNode[] {
  const poemCounts = new Map<string, number>()
  for (const p of poems) {
    poemCounts.set(p.authorId, (poemCounts.get(p.authorId) ?? 0) + 1)
  }

  // Group by dynasty for Y-axis spreading
  const byDynasty = new Map<string, Author[]>()
  for (const a of authors) {
    const list = byDynasty.get(a.dynastyId) ?? []
    list.push(a)
    byDynasty.set(a.dynastyId, list)
  }

  const nodes: AuthorNode[] = []

  for (const [dynastyId, group] of byDynasty) {
    // Sort by birth year within dynasty
    group.sort((a, b) => (a.birth_year ?? 0) - (b.birth_year ?? 0))

    group.forEach((author, i) => {
      const count = poemCounts.get(author.id) ?? 0
      const radius = Math.max(8, Math.min(30, 8 + count * 3))

      // Spread vertically within the band
      const yCenter = WORLD.HEIGHT / 2
      const spread = Math.min(600, group.length * 60)
      const yOffset = group.length === 1
        ? 0
        : ((i / (group.length - 1)) - 0.5) * spread

      nodes.push({
        id: author.id,
        type: 'author',
        label: author.name,
        author,
        dynastyId,
        color: getDynastyColor(dynastyId),
        x: timeScale(author.birth_year ?? 0),
        y: yCenter + yOffset,
        poemCount: count,
        radius,
        styleLabels: author.style_labels ?? [],
      })
    })
  }

  return nodes
}

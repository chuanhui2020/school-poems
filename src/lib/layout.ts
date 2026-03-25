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

/** 3D world coordinate constants */
export const WORLD3D = {
  WIDTH: 800,
  HEIGHT: 200,
  DEPTH: 400,
  PADDING: 20,
} as const

/** Spiral distribution tuning constants */
export const SPIRAL = {
  /** Spiral radius = sqrt(n) * RADIUS_FACTOR */
  RADIUS_FACTOR: 12,
  /** Y/Z spread = sqrt(n) * SPREAD_FACTOR */
  SPREAD_FACTOR: 18,
  /** Minimum spacing between any two star centers */
  MIN_SPACING: 8,
  /** X-axis deterministic offset scale to avoid birth_year overlap */
  X_JITTER_SCALE: 3,
} as const

/**
 * Maps style labels to z-axis offsets in 3D space.
 * Separates poetic styles along the depth axis.
 */
export const STYLE_Z_MAP: Record<string, number> = {
  '豪放': -120,
  '边塞': -80,
  '田园': -40,
  '山水': -20,
  '婉约': 40,
  '闺怨': 80,
  '咏物': 60,
  '爱国': -100,
  '叙事': 0,
  '哲理': 20,
}

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
 * Build a 3D time scale mapping years to x-coordinates in 3D world units.
 */
export function build3DTimeScale() {
  return scaleLinear()
    .domain([-1100, 1912])
    .range([-(WORLD3D.WIDTH / 2) + WORLD3D.PADDING, (WORLD3D.WIDTH / 2) - WORLD3D.PADDING])
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
        z: 0,
        poemCount: count,
        radius,
        styleLabels: author.style_labels ?? [],
      })
    })
  }

  return nodes
}

/**
 * Position authors in 3D space using a golden-angle spiral per dynasty group.
 * X = birth year on timeline + deterministic jitter, Y/Z = spiral distribution.
 */
export function layoutAuthors3D(
  authors: Author[],
  poems: { authorId: string }[],
  timeScale: ReturnType<typeof build3DTimeScale>
): AuthorNode[] {
  const poemCounts = new Map<string, number>()
  for (const p of poems) {
    poemCounts.set(p.authorId, (poemCounts.get(p.authorId) ?? 0) + 1)
  }

  const byDynasty = new Map<string, Author[]>()
  for (const a of authors) {
    const list = byDynasty.get(a.dynastyId) ?? []
    list.push(a)
    byDynasty.set(a.dynastyId, list)
  }

  const nodes: AuthorNode[] = []

  for (const [dynastyId, group] of byDynasty) {
    group.sort((a, b) => (a.birth_year ?? 0) - (b.birth_year ?? 0))

    const n = group.length
    const spiralRadius = Math.sqrt(n) * SPIRAL.RADIUS_FACTOR

    group.forEach((author, i) => {
      const count = poemCounts.get(author.id) ?? 0
      const radius = Math.max(1, Math.min(4, 1 + count * 0.4))

      // Golden-angle spiral, applied per-dynasty
      const angle = i * Math.PI * (3 - Math.sqrt(5))
      const t = n === 1 ? 0 : i / (n - 1)
      const yOffset = Math.sin(angle) * spiralRadius * t
      const zSpiral = Math.cos(angle) * spiralRadius * t * 0.6

      // Pick styleZ from first matching style label, default 0
      const styleLabels = author.style_labels ?? []
      const styleZ = styleLabels.reduce<number>((acc, label) => {
        if (acc !== 0) return acc
        return STYLE_Z_MAP[label] ?? 0
      }, 0)

      const z = styleZ + zSpiral

      // Deterministic X jitter to reduce birth_year overlap
      const xJitter = ((i % 5) - 2) * SPIRAL.X_JITTER_SCALE

      nodes.push({
        id: author.id,
        type: 'author',
        label: author.name,
        author,
        dynastyId,
        color: getDynastyColor(dynastyId),
        x: timeScale(author.birth_year ?? 0) + xJitter,
        y: yOffset,
        z,
        poemCount: count,
        radius,
        styleLabels,
      })
    })
  }

  return nodes
}

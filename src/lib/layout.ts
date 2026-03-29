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

/** Nebula sizing range */
const MIN_NEBULA = 25
const MAX_NEBULA = 80

export interface DynastyScore {
  dynastyId: string
  score: number
  /** Normalized 0–1 relative to max score */
  normalized: number
  poemCount: number
  authorCount: number
}

export interface DynastyRegion3D {
  dynastyId: string
  xCenter: number
  xSpan: number
  nebulaSize: number
  score: DynastyScore
}

/**
 * Compute dynasty importance scores using log2 compression.
 * score = log2(poems + 1) * 0.6 + log2(authors + 1) * 0.4
 */
export function computeDynastyScores(
  dynasties: Dynasty[],
  authors: Author[],
  poems: { authorId: string; dynastyId: string }[]
): DynastyScore[] {
  const poemsByDynasty = new Map<string, number>()
  const authorsByDynasty = new Map<string, number>()

  for (const p of poems) {
    poemsByDynasty.set(p.dynastyId, (poemsByDynasty.get(p.dynastyId) ?? 0) + 1)
  }
  const authorDynasties = new Set<string>()
  for (const a of authors) {
    const key = `${a.dynastyId}:${a.id}`
    if (!authorDynasties.has(key)) {
      authorDynasties.add(key)
      authorsByDynasty.set(a.dynastyId, (authorsByDynasty.get(a.dynastyId) ?? 0) + 1)
    }
  }

  const raw = dynasties.map((d) => {
    const pc = poemsByDynasty.get(d.id) ?? 0
    const ac = authorsByDynasty.get(d.id) ?? 0
    return {
      dynastyId: d.id,
      score: Math.log2(pc + 1) * 0.6 + Math.log2(ac + 1) * 0.4,
      normalized: 0,
      poemCount: pc,
      authorCount: ac,
    }
  })

  const maxScore = Math.max(...raw.map((r) => r.score), 1)
  for (const r of raw) {
    r.normalized = r.score / maxScore
  }

  return raw
}

/**
 * Build weighted 3D dynasty regions.
 * Dynasties keep chronological order but X-axis width is proportional to score,
 * with a minimum width guarantee so small dynasties remain visible.
 */
export function buildWeightedRegions3D(
  dynasties: Dynasty[],
  scores: DynastyScore[]
): DynastyRegion3D[] {
  const totalWidth = WORLD3D.WIDTH - WORLD3D.PADDING * 2
  const scoreMap = new Map(scores.map((s) => [s.dynastyId, s]))
  const minWidth = 40
  const gap = 12

  // Sorted by chronological order (dynasties array is already sorted)
  const sorted = dynasties.map((d) => ({
    dynasty: d,
    score: scoreMap.get(d.id)!,
  }))

  const totalGaps = gap * (sorted.length - 1)
  const totalMinReserved = minWidth * sorted.length
  const distributable = Math.max(0, totalWidth - totalGaps - totalMinReserved)
  const totalScore = sorted.reduce((sum, s) => sum + s.score.score, 0)

  const regions: DynastyRegion3D[] = []
  let cursor = -(totalWidth / 2)

  for (let i = 0; i < sorted.length; i++) {
    const { score } = sorted[i]
    const proportion = totalScore > 0 ? score.score / totalScore : 1 / sorted.length
    const width = minWidth + distributable * proportion
    const xCenter = cursor + width / 2
    const nebulaSize = MIN_NEBULA + score.normalized * (MAX_NEBULA - MIN_NEBULA)

    regions.push({
      dynastyId: score.dynastyId,
      xCenter,
      xSpan: width,
      nebulaSize,
      score,
    })

    cursor += width + gap
  }

  return regions
}

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
 * Authors are placed within their dynasty's weighted X region.
 * Spiral radius scales with dynasty score for proportional spread.
 */
export function layoutAuthors3D(
  authors: Author[],
  poems: { authorId: string }[],
  regions: DynastyRegion3D[]
): AuthorNode[] {
  const poemCounts = new Map<string, number>()
  for (const p of poems) {
    poemCounts.set(p.authorId, (poemCounts.get(p.authorId) ?? 0) + 1)
  }

  const regionMap = new Map(regions.map((r) => [r.dynastyId, r]))

  const byDynasty = new Map<string, Author[]>()
  for (const a of authors) {
    const list = byDynasty.get(a.dynastyId) ?? []
    list.push(a)
    byDynasty.set(a.dynastyId, list)
  }

  const nodes: AuthorNode[] = []

  for (const [dynastyId, group] of byDynasty) {
    const region = regionMap.get(dynastyId)
    if (!region) continue

    group.sort((a, b) => (a.birth_year ?? 0) - (b.birth_year ?? 0))

    const n = group.length
    // Scale spiral radius with dynasty score — larger dynasties spread more
    const baseRadius = Math.sqrt(n) * SPIRAL.RADIUS_FACTOR
    const spiralRadius = baseRadius * (0.6 + region.score.normalized * 0.4)

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

      // Spread authors within dynasty's X region based on birth year order
      const xOffset = n === 1
        ? 0
        : ((i / (n - 1)) - 0.5) * region.xSpan * 0.6
      const xJitter = ((i % 5) - 2) * SPIRAL.X_JITTER_SCALE

      nodes.push({
        id: author.id,
        type: 'author',
        label: author.name,
        author,
        dynastyId,
        color: getDynastyColor(dynastyId),
        x: region.xCenter + xOffset + xJitter,
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

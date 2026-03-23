# 诗词元宇宙重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the current flat orbital visualization into an immersive "Poetry Metaverse" — a zoomable time-space canvas where poets live in their dynasties, their works orbit them as satellites, and historical context breathes life into each era.

**Architecture:** Three-layer canvas: (1) Dynasty nebula background layer with era narratives, (2) Author node layer positioned on a timeline with relationship edges, (3) Poem satellite layer that expands around a selected author. Semantic zoom drives the experience — zoom out to see the full literary galaxy, zoom in to explore a single poet's world. React renders UI overlays; Canvas/SVG hybrid handles the visualization.

**Tech Stack:** React 19, TypeScript, D3.js (zoom/force/scales), Zustand (global state), react-router-dom (navigation), fuse.js (search), Tailwind CSS 4, LXGW WenKai font.

---

## File Structure

### Files to Delete (dead code cleanup)
- `src/hooks/useStore.ts` (replace with new store)
- `src/types/filters.ts` (unused)
- `src/types/graph.ts` (unused)
- `src/components/visualizations/shared/useSimulation.ts` (unused)
- `src/components/visualizations/shared/useZoom.ts` (unused)
- `src/data/poems_batch2.json` (unused)
- `src/data/poems_grade8.json` (unused)
- `src/data/themes.json` (unused)
- `src/lib/graphTransformers.ts` (no longer needed — Universe.tsx builds edges from raw data)

### Files to Create
```
src/
├── store/
│   └── useStore.ts                    # New Zustand store: view state, selection, filters, zoom level
├── types/
│   └── nodes.ts                       # AuthorNode, PoemNode, DynastyRegion typed interfaces
├── components/
│   ├── Universe.tsx                   # Main canvas: timeline layout, zoom handler, renders all layers
│   ├── DynastyNebula.tsx              # Background layer: dynasty regions with color/narrative
│   ├── AuthorStar.tsx                 # Single author node (SVG group)
│   ├── PoemOrbit.tsx                  # Poem satellites around selected author
│   ├── RelationshipEdge.tsx           # Relationship lines between authors
│   ├── TimelineAxis.tsx               # Bottom timeline ruler with dynasty labels
│   ├── PoemReader.tsx                 # Immersive full-screen poem reading view
│   ├── SearchOverlay.tsx              # Fuse.js powered search panel
│   └── HUD.tsx                        # Minimal top-bar: search trigger, zoom controls, breadcrumb
├── hooks/
│   ├── useUniverseZoom.ts             # D3 zoom with semantic zoom levels
│   ├── useTimelineLayout.ts           # Positions authors on time-space canvas
│   └── useSearch.ts                   # Fuse.js search hook
├── lib/
│   ├── layout.ts                      # Timeline scale, dynasty region bounds, collision avoidance
│   └── dynastyNarratives.ts           # Dynasty background stories and era descriptions
└── data/
    └── narratives.json                # Historical context per dynasty/era (new data)
```

### Files to Modify
- `src/App.tsx` — Replace with router setup
- `src/main.tsx` — Add RouterProvider
- `src/index.css` — Update theme for universe aesthetic
- `src/types/poem.ts` — Add missing fields, clean up unused types
- `src/types/index.ts` — Update re-exports
- `src/lib/colorScales.ts` — Keep, fix to be actually used
- `src/components/AuthorPanel.tsx` — Refactor to use getDynastyName + getDynastyColor, change to named export
- `src/components/shared/Tooltip.tsx` — Keep as-is
- `index.html` — Fix LXGW WenKai font stack

### Files to Delete (replaced by new components)
- `src/components/FriendCircle.tsx` (replaced by Universe.tsx)
- `src/components/DynastyHUD.tsx` (replaced by HUD.tsx)

---

## Phase 1: Clean Foundation

### Task 1: Delete dead code and unused files

**Files:**
- Delete: `src/hooks/useStore.ts`
- Delete: `src/types/filters.ts`
- Delete: `src/types/graph.ts`
- Delete: `src/components/visualizations/shared/useSimulation.ts`
- Delete: `src/components/visualizations/shared/useZoom.ts`
- Delete: `src/data/poems_batch2.json`
- Delete: `src/data/poems_grade8.json`
- Delete: `src/data/themes.json`
- Delete: `src/lib/graphTransformers.ts`
- Delete: `src/components/FriendCircle.tsx` (imports deleted files — remove now)
- Delete: `src/components/DynastyHUD.tsx` (no longer needed)
- Modify: `src/types/index.ts`
- Modify: `src/App.tsx` (stub to placeholder so build passes)

- [ ] **Step 1: Delete unused files and old components**

```bash
rm src/hooks/useStore.ts
rm src/types/filters.ts
rm src/types/graph.ts
rm src/components/visualizations/shared/useSimulation.ts
rm src/components/visualizations/shared/useZoom.ts
rm src/data/poems_batch2.json
rm src/data/poems_grade8.json
rm src/data/themes.json
rm src/lib/graphTransformers.ts
rm src/components/FriendCircle.tsx
rm src/components/DynastyHUD.tsx
```

- [ ] **Step 2: Clean up `src/types/index.ts`**

Replace contents with (only poem for now — nodes.ts added in Task 2):
```ts
export * from './poem'
```

- [ ] **Step 3: Stub `src/App.tsx` to a minimal placeholder**

Replace entire contents with:
```tsx
export default function App() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[var(--color-bg-deep)]">
      <p style={{ color: '#e0d6c8', fontFamily: "'LXGW WenKai', serif" }}>
        诗词元宇宙 — 重构中...
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Verify build passes**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove dead code — unused store, hooks, types, data files"
```

---

### Task 2: Define typed node interfaces

**Files:**
- Create: `src/types/nodes.ts`
- Modify: `src/types/poem.ts`

- [ ] **Step 1: Create `src/types/nodes.ts`**

```ts
import type { Author, Poem, Dynasty } from './poem'

/** Author node positioned in the universe */
export interface AuthorNode {
  id: string
  type: 'author'
  label: string
  author: Author
  dynastyId: string
  /** Dynasty color from dynasties.json */
  color: string
  /** X position on timeline (computed from approximate birth year) */
  x: number
  /** Y position (computed by layout algorithm) */
  y: number
  /** Number of poems in curriculum */
  poemCount: number
  /** Node radius, derived from poemCount */
  radius: number
  styleLabels: string[]
}

/** Poem node orbiting an author */
export interface PoemNode {
  id: string
  type: 'poem'
  poem: Poem
  authorId: string
  /** Orbit angle around parent author */
  angle: number
  /** Orbit distance from parent author */
  orbitRadius: number
}

/** Dynasty region bounds on the canvas */
export interface DynastyRegion {
  dynasty: Dynasty
  /** Left edge x in world coordinates */
  x0: number
  /** Right edge x in world coordinates */
  x1: number
  /** Color for nebula background */
  color: string
}

/** Relationship edge between two AuthorNodes */
export interface RelationshipEdge {
  source: string
  target: string
  type: string
  label: string
  description: string
  strength: number
  color: string
  dashArray: string
}

/** Semantic zoom levels */
export type ZoomLevel = 'galaxy' | 'dynasty' | 'poet'
```

- [ ] **Step 2: Clean up unused types in `src/types/poem.ts`**

Remove `ThemeCategory`, `ImageryItem`, `ThemesData` interfaces (lines 65-80) — they are never used.

- [ ] **Step 3: Update `src/types/index.ts`**

```ts
export * from './poem'
export * from './nodes'
```

- [ ] **Step 4: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/
git commit -m "feat: add typed AuthorNode, PoemNode, DynastyRegion interfaces"
```

---

### Task 3: Create new Zustand store

**Files:**
- Create: `src/store/useStore.ts`

- [ ] **Step 1: Create `src/store/useStore.ts`**

```ts
import { create } from 'zustand'
import type { ZoomLevel } from '../types'

interface UniverseState {
  // View
  zoomLevel: ZoomLevel
  setZoomLevel: (level: ZoomLevel) => void

  // Selection
  selectedAuthorId: string | null
  selectAuthor: (id: string | null) => void
  selectedPoemId: string | null
  selectPoem: (id: string | null) => void

  // Hover
  hoveredNodeId: string | null
  setHoveredNode: (id: string | null) => void

  // Zoom control (set by useUniverseZoom, called by HUD)
  resetZoom: (() => void) | null
  setResetZoom: (fn: (() => void) | null) => void

  // Search
  searchQuery: string
  setSearchQuery: (q: string) => void
  searchOpen: boolean
  toggleSearch: () => void

  // Filters
  selectedDynasties: string[]
  toggleDynasty: (id: string) => void
}

export const useStore = create<UniverseState>((set) => ({
  zoomLevel: 'galaxy',
  setZoomLevel: (level) => set({ zoomLevel: level }),

  selectedAuthorId: null,
  selectAuthor: (id) => set({ selectedAuthorId: id, selectedPoemId: null }),
  selectedPoemId: null,
  selectPoem: (id) => set({ selectedPoemId: id }),

  hoveredNodeId: null,
  setHoveredNode: (id) => set({ hoveredNodeId: id }),

  resetZoom: null,
  setResetZoom: (fn) => set({ resetZoom: fn }),

  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  searchOpen: false,
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),

  selectedDynasties: [],
  toggleDynasty: (id) =>
    set((s) => ({
      selectedDynasties: s.selectedDynasties.includes(id)
        ? s.selectedDynasties.filter((d) => d !== id)
        : [...s.selectedDynasties, id],
    })),
}))
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/store/
git commit -m "feat: add Zustand store for universe view state"
```

---

## Phase 2: Layout Engine & Core Canvas

### Task 4: Create dynasty narratives data

**Files:**
- Create: `src/data/narratives.json`
- Create: `src/lib/dynastyNarratives.ts`

- [ ] **Step 1: Create `src/data/narratives.json`**

```json
{
  "pre-qin": {
    "title": "先秦",
    "subtitle": "诗歌的源头",
    "narrative": "从「关关雎鸠」到「路漫漫其修远兮」，诗歌在礼乐文明中诞生，承载着先民最质朴的情感。",
    "atmosphere": "ancient"
  },
  "han": {
    "title": "两汉",
    "subtitle": "乐府与古诗",
    "narrative": "汉乐府采集民间歌谣，「感于哀乐，缘事而发」。五言诗在这里成熟，为后世奠基。",
    "atmosphere": "solemn"
  },
  "wei-jin": {
    "title": "魏晋南北朝",
    "subtitle": "风骨与性灵",
    "narrative": "乱世出诗人。建安风骨慷慨悲凉，陶渊明开田园之宗，谢灵运启山水之源。文学自觉的时代。",
    "atmosphere": "ethereal"
  },
  "tang": {
    "title": "唐",
    "subtitle": "诗的黄金时代",
    "narrative": "初唐四杰开路，盛唐李杜双峰并峙，中唐白居易倡新乐府，晚唐李商隐缠绵悱恻。一个朝代，写尽了诗的所有可能。",
    "atmosphere": "golden"
  },
  "song": {
    "title": "宋",
    "subtitle": "词的天下",
    "narrative": "词从花间走向豪放。苏轼「大江东去」，李清照「寻寻觅觅」，辛弃疾「醉里挑灯看剑」。宋人用词写尽了人间悲欢。",
    "atmosphere": "refined"
  },
  "yuan": {
    "title": "元",
    "subtitle": "曲中乾坤",
    "narrative": "散曲小令，嬉笑怒骂皆成文章。马致远一句「断肠人在天涯」，道尽漂泊之苦。",
    "atmosphere": "dramatic"
  },
  "ming": {
    "title": "明",
    "subtitle": "复古与性灵",
    "narrative": "前后七子倡复古，公安竟陵求性灵。在模仿与创新之间，明人寻找诗的出路。",
    "atmosphere": "contemplative"
  },
  "qing": {
    "title": "清",
    "subtitle": "集大成",
    "narrative": "纳兰容若以词惊世，龚自珍以诗言志。古典诗词的最后辉煌，在夕阳中绽放出璀璨的光芒。",
    "atmosphere": "twilight"
  }
}
```

- [ ] **Step 2: Create `src/lib/dynastyNarratives.ts`**

```ts
import narratives from '../data/narratives.json'

export type Atmosphere = 'ancient' | 'solemn' | 'ethereal' | 'golden' | 'refined' | 'dramatic' | 'contemplative' | 'twilight'

export interface DynastyNarrative {
  title: string
  subtitle: string
  narrative: string
  atmosphere: Atmosphere
}

export function getNarrative(dynastyId: string): DynastyNarrative | undefined {
  return (narratives as Record<string, DynastyNarrative>)[dynastyId]
}

/** Atmosphere → background gradient stops */
export const atmosphereColors: Record<Atmosphere, [string, string]> = {
  ancient:        ['#1a1a2e', '#16213e'],
  solemn:         ['#1a1a2e', '#0f3460'],
  ethereal:       ['#1a1a2e', '#2d1b69'],
  golden:         ['#1a1a2e', '#4a3000'],
  refined:        ['#1a1a2e', '#1b3a4b'],
  dramatic:       ['#1a1a2e', '#3d0000'],
  contemplative:  ['#1a1a2e', '#1a3c34'],
  twilight:       ['#1a1a2e', '#2d1f3d'],
}
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/data/narratives.json src/lib/dynastyNarratives.ts
git commit -m "feat: add dynasty narratives with atmosphere data"
```

---

### Task 5: Create timeline layout engine

**Files:**
- Create: `src/lib/layout.ts`
- Create: `src/hooks/useTimelineLayout.ts`

- [ ] **Step 1: Create `src/lib/layout.ts`**

```ts
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
```

- [ ] **Step 2: Create `src/hooks/useTimelineLayout.ts`**

```ts
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
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/layout.ts src/hooks/useTimelineLayout.ts
git commit -m "feat: add timeline layout engine with dynasty regions"
```

---

### Task 6: Create zoom hook with semantic zoom levels

**Files:**
- Create: `src/hooks/useUniverseZoom.ts`

- [ ] **Step 1: Create `src/hooks/useUniverseZoom.ts`**

```ts
import { useEffect, useRef, useCallback } from 'react'
import { select } from 'd3-selection'
import { zoom, zoomIdentity, type ZoomBehavior, type D3ZoomEvent } from 'd3-zoom'
import type { ZoomLevel } from '../types/nodes'
import { useStore } from '../store/useStore'

/**
 * Semantic zoom: determines ZoomLevel from scale factor.
 *   k < 0.4  → 'galaxy'  (see all dynasties)
 *   k < 1.5  → 'dynasty' (see authors within a dynasty)
 *   k >= 1.5 → 'poet'    (see individual poet details)
 */
function scaleToZoomLevel(k: number): ZoomLevel {
  if (k < 0.4) return 'galaxy'
  if (k < 1.5) return 'dynasty'
  return 'poet'
}

export function useUniverseZoom(
  svgRef: React.RefObject<SVGSVGElement | null>
): { zoomTo: (x: number, y: number, k: number) => void } {
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const setZoomLevel = useStore((s) => s.setZoomLevel)
  const setResetZoom = useStore((s) => s.setResetZoom)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .on('zoom', (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        const { x, y, k } = event.transform
        setZoomLevel(scaleToZoomLevel(k))

        // Apply transform to the main group
        select(svg).select<SVGGElement>('g.universe-root')
          .attr('transform', `translate(${x},${y}) scale(${k})`)
      })

    zoomBehaviorRef.current = zoomBehavior

    const sel = select(svg)
    sel.call(zoomBehavior)

    // Set initial zoom to show full galaxy
    const initialTransform = zoomIdentity.translate(0, 0).scale(0.25)
    sel.call(zoomBehavior.transform, initialTransform)

    // Register resetZoom in store so HUD can call it
    setResetZoom(() => {
      select(svg)
        .transition()
        .duration(750)
        .call(zoomBehavior.transform, zoomIdentity.scale(0.25))
    })

    return () => {
      sel.on('.zoom', null)
      setResetZoom(null)
    }
  }, [svgRef, setZoomLevel, setResetZoom])

  const zoomTo = useCallback((x: number, y: number, k: number) => {
    const svg = svgRef.current
    const zb = zoomBehaviorRef.current
    if (!svg || !zb) return
    const width = svg.clientWidth
    const height = svg.clientHeight
    select(svg)
      .transition()
      .duration(750)
      .call(
        zb.transform,
        zoomIdentity.translate(width / 2 - x * k, height / 2 - y * k).scale(k)
      )
  }, [svgRef])

  return { zoomTo }
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useUniverseZoom.ts
git commit -m "feat: add semantic zoom hook with galaxy/dynasty/poet levels"
```

---

### Task 7: Create DynastyNebula component

**Files:**
- Create: `src/components/DynastyNebula.tsx`

- [ ] **Step 1: Create `src/components/DynastyNebula.tsx`**

```tsx
import { memo } from 'react'
import type { DynastyRegion, ZoomLevel } from '../types/nodes'
import { getNarrative, atmosphereColors } from '../lib/dynastyNarratives'

interface Props {
  regions: DynastyRegion[]
  zoomLevel: ZoomLevel
}

/** Background layer: colored regions for each dynasty with narrative text */
export const DynastyNebula = memo(function DynastyNebula({ regions, zoomLevel }: Props) {
  return (
    <g className="dynasty-nebula">
      {regions.map((region) => {
        const narrative = getNarrative(region.dynasty.id)
        const [colorA, colorB] = narrative
          ? atmosphereColors[narrative.atmosphere]
          : ['#1a1a2e', '#16213e']
        const gradientId = `nebula-${region.dynasty.id}`
        const width = region.x1 - region.x0
        const height = 2000

        return (
          <g key={region.dynasty.id}>
            <defs>
              <radialGradient id={gradientId} cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor={region.color} stopOpacity={0.15} />
                <stop offset="60%" stopColor={colorB} stopOpacity={0.08} />
                <stop offset="100%" stopColor={colorA} stopOpacity={0} />
              </radialGradient>
            </defs>

            {/* Nebula background */}
            <rect
              x={region.x0}
              y={0}
              width={width}
              height={height}
              fill={`url(#${gradientId})`}
            />

            {/* Dynasty border line */}
            <line
              x1={region.x0}
              y1={0}
              x2={region.x0}
              y2={height}
              stroke={region.color}
              strokeOpacity={0.15}
              strokeWidth={1}
              strokeDasharray="8 8"
            />

            {/* Dynasty label — visible at galaxy and dynasty zoom */}
            {(zoomLevel === 'galaxy' || zoomLevel === 'dynasty') && (
              <text
                x={region.x0 + width / 2}
                y={120}
                textAnchor="middle"
                fill={region.color}
                fillOpacity={0.6}
                fontSize={zoomLevel === 'galaxy' ? 80 : 48}
                fontFamily="'LXGW WenKai', serif"
              >
                {narrative?.title ?? region.dynasty.name}
              </text>
            )}

            {/* Subtitle — visible at dynasty zoom */}
            {zoomLevel === 'dynasty' && narrative && (
              <text
                x={region.x0 + width / 2}
                y={180}
                textAnchor="middle"
                fill={region.color}
                fillOpacity={0.4}
                fontSize={28}
                fontFamily="'LXGW WenKai', serif"
              >
                {narrative.subtitle}
              </text>
            )}

            {/* Narrative text — visible at dynasty zoom */}
            {zoomLevel === 'dynasty' && narrative && (
              <foreignObject
                x={region.x0 + width * 0.15}
                y={220}
                width={width * 0.7}
                height={200}
              >
                <p
                  style={{
                    color: region.color,
                    opacity: 0.35,
                    fontSize: '18px',
                    fontFamily: "'LXGW WenKai', serif",
                    textAlign: 'center',
                    lineHeight: 1.8,
                  }}
                >
                  {narrative.narrative}
                </p>
              </foreignObject>
            )}
          </g>
        )
      })}
    </g>
  )
})
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/DynastyNebula.tsx
git commit -m "feat: add DynastyNebula background layer with narratives"
```

---

### Task 8: Create AuthorStar and RelationshipEdge components

**Files:**
- Create: `src/components/AuthorStar.tsx`
- Create: `src/components/RelationshipEdge.tsx`

- [ ] **Step 1: Create `src/components/AuthorStar.tsx`**

```tsx
import { memo, useCallback } from 'react'
import type { AuthorNode, ZoomLevel } from '../types/nodes'
import { useStore } from '../store/useStore'

interface Props {
  node: AuthorNode
  zoomLevel: ZoomLevel
  isSelected: boolean
  isConnected: boolean
  dimmed: boolean
}

export const AuthorStar = memo(function AuthorStar({
  node,
  zoomLevel,
  isSelected,
  isConnected,
  dimmed,
}: Props) {
  const selectAuthor = useStore((s) => s.selectAuthor)
  const setHoveredNode = useStore((s) => s.setHoveredNode)

  const handleClick = useCallback(() => {
    selectAuthor(isSelected ? null : node.id)
  }, [selectAuthor, isSelected, node.id])

  const handleMouseEnter = useCallback(() => {
    setHoveredNode(node.id)
  }, [setHoveredNode, node.id])

  const handleMouseLeave = useCallback(() => {
    setHoveredNode(null)
  }, [setHoveredNode])

  const dynastyColor = node.color
  const opacity = dimmed ? 0.2 : 1
  const glowRadius = isSelected ? node.radius * 3 : isConnected ? node.radius * 2 : 0

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: 'pointer', opacity }}
    >
      {/* Glow effect for selected/connected */}
      {glowRadius > 0 && (
        <circle
          r={glowRadius}
          fill={dynastyColor}
          fillOpacity={isSelected ? 0.15 : 0.08}
        />
      )}

      {/* Main circle */}
      <circle
        r={node.radius}
        fill={dynastyColor}
        fillOpacity={isSelected ? 1 : 0.7}
        stroke={isSelected ? '#fff' : dynastyColor}
        strokeWidth={isSelected ? 2 : 1}
        strokeOpacity={0.6}
      />

      {/* Author name — always visible at dynasty/poet zoom */}
      {(zoomLevel !== 'galaxy' || node.poemCount >= 3) && (
        <text
          y={node.radius + 16}
          textAnchor="middle"
          fill="#e0d6c8"
          fillOpacity={dimmed ? 0.3 : 0.9}
          fontSize={zoomLevel === 'galaxy' ? 24 : 14}
          fontFamily="'LXGW WenKai', serif"
        >
          {node.label}
        </text>
      )}

      {/* Style labels — visible at poet zoom when selected */}
      {zoomLevel === 'poet' && isSelected && node.styleLabels.length > 0 && (
        <text
          y={node.radius + 32}
          textAnchor="middle"
          fill={dynastyColor}
          fillOpacity={0.6}
          fontSize={10}
          fontFamily="'LXGW WenKai', serif"
        >
          {node.styleLabels.join(' · ')}
        </text>
      )}
    </g>
  )
})
```

- [ ] **Step 2: Create `src/components/RelationshipEdge.tsx`**

```tsx
import { memo } from 'react'
import type { AuthorNode, RelationshipEdge as EdgeType } from '../types/nodes'

interface Props {
  edge: EdgeType
  sourceNode: AuthorNode
  targetNode: AuthorNode
  highlighted: boolean
  dimmed: boolean
}

export const RelationshipEdge = memo(function RelationshipEdge({
  edge,
  sourceNode,
  targetNode,
  highlighted,
  dimmed,
}: Props) {
  const opacity = dimmed ? 0.05 : highlighted ? 0.8 : 0.3

  return (
    <line
      x1={sourceNode.x}
      y1={sourceNode.y}
      x2={targetNode.x}
      y2={targetNode.y}
      stroke={edge.color}
      strokeWidth={highlighted ? 2 : 1}
      strokeOpacity={opacity}
      strokeDasharray={edge.dashArray || undefined}
    />
  )
})
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/AuthorStar.tsx src/components/RelationshipEdge.tsx
git commit -m "feat: add AuthorStar and RelationshipEdge SVG components"
```

---

### Task 9: Create Universe main canvas component

**Files:**
- Create: `src/components/Universe.tsx`
- Create: `src/components/TimelineAxis.tsx`

- [ ] **Step 1: Create `src/components/TimelineAxis.tsx`**

```tsx
import { memo } from 'react'
import type { DynastyRegion } from '../types/nodes'
import { WORLD } from '../lib/layout'

interface Props {
  regions: DynastyRegion[]
}

export const TimelineAxis = memo(function TimelineAxis({ regions }: Props) {
  return (
    <g className="timeline-axis">
      <line
        x1={0} y1={WORLD.HEIGHT - 60}
        x2={WORLD.WIDTH} y2={WORLD.HEIGHT - 60}
        stroke="#e0d6c8" strokeOpacity={0.1} strokeWidth={1}
      />
      {regions.map((r) => (
        <g key={r.dynasty.id}>
          <text
            x={(r.x0 + r.x1) / 2}
            y={WORLD.HEIGHT - 30}
            textAnchor="middle"
            fill={r.color}
            fillOpacity={0.4}
            fontSize={16}
            fontFamily="'LXGW WenKai', serif"
          >
            {r.dynasty.name}
          </text>
          <text
            x={(r.x0 + r.x1) / 2}
            y={WORLD.HEIGHT - 10}
            textAnchor="middle"
            fill="#e0d6c8"
            fillOpacity={0.2}
            fontSize={11}
          >
            {r.dynasty.startYear < 0 ? `前${Math.abs(r.dynasty.startYear)}` : r.dynasty.startYear}
            —{r.dynasty.endYear}
          </text>
        </g>
      ))}
    </g>
  )
})
```

- [ ] **Step 2: Create `src/components/Universe.tsx`**

```tsx
import { useRef, useMemo } from 'react'
import authors from '../data/authors.json'
import poems from '../data/poems.json'
import dynasties from '../data/dynasties.json'
import relationshipsData from '../data/relationships.json'
import type { Author, Poem, Dynasty } from '../types/poem'
import type { RelationshipEdge as EdgeType } from '../types/nodes'
import { useStore } from '../store/useStore'
import { useTimelineLayout } from '../hooks/useTimelineLayout'
import { useUniverseZoom } from '../hooks/useUniverseZoom'
import { useDimensions } from './visualizations/shared/useDimensions'
import { DynastyNebula } from './DynastyNebula'
import { AuthorStar } from './AuthorStar'
import { RelationshipEdge } from './RelationshipEdge'
import { TimelineAxis } from './TimelineAxis'
import { PoemOrbit } from './PoemOrbit'
import { WORLD } from '../lib/layout'

export function Universe() {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [containerRef, dims] = useDimensions()

  const { zoomTo } = useUniverseZoom(svgRef)
  const zoomLevel = useStore((s) => s.zoomLevel)
  const selectedAuthorId = useStore((s) => s.selectedAuthorId)

  const { authorNodes, dynastyRegions } = useTimelineLayout(
    authors as Author[],
    poems as Poem[],
    dynasties as Dynasty[]
  )

  // Build relationship edges
  const edges = useMemo<EdgeType[]>(() => {
    const nodeIds = new Set(authorNodes.map((n) => n.id))
    const types = relationshipsData.relationship_types as Record<
      string, { label: string; color: string; dashArray: string }
    >
    return relationshipsData.author_relationships
      .filter((r) => nodeIds.has(r.source) && nodeIds.has(r.target))
      .map((r) => ({
        source: r.source,
        target: r.target,
        type: r.type,
        label: r.label,
        description: r.description,
        strength: r.strength,
        color: types[r.type]?.color ?? '#888',
        dashArray: types[r.type]?.dashArray ?? '',
      }))
  }, [authorNodes])

  const nodeMap = useMemo(
    () => new Map(authorNodes.map((n) => [n.id, n])),
    [authorNodes]
  )

  // Connected author IDs for the selected author
  const connectedIds = useMemo(() => {
    if (!selectedAuthorId) return new Set<string>()
    const ids = new Set<string>()
    for (const e of edges) {
      if (e.source === selectedAuthorId) ids.add(e.target)
      if (e.target === selectedAuthorId) ids.add(e.source)
    }
    return ids
  }, [selectedAuthorId, edges])

  // Poems for selected author
  const selectedPoems = useMemo(
    () =>
      selectedAuthorId
        ? (poems as Poem[]).filter((p) => p.authorId === selectedAuthorId)
        : [],
    [selectedAuthorId]
  )

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden bg-[var(--color-bg-deep)]">
      <svg
        ref={svgRef}
        width={dims.width}
        height={dims.height}
        className="block"
      >
        <g className="universe-root">
          <DynastyNebula regions={dynastyRegions} zoomLevel={zoomLevel} />

          <g className="edges">
            {edges.map((e) => {
              const src = nodeMap.get(e.source)
              const tgt = nodeMap.get(e.target)
              if (!src || !tgt) return null
              const highlighted =
                e.source === selectedAuthorId || e.target === selectedAuthorId
              const dimmed = !!selectedAuthorId && !highlighted
              return (
                <RelationshipEdge
                  key={`${e.source}-${e.target}`}
                  edge={e}
                  sourceNode={src}
                  targetNode={tgt}
                  highlighted={highlighted}
                  dimmed={dimmed}
                />
              )
            })}
          </g>

          <g className="nodes">
            {authorNodes.map((node) => {
              const isSelected = node.id === selectedAuthorId
              const isConnected = connectedIds.has(node.id)
              const dimmed = !!selectedAuthorId && !isSelected && !isConnected
              return (
                <AuthorStar
                  key={node.id}
                  node={node}
                  zoomLevel={zoomLevel}
                  isSelected={isSelected}
                  isConnected={isConnected}
                  dimmed={dimmed}
                />
              )
            })}
          </g>

          {selectedAuthorId && selectedPoems.length > 0 && (
            <PoemOrbit
              authorNode={nodeMap.get(selectedAuthorId)!}
              poems={selectedPoems}
              zoomLevel={zoomLevel}
            />
          )}

          <TimelineAxis regions={dynastyRegions} />
        </g>
      </svg>
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: Will fail because `PoemOrbit` doesn't exist yet — that's Task 10. Verify no other errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Universe.tsx src/components/TimelineAxis.tsx
git commit -m "feat: add Universe main canvas with timeline layout"
```

---

## Phase 3: Content Layer

### Task 10: Create PoemOrbit component

**Files:**
- Create: `src/components/PoemOrbit.tsx`

- [ ] **Step 1: Create `src/components/PoemOrbit.tsx`**

```tsx
import { memo, useMemo } from 'react'
import type { Poem } from '../types/poem'
import type { AuthorNode, ZoomLevel } from '../types/nodes'
import { useStore } from '../store/useStore'

interface Props {
  authorNode: AuthorNode
  poems: Poem[]
  zoomLevel: ZoomLevel
}

/** Poem satellites orbiting a selected author */
export const PoemOrbit = memo(function PoemOrbit({ authorNode, poems, zoomLevel }: Props) {
  const selectPoem = useStore((s) => s.selectPoem)
  const selectedPoemId = useStore((s) => s.selectedPoemId)

  const poemNodes = useMemo(() => {
    const baseRadius = authorNode.radius * 3 + 30
    return poems.map((poem, i) => {
      const angle = (2 * Math.PI * i) / poems.length - Math.PI / 2
      const orbitRadius = baseRadius + Math.floor(i / 8) * 40
      return {
        poem,
        x: authorNode.x + Math.cos(angle) * orbitRadius,
        y: authorNode.y + Math.sin(angle) * orbitRadius,
        angle,
      }
    })
  }, [authorNode, poems])

  if (zoomLevel === 'galaxy') return null

  return (
    <g className="poem-orbit">
      {/* Orbit ring */}
      <circle
        cx={authorNode.x}
        cy={authorNode.y}
        r={authorNode.radius * 3 + 30}
        fill="none"
        stroke="#e0d6c8"
        strokeOpacity={0.08}
        strokeWidth={1}
        strokeDasharray="4 4"
      />

      {/* Poem nodes */}
      {poemNodes.map(({ poem, x, y }) => {
        const isSelected = poem.id === selectedPoemId
        return (
          <g
            key={poem.id}
            transform={`translate(${x}, ${y})`}
            onClick={() => selectPoem(isSelected ? null : poem.id)}
            style={{ cursor: 'pointer' }}
          >
            <circle
              r={isSelected ? 8 : 5}
              fill="#e0d6c8"
              fillOpacity={isSelected ? 0.9 : 0.5}
              stroke={isSelected ? '#fff' : 'none'}
              strokeWidth={1}
            />
            {zoomLevel === 'poet' && (
              <text
                y={-10}
                textAnchor="middle"
                fill="#e0d6c8"
                fillOpacity={isSelected ? 0.9 : 0.6}
                fontSize={11}
                fontFamily="'LXGW WenKai', serif"
              >
                {poem.title}
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
})
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/PoemOrbit.tsx
git commit -m "feat: add PoemOrbit satellite component"
```

---

### Task 11: Create PoemReader immersive view

**Files:**
- Create: `src/components/PoemReader.tsx`

- [ ] **Step 1: Create `src/components/PoemReader.tsx`**

```tsx
import { useStore } from '../store/useStore'
import poems from '../data/poems.json'
import authors from '../data/authors.json'
import dynasties from '../data/dynasties.json'
import type { Poem, Author, Dynasty } from '../types/poem'

export function PoemReader() {
  const selectedPoemId = useStore((s) => s.selectedPoemId)
  const selectPoem = useStore((s) => s.selectPoem)

  if (!selectedPoemId) return null

  const poem = (poems as Poem[]).find((p) => p.id === selectedPoemId)
  if (!poem) return null

  const author = (authors as Author[]).find((a) => a.id === poem.authorId)
  const dynasty = (dynasties as Dynasty[]).find((d) => d.id === poem.dynastyId)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(10, 10, 20, 0.92)', backdropFilter: 'blur(20px)' }}
      onClick={() => selectPoem(null)}
    >
      <div
        className="max-w-2xl w-full mx-4 p-10 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(30,30,50,0.9), rgba(20,20,35,0.95))',
          border: '1px solid rgba(224,214,200,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2
            className="text-2xl mb-2"
            style={{ color: '#e0d6c8', fontFamily: "'LXGW WenKai', serif" }}
          >
            {poem.title}
          </h2>
          <p style={{ color: dynasty?.color ?? '#888', opacity: 0.7, fontSize: '14px' }}>
            [{dynasty?.name}] {author?.name}
          </p>
          {poem.form && (
            <span
              className="inline-block mt-2 px-3 py-1 rounded-full text-xs"
              style={{
                background: 'rgba(224,214,200,0.08)',
                color: '#e0d6c8',
                opacity: 0.5,
              }}
            >
              {poem.form}
            </span>
          )}
        </div>

        {/* Full text */}
        <div
          className="text-center mb-8 leading-loose"
          style={{
            color: '#e0d6c8',
            fontSize: '18px',
            fontFamily: "'LXGW WenKai', serif",
            lineHeight: 2.2,
            whiteSpace: 'pre-line',
          }}
        >
          {poem.full_text}
        </div>

        {/* Translation */}
        {poem.translation && (
          <div
            className="mb-6 p-4 rounded-lg"
            style={{ background: 'rgba(224,214,200,0.04)' }}
          >
            <p className="text-xs mb-2" style={{ color: '#e0d6c8', opacity: 0.4 }}>
              译文
            </p>
            <p
              style={{
                color: '#e0d6c8',
                opacity: 0.6,
                fontSize: '14px',
                lineHeight: 1.8,
                fontFamily: "'LXGW WenKai', serif",
              }}
            >
              {poem.translation}
            </p>
          </div>
        )}

        {/* Annotation */}
        {poem.annotation && (
          <div className="p-4 rounded-lg" style={{ background: 'rgba(224,214,200,0.04)' }}>
            <p className="text-xs mb-2" style={{ color: '#e0d6c8', opacity: 0.4 }}>
              赏析
            </p>
            <p
              style={{
                color: '#e0d6c8',
                opacity: 0.6,
                fontSize: '14px',
                lineHeight: 1.8,
                fontFamily: "'LXGW WenKai', serif",
              }}
            >
              {poem.annotation}
            </p>
          </div>
        )}

        {/* Close hint */}
        <p className="text-center mt-8 text-xs" style={{ color: '#e0d6c8', opacity: 0.25 }}>
          点击空白处关闭
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/PoemReader.tsx
git commit -m "feat: add immersive PoemReader overlay"
```

---

## Phase 4: Integration & Polish

### Task 12: Create HUD and Search components

**Files:**
- Create: `src/components/HUD.tsx`
- Create: `src/components/SearchOverlay.tsx`
- Create: `src/hooks/useSearch.ts`

- [ ] **Step 1: Create `src/hooks/useSearch.ts`**

```ts
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
```

- [ ] **Step 2: Create `src/components/SearchOverlay.tsx`**

```tsx
import { useStore } from '../store/useStore'
import { useSearch } from '../hooks/useSearch'
import authors from '../data/authors.json'
import poems from '../data/poems.json'
import type { Author, Poem } from '../types/poem'

interface Props {
  onSelectAuthor: (id: string) => void
  onSelectPoem: (id: string) => void
}

export function SearchOverlay({ onSelectAuthor, onSelectPoem }: Props) {
  const searchOpen = useStore((s) => s.searchOpen)
  const toggleSearch = useStore((s) => s.toggleSearch)
  const searchQuery = useStore((s) => s.searchQuery)
  const setSearchQuery = useStore((s) => s.setSearchQuery)

  const results = useSearch(authors as Author[], poems as Poem[], searchQuery)

  if (!searchOpen) return null

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center pt-20"
      style={{ backgroundColor: 'rgba(10,10,20,0.8)' }}
      onClick={toggleSearch}
    >
      <div
        className="w-full max-w-lg mx-4 rounded-xl overflow-hidden"
        style={{
          background: 'rgba(30,30,50,0.95)',
          border: '1px solid rgba(224,214,200,0.1)',
          backdropFilter: 'blur(16px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索诗人或诗词..."
          className="w-full px-6 py-4 bg-transparent outline-none"
          style={{
            color: '#e0d6c8',
            fontSize: '16px',
            fontFamily: "'LXGW WenKai', serif",
            borderBottom: '1px solid rgba(224,214,200,0.08)',
          }}
        />
        {results.length > 0 && (
          <ul className="max-h-80 overflow-y-auto">
            {results.map((r) => (
              <li
                key={`${r.type}-${r.id}`}
                className="px-6 py-3 hover:bg-white/5 cursor-pointer"
                onClick={() => {
                  if (r.type === 'author') onSelectAuthor(r.id)
                  else onSelectPoem(r.id)
                  toggleSearch()
                  setSearchQuery('')
                }}
              >
                <span style={{ color: '#e0d6c8', fontSize: '14px' }}>{r.title}</span>
                <span className="ml-2" style={{ color: '#e0d6c8', opacity: 0.4, fontSize: '12px' }}>
                  {r.type === 'author' ? '诗人' : '诗词'} · {r.subtitle}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/HUD.tsx`**

```tsx
import { useStore } from '../store/useStore'

export function HUD() {
  const zoomLevel = useStore((s) => s.zoomLevel)
  const selectedAuthorId = useStore((s) => s.selectedAuthorId)
  const selectAuthor = useStore((s) => s.selectAuthor)
  const toggleSearch = useStore((s) => s.toggleSearch)
  const resetZoom = useStore((s) => s.resetZoom)

  const handleReset = () => resetZoom?.()

  return (
    <div className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: title + breadcrumb */}
        <div className="pointer-events-auto">
          <h1
            className="text-lg cursor-pointer"
            style={{ color: '#e0d6c8', fontFamily: "'LXGW WenKai', serif" }}
            onClick={handleReset}
          >
            诗词元宇宙
          </h1>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#e0d6c8', opacity: 0.4 }}>
            <span>{zoomLevel === 'galaxy' ? '全景' : zoomLevel === 'dynasty' ? '朝代' : '诗人'}</span>
            {selectedAuthorId && (
              <>
                <span>›</span>
                <span
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => selectAuthor(null)}
                >
                  {selectedAuthorId}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: search + zoom controls */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={toggleSearch}
            className="px-4 py-2 rounded-lg text-sm"
            style={{
              background: 'rgba(224,214,200,0.08)',
              color: '#e0d6c8',
              border: '1px solid rgba(224,214,200,0.1)',
              fontFamily: "'LXGW WenKai', serif",
            }}
          >
            搜索
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-lg text-sm"
            style={{
              background: 'rgba(224,214,200,0.08)',
              color: '#e0d6c8',
              border: '1px solid rgba(224,214,200,0.1)',
            }}
          >
            全景
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify build**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useSearch.ts src/components/SearchOverlay.tsx src/components/HUD.tsx
git commit -m "feat: add HUD, search overlay with fuse.js"
```

---

### Task 13: Wire everything together — App.tsx + routing + cleanup

**Files:**
- Modify: `src/App.tsx` (rewrite from stub)
- Modify: `src/main.tsx`
- Modify: `src/index.css`
- Modify: `src/components/AuthorPanel.tsx`
- Modify: `index.html`

- [ ] **Step 1: Rewrite `src/App.tsx`**

```tsx
import { Universe } from './components/Universe'
import { HUD } from './components/HUD'
import { SearchOverlay } from './components/SearchOverlay'
import { PoemReader } from './components/PoemReader'
import { AuthorPanel } from './components/AuthorPanel'
import { useStore } from './store/useStore'
import authors from './data/authors.json'
import poems from './data/poems.json'
import type { Author, Poem } from './types/poem'

export default function App() {
  const selectedAuthorId = useStore((s) => s.selectedAuthorId)
  const selectAuthor = useStore((s) => s.selectAuthor)
  const selectPoem = useStore((s) => s.selectPoem)

  const author = selectedAuthorId
    ? (authors as Author[]).find((a) => a.id === selectedAuthorId)
    : null
  const authorPoems = selectedAuthorId
    ? (poems as Poem[]).filter((p) => p.authorId === selectedAuthorId)
    : []

  return (
    <div className="w-screen h-screen overflow-hidden bg-[var(--color-bg-deep)]">
      <Universe />
      <HUD />
      <SearchOverlay
        onSelectAuthor={(id) => selectAuthor(id)}
        onSelectPoem={(id) => selectPoem(id)}
      />
      {author && (
        <AuthorPanel
          author={author}
          poems={authorPoems}
          onClose={() => selectAuthor(null)}
        />
      )}
      <PoemReader />
    </div>
  )
}
```

- [ ] **Step 2: Update `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Step 3: Fix LXGW WenKai in font stack — edit `src/index.css`**

Find the `--font-family-sans` variable and change to:
```css
--font-family-sans: 'LXGW WenKai', 'Noto Sans SC', 'PingFang SC', system-ui, sans-serif;
```

- [ ] **Step 4: Update `src/components/AuthorPanel.tsx`**

Change from default export to named export, add `onClose` prop, and use `getDynastyName` + `getDynastyColor` from `colorScales.ts`:

1. Change `export default function AuthorPanel` → `export function AuthorPanel`
2. Update the props interface:

```tsx
import { getDynastyName, getDynastyColor } from '../lib/colorScales'

interface Props {
  author: Author
  poems: Poem[]
  onClose: () => void
}
```

3. Replace all `dynastyColor` prop references with `getDynastyColor(author.dynastyId)`:
   - The top glow line: `style={{ background: getDynastyColor(author.dynastyId), ... }}`
   - The dynasty badge: `style={{ backgroundColor: getDynastyColor(author.dynastyId) }}`
4. Replace `{author.dynastyId}` with `{getDynastyName(author.dynastyId)}`
5. Add close button wired to `onClose` prop

- [ ] **Step 5: Verify full build**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS — clean build with no errors

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: wire up Universe, HUD, search, poem reader — complete metaverse shell"
```

---

### Task 14: Final cleanup and verify

**Files:**
- Modify: `package.json` (remove unused scripts if any)
- Modify: `.gitignore` (add dist/ if missing)

- [ ] **Step 1: Add `dist/` to `.gitignore` if not present**

```bash
echo "dist/" >> .gitignore
```

- [ ] **Step 2: Run dev server and manual smoke test**

Run: `npm run dev` (user runs manually)

Verify:
- Galaxy view shows all dynasties as colored nebulae with labels
- Scroll to zoom in → dynasty names get smaller, author names appear
- Click an author → zoom in, poem satellites appear, AuthorPanel slides in
- Click a poem satellite → PoemReader overlay opens
- Search button → search overlay, type a poet name → results appear
- Click "全景" → zoom back to galaxy view

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: cleanup gitignore, finalize metaverse v1"
```

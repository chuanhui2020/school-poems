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

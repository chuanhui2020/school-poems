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

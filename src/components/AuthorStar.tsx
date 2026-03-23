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

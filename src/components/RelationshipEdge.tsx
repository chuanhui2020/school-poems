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

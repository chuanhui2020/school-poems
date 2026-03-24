import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { QuadraticBezierLine } from '@react-three/drei'
import * as THREE from 'three'
import type { RelationshipEdge, AuthorNode } from '../types/nodes'

interface Props {
  edge: RelationshipEdge
  sourceNode: AuthorNode
  targetNode: AuthorNode
  highlighted: boolean
  dimmed: boolean
}

/** Color per relationship type */
const TYPE_COLORS: Record<string, string> = {
  friendship: '#f0c060',
  teacher_student: '#80c8ff',
  literary_school: '#c080ff',
  family: '#ff9080',
  contemporary: '#80ffb0',
}

export function RelationshipCurve3D({ edge, sourceNode, targetNode, highlighted, dimmed }: Props) {
  const progressRef = useRef(0)
  const matRef = useRef<THREE.LineBasicMaterial>(null)

  const color = TYPE_COLORS[edge.type] ?? '#aaaaaa'
  const opacity = dimmed ? 0.05 : highlighted ? 0.95 : 0.3

  const start = new THREE.Vector3(sourceNode.x, sourceNode.y, sourceNode.z)
  const end = new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z)

  // Midpoint lifted in Y to create an arc
  const mid = useMemo(() => {
    const m = start.clone().lerp(end, 0.5)
    m.y += Math.max(10, start.distanceTo(end) * 0.25)
    m.z += (sourceNode.z + targetNode.z) / 2
    return m
  }, [sourceNode, targetNode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Animate a flow pulse along the line
  useFrame((_, delta) => {
    if (!highlighted) return
    progressRef.current = (progressRef.current + delta * 0.4) % 1
  })

  return (
    <QuadraticBezierLine
      start={start}
      end={end}
      mid={mid}
      color={color}
      lineWidth={highlighted ? edge.strength * 0.6 : edge.strength * 0.25}
      transparent
      opacity={opacity}
      dashed={edge.type === 'contemporary'}
      dashScale={highlighted ? 2 : 1}
    />
  )
}

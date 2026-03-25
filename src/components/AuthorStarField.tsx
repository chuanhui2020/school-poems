import { useRef, useMemo, useCallback, useEffect } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { createStarShaderMaterial } from '../shaders/starMaterial'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { AuthorNode } from '../types/nodes'
import type { ZoomLevel } from '../types'
import { useStore } from '../store/useStore'

interface Props {
  nodes: AuthorNode[]
  zoomLevel: ZoomLevel
}

// Pre-allocated temp objects — reused every frame, zero GC
const _tempMatrix = new THREE.Matrix4()
const _tempVec = new THREE.Vector3()
const _tempColor = new THREE.Color()

export function AuthorStarField({ nodes, zoomLevel }: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const selectAuthor = useStore((s) => s.selectAuthor)
  const setFlyToTarget = useStore((s) => s.setFlyToTarget)
  const selectedAuthorId = useStore((s) => s.selectedAuthorId)
  const setHoveredNode = useStore((s) => s.setHoveredNode)
  const hoveredNodeId = useStore((s) => s.hoveredNodeId)

  const starMaterial = useMemo(() => createStarShaderMaterial(), [])

  // Build index → node lookup
  const nodeIndex = useMemo(() => new Map(nodes.map((n, i) => [i, n])), [nodes])
  const idToIndex = useMemo(() => new Map(nodes.map((n, i) => [n.id, i])), [nodes])

  // Set instance matrices and colors
  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    nodes.forEach((node, i) => {
      _tempMatrix.makeScale(node.radius, node.radius, node.radius)
      _tempMatrix.setPosition(node.x, node.y, node.z)
      mesh.setMatrixAt(i, _tempMatrix)
      _tempColor.set(node.color)
      mesh.setColorAt(i, _tempColor)
    })

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [nodes])

  // Animate hovered/selected instance scale
  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!mesh) return

    const hovIdx = hoveredNodeId ? idToIndex.get(hoveredNodeId) : undefined
    const selIdx = selectedAuthorId ? idToIndex.get(selectedAuthorId) : undefined

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const isHovered = i === hovIdx
      const isSelected = i === selIdx
      const targetScale = isHovered || isSelected ? node.radius * 1.3 : node.radius

      mesh.getMatrixAt(i, _tempMatrix)
      _tempVec.setFromMatrixPosition(_tempMatrix)

      // Extract current scale from matrix
      const currentScale = _tempMatrix.elements[0]
      const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1)

      _tempMatrix.makeScale(newScale, newScale, newScale)
      _tempMatrix.setPosition(_tempVec.x, _tempVec.y, _tempVec.z)
      mesh.setMatrixAt(i, _tempMatrix)
    }

    mesh.instanceMatrix.needsUpdate = true
    starMaterial.uniforms.uTime.value = clock.getElapsedTime()
  })

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.instanceId === undefined) return
    const node = nodeIndex.get(e.instanceId)
    if (node) {
      selectAuthor(node.id)
      setFlyToTarget([node.x, node.y, node.z + 20])
    }
  }, [nodeIndex, selectAuthor, setFlyToTarget])

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (e.instanceId === undefined) return
    const node = nodeIndex.get(e.instanceId)
    if (node) {
      setHoveredNode(node.id)
      document.body.style.cursor = 'pointer'
    }
  }, [nodeIndex, setHoveredNode])

  const handlePointerOut = useCallback(() => {
    setHoveredNode(null)
    document.body.style.cursor = 'auto'
  }, [setHoveredNode])

  // Determine which labels to show based on zoom level
  const labelsToShow = useMemo(() => {
    if (zoomLevel === 'galaxy') return []
    if (zoomLevel === 'dynasty') return nodes.filter((n) => n.poemCount > 3)
    return nodes // poet level: show all
  }, [nodes, zoomLevel])

  // Hovered/selected node for highlight label
  const hoveredNode = hoveredNodeId ? nodes.find((n) => n.id === hoveredNodeId) : null
  const selectedNode = selectedAuthorId ? nodes.find((n) => n.id === selectedAuthorId) : null

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, nodes.length]}
        frustumCulled={false}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <primitive object={starMaterial} attach="material" />
      </instancedMesh>

      {/* LOD labels */}
      {labelsToShow.map((node) => (
        <Billboard key={node.id} position={[node.x, node.y + node.radius + 2, node.z]}>
          <Text
            fontSize={2.5}
            color={node.color}
            anchorX="center"
            anchorY="bottom"
            font="/fonts/LXGWWenKai-Subset.woff2"
            fillOpacity={0.7}
          >
            {node.label}
          </Text>
        </Billboard>
      ))}

      {/* Hovered label (always on top) */}
      {hoveredNode && !labelsToShow.includes(hoveredNode) && (
        <Billboard position={[hoveredNode.x, hoveredNode.y + hoveredNode.radius + 2, hoveredNode.z]}>
          <Text
            fontSize={2.5}
            color={hoveredNode.color}
            anchorX="center"
            anchorY="bottom"
            font="/fonts/LXGWWenKai-Subset.woff2"
            fillOpacity={0.9}
          >
            {hoveredNode.label}
          </Text>
        </Billboard>
      )}

      {/* Selected label (always on top) */}
      {selectedNode && !labelsToShow.includes(selectedNode) && selectedNode !== hoveredNode && (
        <Billboard position={[selectedNode.x, selectedNode.y + selectedNode.radius + 2, selectedNode.z]}>
          <Text
            fontSize={2.5}
            color={selectedNode.color}
            anchorX="center"
            anchorY="bottom"
            font="/fonts/LXGWWenKai-Subset.woff2"
            fillOpacity={0.9}
          >
            {selectedNode.label}
          </Text>
        </Billboard>
      )}
    </group>
  )
}

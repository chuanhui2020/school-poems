import { useRef, useState, useCallback } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import { Lod, Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { AuthorNode } from '../types/nodes'
import { useStore } from '../store/useStore'

interface Props {
  node: AuthorNode
}

export function AuthorStar3D({ node }: Props) {
  const selectAuthor = useStore((s) => s.selectAuthor)
  const setFlyToTarget = useStore((s) => s.setFlyToTarget)
  const selectedAuthorId = useStore((s) => s.selectedAuthorId)
  const setHoveredNode = useStore((s) => s.setHoveredNode)

  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const isSelected = selectedAuthorId === node.id

  const color = new THREE.Color(node.color)
  const emissiveIntensity = hovered ? 0.8 : isSelected ? 1.0 : 0.3

  useFrame(() => {
    if (meshRef.current) {
      const scale = hovered || isSelected ? 1.3 : 1.0
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1)
    }
  })

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    selectAuthor(node.id)
    setFlyToTarget([node.x, node.y, node.z + 20])
  }, [node, selectAuthor, setFlyToTarget])

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(true)
    setHoveredNode(node.id)
    document.body.style.cursor = 'pointer'
  }, [node.id, setHoveredNode])

  const handlePointerOut = useCallback(() => {
    setHovered(false)
    setHoveredNode(null)
    document.body.style.cursor = 'auto'
  }, [setHoveredNode])

  return (
    <group position={[node.x, node.y, node.z]}>
      {/* LOD: detailed → medium → point */}
      <Lod>
        {/* Level 0: close — full sphere with emissive glow */}
        <group>
          <mesh
            ref={meshRef}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          >
            <sphereGeometry args={[node.radius, 16, 16]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={emissiveIntensity}
              roughness={0.3}
              metalness={0.6}
            />
          </mesh>
          {/* Point light corona */}
          <pointLight color={color} intensity={0.4} distance={node.radius * 8} decay={2} />
          {/* Name label */}
          <Billboard>
            <Text
              position={[0, node.radius + 2, 0]}
              fontSize={2.5}
              color={node.color}
              anchorX="center"
              anchorY="bottom"
              font="/fonts/LXGWWenKai-Regular.ttf"
              fillOpacity={0.9}
            >
              {node.label}
            </Text>
          </Billboard>
        </group>

        {/* Level 1: medium — simpler sphere, no label */}
        <mesh
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <sphereGeometry args={[node.radius, 8, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={emissiveIntensity * 0.6}
            roughness={0.5}
          />
        </mesh>

        {/* Level 2: far — single point sprite */}
        <mesh
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <sphereGeometry args={[node.radius * 0.6, 4, 4]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </Lod>
    </group>
  )
}

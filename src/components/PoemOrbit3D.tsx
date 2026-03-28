import { useRef, useMemo, useCallback, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { PoemNode, AuthorNode } from '../types/nodes'
import { useStore } from '../store/useStore'

interface Props {
  poems: PoemNode[]
  author: AuthorNode
  visible: boolean
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

function fibonacciSphere(index: number, total: number, radius: number): THREE.Vector3 {
  const y = 1 - (index / Math.max(total - 1, 1)) * 2
  const r = Math.sqrt(1 - y * y)
  const theta = GOLDEN_ANGLE * index
  return new THREE.Vector3(
    Math.cos(theta) * r * radius,
    y * radius,
    Math.sin(theta) * r * radius
  )
}

// Cyberpunk neon colors
const NEON_CYAN = '#00f0ff'
const NEON_RED = '#ff003c'
const NEON_PURPLE = '#b400ff'

export function PoemOrbit3D({ poems, author, visible }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const selectPoem = useStore((s) => s.selectPoem)
  const selectedPoemId = useStore((s) => s.selectedPoemId)
  const [hoveredPoemId, setHoveredPoemId] = useState<string | null>(null)

  const orbitRadius = author.radius * 4 + 6

  const positions = useMemo(
    () => poems.map((_, i) => fibonacciSphere(i, poems.length, orbitRadius)),
    [poems, orbitRadius]
  )

  useFrame((_, delta) => {
    if (groupRef.current && visible) {
      groupRef.current.rotation.y += delta * 0.08
      groupRef.current.rotation.x += delta * 0.03
    }
  })

  const handleClick = useCallback(
    (poemId: string) => (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      selectPoem(poemId)
    },
    [selectPoem]
  )

  if (!visible) return null

  return (
    <group ref={groupRef} position={[author.x, author.y, author.z]}>
      {poems.map((poemNode, i) => {
        const pos = positions[i]
        const isSelected = selectedPoemId === poemNode.id
        const isHovered = hoveredPoemId === poemNode.id
        const glowColor = isSelected ? NEON_RED : isHovered ? NEON_CYAN : NEON_PURPLE

        return (
          <group key={poemNode.id} position={pos}>
            <mesh
              onClick={handleClick(poemNode.id)}
              onPointerEnter={() => setHoveredPoemId(poemNode.id)}
              onPointerLeave={() => setHoveredPoemId(null)}
              scale={isSelected ? 1.7 : isHovered ? 1.4 : 1.0}
              rotation={[Math.PI / 4, 0, Math.PI / 4]}
            >
              <octahedronGeometry args={[0.6, 0]} />
              <meshStandardMaterial
                color="#101025"
                emissive={glowColor}
                emissiveIntensity={isSelected ? 1.2 : isHovered ? 0.8 : 0.4}
                roughness={0.3}
                metalness={0.8}
                transparent
                opacity={0.95}
              />
            </mesh>

            {(isSelected || isHovered) && (
              <Billboard>
                <Text
                  position={[0, 2, 0]}
                  fontSize={1.8}
                  color="#e0e8ff"
                  anchorX="center"
                  anchorY="bottom"
                  font="/fonts/LXGWWenKai-Subset.ttf"
                  maxWidth={20}
                  outlineWidth={0.08}
                  outlineColor="#00f0ff"
                >
                  {poemNode.poem.title}
                </Text>
              </Billboard>
            )}
          </group>
        )
      })}
    </group>
  )
}

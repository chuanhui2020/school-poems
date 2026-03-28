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

// Ink dot colors
const INK_COLOR = '#1a1a2e'
const INK_EMISSIVE = '#2d2d44'
const CINNABAR = '#c43e1c'

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
        const dotColor = isSelected ? CINNABAR : INK_COLOR
        const emissive = isSelected ? CINNABAR : INK_EMISSIVE

        return (
          <group key={poemNode.id} position={pos}>
            <mesh
              onClick={handleClick(poemNode.id)}
              onPointerEnter={() => setHoveredPoemId(poemNode.id)}
              onPointerLeave={() => setHoveredPoemId(null)}
              scale={isSelected ? 1.7 : isHovered ? 1.4 : 1.0}
            >
              <sphereGeometry args={[0.6, 8, 8]} />
              <meshStandardMaterial
                color={dotColor}
                emissive={emissive}
                emissiveIntensity={isSelected ? 0.8 : isHovered ? 0.5 : 0.2}
                roughness={0.8}
                transparent
                opacity={0.9}
              />
            </mesh>

            {(isSelected || isHovered) && (
              <Billboard>
                <Text
                  position={[0, 2, 0]}
                  fontSize={1.8}
                  color="#e0dcd0"
                  anchorX="center"
                  anchorY="bottom"
                  font="/fonts/LXGWWenKai-Subset.ttf"
                  maxWidth={20}
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

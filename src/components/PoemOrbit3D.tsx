import { useRef, useMemo, useCallback } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
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

/** Fibonacci sphere — evenly distributes N points on a sphere surface */
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

export function PoemOrbit3D({ poems, author, visible }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const selectPoem = useStore((s) => s.selectPoem)
  const selectedPoemId = useStore((s) => s.selectedPoemId)

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
        const dotColor = isSelected ? '#fff8e0' : author.color

        return (
          <group key={poemNode.id} position={pos}>
            {/* Poem dot */}
            <mesh onClick={handleClick(poemNode.id)}>
              <sphereGeometry args={[isSelected ? 1.2 : 0.7, 8, 8]} />
              <meshStandardMaterial
                color={dotColor}
                emissive={dotColor}
                emissiveIntensity={isSelected ? 1.0 : 0.4}
                roughness={0.4}
              />
            </mesh>

            {/* Title label — only when selected */}
            {isSelected && (
              <Billboard>
                <Text
                  position={[0, 2, 0]}
                  fontSize={1.8}
                  color="#fff8e0"
                  anchorX="center"
                  anchorY="bottom"
                  font="/fonts/LXGWWenKai-Regular.ttf"
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

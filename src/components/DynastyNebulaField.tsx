import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { Dynasty } from '../types/poem'
import { build3DTimeScale } from '../lib/layout'

interface Props {
  dynasties: Dynasty[]
}

const PARTICLE_COUNT = 120
const timeScale = build3DTimeScale()

export function DynastyNebulaField({ dynasties }: Props) {
  const ref = useRef<THREE.Points>(null)

  const { positions, colors, meta } = useMemo(() => {
    const total = dynasties.length * PARTICLE_COUNT
    const positions = new Float32Array(total * 3)
    const colors = new Float32Array(total * 3)
    const meta: Array<{ id: string; name: string; color: string; xMid: number }> = []

    dynasties.forEach((dynasty, di) => {
      const xMid = (timeScale(dynasty.startYear) + timeScale(dynasty.endYear)) / 2
      const xSpan = Math.abs(timeScale(dynasty.endYear) - timeScale(dynasty.startYear))
      const color = new THREE.Color(dynasty.color)
      meta.push({ id: dynasty.id, name: dynasty.name, color: dynasty.color, xMid })

      const offset = di * PARTICLE_COUNT
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const r = Math.cbrt(Math.random())
        const idx = (offset + i) * 3
        positions[idx]     = xMid + r * Math.sin(phi) * Math.cos(theta) * (xSpan * 0.45)
        positions[idx + 1] = r * Math.sin(phi) * Math.sin(theta) * 60
        positions[idx + 2] = r * Math.cos(phi) * 80
        colors[idx]     = color.r
        colors[idx + 1] = color.g
        colors[idx + 2] = color.b
      }
    })

    return { positions, colors, meta }
  }, [dynasties])

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.005
    }
  })

  return (
    <group>
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={1.8}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      </points>

      {/* Dynasty labels */}
      {meta.map((d) => (
        <Billboard key={d.id} position={[d.xMid, 0, 0]}>
          <Text
            position={[0, 55, 0]}
            fontSize={8}
            color={d.color}
            anchorX="center"
            anchorY="middle"
            font="/fonts/LXGWWenKai-Subset.woff2"
            fillOpacity={0.85}
          >
            {d.name}
          </Text>
        </Billboard>
      ))}
    </group>
  )
}

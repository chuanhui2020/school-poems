import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { Dynasty } from '../types/poem'
import { build3DTimeScale } from '../lib/layout'

interface Props {
  dynasty: Dynasty
}

const PARTICLE_COUNT = 120
const timeScale = build3DTimeScale()

export function DynastyNebula3D({ dynasty }: Props) {
  const ref = useRef<THREE.Points>(null)

  const xMid = (timeScale(dynasty.startYear) + timeScale(dynasty.endYear)) / 2
  const xSpan = Math.abs(timeScale(dynasty.endYear) - timeScale(dynasty.startYear))
  const color = new THREE.Color(dynasty.color)

  const positions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Ellipsoid: wide on x (time span), moderate y, shallow z
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = Math.cbrt(Math.random()) // uniform volume distribution
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta) * (xSpan * 0.45)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 60
      arr[i * 3 + 2] = r * Math.cos(phi) * 80
    }
    return arr
  }, [xSpan])

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.01
    }
  })

  return (
    <group position={[xMid, 0, 0]}>
      {/* Particle cloud */}
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={1.8}
          sizeAttenuation
          color={color}
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      </points>

      {/* Soft dynasty-colored glow */}
      <pointLight color={color} intensity={0.6} distance={xSpan * 0.8} decay={2} />

      {/* Billboard label — only visible at galaxy/dynasty zoom */}
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <Text
          position={[0, 55, 0]}
          fontSize={8}
          color={dynasty.color}
          anchorX="center"
          anchorY="middle"
          font="/fonts/LXGWWenKai-Regular.ttf"
          fillOpacity={0.85}
        >
          {dynasty.name}
        </Text>
      </Billboard>
    </group>
  )
}

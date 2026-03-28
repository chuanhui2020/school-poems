import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PETAL_COUNT = 30

export function FloatingPetals() {
  const pointsRef = useRef<THREE.Points>(null)

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(PETAL_COUNT * 3)
    const vel = new Float32Array(PETAL_COUNT * 3)
    for (let i = 0; i < PETAL_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 3
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2
      pos[i * 3 + 2] = -0.3 + Math.random() * 0.2
      // Slow drift: slightly right and down
      vel[i * 3] = (Math.random() - 0.3) * 0.015
      vel[i * 3 + 1] = -(Math.random() * 0.01 + 0.005)
      vel[i * 3 + 2] = 0
    }
    return { positions: pos, velocities: vel }
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return
    const t = state.clock.elapsedTime
    const posArr = pointsRef.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < PETAL_COUNT; i++) {
      const ix = i * 3
      posArr[ix] += velocities[ix] + Math.sin(t * 0.5 + i) * 0.0005
      posArr[ix + 1] += velocities[ix + 1]
      // Reset when fallen below
      if (posArr[ix + 1] < -1.2) {
        posArr[ix] = (Math.random() - 0.5) * 3
        posArr[ix + 1] = 1.2
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#d4a843"
        transparent
        opacity={0.35}
        size={0.012}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

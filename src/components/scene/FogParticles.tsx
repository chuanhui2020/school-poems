import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const FOG_COUNT = 60

export function FogParticles() {
  const pointsRef = useRef<THREE.Points>(null)

  const { positions, sizes } = useMemo(() => {
    const pos = new Float32Array(FOG_COUNT * 3)
    const sz = new Float32Array(FOG_COUNT)
    for (let i = 0; i < FOG_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 3      // x: spread wide
      pos[i * 3 + 1] = -0.8 + Math.random() * 0.4  // y: bottom area
      pos[i * 3 + 2] = -0.5 + Math.random() * 0.3   // z: slight depth
      sz[i] = 20 + Math.random() * 40
    }
    return { positions: pos, sizes: sz }
  }, [])

  useFrame((_, delta) => {
    if (!pointsRef.current) return
    const posArr = pointsRef.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < FOG_COUNT; i++) {
      posArr[i * 3] += delta * 0.02 * (Math.sin(i * 0.7) * 0.5 + 0.5)
      if (posArr[i * 3] > 1.8) posArr[i * 3] = -1.8
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
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#1e293b"
        transparent
        opacity={0.15}
        size={0.08}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

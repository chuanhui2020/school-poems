import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { Dynasty } from '../types/poem'
import type { DynastyRegion3D } from '../lib/layout'
import { inkNebulaVertex, inkNebulaFragment } from '../shaders/inkNebulaShader'

interface Props {
  dynasties: Dynasty[]
  regions: DynastyRegion3D[]
}

function DynastyNebula({ dynasty, region }: { dynasty: Dynasty; region: DynastyRegion3D }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const size = region.nebulaSize

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
    }
  })

  const color = useMemo(() => new THREE.Color(dynasty.color), [dynasty.color])

  return (
    <group position={[region.xCenter, 0, 0]}>
      <Billboard>
        <mesh>
          <planeGeometry args={[size, size * 0.8]} />
          <shaderMaterial
            ref={materialRef}
            vertexShader={inkNebulaVertex}
            fragmentShader={inkNebulaFragment}
            uniforms={{
              uTime: { value: 0 },
              uColor: { value: color },
              uSaturation: { value: 0.7 },
            }}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </Billboard>
      <Billboard>
        <Text
          position={[0, size * 0.5 + 10, 0]}
          fontSize={8}
          color={dynasty.color}
          anchorX="center"
          anchorY="middle"
          font="/fonts/LXGWWenKai-Subset.ttf"
          fillOpacity={0.85}
        >
          {dynasty.name}
        </Text>
      </Billboard>
    </group>
  )
}

export function DynastyNebulaField({ dynasties, regions }: Props) {
  const regionMap = useMemo(
    () => new Map(regions.map((r) => [r.dynastyId, r])),
    [regions]
  )

  return (
    <group>
      {dynasties.map((dynasty) => {
        const region = regionMap.get(dynasty.id)
        if (!region) return null
        return <DynastyNebula key={dynasty.id} dynasty={dynasty} region={region} />
      })}
    </group>
  )
}

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { Dynasty } from '../types/poem'
import { build3DTimeScale } from '../lib/layout'
import { cyberNebulaVertex, cyberNebulaFragment } from '../shaders/cyberNebulaShader'

interface Props {
  dynasties: Dynasty[]
}

const timeScale = build3DTimeScale()

function DynastyNebula({ dynasty }: { dynasty: Dynasty }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const xMid = (timeScale(dynasty.startYear) + timeScale(dynasty.endYear)) / 2
  const xSpan = Math.abs(timeScale(dynasty.endYear) - timeScale(dynasty.startYear))
  const size = Math.max(xSpan * 0.8, 40)

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
    }
  })

  const color = useMemo(() => new THREE.Color(dynasty.color), [dynasty.color])

  return (
    <group position={[xMid, 0, 0]}>
      <Billboard>
        <mesh>
          <planeGeometry args={[size, size * 0.8]} />
          <shaderMaterial
            ref={materialRef}
            vertexShader={cyberNebulaVertex}
            fragmentShader={cyberNebulaFragment}
            uniforms={{
              uTime: { value: 0 },
              uColor: { value: color },
              uSaturation: { value: 0.9 },
            }}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </Billboard>
      <Billboard>
        <Text
          position={[0, 55, 0]}
          fontSize={8}
          color={dynasty.color}
          anchorX="center"
          anchorY="middle"
          font="/fonts/LXGWWenKai-Subset.ttf"
          fillOpacity={0.95}
          outlineWidth={0.3}
          outlineColor="#00f0ff"
        >
          {dynasty.name}
        </Text>
      </Billboard>
    </group>
  )
}

export function DynastyNebulaField({ dynasties }: Props) {
  return (
    <group>
      {dynasties.map((dynasty) => (
        <DynastyNebula key={dynasty.id} dynasty={dynasty} />
      ))}
    </group>
  )
}

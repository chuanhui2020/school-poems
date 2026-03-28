import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { ShaderMaterial as ShaderMaterialType } from 'three'
import * as THREE from 'three'
import { nightSkyVertexShader, nightSkyFragmentShader } from '../../shaders/nightSkyShader.ts'
import { FogParticles } from './FogParticles.tsx'
import { FloatingPetals } from './FloatingPetals.tsx'

function SkyPlane() {
  const matRef = useRef<ShaderMaterialType>(null)
  const { size } = useThree()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
    }),
    [size.width, size.height],
  )

  useFrame((_, delta) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += delta
    }
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={nightSkyVertexShader}
        fragmentShader={nightSkyFragmentShader}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  )
}

export function NightSky() {
  return (
    <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
        gl={{ antialias: false, alpha: false }}
        dpr={[1, 1.5]}
        style={{ background: '#020617' }}
      >
        <SkyPlane />
        <FogParticles />
        <FloatingPetals />
      </Canvas>
    </div>
  )
}

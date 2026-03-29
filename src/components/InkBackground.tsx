import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { spaceGridVertex, spaceGridFragment } from '../shaders/spaceGridShader'

export function InkBackground() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size } = useThree()

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height)
    }
  })

  return (
    <mesh renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={spaceGridVertex}
        fragmentShader={spaceGridFragment}
        uniforms={{
          uTime: { value: 0 },
          uResolution: { value: new THREE.Vector2(size.width, size.height) },
        }}
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
      />
    </mesh>
  )
}

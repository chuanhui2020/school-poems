import { Canvas } from '@react-three/fiber'
import { StarfieldBackground } from './StarfieldBackground'

export function Universe3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 300], fov: 60, near: 0.1, far: 5000 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#0a0a12' }}
    >
      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.4} color="#e0d6c8" />
      {/* Key light from above-front */}
      <directionalLight position={[200, 300, 200]} intensity={0.8} color="#fff8e8" />
      {/* Rim light from behind */}
      <pointLight position={[-300, -100, -200]} intensity={0.3} color="#8899cc" />

      <StarfieldBackground />

      {/* Dynasty nebulae, author stars, poem orbits, timeline rail go here */}
    </Canvas>
  )
}

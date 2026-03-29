import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 600

const particleVertex = /* glsl */ `
  attribute float aSize;
  attribute float aSpeed;
  attribute float aPhase;
  uniform float uTime;
  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // Slow drift animation
    pos.x += sin(uTime * aSpeed * 0.3 + aPhase) * 2.0;
    pos.y += cos(uTime * aSpeed * 0.2 + aPhase * 1.3) * 1.5;
    pos.z += sin(uTime * aSpeed * 0.25 + aPhase * 0.7) * 2.0;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    // Size attenuation
    gl_PointSize = aSize * (200.0 / -mvPosition.z);
    gl_PointSize = clamp(gl_PointSize, 0.5, 4.0);

    // Fade with distance
    float dist = -mvPosition.z;
    vAlpha = smoothstep(800.0, 200.0, dist) * smoothstep(5.0, 30.0, dist);

    // Twinkle
    vAlpha *= 0.4 + 0.6 * (0.5 + 0.5 * sin(uTime * aSpeed * 2.0 + aPhase * 6.28));

    gl_Position = projectionMatrix * mvPosition;
  }
`

const particleFragment = /* glsl */ `
  varying float vAlpha;

  void main() {
    // Soft circle
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float circle = smoothstep(1.0, 0.3, d);

    vec3 color = vec3(0.4, 0.6, 0.8);
    gl_FragColor = vec4(color, circle * vAlpha * 0.5);
  }
`

export function AmbientParticles() {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const { geometry } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const sizes = new Float32Array(PARTICLE_COUNT)
    const speeds = new Float32Array(PARTICLE_COUNT)
    const phases = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 800
      positions[i * 3 + 1] = (Math.random() - 0.5) * 300
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400

      sizes[i] = 1.0 + Math.random() * 3.0
      speeds[i] = 0.3 + Math.random() * 0.7
      phases[i] = Math.random() * Math.PI * 2
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))

    return { geometry: geo }
  }, [])

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
    }
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={particleVertex}
        fragmentShader={particleFragment}
        uniforms={{
          uTime: { value: 0 },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}

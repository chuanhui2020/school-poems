import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { Dynasty } from '../types/poem'
import type { DynastyRegion3D } from '../lib/layout'

const PARTICLES_PER_NEBULA = 120

const nebulaParticleVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  uniform float uTime;
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vColor = instanceColor;

    vec3 pos = position;
    // Brownian drift
    pos.x += sin(uTime * aSpeed * 0.4 + aPhase) * 3.0;
    pos.y += cos(uTime * aSpeed * 0.3 + aPhase * 1.7) * 2.5;
    pos.z += sin(uTime * aSpeed * 0.35 + aPhase * 0.9) * 3.0;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (150.0 / -mvPosition.z);
    gl_PointSize = clamp(gl_PointSize, 1.0, 8.0);

    float dist = -mvPosition.z;
    vAlpha = smoothstep(600.0, 100.0, dist) * smoothstep(5.0, 20.0, dist);
    // Gentle pulse
    vAlpha *= 0.5 + 0.5 * (0.7 + 0.3 * sin(uTime * aSpeed + aPhase * 6.28));

    gl_Position = projectionMatrix * mvPosition;
  }
`

const nebulaParticleFragment = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float circle = smoothstep(1.0, 0.2, d);
    // Soft glow falloff
    float glow = exp(-d * d * 2.0);

    vec3 color = vColor * 1.2;
    float alpha = (circle * 0.4 + glow * 0.3) * vAlpha;

    gl_FragColor = vec4(color, alpha);
  }
`

interface Props {
  dynasties: Dynasty[]
  regions: DynastyRegion3D[]
}

function DynastyNebula({ dynasty, region }: { dynasty: Dynasty; region: DynastyRegion3D }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const size = region.nebulaSize

  const geometry = useMemo(() => {
    const positions = new Float32Array(PARTICLES_PER_NEBULA * 3)
    const colors = new Float32Array(PARTICLES_PER_NEBULA * 3)
    const sizes = new Float32Array(PARTICLES_PER_NEBULA)
    const phases = new Float32Array(PARTICLES_PER_NEBULA)
    const speeds = new Float32Array(PARTICLES_PER_NEBULA)

    const color = new THREE.Color(dynasty.color)
    const spread = size * 0.5

    for (let i = 0; i < PARTICLES_PER_NEBULA; i++) {
      // Gaussian-ish distribution: denser in center
      const r = Math.pow(Math.random(), 0.6) * spread
      const theta = Math.random() * Math.PI * 2
      const phi = (Math.random() - 0.5) * Math.PI

      positions[i * 3] = r * Math.cos(theta) * Math.cos(phi)
      positions[i * 3 + 1] = r * Math.sin(phi) * 0.7
      positions[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi)

      // Color variation: slight hue shift per particle
      const hsl = { h: 0, s: 0, l: 0 }
      color.getHSL(hsl)
      const varied = new THREE.Color().setHSL(
        hsl.h + (Math.random() - 0.5) * 0.05,
        hsl.s * (0.6 + Math.random() * 0.4),
        hsl.l * (0.8 + Math.random() * 0.4)
      )
      colors[i * 3] = varied.r
      colors[i * 3 + 1] = varied.g
      colors[i * 3 + 2] = varied.b

      sizes[i] = 2.0 + Math.random() * 4.0
      phases[i] = Math.random() * Math.PI * 2
      speeds[i] = 0.2 + Math.random() * 0.6
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('instanceColor', new THREE.BufferAttribute(colors, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    return geo
  }, [dynasty.color, size])

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
    }
  })

  return (
    <group position={[region.xCenter, 0, 0]}>
      <points geometry={geometry}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={nebulaParticleVertex}
          fragmentShader={nebulaParticleFragment}
          uniforms={{
            uTime: { value: 0 },
          }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
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

import { useMemo } from 'react'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { Dynasty } from '../types/poem'
import type { DynastyRegion3D } from '../lib/layout'

interface Props {
  dynasties: Dynasty[]
  regions: DynastyRegion3D[]
}

const RAIL_Y = -80
const SEGMENTS = 200
const RAIL_HALF_WIDTH = 0.6

/** Build a ribbon geometry along the X axis with slight width variation for brush feel */
function buildRailRibbon(xMin: number, xMax: number): THREE.BufferGeometry {
  const vertices: number[] = []
  const indices: number[] = []

  for (let i = 0; i <= SEGMENTS; i++) {
    const t = i / SEGMENTS
    const x = xMin + (xMax - xMin) * t
    const wobble = Math.sin(t * 40) * 0.15 + Math.sin(t * 17) * 0.1
    const hw = RAIL_HALF_WIDTH * (1.0 + wobble)
    vertices.push(x, hw, 0, x, -hw, 0)

    if (i < SEGMENTS) {
      const base = i * 2
      indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geo.setIndex(indices)
  return geo
}

const STAMP_SIZE = 4

export function TimelineRail3D({ dynasties, regions }: Props) {
  const regionMap = useMemo(
    () => new Map(regions.map((r) => [r.dynastyId, r])),
    [regions]
  )

  // Rail spans from first region left edge to last region right edge
  const xMin = regions.length > 0 ? regions[0].xCenter - regions[0].xSpan / 2 : -380
  const xMax = regions.length > 0
    ? regions[regions.length - 1].xCenter + regions[regions.length - 1].xSpan / 2
    : 380

  const railGeo = useMemo(() => buildRailRibbon(xMin, xMax), [xMin, xMax])

  return (
    <group position={[0, RAIL_Y, 0]}>
      {/* Main rail ribbon */}
      <mesh geometry={railGeo}>
        <meshBasicMaterial color="#4a4a6a" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Dynasty span markers with stamp-style endpoints */}
      {dynasties.map((dynasty) => {
        const region = regionMap.get(dynasty.id)
        if (!region) return null
        const x0 = region.xCenter - region.xSpan / 2
        const spanWidth = region.xSpan

        return (
          <group key={dynasty.id}>
            {/* Dynasty color bar below rail */}
            <mesh position={[region.xCenter, -3, 0]}>
              <planeGeometry args={[spanWidth, 2]} />
              <meshBasicMaterial color={dynasty.color} transparent opacity={0.25} />
            </mesh>

            {/* Start stamp: red square outline */}
            <mesh position={[x0, -8, 0]}>
              <ringGeometry args={[STAMP_SIZE * 0.35, STAMP_SIZE * 0.45, 4]} />
              <meshBasicMaterial color="#ff6b35" transparent opacity={0.6} side={THREE.DoubleSide} />
            </mesh>

            {/* Dynasty name label */}
            <Billboard position={[region.xCenter, -12, 0]}>
              <Text
                fontSize={2.5}
                color={dynasty.color}
                anchorX="center"
                anchorY="top"
                font="/fonts/LXGWWenKai-Subset.ttf"
                fillOpacity={0.8}
              >
                {dynasty.name}
              </Text>
            </Billboard>
          </group>
        )
      })}
    </group>
  )
}

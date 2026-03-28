import { useMemo } from 'react'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { Dynasty } from '../types/poem'
import { build3DTimeScale } from '../lib/layout'

interface Props {
  dynasties: Dynasty[]
}

const timeScale = build3DTimeScale()
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

/** Build a short vertical tick ribbon */
function buildTickRibbon(height: number): THREE.BufferGeometry {
  const hw = 0.15
  const wobble = 0.03
  const vertices = [
    -hw - wobble, 0, 0,
    hw + wobble, 0, 0,
    -hw, height, 0,
    hw, height, 0,
  ]
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geo.setIndex([0, 1, 2, 1, 3, 2])
  return geo
}

const TICK_HEIGHT = 6
const STAMP_SIZE = 4

export function TimelineRail3D({ dynasties }: Props) {
  const xMin = timeScale(-1100)
  const xMax = timeScale(1912)

  const railGeo = useMemo(() => buildRailRibbon(xMin, xMax), [xMin, xMax])
  const majorTickGeo = useMemo(() => buildTickRibbon(TICK_HEIGHT), [])
  const minorTickGeo = useMemo(() => buildTickRibbon(TICK_HEIGHT * 0.5), [])

  const ticks = useMemo(() => {
    const result: number[] = []
    for (let year = -1000; year <= 1900; year += 100) {
      result.push(year)
    }
    return result
  }, [])

  return (
    <group position={[0, RAIL_Y, 0]}>
      {/* Main rail ribbon */}
      <mesh geometry={railGeo}>
        <meshBasicMaterial color="#4a4a6a" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Century tick marks */}
      {ticks.map((year) => {
        const x = timeScale(year)
        const isMajor = year % 500 === 0
        return (
          <group key={year} position={[x, 0, 0]}>
            <mesh geometry={isMajor ? majorTickGeo : minorTickGeo}>
              <meshBasicMaterial
                color={isMajor ? '#6a6a7a' : '#3a3a4a'}
                transparent
                opacity={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>
            {isMajor && (
              <Billboard>
                <Text
                  position={[0, TICK_HEIGHT + 2, 0]}
                  fontSize={2}
                  color="#6a6a7a"
                  anchorX="center"
                  anchorY="bottom"
                  fillOpacity={0.7}
                >
                  {year < 0 ? `${Math.abs(year)}BC` : `${year}`}
                </Text>
              </Billboard>
            )}
          </group>
        )
      })}

      {/* Dynasty span markers with stamp-style endpoints */}
      {dynasties.map((dynasty) => {
        const x0 = timeScale(dynasty.startYear)
        const x1 = timeScale(dynasty.endYear)
        const xMid = (x0 + x1) / 2
        const spanWidth = Math.abs(x1 - x0)

        return (
          <group key={dynasty.id}>
            {/* Dynasty color bar below rail */}
            <mesh position={[xMid, -3, 0]}>
              <planeGeometry args={[spanWidth, 2]} />
              <meshBasicMaterial color={dynasty.color} transparent opacity={0.25} />
            </mesh>

            {/* Start stamp: red square outline */}
            <mesh position={[x0, -8, 0]}>
              <ringGeometry args={[STAMP_SIZE * 0.35, STAMP_SIZE * 0.45, 4]} />
              <meshBasicMaterial color="#ff6b35" transparent opacity={0.6} side={THREE.DoubleSide} />
            </mesh>

            {/* Dynasty name label */}
            <Billboard position={[xMid, -12, 0]}>
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

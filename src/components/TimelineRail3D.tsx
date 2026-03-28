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

/** Build a glowing neon tube rail along the X axis */
function buildRailTube(xMin: number, xMax: number): THREE.BufferGeometry {
  const path = new THREE.LineCurve3(
    new THREE.Vector3(xMin, 0, 0),
    new THREE.Vector3(xMax, 0, 0)
  )
  return new THREE.TubeGeometry(path, SEGMENTS, 0.4, 8, false)
}

/** Build a holographic tick mark */
function buildTickGeometry(height: number): THREE.BufferGeometry {
  const hw = 0.1
  const vertices = new Float32Array([
    -hw, 0, 0,
    hw, 0, 0,
    -hw, height, 0,
    hw, height, 0,
  ])
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  geo.setIndex([0, 1, 2, 1, 3, 2])
  return geo
}

const TICK_HEIGHT = 6

export function TimelineRail3D({ dynasties }: Props) {
  const xMin = timeScale(-1100)
  const xMax = timeScale(1912)

  const railGeo = useMemo(() => buildRailTube(xMin, xMax), [xMin, xMax])
  const majorTickGeo = useMemo(() => buildTickGeometry(TICK_HEIGHT), [])
  const minorTickGeo = useMemo(() => buildTickGeometry(TICK_HEIGHT * 0.5), [])

  const ticks = useMemo(() => {
    const result: number[] = []
    for (let year = -1000; year <= 1900; year += 100) {
      result.push(year)
    }
    return result
  }, [])

  return (
    <group position={[0, RAIL_Y, 0]}>
      {/* Main rail — glowing neon tube */}
      <mesh geometry={railGeo}>
        <meshStandardMaterial
          color="#050510"
          emissive="#00f0ff"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.9}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Century tick marks — holographic */}
      {ticks.map((year) => {
        const x = timeScale(year)
        const isMajor = year % 500 === 0
        return (
          <group key={year} position={[x, 0, 0]}>
            <mesh geometry={isMajor ? majorTickGeo : minorTickGeo}>
              <meshBasicMaterial
                color={isMajor ? '#00f0ff' : '#1a3a4a'}
                transparent
                opacity={isMajor ? 0.7 : 0.4}
                side={THREE.DoubleSide}
              />
            </mesh>
            {isMajor && (
              <Billboard>
                <Text
                  position={[0, TICK_HEIGHT + 2, 0]}
                  fontSize={2}
                  color="#5a6a8a"
                  anchorX="center"
                  anchorY="bottom"
                  fillOpacity={0.8}
                >
                  {year < 0 ? `${Math.abs(year)}BC` : `${year}`}
                </Text>
              </Billboard>
            )}
          </group>
        )
      })}

      {/* Dynasty span markers with neon color bands */}
      {dynasties.map((dynasty) => {
        const x0 = timeScale(dynasty.startYear)
        const x1 = timeScale(dynasty.endYear)
        const xMid = (x0 + x1) / 2
        const spanWidth = Math.abs(x1 - x0)

        return (
          <group key={dynasty.id}>
            {/* Dynasty neon color bar below rail */}
            <mesh position={[xMid, -3, 0]}>
              <planeGeometry args={[spanWidth, 2]} />
              <meshStandardMaterial
                color="#050510"
                emissive={dynasty.color}
                emissiveIntensity={0.8}
                transparent
                opacity={0.4}
              />
            </mesh>

            {/* Start marker: hexagonal node */}
            <mesh position={[x0, -8, 0]} rotation={[0, 0, Math.PI / 6]}>
              <circleGeometry args={[2, 6]} />
              <meshStandardMaterial
                color="#050510"
                emissive={dynasty.color}
                emissiveIntensity={1.0}
                transparent
                opacity={0.7}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Dynasty name label */}
            <Billboard position={[xMid, -12, 0]}>
              <Text
                fontSize={2.5}
                color={dynasty.color}
                anchorX="center"
                anchorY="top"
                font="/fonts/LXGWWenKai-Subset.ttf"
                fillOpacity={0.9}
                outlineWidth={0.1}
                outlineColor="#00f0ff"
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

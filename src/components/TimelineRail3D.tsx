import { useMemo } from 'react'
import { Line, Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { Dynasty } from '../types/poem'
import { build3DTimeScale } from '../lib/layout'

interface Props {
  dynasties: Dynasty[]
}

const timeScale = build3DTimeScale()
const RAIL_Y = -80
const TICK_HEIGHT = 6

export function TimelineRail3D({ dynasties }: Props) {
  const xMin = timeScale(-1100)
  const xMax = timeScale(1912)

  const ticks = useMemo(() => {
    // Century ticks from -1000 to 1900
    const result: number[] = []
    for (let year = -1000; year <= 1900; year += 100) {
      result.push(year)
    }
    return result
  }, [])

  return (
    <group position={[0, RAIL_Y, 0]}>
      {/* Main rail line */}
      <Line
        points={[new THREE.Vector3(xMin, 0, 0), new THREE.Vector3(xMax, 0, 0)]}
        color="#6b5e4a"
        lineWidth={1.5}
        transparent
        opacity={0.6}
      />

      {/* Century tick marks */}
      {ticks.map((year) => {
        const x = timeScale(year)
        const isMajor = year % 500 === 0
        return (
          <group key={year} position={[x, 0, 0]}>
            <Line
              points={[
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, isMajor ? TICK_HEIGHT : TICK_HEIGHT * 0.5, 0),
              ]}
              color={isMajor ? '#9b8e7a' : '#5b4e3a'}
              lineWidth={isMajor ? 1.2 : 0.6}
              transparent
              opacity={0.7}
            />
            {isMajor && (
              <Billboard>
                <Text
                  position={[0, TICK_HEIGHT + 2, 0]}
                  fontSize={2}
                  color="#9b8e7a"
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

      {/* Dynasty span markers */}
      {dynasties.map((dynasty) => {
        const x0 = timeScale(dynasty.startYear)
        const x1 = timeScale(dynasty.endYear)
        const xMid = (x0 + x1) / 2
        return (
          <group key={dynasty.id}>
            {/* Dynasty span line below rail */}
            <Line
              points={[new THREE.Vector3(x0, -3, 0), new THREE.Vector3(x1, -3, 0)]}
              color={dynasty.color}
              lineWidth={2.5}
              transparent
              opacity={0.5}
            />
            {/* Dynasty name label */}
            <Billboard position={[xMid, -10, 0]}>
              <Text
                fontSize={2.5}
                color={dynasty.color}
                anchorX="center"
                anchorY="top"
                font="/fonts/LXGWWenKai-Subset.woff2"
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

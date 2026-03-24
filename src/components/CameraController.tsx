import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store/useStore'
import { useSemanticZoom } from '../hooks/useSemanticZoom'

const INITIAL_POSITION = new THREE.Vector3(0, 0, 300)
const FLY_SPEED = 0.05

export function CameraController() {
  const { camera, controls } = useThree()
  const setResetZoom = useStore((s) => s.setResetZoom)
  const flyToTarget = useStore((s) => s.flyToTarget)
  const setFlyToTarget = useStore((s) => s.setFlyToTarget)

  const flyTarget = useRef<THREE.Vector3 | null>(null)
  const distanceRef = useRef(300)

  // Register resetZoom with store
  useEffect(() => {
    setResetZoom(() => {
      flyTarget.current = INITIAL_POSITION.clone()
      // @ts-expect-error OrbitControls target
      if (controls) controls.target.set(0, 0, 0)
    })
    return () => setResetZoom(null)
  }, [controls, setResetZoom])

  // React to flyToTarget changes from store
  useEffect(() => {
    if (flyToTarget) {
      flyTarget.current = new THREE.Vector3(...flyToTarget)
      setFlyToTarget(null)
    }
  }, [flyToTarget, setFlyToTarget])

  useFrame(() => {
    distanceRef.current = camera.position.length()

    if (flyTarget.current) {
      camera.position.lerp(flyTarget.current, FLY_SPEED)
      if (camera.position.distanceTo(flyTarget.current) < 0.5) {
        flyTarget.current = null
      }
    }
  })

  useSemanticZoom(distanceRef.current)

  return (
    <OrbitControls
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
      minDistance={5}
      maxDistance={800}
    />
  )
}

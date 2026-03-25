import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store/useStore'
import { getZoomLevel } from '../hooks/useSemanticZoom'

const INITIAL_POSITION = new THREE.Vector3(0, 0, 300)
const FLY_SPEED = 0.05

export function CameraController() {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)
  const setResetZoom = useStore((s) => s.setResetZoom)
  const flyToTarget = useStore((s) => s.flyToTarget)
  const setFlyToTarget = useStore((s) => s.setFlyToTarget)
  const setZoomLevel = useStore((s) => s.setZoomLevel)
  const zoomLevelRef = useRef(useStore.getState().zoomLevel)

  const flyTarget = useRef<THREE.Vector3 | null>(null)

  // Keep ref in sync for use in useFrame without causing re-renders
  useEffect(() => {
    return useStore.subscribe((s) => { zoomLevelRef.current = s.zoomLevel })
  }, [])

  useEffect(() => {
    setResetZoom(() => {
      flyTarget.current = INITIAL_POSITION.clone()
      if (controlsRef.current) controlsRef.current.target.set(0, 0, 0)
    })
    return () => setResetZoom(null)
  }, [setResetZoom])

  useEffect(() => {
    if (flyToTarget) {
      flyTarget.current = new THREE.Vector3(...flyToTarget)
      setFlyToTarget(null)
    }
  }, [flyToTarget, setFlyToTarget])

  useFrame(() => {
    // Fly-to animation
    if (flyTarget.current) {
      camera.position.lerp(flyTarget.current, FLY_SPEED)
      if (camera.position.distanceTo(flyTarget.current) < 0.5) {
        flyTarget.current = null
      }
    }

    // Semantic zoom — computed in frame loop for accuracy
    const distance = camera.position.length()
    const nextZoom = getZoomLevel(distance)
    if (nextZoom !== zoomLevelRef.current) {
      setZoomLevel(nextZoom)
    }

    // Dynamic zoom speed: slower when close
    if (controlsRef.current) {
      controlsRef.current.zoomSpeed = distance > 200 ? 0.8 : distance > 60 ? 0.5 : 0.3
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
      minDistance={5}
      maxDistance={800}
    />
  )
}

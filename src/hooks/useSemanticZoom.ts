import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import type { ZoomLevel } from '../types'

/** Distance thresholds for semantic zoom levels */
const THRESHOLDS = {
  galaxy: 80,  // distance > 80 → galaxy
  dynasty: 30, // 30–80 → dynasty, < 30 → poet
} as const

export function getZoomLevel(distance: number): ZoomLevel {
  if (distance > THRESHOLDS.galaxy) return 'galaxy'
  if (distance > THRESHOLDS.dynasty) return 'dynasty'
  return 'poet'
}

/** Sync camera distance → store zoomLevel */
export function useSemanticZoom(distance: number) {
  const setZoomLevel = useStore((s) => s.setZoomLevel)
  const current = useStore((s) => s.zoomLevel)

  useEffect(() => {
    const next = getZoomLevel(distance)
    if (next !== current) setZoomLevel(next)
  }, [distance, current, setZoomLevel])
}

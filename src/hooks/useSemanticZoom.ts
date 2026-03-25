import type { ZoomLevel } from '../types'

/** Distance thresholds for semantic zoom levels */
const THRESHOLDS = {
  galaxy: 200,
  dynasty: 60,
} as const

export function getZoomLevel(distance: number): ZoomLevel {
  if (distance > THRESHOLDS.galaxy) return 'galaxy'
  if (distance > THRESHOLDS.dynasty) return 'dynasty'
  return 'poet'
}

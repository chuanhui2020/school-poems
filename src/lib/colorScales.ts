import * as THREE from 'three'
import dynasties from '../data/dynasties.json'
import type { Dynasty } from '../types'

const dynastyColorMap = new Map(
  (dynasties as Dynasty[]).map((d) => [d.id, d.color])
)

/** Saturate a hex color by a factor (boost saturation) */
function saturate(hex: string, amount: number): string {
  const color = new THREE.Color(hex)
  const hsl = { h: 0, s: 0, l: 0 }
  color.getHSL(hsl)
  hsl.s = Math.min(1, hsl.s * (1 + amount))
  color.setHSL(hsl.h, hsl.s, hsl.l)
  return '#' + color.getHexString()
}

export function getDynastyColor(dynastyId: string): string {
  const raw = dynastyColorMap.get(dynastyId) ?? '#999'
  return saturate(raw, 0.2)
}

export function getDynastyColorRaw(dynastyId: string): string {
  return dynastyColorMap.get(dynastyId) ?? '#999'
}

export function getDynastyName(dynastyId: string): string {
  const d = (dynasties as Dynasty[]).find((d) => d.id === dynastyId)
  return d?.name ?? '未知'
}

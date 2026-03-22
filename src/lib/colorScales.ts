import dynasties from '../data/dynasties.json'
import type { Dynasty } from '../types'

const dynastyColorMap = new Map(
  (dynasties as Dynasty[]).map((d) => [d.id, d.color])
)

export function getDynastyColor(dynastyId: string): string {
  return dynastyColorMap.get(dynastyId) ?? '#999'
}

export function getDynastyName(dynastyId: string): string {
  const d = (dynasties as Dynasty[]).find((d) => d.id === dynastyId)
  return d?.name ?? '未知'
}

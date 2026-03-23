import narratives from '../data/narratives.json'

export type Atmosphere = 'ancient' | 'solemn' | 'ethereal' | 'golden' | 'refined' | 'dramatic' | 'contemplative' | 'twilight'

export interface DynastyNarrative {
  title: string
  subtitle: string
  narrative: string
  atmosphere: Atmosphere
}

export function getNarrative(dynastyId: string): DynastyNarrative | undefined {
  return (narratives as Record<string, DynastyNarrative>)[dynastyId]
}

/** Atmosphere → background gradient stops */
export const atmosphereColors: Record<Atmosphere, [string, string]> = {
  ancient:        ['#1a1a2e', '#16213e'],
  solemn:         ['#1a1a2e', '#0f3460'],
  ethereal:       ['#1a1a2e', '#2d1b69'],
  golden:         ['#1a1a2e', '#4a3000'],
  refined:        ['#1a1a2e', '#1b3a4b'],
  dramatic:       ['#1a1a2e', '#3d0000'],
  contemplative:  ['#1a1a2e', '#1a3c34'],
  twilight:       ['#1a1a2e', '#2d1f3d'],
}

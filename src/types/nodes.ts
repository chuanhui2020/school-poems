import type { Author, Poem, Dynasty } from './poem'

/** Author node positioned in the universe */
export interface AuthorNode {
  id: string
  type: 'author'
  label: string
  author: Author
  dynastyId: string
  /** Dynasty color from dynasties.json */
  color: string
  /** X position on timeline (computed from approximate birth year) */
  x: number
  /** Y position (computed by layout algorithm) */
  y: number
  /** Number of poems in curriculum */
  poemCount: number
  /** Node radius, derived from poemCount */
  radius: number
  styleLabels: string[]
}

/** Poem node orbiting an author */
export interface PoemNode {
  id: string
  type: 'poem'
  poem: Poem
  authorId: string
  /** Orbit angle around parent author */
  angle: number
  /** Orbit distance from parent author */
  orbitRadius: number
}

/** Dynasty region bounds on the canvas */
export interface DynastyRegion {
  dynasty: Dynasty
  /** Left edge x in world coordinates */
  x0: number
  /** Right edge x in world coordinates */
  x1: number
  /** Color for nebula background */
  color: string
}

/** Relationship edge between two AuthorNodes */
export interface RelationshipEdge {
  source: string
  target: string
  type: string
  label: string
  description: string
  strength: number
  color: string
  dashArray: string
}

/** Semantic zoom levels */
export type ZoomLevel = 'galaxy' | 'dynasty' | 'poet'

import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { useStore } from '../store/useStore'
import { layoutAuthors3D, build3DTimeScale } from '../lib/layout'
import type { AuthorNode, PoemNode, RelationshipEdge } from '../types/nodes'
import type { Author, Poem, Dynasty } from '../types/poem'
import authorsData from '../data/authors.json'
import poemsData from '../data/poems.json'
import dynastiesData from '../data/dynasties.json'
import relationshipsData from '../data/relationships.json'
import { InkBackground } from './InkBackground'
import { CameraController } from './CameraController'
import { DynastyNebulaField } from './DynastyNebulaField'
import { AuthorStarField } from './AuthorStarField'
import { PoemOrbit3D } from './PoemOrbit3D'
import { RelationshipCurve3D } from './RelationshipCurve3D'
import { TimelineRail3D } from './TimelineRail3D'

const authors = authorsData as Author[]
const poems = poemsData as Poem[]
const dynasties = dynastiesData as Dynasty[]

const EDGE_COLORS: Record<string, string> = {
  friendship: '#f0c060',
  teacher_student: '#80c8ff',
  literary_school: '#c080ff',
  family: '#ff9080',
  influence: '#80ffb0',
  contemporary: '#aaaaaa',
}

const timeScale = build3DTimeScale()

function buildPoemNodes(authorNodes: AuthorNode[]): PoemNode[] {
  const nodeMap = new Map(authorNodes.map((n) => [n.id, n]))
  return (poems as Poem[]).map((poem, i) => {
    const author = nodeMap.get(poem.authorId)
    const total = (poems as Poem[]).filter((p) => p.authorId === poem.authorId).length
    return {
      id: poem.id,
      type: 'poem' as const,
      poem,
      authorId: poem.authorId,
      angle: (i / Math.max(total, 1)) * Math.PI * 2,
      orbitRadius: author ? author.radius * 4 + 6 : 10,
    }
  })
}

function buildEdges(authorNodes: AuthorNode[]): RelationshipEdge[] {
  const nodeIds = new Set(authorNodes.map((n) => n.id))
  return (relationshipsData.author_relationships as Array<{
    source: string
    target: string
    type: string
    label: string
    description: string
    strength: number
  }>)
    .filter((r) => nodeIds.has(r.source) && nodeIds.has(r.target))
    .map((r) => ({
      ...r,
      color: EDGE_COLORS[r.type] ?? '#aaaaaa',
      dashArray: r.type === 'contemporary' ? '4 2' : '',
    }))
}

/** Inner scene — rendered inside Canvas so R3F hooks work */
function Scene() {
  const selectedAuthorId = useStore((s) => s.selectedAuthorId)
  const selectedDynasties = useStore((s) => s.selectedDynasties)
  const zoomLevel = useStore((s) => s.zoomLevel)

  const authorNodes = useMemo(() => layoutAuthors3D(authors, poems, timeScale), [])
  const poemNodes = useMemo(() => buildPoemNodes(authorNodes), [authorNodes])
  const edges = useMemo(() => buildEdges(authorNodes), [authorNodes])
  const nodeMap = useMemo(() => new Map(authorNodes.map((n) => [n.id, n])), [authorNodes])

  const visibleAuthors = useMemo(
    () =>
      selectedDynasties.length === 0
        ? authorNodes
        : authorNodes.filter((n) => selectedDynasties.includes(n.dynastyId)),
    [authorNodes, selectedDynasties]
  )

  const selectedAuthorPoems = useMemo(
    () => (selectedAuthorId ? poemNodes.filter((p) => p.authorId === selectedAuthorId) : []),
    [poemNodes, selectedAuthorId]
  )

  const selectedAuthorNode = selectedAuthorId ? nodeMap.get(selectedAuthorId) ?? null : null

  return (
    <>
      <ambientLight intensity={0.3} color="#e0dcd0" />
      <directionalLight position={[200, 300, 200]} intensity={0.5} color="#e0dcd0" />
      <pointLight position={[-300, -100, -200]} intensity={0.2} color="#4a4a6a" />

      <CameraController />
      <InkBackground />
      <TimelineRail3D dynasties={dynasties} />
      <DynastyNebulaField dynasties={dynasties} />

      {edges.map((edge, i) => {
        const src = nodeMap.get(edge.source)
        const tgt = nodeMap.get(edge.target)
        if (!src || !tgt) return null
        const highlighted =
          selectedAuthorId !== null &&
          (edge.source === selectedAuthorId || edge.target === selectedAuthorId)
        const dimmed = selectedAuthorId !== null && !highlighted
        return (
          <RelationshipCurve3D
            key={i}
            edge={edge}
            sourceNode={src}
            targetNode={tgt}
            highlighted={highlighted}
            dimmed={dimmed}
          />
        )
      })}

      <AuthorStarField nodes={visibleAuthors} zoomLevel={zoomLevel} />

      {selectedAuthorNode && (
        <PoemOrbit3D
          poems={selectedAuthorPoems}
          author={selectedAuthorNode}
          visible={true}
        />
      )}

      <EffectComposer>
        <Bloom
          intensity={1.8}
          luminanceThreshold={0.3}
          luminanceSmoothing={0.6}
          mipmapBlur
        />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette eskil={false} offset={0.25} darkness={0.75} />
      </EffectComposer>
    </>
  )
}

export function Universe3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 300], fov: 60, near: 0.1, far: 5000 }}
      gl={{ antialias: true, alpha: false, toneMapping: THREE.NoToneMapping }}
      style={{ background: '#0a0a0f' }}
    >
      <Scene />
    </Canvas>
  )
}

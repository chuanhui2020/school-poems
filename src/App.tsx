import { useMemo, Component, type ReactNode } from 'react'
import { useStore } from './store/useStore'
import { Universe3D } from './components/Universe3D'
import { HUD } from './components/HUD'
import { SearchOverlay } from './components/SearchOverlay'
import { PoemReader } from './components/PoemReader'
import { HoverCard } from './components/HoverCard'
import AuthorPanel from './components/AuthorPanel'
import authors from './data/authors.json'
import poems from './data/poems.json'
import dynasties from './data/dynasties.json'
import type { Author, Poem, Dynasty } from './types/poem'
import { getDynastyColor } from './lib/colorScales'
import { layoutAuthors3D, computeDynastyScores, buildWeightedRegions3D } from './lib/layout'

const dynastyScores = computeDynastyScores(dynasties as Dynasty[], authors as Author[], poems as Poem[])
const dynastyRegions = buildWeightedRegions3D(dynasties as Dynasty[], dynastyScores)

/** Fallback when WebGL is unavailable */
function WebGLFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <p style={{ color: '#e0d6c8', fontFamily: "'LXGW WenKai', serif", textAlign: 'center' }}>
        您的浏览器不支持 WebGL，无法显示 3D 宇宙。
        <br />
        请尝试使用 Chrome 或 Firefox。
      </p>
    </div>
  )
}

interface ErrorBoundaryState { hasError: boolean }
class WebGLErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    return this.state.hasError ? <WebGLFallback /> : this.props.children
  }
}

export default function App() {
  const selectedAuthorId = useStore((s) => s.selectedAuthorId)
  const selectAuthor = useStore((s) => s.selectAuthor)
  const selectPoem = useStore((s) => s.selectPoem)
  const setFlyToTarget = useStore((s) => s.setFlyToTarget)

  // Build node position map for search fly-to
  const nodePositionMap = useMemo(() => {
    const nodes = layoutAuthors3D(authors as Author[], poems as Poem[], dynastyRegions)
    return new Map(nodes.map((n) => [n.id, [n.x, n.y, n.z] as [number, number, number]]))
  }, [])

  const selectedAuthor = selectedAuthorId
    ? (authors as Author[]).find((a) => a.id === selectedAuthorId) ?? null
    : null
  const authorPoems = selectedAuthorId
    ? (poems as Poem[]).filter((p) => p.authorId === selectedAuthorId)
    : []
  const dynastyColor = selectedAuthorId
    ? getDynastyColor((authors as Author[]).find((a) => a.id === selectedAuthorId)?.dynastyId ?? '')
    : '#888'
  const getDynastyName = (dynastyId: string) =>
    (dynasties as Dynasty[]).find((d) => d.id === dynastyId)?.name ?? dynastyId

  const handleSelectAuthor = (id: string) => {
    selectAuthor(id)
    const pos = nodePositionMap.get(id)
    if (pos) setFlyToTarget([pos[0], pos[1], pos[2] + 20])
  }

  const handleSelectPoem = (id: string) => {
    selectPoem(id)
    const poem = (poems as Poem[]).find((p) => p.id === id)
    if (poem) {
      const pos = nodePositionMap.get(poem.authorId)
      if (pos) setFlyToTarget([pos[0], pos[1], pos[2] + 20])
    }
  }

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-[var(--color-bg-deep)]">
      <WebGLErrorBoundary>
        <Universe3D />
      </WebGLErrorBoundary>
      <HUD />
      <SearchOverlay
        onSelectAuthor={handleSelectAuthor}
        onSelectPoem={handleSelectPoem}
      />
      <PoemReader />
      <HoverCard />
      {selectedAuthor && (
        <AuthorPanel
          author={{ ...selectedAuthor, dynastyId: getDynastyName(selectedAuthor.dynastyId) }}
          poems={authorPoems}
          dynastyColor={dynastyColor}
          onClose={() => selectAuthor(null)}
        />
      )}
    </div>
  )
}

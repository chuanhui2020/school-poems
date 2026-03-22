import { useState, useEffect, useCallback, useMemo } from 'react'
import FriendCircle from './components/FriendCircle'
import AuthorPanel from './components/AuthorPanel'
import DynastyHUD from './components/DynastyHUD'
import poems from './data/poems.json'
import authors from './data/authors.json'
import dynasties from './data/dynasties.json'
import relationshipsData from './data/relationships.json'
import { buildAuthorGraph } from './lib/graphTransformers'
import type { Poem, Author, Dynasty, RelationshipsData } from './types'

const relData = relationshipsData as RelationshipsData

// Group dynasties: pre-Tang together, Tang, Song, Yuan+Ming+Qing together
const dynastyGroups: { label: string; ids: string[]; color: string; yearRange: string }[] = [
  { label: '先秦至魏晋', ids: ['pre-qin', 'han', 'wei-jin'], color: '#7ec850', yearRange: '前1046—589' },
  { label: '唐', ids: ['tang'], color: '#ff4757', yearRange: '618—907' },
  { label: '宋', ids: ['song'], color: '#5b9bff', yearRange: '960—1279' },
  { label: '元明清', ids: ['yuan', 'ming', 'qing'], color: '#a55eea', yearRange: '1271—1912' },
]

// Only keep groups that have poems
const availableGroups = dynastyGroups.filter((g) =>
  g.ids.some((id) => (poems as Poem[]).some((p) => p.dynastyId === id))
)

export default function App() {
  const [activeGroupIdx, setActiveGroupIdx] = useState(() =>
    Math.floor(Math.random() * availableGroups.length)
  )
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null)
  const [paused, setPaused] = useState(false)

  const activeGroup = availableGroups[activeGroupIdx]

  const graphData = useMemo(() => {
    return buildAuthorGraph(
      authors as Author[],
      poems as Poem[],
      relData.author_relationships,
      { dynastyIds: activeGroup.ids }
    )
  }, [activeGroup.ids])

  const switchDynasty = useCallback((idx: number) => {
    setActiveGroupIdx(idx)
    setSelectedAuthorId(null)
  }, [])

  // Auto-rotate every 30s
  useEffect(() => {
    if (paused || selectedAuthorId) return
    const timer = setInterval(() => {
      setActiveGroupIdx((prev) => (prev + 1) % availableGroups.length)
      setSelectedAuthorId(null)
    }, 30000)
    return () => clearInterval(timer)
  }, [paused, selectedAuthorId, activeGroupIdx])

  const handleSelectAuthor = useCallback((id: string) => {
    setSelectedAuthorId(id)
    setPaused(true)
  }, [])

  const handleClosePanel = useCallback(() => {
    setSelectedAuthorId(null)
    setPaused(false)
  }, [])

  const selectedAuthor = selectedAuthorId
    ? (authors as Author[]).find((a) => a.id === selectedAuthorId) ?? null
    : null

  const authorPoems = selectedAuthorId
    ? (poems as Poem[]).filter((p) => p.authorId === selectedAuthorId)
    : []

  return (
    <div className="w-full h-full relative overflow-hidden">
      <FriendCircle
        graphData={graphData}
        dynastyColor={activeGroup.color}
        selectedAuthorId={selectedAuthorId}
        onSelectAuthor={handleSelectAuthor}
        relationshipTypes={relData.relationship_types}
      />

      <DynastyHUD
        groups={availableGroups}
        activeIdx={activeGroupIdx}
        nodeCount={graphData.nodes.length}
        linkCount={graphData.links.length}
        paused={paused || !!selectedAuthorId}
        onSwitch={switchDynasty}
        relationshipTypes={relData.relationship_types}
      />

      {selectedAuthor && (
        <AuthorPanel
          author={selectedAuthor}
          poems={authorPoems}
          dynastyColor={activeGroup.color}
          onClose={handleClosePanel}
        />
      )}
    </div>
  )
}

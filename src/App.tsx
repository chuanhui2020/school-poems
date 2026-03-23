import { useStore } from './store/useStore'
import { Universe } from './components/Universe'
import { HUD } from './components/HUD'
import { SearchOverlay } from './components/SearchOverlay'
import { PoemReader } from './components/PoemReader'
import AuthorPanel from './components/AuthorPanel'
import authors from './data/authors.json'
import poems from './data/poems.json'
import dynasties from './data/dynasties.json'
import type { Author, Poem, Dynasty } from './types/poem'
import { getDynastyColor } from './lib/colorScales'

export default function App() {
  const selectedAuthorId = useStore((s) => s.selectedAuthorId)
  const selectAuthor = useStore((s) => s.selectAuthor)
  const selectPoem = useStore((s) => s.selectPoem)

  const selectedAuthor = selectedAuthorId
    ? (authors as Author[]).find((a) => a.id === selectedAuthorId) ?? null
    : null

  const authorPoems = selectedAuthorId
    ? (poems as Poem[]).filter((p) => p.authorId === selectedAuthorId)
    : []

  const dynastyColor = selectedAuthorId
    ? getDynastyColor(
        (authors as Author[]).find((a) => a.id === selectedAuthorId)?.dynastyId ?? ''
      )
    : '#888'

  const getDynastyName = (dynastyId: string) =>
    (dynasties as Dynasty[]).find((d) => d.id === dynastyId)?.name ?? dynastyId

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-[var(--color-bg-deep)]">
      <Universe />
      <HUD />
      <SearchOverlay
        onSelectAuthor={(id) => selectAuthor(id)}
        onSelectPoem={(id) => selectPoem(id)}
      />
      <PoemReader />
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

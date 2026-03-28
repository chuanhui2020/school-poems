import { useStore } from '../store/useStore'
import { useSearch } from '../hooks/useSearch'
import authors from '../data/authors.json'
import poems from '../data/poems.json'
import type { Author, Poem } from '../types/poem'

interface Props {
  onSelectAuthor: (id: string) => void
  onSelectPoem: (id: string) => void
}

export function SearchOverlay({ onSelectAuthor, onSelectPoem }: Props) {
  const searchOpen = useStore((s) => s.searchOpen)
  const toggleSearch = useStore((s) => s.toggleSearch)
  const searchQuery = useStore((s) => s.searchQuery)
  const setSearchQuery = useStore((s) => s.setSearchQuery)

  const results = useSearch(authors as Author[], poems as Poem[], searchQuery)

  if (!searchOpen) return null

  return (
    <div
      className="fixed inset-0 z-40"
      onClick={toggleSearch}
    >
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: 'rgba(5,5,16,0.6)' }} />

      {/* Right slide-in panel */}
      <div
        className="absolute top-0 right-0 h-full w-[360px] max-w-[85vw] animate-slide-in neon-border"
        style={{
          background: 'rgba(5, 5, 20, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderLeft: '1px solid rgba(0, 240, 255, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="p-6">
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索诗人或诗词..."
            className="w-full bg-transparent outline-none pb-2"
            style={{
              color: '#e0e8ff',
              fontSize: '16px',
              fontFamily: "'LXGW WenKai', serif",
              borderBottom: '2px solid rgba(0, 240, 255, 0.4)',
              caretColor: '#00f0ff',
            }}
          />
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ul className="max-h-[calc(100vh-100px)] overflow-y-auto px-2">
            {results.map((r) => (
              <li
                key={`${r.type}-${r.id}`}
                className="px-4 py-3 cursor-pointer rounded-lg transition-colors"
                style={{ borderLeft: '2px solid transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 240, 255, 0.08)'
                  e.currentTarget.style.borderLeftColor = '#00f0ff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderLeftColor = 'transparent'
                }}
                onClick={() => {
                  if (r.type === 'author') onSelectAuthor(r.id)
                  else onSelectPoem(r.id)
                  toggleSearch()
                  setSearchQuery('')
                }}
              >
                <span style={{ color: '#e0e8ff', fontSize: '14px' }}>{r.title}</span>
                <span className="ml-2" style={{ color: '#5a6a8a', fontSize: '12px' }}>
                  {r.type === 'author' ? '诗人' : '诗词'} · {r.subtitle}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

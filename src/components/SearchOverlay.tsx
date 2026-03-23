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
      className="fixed inset-0 z-40 flex items-start justify-center pt-20"
      style={{ backgroundColor: 'rgba(10,10,20,0.8)' }}
      onClick={toggleSearch}
    >
      <div
        className="w-full max-w-lg mx-4 rounded-xl overflow-hidden"
        style={{
          background: 'rgba(30,30,50,0.95)',
          border: '1px solid rgba(224,214,200,0.1)',
          backdropFilter: 'blur(16px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索诗人或诗词..."
          className="w-full px-6 py-4 bg-transparent outline-none"
          style={{
            color: '#e0d6c8',
            fontSize: '16px',
            fontFamily: "'LXGW WenKai', serif",
            borderBottom: '1px solid rgba(224,214,200,0.08)',
          }}
        />
        {results.length > 0 && (
          <ul className="max-h-80 overflow-y-auto">
            {results.map((r) => (
              <li
                key={`${r.type}-${r.id}`}
                className="px-6 py-3 hover:bg-white/5 cursor-pointer"
                onClick={() => {
                  if (r.type === 'author') onSelectAuthor(r.id)
                  else onSelectPoem(r.id)
                  toggleSearch()
                  setSearchQuery('')
                }}
              >
                <span style={{ color: '#e0d6c8', fontSize: '14px' }}>{r.title}</span>
                <span className="ml-2" style={{ color: '#e0d6c8', opacity: 0.4, fontSize: '12px' }}>
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

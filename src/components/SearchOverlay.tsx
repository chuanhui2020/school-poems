import { useEffect, useRef, useCallback } from 'react'
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
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const activeIndex = useRef(-1)

  const results = useSearch(authors as Author[], poems as Poem[], searchQuery)

  // Focus trap & Escape
  useEffect(() => {
    if (!searchOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        toggleSearch()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        activeIndex.current = Math.min(activeIndex.current + 1, results.length - 1)
        updateActiveDescendant()
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        activeIndex.current = Math.max(activeIndex.current - 1, -1)
        updateActiveDescendant()
      }
      if (e.key === 'Enter' && activeIndex.current >= 0) {
        e.preventDefault()
        const r = results[activeIndex.current]
        if (r) selectResult(r)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [searchOpen, results, toggleSearch])

  // Reset active index when results change
  useEffect(() => { activeIndex.current = -1 }, [results])

  const updateActiveDescendant = useCallback(() => {
    const items = panelRef.current?.querySelectorAll('[data-search-item]')
    items?.forEach((el, i) => {
      if (i === activeIndex.current) {
        el.classList.add('bg-white/10')
        el.scrollIntoView({ block: 'nearest' })
      } else {
        el.classList.remove('bg-white/10')
      }
    })
  }, [])

  const selectResult = useCallback((r: { type: string; id: string }) => {
    if (r.type === 'author') onSelectAuthor(r.id)
    else onSelectPoem(r.id)
    toggleSearch()
    setSearchQuery('')
  }, [onSelectAuthor, onSelectPoem, toggleSearch, setSearchQuery])

  if (!searchOpen) return null

  return (
    <div
      className="fixed inset-0 z-40"
      role="dialog"
      aria-label="搜索"
      aria-modal="true"
      onClick={toggleSearch}
    >
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: 'rgba(10,10,15,0.5)' }} />

      {/* Right slide-in panel */}
      <div
        ref={panelRef}
        className="absolute top-0 right-0 h-full w-[360px] max-w-[85vw] max-md:w-full max-md:max-w-full animate-slide-in"
        style={{
          background: 'rgba(10, 10, 15, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderLeft: '1px solid rgba(224, 220, 208, 0.06)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="p-6">
          <input
            ref={inputRef}
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索诗人或诗词..."
            className="w-full bg-transparent outline-none pb-2 font-serif"
            style={{
              color: 'var(--color-text)',
              fontSize: '16px',
              borderBottom: '1px solid rgba(224, 220, 208, 0.15)',
            }}
            aria-label="搜索诗人或诗词"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="search-results"
          />
          <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)', opacity: 0.6 }}>
            ↑↓ 导航 · Enter 选择 · Esc 关闭
          </p>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ul id="search-results" className="max-h-[calc(100vh-120px)] overflow-y-auto px-2" role="listbox">
            {results.map((r, i) => (
              <li
                key={`${r.type}-${r.id}`}
                data-search-item
                className="ink-dot px-4 py-3 cursor-pointer rounded-lg hover:bg-white/5 transition-colors"
                role="option"
                aria-selected={i === activeIndex.current}
                onClick={() => selectResult(r)}
              >
                <span style={{ color: 'var(--color-text)', fontSize: '14px' }}>{r.title}</span>
                <span className="ml-2" style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                  {r.type === 'author' ? '诗人' : '诗词'} · {r.subtitle}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Empty state */}
        {searchQuery.length > 0 && results.length === 0 && (
          <div className="px-6 py-12 text-center" style={{ color: 'var(--color-text-secondary)' }}>
            <p className="text-sm">未找到相关结果</p>
            <p className="text-xs mt-1" style={{ opacity: 0.6 }}>试试其他关键词</p>
          </div>
        )}
      </div>
    </div>
  )
}

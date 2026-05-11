import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import authors from '../data/authors.json'
import type { Author } from '../types/poem'

export function HUD() {
  const zoomLevel = useStore((s) => s.zoomLevel)
  const selectedAuthorId = useStore((s) => s.selectedAuthorId)
  const selectAuthor = useStore((s) => s.selectAuthor)
  const toggleSearch = useStore((s) => s.toggleSearch)
  const resetZoom = useStore((s) => s.resetZoom)

  const handleReset = () => resetZoom?.()

  // Global keyboard shortcut: Ctrl+K / ⌘K to open search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggleSearch()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [toggleSearch])

  const selectedAuthorName = selectedAuthorId
    ? (authors as Author[]).find((a) => a.id === selectedAuthorId)?.name ?? selectedAuthorId
    : null

  return (
    <div className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
      <div className="flex items-center justify-between px-6 py-4 max-md:px-3 max-md:py-3">
        {/* Left: title + breadcrumb */}
        <div className="flex items-center gap-4 max-md:gap-2 pointer-events-auto">
          <h1
            className="text-xl max-md:text-base cursor-pointer font-serif"
            style={{
              color: 'var(--color-text)',
              fontWeight: 300,
              letterSpacing: '0.1em',
            }}
            onClick={handleReset}
          >
            古诗词网络
          </h1>
          <div
            className="flex items-center gap-2 text-xs"
            style={{ color: 'var(--color-text-dim)' }}
          >
            <span>{zoomLevel === 'galaxy' ? '全景' : zoomLevel === 'dynasty' ? '朝代' : '诗人'}</span>
            {selectedAuthorName && (
              <span
                className="cursor-pointer hover:opacity-80"
                onClick={() => selectAuthor(null)}
              >
                › {selectedAuthorName}
              </span>
            )}
          </div>
        </div>

        {/* Right: stamp-style buttons */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={toggleSearch}
            className="ink-stamp text-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="搜索诗人或诗词 (Ctrl+K)"
          >
            搜索
          </button>
          <button
            onClick={handleReset}
            className="ink-stamp text-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
            style={{ transform: 'rotate(1deg)' }}
            aria-label="返回全景视图"
          >
            全景
          </button>
        </div>
      </div>

      {/* Top gradient fade */}
      <div
        className="absolute inset-x-0 top-0 h-20 pointer-events-none -z-10"
        style={{
          background: 'linear-gradient(to bottom, rgba(10,10,15,0.6), transparent)',
        }}
      />
    </div>
  )
}

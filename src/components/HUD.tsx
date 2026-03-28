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

  const selectedAuthorName = selectedAuthorId
    ? (authors as Author[]).find((a) => a.id === selectedAuthorId)?.name ?? selectedAuthorId
    : null

  return (
    <div className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: title + breadcrumb */}
        <div className="flex items-center gap-4 pointer-events-auto">
          <h1
            className="text-xl cursor-pointer"
            style={{
              color: 'var(--color-text)',
              fontFamily: "'LXGW WenKai', serif",
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
            className="ink-stamp text-sm"
          >
            搜索
          </button>
          <button
            onClick={handleReset}
            className="ink-stamp text-sm"
            style={{ transform: 'rotate(1deg)' }}
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

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
      {/* Scanline overlay */}
      <div className="scanline absolute inset-0 pointer-events-none" />

      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: title + breadcrumb */}
        <div className="flex items-center gap-4 pointer-events-auto">
          {/* Corner bracket decoration */}
          <div className="corner-brackets px-2 py-1">
            <h1
              className="glitch text-xl cursor-pointer"
              data-text="古诗词网络"
              style={{
                color: 'var(--color-neon-cyan)',
                fontFamily: "'LXGW WenKai', serif",
                fontWeight: 300,
                letterSpacing: '0.1em',
                textShadow: '0 0 10px rgba(0,240,255,0.5)',
              }}
              onClick={handleReset}
            >
              古诗词网络
            </h1>
          </div>
          <div
            className="flex items-center gap-2 text-xs"
            style={{ color: 'var(--color-text-dim)' }}
          >
            <span style={{ color: 'var(--color-neon-cyan)', opacity: 0.7 }}>
              {zoomLevel === 'galaxy' ? '全景' : zoomLevel === 'dynasty' ? '朝代' : '诗人'}
            </span>
            {selectedAuthorName && (
              <span
                className="cursor-pointer hover:opacity-80"
                style={{ color: 'var(--color-neon-yellow)' }}
                onClick={() => selectAuthor(null)}
              >
                › {selectedAuthorName}
              </span>
            )}
          </div>
        </div>

        {/* Right: cyber buttons */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={toggleSearch}
            className="cyber-btn text-sm"
          >
            搜索
          </button>
          <button
            onClick={handleReset}
            className="cyber-btn text-sm"
          >
            全景
          </button>
        </div>
      </div>

      {/* Top gradient fade */}
      <div
        className="absolute inset-x-0 top-0 h-20 pointer-events-none -z-10"
        style={{
          background: 'linear-gradient(to bottom, rgba(5,5,16,0.7), transparent)',
        }}
      />
    </div>
  )
}

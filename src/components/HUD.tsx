import { useStore } from '../store/useStore'

export function HUD() {
  const zoomLevel = useStore((s) => s.zoomLevel)
  const selectedAuthorId = useStore((s) => s.selectedAuthorId)
  const selectAuthor = useStore((s) => s.selectAuthor)
  const toggleSearch = useStore((s) => s.toggleSearch)
  const resetZoom = useStore((s) => s.resetZoom)

  const handleReset = () => resetZoom?.()

  return (
    <div className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
      <div className="flex items-start justify-between px-6 py-4">
        {/* Left: vertical title + breadcrumb */}
        <div className="flex items-start gap-4 pointer-events-auto">
          <h1
            className="text-lg cursor-pointer leading-tight"
            style={{
              color: '#e0dcd0',
              fontFamily: "'LXGW WenKai', serif",
              writingMode: 'vertical-rl',
              letterSpacing: '0.15em',
            }}
            onClick={handleReset}
          >
            古诗词网络
          </h1>
          <div
            className="flex flex-col gap-1 text-xs mt-1"
            style={{ color: '#e0dcd0', opacity: 0.4 }}
          >
            <span>{zoomLevel === 'galaxy' ? '全景' : zoomLevel === 'dynasty' ? '朝代' : '诗人'}</span>
            {selectedAuthorId && (
              <span
                className="cursor-pointer hover:opacity-80"
                onClick={() => selectAuthor(null)}
              >
                › {selectedAuthorId}
              </span>
            )}
          </div>
        </div>

        {/* Right: stamp-style buttons */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={toggleSearch}
            className="ink-stamp text-sm"
            style={{ fontFamily: "'LXGW WenKai', serif" }}
          >
            搜索
          </button>
          <button
            onClick={handleReset}
            className="ink-stamp text-sm"
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

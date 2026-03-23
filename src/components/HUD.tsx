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
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: title + breadcrumb */}
        <div className="pointer-events-auto">
          <h1
            className="text-lg cursor-pointer"
            style={{ color: '#e0d6c8', fontFamily: "'LXGW WenKai', serif" }}
            onClick={handleReset}
          >
            诗词元宇宙
          </h1>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#e0d6c8', opacity: 0.4 }}>
            <span>{zoomLevel === 'galaxy' ? '全景' : zoomLevel === 'dynasty' ? '朝代' : '诗人'}</span>
            {selectedAuthorId && (
              <>
                <span>›</span>
                <span
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => selectAuthor(null)}
                >
                  {selectedAuthorId}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: search + zoom controls */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={toggleSearch}
            className="px-4 py-2 rounded-lg text-sm"
            style={{
              background: 'rgba(224,214,200,0.08)',
              color: '#e0d6c8',
              border: '1px solid rgba(224,214,200,0.1)',
              fontFamily: "'LXGW WenKai', serif",
            }}
          >
            搜索
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-lg text-sm"
            style={{
              background: 'rgba(224,214,200,0.08)',
              color: '#e0d6c8',
              border: '1px solid rgba(224,214,200,0.1)',
            }}
          >
            全景
          </button>
        </div>
      </div>
    </div>
  )
}

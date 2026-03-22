import { useEffect, useState } from 'react'

interface DynastyGroup {
  label: string
  ids: string[]
  color: string
  yearRange: string
}

interface DynastyHUDProps {
  groups: DynastyGroup[]
  activeIdx: number
  nodeCount: number
  linkCount: number
  paused: boolean
  onSwitch: (idx: number) => void
  relationshipTypes: Record<string, { color: string; dashArray: string; label: string }>
}

const CYCLE_MS = 30000

export default function DynastyHUD({
  groups,
  activeIdx,
  nodeCount,
  linkCount,
  paused,
  onSwitch,
  relationshipTypes,
}: DynastyHUDProps) {
  const group = groups[activeIdx]
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (paused) { setProgress(100); return }
    setProgress(100)
    const start = Date.now()
    const frame = () => {
      const elapsed = Date.now() - start
      const pct = Math.max(0, 100 - (elapsed / CYCLE_MS) * 100)
      setProgress(pct)
      if (pct > 0) raf = requestAnimationFrame(frame)
    }
    let raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [activeIdx, paused])

  return (
    <>
      {/* Top left — Dynasty info */}
      <div className="absolute top-5 left-5 z-30">
        <div className="glass rounded-xl px-5 py-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-4xl font-bold tracking-wide" style={{ color: group.color }}>
              {group.label}
            </h1>
            <span className="text-sm text-[var(--color-text-dim)]">
              {group.yearRange}
            </span>
          </div>
          <div className="text-[11px] text-[var(--color-text-dim)] mt-1 tracking-widest uppercase">
            诗人的朋友圈
          </div>
          {/* Progress bar */}
          {!paused && (
            <div className="mt-3 w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: group.color,
                  boxShadow: `0 0 8px ${group.color}60`,
                  transition: 'none',
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Top right — Dynasty switcher (timeline style) */}
      <div className="absolute top-5 right-5 z-30">
        <div className="glass rounded-xl px-4 py-3 flex items-center gap-0">
          {groups.map((g, i) => {
            const isActive = i === activeIdx
            return (
              <div key={g.label} className="flex items-center">
                <button
                  onClick={() => onSwitch(i)}
                  className="cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium transition-all relative"
                  style={{
                    color: isActive ? '#fff' : g.color,
                    backgroundColor: isActive ? g.color + '20' : 'transparent',
                    textShadow: isActive ? `0 0 12px ${g.color}` : 'none',
                  }}
                >
                  {isActive && (
                    <span
                      className="absolute inset-0 rounded-full animate-glow"
                      style={{ border: `1px solid ${g.color}40` }}
                    />
                  )}
                  {g.label}
                </button>
                {i < groups.length - 1 && (
                  <div className="w-4 h-[1px] bg-white/10" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom left — Legend */}
      <div className="absolute bottom-5 left-5 z-30">
        <div className="glass rounded-xl px-4 py-3 flex items-center gap-5">
          {Object.entries(relationshipTypes).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2 text-[10px] text-[var(--color-text-dim)]">
              <svg width="20" height="4">
                <line x1="0" y1="2" x2="20" y2="2"
                  stroke={val.color} strokeWidth={1.5}
                  strokeDasharray={val.dashArray === 'none' ? undefined : val.dashArray}
                  filter="url(#glow-line)"
                />
              </svg>
              <span>{val.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom right — Stats */}
      <div className="absolute bottom-5 right-5 z-30">
        <div className="glass rounded-xl px-4 py-3 text-xs text-[var(--color-text-dim)] flex items-center gap-3">
          <div>
            <span className="text-base font-semibold tabular-nums" style={{ color: group.color }}>{nodeCount}</span>
            <span className="ml-1">位诗人</span>
          </div>
          <div className="w-[1px] h-4 bg-white/10" />
          <div>
            <span className="text-base font-semibold tabular-nums" style={{ color: group.color }}>{linkCount}</span>
            <span className="ml-1">条关系</span>
          </div>
        </div>
      </div>
    </>
  )
}

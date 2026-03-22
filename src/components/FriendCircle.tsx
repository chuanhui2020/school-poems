import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import { useDimensions } from './visualizations/shared/useDimensions'
import type { SimNode } from './visualizations/shared/useSimulation'
import Tooltip from './shared/Tooltip'

interface FriendCircleProps {
  graphData: { nodes: SimNode[]; links: any[] }
  dynastyColor: string
  selectedAuthorId: string | null
  onSelectAuthor: (id: string) => void
  relationshipTypes: Record<string, { color: string; dashArray: string; label: string }>
}

export default function FriendCircle({
  graphData,
  dynastyColor,
  selectedAuthorId,
  onSelectAuthor,
  relationshipTypes,
}: FriendCircleProps) {
  const [containerRef, dimensions] = useDimensions()
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [tooltipInfo, setTooltipInfo] = useState<{
    x: number; y: number; content: React.ReactNode
  } | null>(null)
  const [time, setTime] = useState(0)
  const rafRef = useRef<number>(0)
  const [fadePhase, setFadePhase] = useState<'in' | 'out' | 'visible'>('in')
  const prevDataRef = useRef(graphData)

  // Auto-select random author
  const effectiveSelectedId = useMemo(() => {
    if (selectedAuthorId && graphData.nodes.some((n) => n.id === selectedAuthorId)) {
      return selectedAuthorId
    }
    if (graphData.nodes.length === 0) return null
    return graphData.nodes[Math.floor(Math.random() * graphData.nodes.length)].id
  }, [selectedAuthorId, graphData.nodes])

  // Fade transition on data change
  useEffect(() => {
    if (prevDataRef.current !== graphData) {
      setFadePhase('in')
      const t = setTimeout(() => setFadePhase('visible'), 500)
      prevDataRef.current = graphData
      return () => clearTimeout(t)
    }
  }, [graphData])

  // Animation loop
  useEffect(() => {
    const start = Date.now()
    const tick = () => {
      setTime((Date.now() - start) / 1000)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // Connected nodes
  const connectedIds = useMemo(() => {
    if (!effectiveSelectedId) return new Set<string>()
    const ids = new Set<string>()
    for (const link of graphData.links) {
      const s = typeof link.source === 'string' ? link.source : link.source.id
      const t = typeof link.target === 'string' ? link.target : link.target.id
      if (s === effectiveSelectedId) ids.add(t)
      if (t === effectiveSelectedId) ids.add(s)
    }
    return ids
  }, [effectiveSelectedId, graphData.links])

  const cx = dimensions.width / 2
  const cy = dimensions.height / 2
  const maxR = Math.min(cx, cy) * 0.82

  // Orbital layout
  const orbitData = useMemo(() => {
    const result = new Map<string, { radius: number; speed: number; baseAngle: number }>()
    if (graphData.nodes.length === 0) return result

    const others = graphData.nodes.filter((n) => n.id !== effectiveSelectedId)
    const connected = others.filter((n) => connectedIds.has(n.id))
    const unconnected = others.filter((n) => !connectedIds.has(n.id))

    if (effectiveSelectedId) {
      result.set(effectiveSelectedId, { radius: 0, speed: 0, baseAngle: 0 })
    }

    const innerRings = Math.max(1, Math.ceil(connected.length / 7))
    connected.forEach((n, i) => {
      const ring = Math.floor(i / Math.ceil(connected.length / innerRings))
      const posInRing = i % Math.ceil(connected.length / innerRings)
      const ringSize = Math.ceil(connected.length / innerRings)
      const radius = maxR * (0.22 + (ring / (innerRings + 1)) * 0.28)
      result.set(n.id, {
        radius,
        speed: 0.05 / (1 + ring * 0.4) * (ring % 2 === 0 ? 1 : -1),
        baseAngle: (posInRing / ringSize) * Math.PI * 2 + ring * 0.8,
      })
    })

    const outerRings = Math.max(1, Math.ceil(unconnected.length / 10))
    unconnected.forEach((n, i) => {
      const ring = Math.floor(i / Math.ceil(unconnected.length / outerRings))
      const posInRing = i % Math.ceil(unconnected.length / outerRings)
      const ringSize = Math.ceil(unconnected.length / outerRings)
      const radius = maxR * (0.58 + (ring / (outerRings + 1)) * 0.38)
      result.set(n.id, {
        radius,
        speed: 0.025 / (1 + ring * 0.3) * (ring % 2 === 0 ? -1 : 1),
        baseAngle: (posInRing / ringSize) * Math.PI * 2 + ring * 1.3,
      })
    })

    return result
  }, [graphData.nodes, effectiveSelectedId, connectedIds, maxR])

  const getPos = useCallback((id: string) => {
    const d = orbitData.get(id)
    if (!d || d.radius === 0) return { x: cx, y: cy }
    const angle = d.baseAngle + time * d.speed
    return { x: cx + Math.cos(angle) * d.radius, y: cy + Math.sin(angle) * d.radius }
  }, [orbitData, time, cx, cy])

  const handleNodeHover = useCallback((node: SimNode, event: React.MouseEvent) => {
    setHoveredNodeId(node.id)
    setTooltipInfo({
      x: event.clientX, y: event.clientY,
      content: (
        <div>
          <div className="font-bold text-white text-sm">{node.label as string}</div>
          {(node.styleLabels as string[])?.length > 0 && (
            <div className="text-xs text-[var(--color-text-dim)] mt-0.5">
              {(node.styleLabels as string[]).join(' · ')}
            </div>
          )}
          <div className="text-xs mt-1" style={{ color: dynastyColor }}>
            收录 {node.poemCount as number} 首 · 点击查看作品
          </div>
        </div>
      ),
    })
  }, [dynastyColor])

  // Link data with relationship type colors
  const linkElements = useMemo(() => {
    return graphData.links.map((link, i) => {
      const sId = typeof link.source === 'string' ? link.source : link.source.id
      const tId = typeof link.target === 'string' ? link.target : link.target.id
      const type = link.type as string
      const relStyle = relationshipTypes[type]
      const color = relStyle?.color || dynastyColor
      return { sId, tId, key: i, color, type }
    })
  }, [graphData.links, relationshipTypes, dynastyColor])

  const uniqueRadii = useMemo(() =>
    Array.from(new Set([...orbitData.values()].map((d) => d.radius).filter((r) => r > 0))).sort((a, b) => a - b),
    [orbitData]
  )

  const globalOpacity = fadePhase === 'in' ? 0 : 1

  return (
    <div ref={containerRef} className="absolute inset-0 z-10">
      <svg width={dimensions.width} height={dimensions.height}
        style={{ opacity: globalOpacity, transition: 'opacity 0.5s ease-in-out' }}
      >
        <defs>
          <filter id="glow-line">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-text">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-selected">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-dot">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Multi-layer center aura */}
          <radialGradient id="aura-inner" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={dynastyColor} stopOpacity="0.12" />
            <stop offset="60%" stopColor={dynastyColor} stopOpacity="0.03" />
            <stop offset="100%" stopColor={dynastyColor} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="aura-outer" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={dynastyColor} stopOpacity="0.04" />
            <stop offset="100%" stopColor={dynastyColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer aura */}
        <circle cx={cx} cy={cy} r={maxR * 0.9} fill="url(#aura-outer)" />
        {/* Inner aura */}
        <circle cx={cx} cy={cy} r={maxR * 0.35} fill="url(#aura-inner)" className="animate-breathe" />

        {/* Orbital rings */}
        {uniqueRadii.map((r, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={i < Math.ceil(uniqueRadii.length * 0.4) ? dynastyColor : 'white'}
            strokeWidth={0.4}
            opacity={i < Math.ceil(uniqueRadii.length * 0.4) ? 0.1 : 0.04}
            strokeDasharray="2 8"
          />
        ))}

        {/* Decorative rotating ring */}
        <circle
          cx={cx} cy={cy} r={maxR * 0.15}
          fill="none" stroke={dynastyColor} strokeWidth={0.3}
          opacity={0.15} strokeDasharray="1 12"
          transform={`rotate(${time * 8}, ${cx}, ${cy})`}
        />
        <circle
          cx={cx} cy={cy} r={maxR * 0.5}
          fill="none" stroke={dynastyColor} strokeWidth={0.2}
          opacity={0.06} strokeDasharray="1 20"
          transform={`rotate(${-time * 3}, ${cx}, ${cy})`}
        />

        {/* Relationship lines */}
        {linkElements.map(({ sId, tId, key, color }) => {
          const sp = getPos(sId)
          const tp = getPos(tId)
          const isSelectedLink = sId === effectiveSelectedId || tId === effectiveSelectedId
          const isHoveredLink = sId === hoveredNodeId || tId === hoveredNodeId

          return (
            <g key={key}>
              <line
                x1={sp.x} y1={sp.y} x2={tp.x} y2={tp.y}
                stroke={color}
                strokeWidth={isHoveredLink ? 1.5 : isSelectedLink ? 1 : 0.5}
                opacity={isHoveredLink ? 0.75 : isSelectedLink ? 0.4 : 0.18}
                strokeDasharray={isSelectedLink ? '5 5' : undefined}
                className={isSelectedLink ? 'animate-pulse-line' : ''}
                filter={isHoveredLink ? 'url(#glow-line)' : undefined}
              />
              {(isSelectedLink || isHoveredLink) && (
                <>
                  <circle cx={sp.x} cy={sp.y} r={1.5} fill={color} opacity={0.5} />
                  <circle cx={tp.x} cy={tp.y} r={1.5} fill={color} opacity={0.5} />
                </>
              )}
            </g>
          )
        })}

        {/* Author nodes */}
        {graphData.nodes.map((node) => {
          const pos = getPos(node.id)
          const isSelected = node.id === effectiveSelectedId
          const isHovered = node.id === hoveredNodeId
          const isConnected = connectedIds.has(node.id)
          const name = node.label as string

          let fontSize = 11
          let fontWeight = '400'
          let opacity = 0.3
          let fill = dynastyColor

          if (isSelected) {
            fontSize = 20
            fontWeight = '700'
            opacity = 1
            fill = '#ffffff'
          } else if (isHovered) {
            fontSize = 15
            fontWeight = '600'
            opacity = 1
            fill = '#ffffff'
          } else if (isConnected) {
            fontSize = 13
            fontWeight = '500'
            opacity = 0.7
          }

          return (
            <g key={node.id}
              className="cursor-pointer"
              onMouseEnter={(e) => handleNodeHover(node, e)}
              onMouseLeave={() => { setHoveredNodeId(null); setTooltipInfo(null) }}
              onClick={() => onSelectAuthor(node.id)}
            >
              {/* Star dot behind text */}
              <circle
                cx={pos.x} cy={pos.y}
                r={isSelected ? 4 : isHovered ? 3.5 : isConnected ? 2.5 : 1.5}
                fill={isSelected || isHovered ? '#fff' : dynastyColor}
                opacity={isSelected ? 0.3 : isHovered ? 0.25 : 0.12}
                filter="url(#glow-dot)"
              />
              {/* Name */}
              <text
                x={pos.x} y={pos.y}
                textAnchor="middle" dominantBaseline="middle"
                fill={fill} fontSize={fontSize} fontWeight={fontWeight}
                opacity={opacity}
                filter={isSelected ? 'url(#glow-selected)' : isHovered ? 'url(#glow-text)' : undefined}
                className="select-none"
                style={{ transition: 'opacity 0.3s' }}
              >
                {name}
              </text>
            </g>
          )
        })}

        {/* Selected author decorative line */}
        {effectiveSelectedId && (() => {
          const node = graphData.nodes.find((n) => n.id === effectiveSelectedId)
          if (!node) return null
          const name = node.label as string
          const lineW = name.length * 12
          const labels = (node.styleLabels as string[]) || []
          return (
            <g>
              <line
                x1={cx - lineW / 2} y1={cy + 14}
                x2={cx + lineW / 2} y2={cy + 14}
                stroke={dynastyColor} strokeWidth={0.5} opacity={0.3}
              />
              {labels.length > 0 && (
                <text
                  x={cx} y={cy + 30}
                  textAnchor="middle" fill={dynastyColor}
                  fontSize={10} opacity={0.4}
                  className="select-none"
                >
                  {labels.join('  ·  ')}
                </text>
              )}
            </g>
          )
        })()}
      </svg>

      {tooltipInfo && (
        <Tooltip x={tooltipInfo.x} y={tooltipInfo.y} visible dynastyColor={dynastyColor}>
          {tooltipInfo.content}
        </Tooltip>
      )}

      {graphData.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-dim)] text-lg z-20">
          该朝代暂无诗人关系数据
        </div>
      )}
    </div>
  )
}

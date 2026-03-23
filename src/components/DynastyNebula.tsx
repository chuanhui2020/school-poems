import { memo } from 'react'
import type { DynastyRegion, ZoomLevel } from '../types/nodes'
import { getNarrative, atmosphereColors } from '../lib/dynastyNarratives'

interface Props {
  regions: DynastyRegion[]
  zoomLevel: ZoomLevel
}

/** Background layer: colored regions for each dynasty with narrative text */
export const DynastyNebula = memo(function DynastyNebula({ regions, zoomLevel }: Props) {
  return (
    <g className="dynasty-nebula">
      {regions.map((region) => {
        const narrative = getNarrative(region.dynasty.id)
        const [colorA, colorB] = narrative
          ? atmosphereColors[narrative.atmosphere]
          : ['#1a1a2e', '#16213e']
        const gradientId = `nebula-${region.dynasty.id}`
        const width = region.x1 - region.x0
        const height = 2000

        return (
          <g key={region.dynasty.id}>
            <defs>
              <radialGradient id={gradientId} cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor={region.color} stopOpacity={0.15} />
                <stop offset="60%" stopColor={colorB} stopOpacity={0.08} />
                <stop offset="100%" stopColor={colorA} stopOpacity={0} />
              </radialGradient>
            </defs>

            {/* Nebula background */}
            <rect
              x={region.x0}
              y={0}
              width={width}
              height={height}
              fill={`url(#${gradientId})`}
            />

            {/* Dynasty border line */}
            <line
              x1={region.x0}
              y1={0}
              x2={region.x0}
              y2={height}
              stroke={region.color}
              strokeOpacity={0.15}
              strokeWidth={1}
              strokeDasharray="8 8"
            />

            {/* Dynasty label — visible at galaxy and dynasty zoom */}
            {(zoomLevel === 'galaxy' || zoomLevel === 'dynasty') && (
              <text
                x={region.x0 + width / 2}
                y={120}
                textAnchor="middle"
                fill={region.color}
                fillOpacity={0.6}
                fontSize={zoomLevel === 'galaxy' ? 80 : 48}
                fontFamily="'LXGW WenKai', serif"
              >
                {narrative?.title ?? region.dynasty.name}
              </text>
            )}

            {/* Subtitle — visible at dynasty zoom */}
            {zoomLevel === 'dynasty' && narrative && (
              <text
                x={region.x0 + width / 2}
                y={180}
                textAnchor="middle"
                fill={region.color}
                fillOpacity={0.4}
                fontSize={28}
                fontFamily="'LXGW WenKai', serif"
              >
                {narrative.subtitle}
              </text>
            )}

            {/* Narrative text — visible at dynasty zoom */}
            {zoomLevel === 'dynasty' && narrative && (
              <foreignObject
                x={region.x0 + width * 0.15}
                y={220}
                width={width * 0.7}
                height={200}
              >
                <p
                  style={{
                    color: region.color,
                    opacity: 0.35,
                    fontSize: '18px',
                    fontFamily: "'LXGW WenKai', serif",
                    textAlign: 'center',
                    lineHeight: 1.8,
                  }}
                >
                  {narrative.narrative}
                </p>
              </foreignObject>
            )}
          </g>
        )
      })}
    </g>
  )
})

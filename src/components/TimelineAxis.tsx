import { memo } from 'react'
import type { DynastyRegion } from '../types/nodes'
import { WORLD } from '../lib/layout'

interface Props {
  regions: DynastyRegion[]
}

export const TimelineAxis = memo(function TimelineAxis({ regions }: Props) {
  return (
    <g className="timeline-axis">
      <line
        x1={0} y1={WORLD.HEIGHT - 60}
        x2={WORLD.WIDTH} y2={WORLD.HEIGHT - 60}
        stroke="#e0d6c8" strokeOpacity={0.1} strokeWidth={1}
      />
      {regions.map((r) => (
        <g key={r.dynasty.id}>
          <text
            x={(r.x0 + r.x1) / 2}
            y={WORLD.HEIGHT - 30}
            textAnchor="middle"
            fill={r.color}
            fillOpacity={0.4}
            fontSize={16}
            fontFamily="'LXGW WenKai', serif"
          >
            {r.dynasty.name}
          </text>
          <text
            x={(r.x0 + r.x1) / 2}
            y={WORLD.HEIGHT - 10}
            textAnchor="middle"
            fill="#e0d6c8"
            fillOpacity={0.2}
            fontSize={11}
          >
            {r.dynasty.startYear < 0 ? `前${Math.abs(r.dynasty.startYear)}` : r.dynasty.startYear}
            —{r.dynasty.endYear}
          </text>
        </g>
      ))}
    </g>
  )
})

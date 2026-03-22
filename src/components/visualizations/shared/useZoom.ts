import { useEffect, useRef, useState } from 'react'
import { select, zoom, type ZoomBehavior, zoomIdentity, type ZoomTransform } from 'd3'

export function useZoom(
  svgRef: React.RefObject<SVGSVGElement | null>,
  scaleExtent: [number, number] = [0.3, 5]
) {
  const [transform, setTransform] = useState<ZoomTransform>(zoomIdentity)
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent(scaleExtent)
      .on('zoom', (event) => {
        setTransform(event.transform)
      })

    zoomBehaviorRef.current = zoomBehavior
    select(svgRef.current).call(zoomBehavior)

    return () => {
      select(svgRef.current!).on('.zoom', null)
    }
  }, [svgRef, scaleExtent[0], scaleExtent[1]])

  const resetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      select(svgRef.current)
        .transition()
        .duration(500)
        .call(zoomBehaviorRef.current.transform, zoomIdentity)
    }
  }

  return { transform, resetZoom }
}

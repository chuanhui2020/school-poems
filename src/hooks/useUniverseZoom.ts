import { useEffect, useRef, useCallback } from 'react'
import { select } from 'd3-selection'
import { zoom, zoomIdentity, type ZoomBehavior, type D3ZoomEvent } from 'd3-zoom'
import type { ZoomLevel } from '../types/nodes'
import { useStore } from '../store/useStore'

/**
 * Semantic zoom: determines ZoomLevel from scale factor.
 *   k < 0.4  → 'galaxy'  (see all dynasties)
 *   k < 1.5  → 'dynasty' (see authors within a dynasty)
 *   k >= 1.5 → 'poet'    (see individual poet details)
 */
function scaleToZoomLevel(k: number): ZoomLevel {
  if (k < 0.4) return 'galaxy'
  if (k < 1.5) return 'dynasty'
  return 'poet'
}

export function useUniverseZoom(
  svgRef: React.RefObject<SVGSVGElement | null>
): { zoomTo: (x: number, y: number, k: number) => void } {
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const setZoomLevel = useStore((s) => s.setZoomLevel)
  const setResetZoom = useStore((s) => s.setResetZoom)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .on('zoom', (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        const { x, y, k } = event.transform
        setZoomLevel(scaleToZoomLevel(k))

        // Apply transform to the main group
        select(svg).select<SVGGElement>('g.universe-root')
          .attr('transform', `translate(${x},${y}) scale(${k})`)
      })

    zoomBehaviorRef.current = zoomBehavior

    const sel = select(svg)
    sel.call(zoomBehavior)

    // Set initial zoom to show full galaxy
    const initialTransform = zoomIdentity.translate(0, 0).scale(0.25)
    sel.call(zoomBehavior.transform, initialTransform)

    // Register resetZoom in store so HUD can call it
    setResetZoom(() => {
      select(svg)
        .transition()
        .duration(750)
        .call(zoomBehavior.transform, zoomIdentity.scale(0.25))
    })

    return () => {
      sel.on('.zoom', null)
      setResetZoom(null)
    }
  }, [svgRef, setZoomLevel, setResetZoom])

  const zoomTo = useCallback((x: number, y: number, k: number) => {
    const svg = svgRef.current
    const zb = zoomBehaviorRef.current
    if (!svg || !zb) return
    const width = svg.clientWidth
    const height = svg.clientHeight
    select(svg)
      .transition()
      .duration(750)
      .call(
        zb.transform,
        zoomIdentity.translate(width / 2 - x * k, height / 2 - y * k).scale(k)
      )
  }, [svgRef])

  return { zoomTo }
}

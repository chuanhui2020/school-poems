import { useState, useEffect, useRef, useCallback } from 'react'

export interface Dimensions {
  width: number
  height: number
}

export function useDimensions(): [React.RefObject<HTMLDivElement | null>, Dimensions] {
  const ref = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 800, height: 600 })

  const updateDimensions = useCallback(() => {
    if (ref.current) {
      const { width, height } = ref.current.getBoundingClientRect()
      setDimensions({ width: Math.floor(width), height: Math.floor(height) })
    }
  }, [])

  useEffect(() => {
    updateDimensions()
    const observer = new ResizeObserver(updateDimensions)
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [updateDimensions])

  return [ref, dimensions]
}

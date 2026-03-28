import { useRef } from 'react'
import { useInView } from 'framer-motion'

/**
 * Intersection Observer hook for scroll-triggered line-by-line reveal.
 * Returns a ref to attach to each line element and whether it's revealed.
 */
export function useScrollReveal(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, {
    once: true,
    amount: threshold,
  })
  return { ref, isRevealed: isInView }
}

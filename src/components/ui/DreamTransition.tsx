import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface DreamTransitionProps {
  children: ReactNode
}

export function DreamTransition({ children }: DreamTransitionProps) {
  return (
    <motion.div
      initial={{ clipPath: 'circle(0% at 50% 50%)', opacity: 0 }}
      animate={{ clipPath: 'circle(150% at 50% 50%)', opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        clipPath: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] },
        opacity: { duration: 0.6 },
      }}
    >
      {children}
    </motion.div>
  )
}

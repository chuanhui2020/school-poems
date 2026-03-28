import { motion } from 'framer-motion'
import { useScrollReveal } from '../../hooks/useScrollReveal.ts'

interface PoemLineProps {
  text: string
  delay?: number
}

export function PoemLine({ text, delay = 0 }: PoemLineProps) {
  const { ref, isRevealed } = useScrollReveal(0.3)

  return (
    <motion.div
      ref={ref}
      className="py-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={
        isRevealed
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 20 }
      }
      transition={{
        duration: 1.2,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <motion.span
        className="text-text-bright text-2xl md:text-4xl tracking-[0.15em] leading-loose"
        style={{ fontFamily: 'var(--font-family-serif)' }}
        animate={
          isRevealed
            ? {
                letterSpacing: ['0.15em', '0.2em', '0.15em'],
              }
            : {}
        }
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: delay + 1.2,
        }}
      >
        {text}
      </motion.span>
    </motion.div>
  )
}

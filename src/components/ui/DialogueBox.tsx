import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface DialogueBoxProps {
  text: string
  speed?: number
  onComplete?: () => void
}

export function DialogueBox({ text, speed = 80, onComplete }: DialogueBoxProps) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const timer = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(timer)
        setDone(true)
        onComplete?.()
      }
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed, onComplete])

  return (
    <motion.div
      className="max-w-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <p
        className="text-text-bright text-lg md:text-xl leading-[2.5] tracking-wider"
        style={{ fontFamily: 'var(--font-family-serif)' }}
      >
        {displayed}
        {!done && (
          <span className="inline-block w-[2px] h-[1.2em] bg-gold/60 ml-1 align-middle breathing" />
        )}
      </p>
    </motion.div>
  )
}

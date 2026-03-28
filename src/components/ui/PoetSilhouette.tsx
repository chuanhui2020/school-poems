import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

interface PoetSilhouetteProps {
  id: string
  name: string
  representativeLine: string
  x: number
  y: number
}

export function PoetSilhouette({ id, name, representativeLine, x, y }: PoetSilhouetteProps) {
  const navigate = useNavigate()

  return (
    <motion.div
      className="absolute cursor-pointer group"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: Math.random() * 0.8 }}
      onClick={() => navigate(`/poet/${id}`)}
    >
      {/* Poet name */}
      <motion.span
        className="block text-text text-lg md:text-xl tracking-[0.2em] gold-glow whitespace-nowrap"
        style={{ fontFamily: 'var(--font-family-serif)' }}
        whileHover={{ scale: 1.1 }}
      >
        {name}
      </motion.span>

      {/* Subtle aura glow behind name */}
      <div
        className="absolute inset-0 -z-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: 'radial-gradient(ellipse, rgba(184,134,11,0.15) 0%, transparent 70%)',
          transform: 'scale(2.5)',
        }}
      />

      {/* Representative poem line on hover */}
      <motion.span
        className="block text-text-dim text-xs md:text-sm mt-2 tracking-wider whitespace-nowrap text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ fontFamily: 'var(--font-family-serif)' }}
      >
        {representativeLine}
      </motion.span>
    </motion.div>
  )
}

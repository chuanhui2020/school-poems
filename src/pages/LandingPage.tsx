import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { NightSky } from '../components/scene/NightSky.tsx'
import { DreamTransition } from '../components/ui/DreamTransition.tsx'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <DreamTransition>
      <div className="relative w-screen h-screen overflow-hidden">
        <NightSky />

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
          {/* Main question */}
          <motion.h1
            className="text-text-bright text-3xl md:text-5xl leading-relaxed tracking-widest text-center"
            style={{ fontFamily: 'var(--font-family-serif)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2, ease: 'easeOut' }}
          >
            今夜，你将遇见哪位诗人？
          </motion.h1>

          {/* Enter button */}
          <motion.button
            onClick={() => navigate('/world')}
            className="mt-16 px-10 py-3 text-xl tracking-[0.3em] text-gold border border-gold/30 rounded-none bg-transparent cursor-pointer gold-glow"
            style={{ fontFamily: 'var(--font-family-serif)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1.5 }}
            whileHover={{
              borderColor: 'rgba(212, 168, 67, 0.6)',
              boxShadow: '0 0 30px rgba(184, 134, 11, 0.2), 0 0 60px rgba(184, 134, 11, 0.1)',
            }}
          >
            入梦
          </motion.button>

          {/* Hint text at bottom */}
          <motion.p
            className="absolute bottom-12 text-text-dim text-sm tracking-widest breathing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 2, delay: 3 }}
          >
            轻触，步入诗词的世界
          </motion.p>
        </div>
      </div>
    </DreamTransition>
  )
}

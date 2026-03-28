import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { NightSky } from '../components/scene/NightSky.tsx'
import { PoemLine } from '../components/ui/PoemLine.tsx'
import { DreamTransition } from '../components/ui/DreamTransition.tsx'
import poems from '../data/poems.json'
import authors from '../data/authors.json'
import dynasties from '../data/dynasties.json'
import type { Poem, Author, Dynasty } from '../types/poem.ts'

export default function PoemReveal() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const poem = useMemo(
    () => (poems as Poem[]).find((p) => p.id === id) ?? null,
    [id],
  )

  const author = useMemo(
    () => (poem ? (authors as Author[]).find((a) => a.id === poem.authorId) : null) ?? null,
    [poem],
  )

  const dynastyName = useMemo(
    () => (dynasties as Dynasty[]).find((d) => d.id === poem?.dynastyId)?.name ?? '',
    [poem],
  )

  if (!poem || !author) {
    return (
      <DreamTransition>
        <div className="w-screen h-screen flex items-center justify-center bg-bg-deep">
          <p className="text-text-dim text-lg">诗词未找到</p>
        </div>
      </DreamTransition>
    )
  }

  const lines = poem.full_text.split('\n').filter((l) => l.trim())

  return (
    <DreamTransition>
      <div className="relative w-screen min-h-screen">
        <NightSky />

        <div className="relative z-10 flex flex-col items-center px-4 py-24 min-h-screen">
          {/* Title + Author */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
          >
            <h1
              className="text-text-bright text-3xl md:text-5xl tracking-[0.2em] mb-4"
              style={{ fontFamily: 'var(--font-family-serif)', fontWeight: 700 }}
            >
              {poem.title}
            </h1>
            <p
              className="text-text-dim text-base md:text-lg tracking-[0.3em]"
              style={{ fontFamily: 'var(--font-family-serif)' }}
            >
              {dynastyName} · {author.name}
            </p>
          </motion.div>

          {/* Poem lines — scroll-triggered reveal */}
          <div className="max-w-2xl w-full space-y-2">
            {lines.map((line, i) => (
              <PoemLine key={i} text={line} delay={i * 0.15} />
            ))}
          </div>

          {/* Translation section */}
          {poem.translation && (
            <motion.div
              className="max-w-2xl w-full mt-24"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.5 }}
            >
              <p className="text-text-dim/60 text-xs tracking-[0.2em] mb-4 text-center">译文</p>
              <p
                className="text-text-dim text-sm md:text-base leading-[2.5] tracking-wider text-center"
                style={{ fontFamily: 'var(--font-family-serif)' }}
              >
                {poem.translation}
              </p>
            </motion.div>
          )}

          {/* Annotation section */}
          {poem.annotation && (
            <motion.div
              className="max-w-2xl w-full mt-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.5 }}
            >
              <p className="text-text-dim/60 text-xs tracking-[0.2em] mb-4 text-center">赏析</p>
              <p
                className="text-text-dim text-sm md:text-base leading-[2.5] tracking-wider text-center"
                style={{ fontFamily: 'var(--font-family-serif)' }}
              >
                {poem.annotation}
              </p>
            </motion.div>
          )}

          {/* Back link */}
          <motion.button
            onClick={() => navigate(author ? `/poet/${author.id}` : '/world')}
            className="mt-20 mb-12 text-text-dim text-sm tracking-widest border-none bg-transparent cursor-pointer gold-glow"
            style={{ fontFamily: 'var(--font-family-serif)' }}
            whileHover={{ opacity: 1 }}
          >
            返回
          </motion.button>
        </div>
      </div>
    </DreamTransition>
  )
}

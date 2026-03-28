import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { NightSky } from '../components/scene/NightSky.tsx'
import { DialogueBox } from '../components/ui/DialogueBox.tsx'
import { DreamTransition } from '../components/ui/DreamTransition.tsx'
import { getPoetDialogue } from '../lib/poetDialogues.ts'
import authors from '../data/authors.json'
import poems from '../data/poems.json'
import dynasties from '../data/dynasties.json'
import type { Author, Poem, Dynasty } from '../types/poem.ts'

export default function PoetEncounter() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const author = useMemo(
    () => (authors as Author[]).find((a) => a.id === id) ?? null,
    [id],
  )

  const authorPoems = useMemo(
    () => (poems as Poem[]).filter((p) => p.authorId === id),
    [id],
  )

  const dynastyName = useMemo(
    () => (dynasties as Dynasty[]).find((d) => d.id === author?.dynastyId)?.name ?? '',
    [author],
  )

  const dialogue = useMemo(() => getPoetDialogue(id ?? ''), [id])

  if (!author) {
    return (
      <DreamTransition>
        <div className="w-screen h-screen flex items-center justify-center bg-bg-deep">
          <p className="text-text-dim text-lg">诗人未找到</p>
        </div>
      </DreamTransition>
    )
  }

  return (
    <DreamTransition>
      <div className="relative w-screen h-screen overflow-hidden">
        <NightSky />

        <div className="relative z-10 flex h-full">
          {/* Left: large poet name (vertical) */}
          <div className="flex items-center justify-center w-1/3 md:w-2/5">
            <motion.div
              className="vertical-text"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 0.15, x: 0 }}
              transition={{ duration: 1.5 }}
            >
              <span
                className="text-text-bright text-7xl md:text-9xl tracking-[0.3em] leading-none"
                style={{ fontFamily: 'var(--font-family-serif)', fontWeight: 900 }}
              >
                {author.name}
              </span>
            </motion.div>
          </div>

          {/* Right: dialogue + poems */}
          <div className="flex flex-col justify-center w-2/3 md:w-3/5 pr-8 md:pr-16">
            {/* Dynasty label */}
            <motion.span
              className="text-gold/60 text-sm tracking-[0.3em] mb-6"
              style={{ fontFamily: 'var(--font-family-serif)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {dynastyName} · {author.courtesy_name ? `字${author.courtesy_name}` : author.name}
            </motion.span>

            {/* Dialogue */}
            <DialogueBox text={dialogue.greeting} speed={70} />

            {/* Poem titles — scattered, not a list */}
            <motion.div
              className="mt-12 flex flex-wrap gap-x-8 gap-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3, duration: 1 }}
            >
              {authorPoems.map((poem, i) => (
                <motion.button
                  key={poem.id}
                  onClick={() => navigate(`/poem/${poem.id}`)}
                  className="text-text text-base md:text-lg tracking-wider border-none bg-transparent cursor-pointer gold-glow"
                  style={{
                    fontFamily: 'var(--font-family-serif)',
                    transform: `translateY(${Math.sin(i * 2.3) * 6}px)`,
                  }}
                  whileHover={{ scale: 1.08 }}
                >
                  《{poem.title}》
                </motion.button>
              ))}
            </motion.div>

            {/* Back link */}
            <motion.button
              onClick={() => navigate('/world')}
              className="mt-16 text-text-dim text-sm tracking-widest border-none bg-transparent cursor-pointer gold-glow self-start"
              style={{ fontFamily: 'var(--font-family-serif)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 2 }}
              whileHover={{ opacity: 1 }}
            >
              返回世界
            </motion.button>
          </div>
        </div>
      </div>
    </DreamTransition>
  )
}

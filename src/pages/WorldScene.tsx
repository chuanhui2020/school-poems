import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { NightSky } from '../components/scene/NightSky.tsx'
import { PoetSilhouette } from '../components/ui/PoetSilhouette.tsx'
import { DreamTransition } from '../components/ui/DreamTransition.tsx'
import authors from '../data/authors.json'
import poems from '../data/poems.json'
import dynasties from '../data/dynasties.json'
import type { Author, Poem, Dynasty } from '../types/poem.ts'

// Pick a representative line for each author (first poem's first line)
function getRepLine(authorId: string): string {
  const poem = (poems as Poem[]).find((p) => p.authorId === authorId)
  if (!poem) return ''
  const firstLine = poem.full_text.split('\n')[0]
  // Take first half-line (before comma/period)
  return firstLine.split(/[，。？！；]/)[0] + '…'
}

// Layout poets in a scattered pattern grouped loosely by dynasty
function layoutPoets(authorList: Author[]) {
  const dynastyOrder = (dynasties as Dynasty[]).map((d) => d.id)
  const cols = dynastyOrder.length
  const result: { id: string; name: string; line: string; x: number; y: number; dynastyId: string }[] = []

  const grouped = new Map<string, Author[]>()
  for (const a of authorList) {
    const arr = grouped.get(a.dynastyId) ?? []
    arr.push(a)
    grouped.set(a.dynastyId, arr)
  }

  dynastyOrder.forEach((dId, colIdx) => {
    const group = grouped.get(dId) ?? []
    const colCenter = ((colIdx + 0.5) / cols) * 85 + 7 // 7% to 92% horizontal
    group.forEach((a, i) => {
      const row = i
      const totalInCol = group.length
      const yCenter = ((row + 0.5) / Math.max(totalInCol, 1)) * 70 + 15 // 15% to 85% vertical
      // Add some jitter
      const jx = (Math.sin(a.id.length * 7 + colIdx * 3) * 3)
      const jy = (Math.cos(a.id.length * 5 + i * 7) * 3)
      result.push({
        id: a.id,
        name: a.name,
        line: getRepLine(a.id),
        x: colCenter + jx,
        y: yCenter + jy,
        dynastyId: dId,
      })
    })
  })

  return result
}

export default function WorldScene() {
  const [selectedDynasties, setSelectedDynasties] = useState<string[]>([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const allPoets = useMemo(() => layoutPoets(authors as Author[]), [])

  const filteredPoets = useMemo(
    () =>
      selectedDynasties.length === 0
        ? allPoets
        : allPoets.filter((p) => selectedDynasties.includes(p.dynastyId)),
    [allPoets, selectedDynasties],
  )

  const toggleDynasty = (id: string) => {
    setSelectedDynasties((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    )
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2
    const y = (e.clientY / window.innerHeight - 0.5) * 2
    setMousePos({ x, y })
  }

  return (
    <DreamTransition>
      <div
        className="relative w-screen h-screen overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        <NightSky />

        {/* Parallax container */}
        <motion.div
          className="relative z-10 w-full h-full"
          animate={{
            x: mousePos.x * -8,
            y: mousePos.y * -5,
          }}
          transition={{ type: 'tween', ease: 'easeOut', duration: 0.6 }}
        >
          {filteredPoets.map((poet) => (
            <PoetSilhouette
              key={poet.id}
              id={poet.id}
              name={poet.name}
              representativeLine={poet.line}
              x={poet.x}
              y={poet.y}
            />
          ))}
        </motion.div>

        {/* Dynasty filter — bottom left */}
        <div className="fixed bottom-6 left-6 z-20 flex flex-wrap gap-3">
          {(dynasties as Dynasty[]).map((d) => {
            const active = selectedDynasties.length === 0 || selectedDynasties.includes(d.id)
            return (
              <button
                key={d.id}
                onClick={() => toggleDynasty(d.id)}
                className={`text-sm tracking-wider border-none bg-transparent cursor-pointer transition-all duration-300 ${
                  active ? 'text-text-bright' : 'text-text-dim'
                }`}
                style={{ fontFamily: 'var(--font-family-serif)' }}
              >
                {d.name}
              </button>
            )
          })}
        </div>
      </div>
    </DreamTransition>
  )
}

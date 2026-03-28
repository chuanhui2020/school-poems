import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import authors from '../data/authors.json'
import poems from '../data/poems.json'
import dynasties from '../data/dynasties.json'
import type { Author, Poem, Dynasty } from '../types/poem'

export function HoverCard() {
  const hoveredNodeId = useStore((s) => s.hoveredNodeId)
  const [showCard, setShowCard] = useState(false)

  useEffect(() => {
    if (!hoveredNodeId) {
      setShowCard(false)
      return
    }
    const timer = setTimeout(() => setShowCard(true), 300)
    return () => clearTimeout(timer)
  }, [hoveredNodeId])

  if (!showCard || !hoveredNodeId) return null

  const author = (authors as Author[]).find((a) => a.id === hoveredNodeId)
  if (!author) return null

  const dynasty = (dynasties as Dynasty[]).find((d) => d.id === author.dynastyId)
  const topPoems = (poems as Poem[])
    .filter((p) => p.authorId === hoveredNodeId)
    .slice(0, 2)

  return (
    <div
      className="fixed z-50 pointer-events-none animate-fade-in"
      style={{
        top: '50%',
        right: '2rem',
        transform: 'translateY(-50%)',
      }}
    >
      <div
        className="px-4 py-3 rounded-lg max-w-[200px]"
        style={{
          background: 'rgba(10, 10, 15, 0.9)',
          border: '1px solid rgba(224, 220, 208, 0.1)',
        }}
      >
        <p
          className="text-base font-medium"
          style={{ color: '#e0dcd0', fontFamily: "'LXGW WenKai', serif" }}
        >
          {author.name}
        </p>
        <p className="text-xs mt-1" style={{ color: dynasty?.color ?? 'var(--color-text-dim)' }}>
          {dynasty?.name}
        </p>
        {topPoems.length > 0 && (
          <div className="mt-2 border-t border-white/5 pt-2">
            {topPoems.map((p) => (
              <p key={p.id} className="text-xs truncate" style={{ color: 'var(--color-text-dim)' }}>
                {p.title}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

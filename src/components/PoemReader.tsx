import { useEffect, useRef, useState, useCallback } from 'react'
import { useStore } from '../store/useStore'
import poems from '../data/poems.json'
import authors from '../data/authors.json'
import dynasties from '../data/dynasties.json'
import type { Poem, Author, Dynasty } from '../types/poem'

export function PoemReader() {
  const selectedPoemId = useStore((s) => s.selectedPoemId)
  const selectPoem = useStore((s) => s.selectPoem)
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  const [visiblePoemId, setVisiblePoemId] = useState<string | null>(null)
  const [exiting, setExiting] = useState(false)

  // Manage enter/exit transitions
  useEffect(() => {
    if (selectedPoemId) {
      setVisiblePoemId(selectedPoemId)
      setExiting(false)
    } else if (visiblePoemId) {
      setExiting(true)
      const timer = setTimeout(() => {
        setVisiblePoemId(null)
        setExiting(false)
      }, 250)
      return () => clearTimeout(timer)
    }
  }, [selectedPoemId])

  // Focus trap & restore
  useEffect(() => {
    if (visiblePoemId && !exiting) {
      previousFocus.current = document.activeElement as HTMLElement
      dialogRef.current?.focus()
    } else if (!visiblePoemId && previousFocus.current) {
      previousFocus.current.focus()
      previousFocus.current = null
    }
  }, [visiblePoemId, exiting])

  const handleClose = useCallback(() => {
    selectPoem(null)
  }, [selectPoem])

  useEffect(() => {
    if (!visiblePoemId) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [visiblePoemId, handleClose])

  if (!visiblePoemId) return null

  const poem = (poems as Poem[]).find((p) => p.id === visiblePoemId)
  if (!poem) return null

  const author = (authors as Author[]).find((a) => a.id === poem.authorId)
  const dynasty = (dynasties as Dynasty[]).find((d) => d.id === poem.dynastyId)

  return (
    <div
      ref={dialogRef}
      className={`fixed inset-0 z-50 flex items-center justify-center ${exiting ? 'animate-fade-out' : 'animate-fade-in'}`}
      style={{ backgroundColor: 'rgba(10, 10, 15, 0.85)' }}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${poem.title} — ${author?.name ?? ''}`}
      tabIndex={-1}
    >
      <div
        className={`max-w-4xl w-full mx-4 p-10 max-md:p-5 max-md:mx-2 rounded-lg relative ${exiting ? 'animate-fade-out' : 'animate-ink-spread'}`}
        style={{
          background: 'rgba(15, 15, 25, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(224, 220, 208, 0.06)',
          color: 'var(--color-text)',
          maxHeight: '85dvh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => selectPoem(null)}
          className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="关闭"
        >
          ✕
        </button>
        {/* Header — horizontal */}
        <div className="text-center mb-6">
          <h2
            className="text-2xl mb-1 font-serif"
            style={{ color: 'var(--color-text)' }}
          >
            {poem.title}
          </h2>
          <p style={{ color: dynasty?.color ?? '#4a4a6a', fontSize: '14px' }}>
            [{dynasty?.name}] {author?.name}
          </p>
          {poem.form && (
            <span
              className="inline-block mt-2 px-3 py-0.5 text-xs rounded"
              style={{
                border: '1px solid #4a4a6a',
                color: '#4a4a6a',
              }}
            >
              {poem.form}
            </span>
          )}
        </div>

        {/* Poem text — vertical on desktop, horizontal on mobile */}
        <div
          className="mx-auto mb-8 px-6 py-4 max-md:px-2 font-serif poem-text-vertical"
          style={{
            writingMode: 'vertical-rl',
            fontSize: '20px',
            lineHeight: 2.5,
            letterSpacing: '0.05em',
            color: 'var(--color-text)',
            maxHeight: '50vh',
            overflowX: 'auto',
            textAlign: 'center',
          }}
        >
          {poem.full_text}
        </div>

        {/* Translation & annotation — horizontal columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {poem.translation && (
            <div
              className="p-4 rounded"
              style={{ background: 'rgba(224, 220, 208, 0.05)' }}
            >
              <p className="text-xs mb-2" style={{ color: 'var(--color-cinnabar)' }}>译文</p>
              <p
                className="font-serif"
                style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '14px',
                  lineHeight: 1.8,
                }}
              >
                {poem.translation}
              </p>
            </div>
          )}

          {poem.annotation && (
            <div
              className="p-4 rounded"
              style={{ background: 'rgba(224, 220, 208, 0.05)' }}
            >
              <p className="text-xs mb-2" style={{ color: 'var(--color-cinnabar)' }}>赏析</p>
              <p
                className="font-serif"
                style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '14px',
                  lineHeight: 1.8,
                }}
              >
                {poem.annotation}
              </p>
            </div>
          )}
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: 'var(--color-text-secondary)', opacity: 0.6 }}>
          点击空白处关闭 · 按 Esc 退出
        </p>
      </div>
    </div>
  )
}

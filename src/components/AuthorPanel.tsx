import { useState, useEffect, useCallback } from 'react'
import type { Author, Poem } from '../types'

interface AuthorPanelProps {
  author: Author
  poems: Poem[]
  dynastyColor: string
  onClose: () => void
}

export default function AuthorPanel({ author, poems, dynastyColor, onClose }: AuthorPanelProps) {
  const [expandedPoemId, setExpandedPoemId] = useState<string | null>(null)
  const [exiting, setExiting] = useState(false)

  const handleClose = useCallback(() => {
    setExiting(true)
    setTimeout(onClose, 250)
  }, [onClose])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleClose])

  return (
    <div
      className={`absolute top-0 right-0 h-full w-[420px] max-w-[90vw] md:max-w-[420px] z-40 flex flex-col max-md:w-full max-md:max-w-full ${exiting ? 'animate-slide-out' : 'animate-slide-in'}`}
      style={{
        background: 'rgba(10, 10, 15, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderLeft: '1px solid rgba(224, 220, 208, 0.06)',
      }}
      role="dialog"
      aria-label={`${author.name} 诗人详情`}
    >
      {/* Top accent line */}
      <div className="h-[1px] w-full" style={{ background: dynastyColor, boxShadow: `0 0 8px ${dynastyColor}40` }} />

      {/* Header */}
      <div className="p-5 border-b" style={{ borderColor: 'rgba(224, 220, 208, 0.06)' }}>
        <div className="flex items-start justify-between">
          <div>
            <h2
              className="text-2xl font-bold font-serif"
              style={{ color: 'var(--color-text)' }}
            >
              {author.name}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {author.courtesy_name && <span>字{author.courtesy_name}</span>}
              <span
                className="px-2 py-0.5 rounded text-xs"
                style={{ backgroundColor: dynastyColor, color: '#e0dcd0' }}
              >
                {author.dynastyId}
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-xl cursor-pointer flex items-center justify-center w-11 h-11 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
            aria-label="关闭面板"
          >
            ✕
          </button>
        </div>

        {/* Style labels as mini stamps */}
        {author.style_labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {author.style_labels.map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 text-xs"
                style={{
                  border: '1px solid var(--color-cinnabar)',
                  color: 'var(--color-cinnabar)',
                }}
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {author.brief_bio && (
          <p
            className="mt-3 text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {author.brief_bio}
          </p>
        )}
      </div>

      {/* Poems list */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          收录 {poems.length} 首作品
        </div>

        <div className="space-y-2">
          {poems.map((poem) => {
            const isExpanded = expandedPoemId === poem.id
            return (
              <div
                key={poem.id}
                className="rounded-lg overflow-hidden transition-colors"
                style={{
                  border: '1px solid rgba(224, 220, 208, 0.04)',
                  background: isExpanded ? 'rgba(224, 220, 208, 0.03)' : 'transparent',
                }}
              >
                <button
                  onClick={() => setExpandedPoemId(isExpanded ? null : poem.id)}
                  className="ink-dot w-full text-left px-4 py-3 flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <span style={{ color: '#e0dcd0' }}>{poem.title}</span>
                    <span className="text-xs ml-2" style={{ color: 'var(--color-text-secondary)' }}>{poem.form}</span>
                  </div>
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {isExpanded ? '▾' : '▸'}
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 animate-fade-in">
                    <div
                      className="whitespace-pre-line text-sm leading-relaxed mb-3 pl-3 border-l-2"
                      style={{ borderColor: dynastyColor, color: '#e0dcd0' }}
                    >
                      {poem.full_text}
                    </div>

                    {poem.translation && (
                      <div className="text-xs leading-relaxed mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                        <span style={{ color: 'var(--color-cinnabar)' }} className="mr-1">译</span>
                        {poem.translation}
                      </div>
                    )}

                    {poem.annotation && (
                      <div className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        <span style={{ color: 'var(--color-cinnabar)' }} className="mr-1">注</span>
                        {poem.annotation}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1 mt-2">
                      {poem.themes.map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 rounded text-[10px]"
                          style={{ background: 'rgba(224, 220, 208, 0.05)', color: 'var(--color-text-secondary)' }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {poems.length === 0 && (
          <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
            暂无收录作品
          </div>
        )}
      </div>
    </div>
  )
}

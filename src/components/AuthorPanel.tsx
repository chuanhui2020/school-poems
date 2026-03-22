import { useState, useEffect } from 'react'
import type { Author, Poem } from '../types'

interface AuthorPanelProps {
  author: Author
  poems: Poem[]
  dynastyColor: string
  onClose: () => void
}

export default function AuthorPanel({ author, poems, dynastyColor, onClose }: AuthorPanelProps) {
  const [expandedPoemId, setExpandedPoemId] = useState<string | null>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="absolute top-0 right-0 h-full w-[420px] max-w-[90vw] z-40 animate-slide-in"
      style={{ background: 'var(--color-bg-panel)', borderLeft: `1px solid var(--color-border)` }}
    >
      {/* Top glow line */}
      <div className="h-[1px] w-full" style={{ background: dynastyColor, boxShadow: `0 0 12px ${dynastyColor}60, 0 0 4px ${dynastyColor}` }} />
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{author.name}</h2>
              <div className="flex items-center gap-2 mt-1 text-sm text-[var(--color-text-dim)]">
                {author.courtesy_name && <span>字{author.courtesy_name}</span>}
                <span
                  className="px-2 py-0.5 rounded text-xs text-white/90"
                  style={{ backgroundColor: dynastyColor }}
                >
                  {author.dynastyId}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[var(--color-text-dim)] hover:text-white text-xl cursor-pointer p-1"
              aria-label="关闭"
            >
              ✕
            </button>
          </div>

          {author.style_labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {author.style_labels.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-full text-xs border border-white/10 text-[var(--color-accent)]">
                  {s}
                </span>
              ))}
            </div>
          )}

          {author.brief_bio && (
            <p className="mt-3 text-sm text-[var(--color-text-dim)] leading-relaxed">
              {author.brief_bio}
            </p>
          )}
        </div>

        {/* Poems list */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-xs text-[var(--color-text-dim)] mb-3">
            收录 {poems.length} 首作品
          </div>

          <div className="space-y-2">
            {poems.map((poem) => {
              const isExpanded = expandedPoemId === poem.id
              return (
                <div
                  key={poem.id}
                  className="rounded-lg border border-white/5 overflow-hidden transition-colors hover:border-white/10"
                  style={{ background: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent' }}
                >
                  <button
                    onClick={() => setExpandedPoemId(isExpanded ? null : poem.id)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <span className="text-white font-medium">{poem.title}</span>
                      <span className="text-xs text-[var(--color-text-dim)] ml-2">{poem.form}</span>
                    </div>
                    <span className="text-[var(--color-text-dim)] text-sm">
                      {isExpanded ? '▾' : '▸'}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 animate-fade-in">
                      <div className="whitespace-pre-line text-sm text-[var(--color-text)] leading-relaxed mb-3 pl-3 border-l-2"
                        style={{ borderColor: dynastyColor }}
                      >
                        {poem.full_text}
                      </div>

                      {poem.translation && (
                        <div className="text-xs text-[var(--color-text-dim)] leading-relaxed mb-2">
                          <span className="text-[var(--color-accent)] mr-1">译</span>
                          {poem.translation}
                        </div>
                      )}

                      {poem.annotation && (
                        <div className="text-xs text-[var(--color-text-dim)] leading-relaxed">
                          <span className="text-[var(--color-accent)] mr-1">注</span>
                          {poem.annotation}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1 mt-2">
                        {poem.themes.map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-[var(--color-text-dim)]">
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
            <div className="text-center text-[var(--color-text-dim)] py-8">
              暂无收录作品
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

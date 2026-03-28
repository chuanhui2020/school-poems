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
    <div
      className="absolute top-0 right-0 h-full w-[420px] max-w-[90vw] z-40 animate-slide-in flex flex-col neon-border"
      style={{
        background: 'rgba(5, 5, 20, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderLeft: '1px solid rgba(0, 240, 255, 0.2)',
      }}
    >
      {/* Top neon accent line */}
      <div
        className="h-[2px] w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${dynastyColor}, transparent)`,
          boxShadow: `0 0 12px ${dynastyColor}80`,
        }}
      />

      {/* Header */}
      <div className="p-5 border-b" style={{ borderColor: 'rgba(0, 240, 255, 0.1)' }}>
        <div className="flex items-start justify-between">
          <div>
            <h2
              className="text-2xl font-bold"
              style={{
                color: '#e0e8ff',
                fontFamily: "'LXGW WenKai', serif",
                textShadow: '0 0 8px rgba(0,240,255,0.3)',
              }}
            >
              {author.name}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: '#5a6a8a' }}>
              {author.courtesy_name && <span>字{author.courtesy_name}</span>}
              <span
                className="px-2 py-0.5 rounded text-xs"
                style={{
                  background: 'rgba(0, 240, 255, 0.1)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  color: '#00f0ff',
                }}
              >
                {author.dynastyId}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xl cursor-pointer p-1 transition-colors"
            style={{ color: '#5a6a8a' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ff003c' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#5a6a8a' }}
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        {/* Style labels as neon tags */}
        {author.style_labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {author.style_labels.map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 text-xs"
                style={{
                  border: '1px solid rgba(180, 0, 255, 0.4)',
                  color: '#b400ff',
                  background: 'rgba(180, 0, 255, 0.05)',
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
            style={{ color: '#5a6a8a' }}
          >
            {author.brief_bio}
          </p>
        )}
      </div>

      {/* Poems list */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-xs mb-3" style={{ color: '#5a6a8a' }}>
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
                  border: '1px solid rgba(0, 240, 255, 0.06)',
                  background: isExpanded ? 'rgba(0, 240, 255, 0.03)' : 'transparent',
                }}
              >
                <button
                  onClick={() => setExpandedPoemId(isExpanded ? null : poem.id)}
                  className="w-full text-left px-4 py-3 flex items-center justify-between cursor-pointer transition-colors"
                  style={{ borderLeft: '2px solid transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderLeftColor = '#00f0ff' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderLeftColor = 'transparent' }}
                >
                  <div>
                    <span style={{ color: '#e0e8ff' }}>{poem.title}</span>
                    <span className="text-xs ml-2" style={{ color: '#5a6a8a' }}>{poem.form}</span>
                  </div>
                  <span className="text-sm" style={{ color: '#00f0ff' }}>
                    {isExpanded ? '▾' : '▸'}
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 animate-fade-in">
                    <div
                      className="whitespace-pre-line text-sm leading-relaxed mb-3 pl-3 border-l-2"
                      style={{ borderColor: dynastyColor, color: '#e0e8ff' }}
                    >
                      {poem.full_text}
                    </div>

                    {poem.translation && (
                      <div className="text-xs leading-relaxed mb-2" style={{ color: '#5a6a8a' }}>
                        <span style={{ color: '#00f0ff' }} className="mr-1">译</span>
                        {poem.translation}
                      </div>
                    )}

                    {poem.annotation && (
                      <div className="text-xs leading-relaxed" style={{ color: '#5a6a8a' }}>
                        <span style={{ color: '#b400ff' }} className="mr-1">注</span>
                        {poem.annotation}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1 mt-2">
                      {poem.themes.map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 rounded text-[10px]"
                          style={{
                            background: 'rgba(0, 240, 255, 0.05)',
                            border: '1px solid rgba(0, 240, 255, 0.1)',
                            color: '#5a6a8a',
                          }}
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
          <div className="text-center py-8" style={{ color: '#5a6a8a' }}>
            暂无收录作品
          </div>
        )}
      </div>
    </div>
  )
}

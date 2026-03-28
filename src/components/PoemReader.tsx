import { useStore } from '../store/useStore'
import poems from '../data/poems.json'
import authors from '../data/authors.json'
import dynasties from '../data/dynasties.json'
import type { Poem, Author, Dynasty } from '../types/poem'

export function PoemReader() {
  const selectedPoemId = useStore((s) => s.selectedPoemId)
  const selectPoem = useStore((s) => s.selectPoem)

  if (!selectedPoemId) return null

  const poem = (poems as Poem[]).find((p) => p.id === selectedPoemId)
  if (!poem) return null

  const author = (authors as Author[]).find((a) => a.id === poem.authorId)
  const dynasty = (dynasties as Dynasty[]).find((d) => d.id === poem.dynastyId)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(5, 5, 16, 0.9)' }}
      onClick={() => selectPoem(null)}
    >
      <div
        className="max-w-4xl w-full mx-4 p-10 rounded-lg animate-cyber-reveal neon-border corner-brackets"
        style={{
          background: 'rgba(5, 5, 20, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          color: '#e0e8ff',
          maxHeight: '85vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2
            className="glitch text-2xl mb-1"
            data-text={poem.title}
            style={{
              fontFamily: "'LXGW WenKai', serif",
              color: '#e0e8ff',
              textShadow: '0 0 8px rgba(0,240,255,0.3)',
            }}
          >
            {poem.title}
          </h2>
          <p style={{ color: dynasty?.color ?? '#5a6a8a', fontSize: '14px' }}>
            [{dynasty?.name}] {author?.name}
          </p>
          {poem.form && (
            <span
              className="inline-block mt-2 px-3 py-0.5 text-xs rounded"
              style={{
                border: '1px solid rgba(0, 240, 255, 0.3)',
                color: '#00f0ff',
              }}
            >
              {poem.form}
            </span>
          )}
        </div>

        {/* Poem text — vertical */}
        <div
          className="mx-auto mb-8 px-6 py-4"
          style={{
            writingMode: 'vertical-rl',
            fontFamily: "'LXGW WenKai', serif",
            fontSize: '20px',
            lineHeight: 2.5,
            color: '#e0e8ff',
            maxHeight: '50vh',
            overflowX: 'auto',
            textAlign: 'center',
          }}
        >
          {poem.full_text}
        </div>

        {/* Translation & annotation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {poem.translation && (
            <div
              className="p-4 rounded"
              style={{
                background: 'rgba(0, 240, 255, 0.03)',
                borderLeft: '2px solid rgba(0, 240, 255, 0.3)',
              }}
            >
              <p className="text-xs mb-2" style={{ color: '#00f0ff' }}>译文</p>
              <p
                style={{
                  color: '#5a6a8a',
                  fontSize: '14px',
                  lineHeight: 1.8,
                  fontFamily: "'LXGW WenKai', serif",
                }}
              >
                {poem.translation}
              </p>
            </div>
          )}

          {poem.annotation && (
            <div
              className="p-4 rounded"
              style={{
                background: 'rgba(180, 0, 255, 0.03)',
                borderLeft: '2px solid rgba(180, 0, 255, 0.3)',
              }}
            >
              <p className="text-xs mb-2" style={{ color: '#b400ff' }}>赏析</p>
              <p
                style={{
                  color: '#5a6a8a',
                  fontSize: '14px',
                  lineHeight: 1.8,
                  fontFamily: "'LXGW WenKai', serif",
                }}
              >
                {poem.annotation}
              </p>
            </div>
          )}
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: '#5a6a8a', opacity: 0.5 }}>
          点击空白处关闭
        </p>
      </div>
    </div>
  )
}

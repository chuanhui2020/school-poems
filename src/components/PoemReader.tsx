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
      style={{ backgroundColor: 'rgba(10, 10, 20, 0.92)', backdropFilter: 'blur(20px)' }}
      onClick={() => selectPoem(null)}
    >
      <div
        className="max-w-2xl w-full mx-4 p-10 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(30,30,50,0.9), rgba(20,20,35,0.95))',
          border: '1px solid rgba(224,214,200,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2
            className="text-2xl mb-2"
            style={{ color: '#e0d6c8', fontFamily: "'LXGW WenKai', serif" }}
          >
            {poem.title}
          </h2>
          <p style={{ color: dynasty?.color ?? '#888', opacity: 0.7, fontSize: '14px' }}>
            [{dynasty?.name}] {author?.name}
          </p>
          {poem.form && (
            <span
              className="inline-block mt-2 px-3 py-1 rounded-full text-xs"
              style={{
                background: 'rgba(224,214,200,0.08)',
                color: '#e0d6c8',
                opacity: 0.5,
              }}
            >
              {poem.form}
            </span>
          )}
        </div>

        {/* Full text */}
        <div
          className="text-center mb-8 leading-loose"
          style={{
            color: '#e0d6c8',
            fontSize: '18px',
            fontFamily: "'LXGW WenKai', serif",
            lineHeight: 2.2,
            whiteSpace: 'pre-line',
          }}
        >
          {poem.full_text}
        </div>

        {/* Translation */}
        {poem.translation && (
          <div
            className="mb-6 p-4 rounded-lg"
            style={{ background: 'rgba(224,214,200,0.04)' }}
          >
            <p className="text-xs mb-2" style={{ color: '#e0d6c8', opacity: 0.4 }}>
              译文
            </p>
            <p
              style={{
                color: '#e0d6c8',
                opacity: 0.6,
                fontSize: '14px',
                lineHeight: 1.8,
                fontFamily: "'LXGW WenKai', serif",
              }}
            >
              {poem.translation}
            </p>
          </div>
        )}

        {/* Annotation */}
        {poem.annotation && (
          <div className="p-4 rounded-lg" style={{ background: 'rgba(224,214,200,0.04)' }}>
            <p className="text-xs mb-2" style={{ color: '#e0d6c8', opacity: 0.4 }}>
              赏析
            </p>
            <p
              style={{
                color: '#e0d6c8',
                opacity: 0.6,
                fontSize: '14px',
                lineHeight: 1.8,
                fontFamily: "'LXGW WenKai', serif",
              }}
            >
              {poem.annotation}
            </p>
          </div>
        )}

        {/* Close hint */}
        <p className="text-center mt-8 text-xs" style={{ color: '#e0d6c8', opacity: 0.25 }}>
          点击空白处关闭
        </p>
      </div>
    </div>
  )
}

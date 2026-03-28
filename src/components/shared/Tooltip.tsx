interface TooltipProps {
  x: number
  y: number
  visible: boolean
  children: React.ReactNode
  dynastyColor?: string
}

export default function Tooltip({ x, y, visible, children, dynastyColor }: TooltipProps) {
  if (!visible) return null

  const pad = 14
  const tooltipW = 200
  const tooltipH = 80
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800

  const left = x + pad + tooltipW > vw ? x - pad - tooltipW : x + pad
  const top = y - pad < 0 ? y + pad : y + tooltipH > vh ? y - pad - tooltipH : y - pad

  return (
    <div
      className="fixed pointer-events-none z-50 px-4 py-3 rounded-lg max-w-xs"
      style={{
        left,
        top,
        background: 'rgba(8, 12, 28, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${dynastyColor ? dynastyColor + '30' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: dynastyColor
          ? `0 4px 24px rgba(0,0,0,0.4), 0 0 1px ${dynastyColor}40`
          : '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {children}
    </div>
  )
}

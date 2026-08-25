type ChevronProps = {
  direction?: 'left' | 'right' | 'down'
  /** két, szorosan egymás mellett álló nyíl — a logóban látható ismétlődő minta, pl. eyebrow-khoz */
  double?: boolean
  className?: string
}

/** Egyetlen, tömör kitöltésű, éles sarkú nyíl-elem — pontosan a logó (original logo.png)
 * "BACK«««" nyilainak geometriáját követi. Magassága mindig a szülő szöveg
 * betűméretével egyezik (1em). */
function Unit() {
  return (
    <svg className="chevron-unit" viewBox="0 0 13 20" aria-hidden="true" focusable="false">
      <path d="M12 1 L1 10 L12 19" fill="none" stroke="currentColor" strokeWidth="5.6" strokeLinecap="butt" strokeLinejoin="miter" />
    </svg>
  )
}

export default function Chevron({ direction = 'left', double = false, className = '' }: ChevronProps) {
  const rotation =
    direction === 'right' ? 'scaleX(-1)' : direction === 'down' ? 'rotate(-90deg)' : undefined

  return (
    <span
      className={`chevron-svg ${double ? 'chevron-svg--double' : ''} ${className}`}
      style={rotation ? { transform: rotation } : undefined}
    >
      <Unit />
      {double && <Unit />}
    </span>
  )
}

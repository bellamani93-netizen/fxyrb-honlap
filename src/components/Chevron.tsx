type ChevronProps = {
  direction?: 'left' | 'right' | 'down'
  /** két, szorosan egymás mellett álló nyíl — a logóban látható ismétlődő minta, pl. eyebrow-khoz */
  double?: boolean
  className?: string
}

/** A logóból (Design elemek/original logo.png) pixelre pontosan kivágott nyíl-grafika —
 * nem újrarajzolt SVG, hanem maga a márkajel képe, hogy formája garantáltan egyezzen. */
function Unit() {
  return <img src="/images/chevron.png" alt="" className="chevron-unit" draggable={false} />
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

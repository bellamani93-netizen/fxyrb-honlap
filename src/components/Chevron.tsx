type ChevronProps = {
  direction?: 'left' | 'right' | 'down'
  /** két, szorosan egymás mellett álló nyíl — a logóban látható ismétlődő minta, pl. eyebrow-khoz */
  double?: boolean
  className?: string
  /** ha meg van adva, az eredeti grafika helyett egy erre a színre maszkolt változat jelenik meg
   * (ugyanaz a technika, mint az Icon.tsx-nél — ld. .icon-mask), pl. var(--lime). */
  color?: string
}

/** A logóból (Design elemek/original logo.png) pixelre pontosan kivágott nyíl-grafika —
 * nem újrarajzolt SVG, hanem maga a márkajel képe, hogy formája garantáltan egyezzen. */
function Unit({ color }: { color?: string }) {
  if (color) {
    return (
      <span
        className="chevron-unit chevron-unit--mask"
        style={{ WebkitMaskImage: 'url(/images/chevron.png)', maskImage: 'url(/images/chevron.png)', backgroundColor: color }}
      />
    )
  }
  return <img src="/images/chevron.png" alt="" className="chevron-unit" draggable={false} />
}

export default function Chevron({ direction = 'left', double = false, className = '', color }: ChevronProps) {
  const rotation =
    direction === 'right' ? 'scaleX(-1)' : direction === 'down' ? 'rotate(-90deg)' : undefined

  return (
    <span
      className={`chevron-svg ${double ? 'chevron-svg--double' : ''} ${className}`}
      style={rotation ? { transform: rotation } : undefined}
    >
      <Unit color={color} />
      {double && <Unit color={color} />}
    </span>
  )
}

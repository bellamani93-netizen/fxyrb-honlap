type ChevronProps = {
  direction?: 'left' | 'right' | 'down'
  className?: string
}

/** A márkajel kettős chevronja («), SVG-ként — magassága mindig a szülő szövegelem
 * betűméretével egyezik (1em), így pontosan illeszkedik a mellette álló szöveghez. */
export default function Chevron({ direction = 'left', className = '' }: ChevronProps) {
  const rotation =
    direction === 'right' ? 'scaleX(-1)' : direction === 'down' ? 'rotate(-90deg)' : undefined

  return (
    <svg
      className={`chevron-svg ${className}`}
      viewBox="0 0 18 16"
      style={rotation ? { transform: rotation } : undefined}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M8 1 L1.5 8 L8 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 1 L9.5 8 L16 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

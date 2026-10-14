import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import Chevron from './Chevron'

// Vízszintesen görgethető (scroll-snap) carousel előző/következő nyilakkal —
// a Főoldal és az Időpontfoglalás vélemény-sávjai közös alapja. Mobilon 1,
// ≥768px-en 2 elem látszik egyszerre.
export default function Carousel({ label, children }: { label: string; children: ReactNode[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const update = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [update, children.length])

  function scrollByPage(dir: 1 | -1) {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="carousel-fyb" role="region" aria-label={label}>
      <div className="carousel-fyb-track" ref={trackRef} onScroll={update}>
        {children.map((child, i) => (
          <div className="carousel-fyb-item" key={i}>{child}</div>
        ))}
      </div>
      {(canPrev || canNext) && (
        <div className="carousel-fyb-nav">
          <button type="button" className="carousel-fyb-btn" onClick={() => scrollByPage(-1)} disabled={!canPrev} aria-label="előző">
            <Chevron direction="left" color="var(--navy)" />
          </button>
          <button type="button" className="carousel-fyb-btn" onClick={() => scrollByPage(1)} disabled={!canNext} aria-label="következő">
            <Chevron direction="right" color="var(--navy)" />
          </button>
        </div>
      )}
    </div>
  )
}

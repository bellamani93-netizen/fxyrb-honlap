import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import Chevron from './Chevron'

// Vízszintesen görgethető (scroll-snap) carousel, a következő elem kissé
// belóg a képbe; az előző/következő nyíl a sáv két oldalán áll. A Főoldal és
// az Időpontfoglalás vélemény-sávjai közös alapja.
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
    const item = el.querySelector<HTMLElement>('.carousel-fyb-item')
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0
    el.scrollBy({ left: dir * ((item?.offsetWidth ?? el.clientWidth) + gap), behavior: 'smooth' })
  }

  return (
    <div className="carousel-fyb" role="region" aria-label={label}>
      <div className="carousel-fyb-track" ref={trackRef} onScroll={update}>
        {children.map((child, i) => (
          <div className="carousel-fyb-item" key={i}>{child}</div>
        ))}
      </div>
      {canPrev && (
        <button type="button" className="carousel-fyb-btn carousel-fyb-btn--prev" onClick={() => scrollByPage(-1)} aria-label="előző">
          <Chevron direction="left" color="var(--navy)" />
        </button>
      )}
      {canNext && (
        <button type="button" className="carousel-fyb-btn carousel-fyb-btn--next" onClick={() => scrollByPage(1)} aria-label="következő">
          <Chevron direction="right" color="var(--navy)" />
        </button>
      )}
    </div>
  )
}

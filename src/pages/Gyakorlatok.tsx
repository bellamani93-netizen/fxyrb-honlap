import { useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon'
import { EXERCISES, SEQUENCES } from '../data/tornaSzintek'

type LevelState = 'lezart' | 'aktiv' | 'zarolt'

type Level = {
  num: number
  state: LevelState
  code?: string
  period?: string
  lockReason?: string
}

// Péter (ÜF-oldali demó-felhasználó) sorrendje: LOO — alsó lumbális fájdalom,
// hason fekvés OK, váll mobilitás OK. Ez a "torna szintek.odt"-ben rögzített
// legegyszerűbb, egyenes sorrend (S01→S13). Más ügyfélnél más sorrend adódna
// (ld. src/data/tornaSzintek.ts).
const sequence = SEQUENCES.LOO

const periods = [
  '2026.05.05. – 2026.05.19.',
  '2026.05.19. – 2026.06.02.',
  '2026.06.02. – 2026.06.16.',
  '2026.06.16. – 2026.06.30.',
  '2026.06.30. – jelenleg is tart',
]

const levels: Level[] = sequence.map((code, i) => {
  const num = i + 1
  if (num <= 4) return { num, state: 'lezart', code, period: periods[i] }
  if (num === 5) return { num, state: 'aktiv', code, period: periods[i] }
  return {
    num,
    state: 'zarolt',
    lockReason:
      num === 6
        ? 'a jelenlegi (5.) szint lezárása után nyílik meg — a következő videót a gyógytornászod választja ki a 6. konzultáción.'
        : 'a 10 hetes együttműködés lezárása után nyílik meg, ha a szint kezdete óta eltelt 2 hét ÉS legalább 10 edzésnapod volt.',
  }
})

function LevelBadge({ level }: { level: Level }) {
  return (
    <span className={`level-select-badge level-select-badge--${level.state}`}>
      {level.state === 'zarolt' && <Icon src="/icons/ikon_lakat.svg" />}
      {level.state === 'lezart' && <Icon src="/icons/ikon_pipa.svg" />}
    </span>
  )
}

export default function Gyakorlatok() {
  const [selected, setSelected] = useState(5)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const level = levels.find((l) => l.num === selected)!
  const exercise = level.code ? EXERCISES[level.code as keyof typeof EXERCISES] : undefined

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 860 }}>
        <div className="app-page-header mb-3">
          <h1 className="app-page-title mb-0">szintjeid</h1>

          <div className={`level-select ${open ? 'is-open' : ''}`} ref={wrapRef}>
            <button type="button" className="level-select-toggle" onClick={() => setOpen((o) => !o)}>
              <LevelBadge level={level} />
              <span>{level.num}. szint</span>
              <span className="level-select-chevron">▾</span>
            </button>

            {open && (
              <ul className="level-select-menu">
                {levels.map((l) => (
                  <li key={l.num}>
                    <button
                      type="button"
                      className={`level-select-item ${l.num === selected ? 'is-selected' : ''}`}
                      onClick={() => {
                        setSelected(l.num)
                        setOpen(false)
                      }}
                    >
                      <LevelBadge level={l} />
                      <span>{l.num}. szint</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card-fyb card-fyb-accent">
          <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
            <h2 className="h5 mb-0">{level.num}. szint</h2>
            {level.state === 'aktiv' && <span className="badge-fyb">aktuális szint</span>}
            {level.state === 'lezart' && <span className="small" style={{ color: 'var(--color-text-muted)' }}>lezárva — visszanézhető</span>}
          </div>

          {level.state === 'zarolt' ? (
            <div className="locked-card">
              <div className="locked-header">
                <Icon src="/icons/ikon_lakat.svg" />
                még zárolva
              </div>
              <p className="mb-0">{level.lockReason}</p>
            </div>
          ) : (
            <>
              <div className="video-thumb mb-2">
                <span className="play-btn">▶</span>
              </div>
              <p className="small mb-2" style={{ color: 'var(--color-text-muted)' }}>{level.period}</p>

              <h3 className="h6 mb-1">{level.code} {exercise!.name}</h3>
              <p className="small mb-0" style={{ color: 'var(--color-text-muted)' }}>{exercise!.desc}</p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

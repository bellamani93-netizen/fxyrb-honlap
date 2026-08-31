import { useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon'
import { EXERCISES, SEQUENCES, HOLD_START_SECONDS, HOLD_STEP_SECONDS, HOLD_STEP_DAYS } from '../data/tornaSzintek'

type LevelState = 'lezart' | 'aktiv' | 'zarolt'

type Level = {
  num: number
  state: LevelState
  code?: string
  period?: string
  lockReason?: string
  /** GYT-től kapott, opcionális megjegyzés az adott szinthez (pl. részleges kiosztás jelzése). */
  note?: string
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
  if (num === 5) return { num, state: 'aktiv', code, period: periods[i], note: 'csak az első 2 gyakorlat ebből a szintből.' }
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
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [holdInfoOpen, setHoldInfoOpen] = useState(false)
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

  useEffect(() => {
    setDetailsOpen(false)
    setHoldInfoOpen(false)
  }, [selected])

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

              <button
                type="button"
                className="d-flex align-items-center gap-2 w-100 text-start"
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-text)' }}
                onClick={() => setDetailsOpen((o) => !o)}
              >
                <span className="small">gyakorlat részletei</span>
                <span className="level-select-chevron ms-auto" style={{ transform: detailsOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
              </button>

              {detailsOpen && (
                <div className="mt-2">
                  {exercise!.note && (
                    <p className="small fst-italic mb-2" style={{ color: 'var(--color-text-muted)' }}>{exercise!.note}</p>
                  )}
                  <div style={{ overflowX: 'auto' }}>
                    <table className="exercise-table">
                      <thead>
                        <tr>
                          <th>gyakorlat</th>
                          <th>kiinduló helyzet</th>
                          <th>ismétlésszám</th>
                          <th>
                            megtartás{' '}
                            <button
                              type="button"
                              className="info-toggle"
                              aria-label="mit jelent ez?"
                              onClick={() => setHoldInfoOpen((o) => !o)}
                            >
                              ⓘ
                            </button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {exercise!.variants.map((v) => (
                          <tr key={v.label}>
                            <td>{v.label}</td>
                            <td>{v.start}</td>
                            <td>{v.reps}</td>
                            <td>{HOLD_START_SECONDS}s</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {holdInfoOpen && (
                    <p className="small fst-italic mt-1 mb-0" style={{ color: 'var(--color-text-muted)' }}>
                      ({HOLD_STEP_DAYS} naponta {HOLD_STEP_SECONDS} s-el hosszabb ideig)
                    </p>
                  )}
                  {level.note && (
                    <p className="small fst-italic mt-2 mb-0" style={{ color: 'var(--color-text-muted)' }}>
                      Megjegyzés a gyógytornászodtól: {level.note}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

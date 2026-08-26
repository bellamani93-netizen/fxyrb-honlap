import { useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon'

type LevelState = 'lezart' | 'aktiv' | 'zarolt'

type Level = {
  num: number
  state: LevelState
  exercises?: string[]
  period?: string
  lockReason?: string
}

const levels: Level[] = [
  {
    num: 1,
    state: 'lezart',
    period: '2026.05.05. – 2026.05.19.',
    exercises: ['S01 Háton fekvés, alsó karpozíciók', 'S02 Ülő gerinctartás', 'S03 Hasi légzés fekvésben', 'S04 Vállöv lazítás állásban'],
  },
  {
    num: 2,
    state: 'lezart',
    period: '2026.05.19. – 2026.06.02.',
    exercises: ['S01 Térdelő csípőhajlító nyújtás', 'S02 Pillangó-ülés combközelítő nyújtás', 'S03 Fekvő csípőhajlító nyújtás', 'S04 Dinamikus csípőkör állásban'],
  },
  {
    num: 3,
    state: 'lezart',
    period: '2026.06.02. – 2026.06.16.',
    exercises: ['S01 Hasonfekvő törzsemelés', 'S02 Négykézláb ellentétes végtag emelés', 'S03 Oldalfekvő csípőemelés', 'S04 Híd-tartás lábemeléssel'],
  },
  {
    num: 4,
    state: 'lezart',
    period: '2026.06.16. – 2026.06.30.',
    exercises: ['S01 Ülő rekeszizom-légzés', 'S02 Bordaközi nyújtás karral', 'S03 Légzésvezérelt derékforgatás', 'S04 Mellkasnyitó nyújtás ajtókeretben'],
  },
  {
    num: 5,
    state: 'aktiv',
    period: '2026.06.30. – jelenleg is tart',
    exercises: ['S01 Plank alapváltozat', 'S02 Oldalsó plank térdtámasszal', 'S03 Híd egy lábbal', 'S04 Négykézláb dinamikus törzsrotáció'],
  },
  { num: 6, state: 'zarolt', lockReason: 'a jelenlegi (5.) szint lezárása után nyílik meg — a következő videót a gyógytornászod választja ki a 6. konzultáción.' },
  { num: 7, state: 'zarolt', lockReason: 'a 10 hetes együttműködés lezárása után nyílik meg, ha a szint kezdete óta eltelt 2 hét ÉS legalább 10 edzésnapod volt.' },
  { num: 8, state: 'zarolt', lockReason: 'a 10 hetes együttműködés lezárása után nyílik meg, ha a szint kezdete óta eltelt 2 hét ÉS legalább 10 edzésnapod volt.' },
  { num: 9, state: 'zarolt', lockReason: 'a 10 hetes együttműködés lezárása után nyílik meg, ha a szint kezdete óta eltelt 2 hét ÉS legalább 10 edzésnapod volt.' },
  { num: 10, state: 'zarolt', lockReason: 'a 10 hetes együttműködés lezárása után nyílik meg, ha a szint kezdete óta eltelt 2 hét ÉS legalább 10 edzésnapod volt.' },
  { num: 11, state: 'zarolt', lockReason: 'a 10 hetes együttműködés lezárása után nyílik meg, ha a szint kezdete óta eltelt 2 hét ÉS legalább 10 edzésnapod volt.' },
  { num: 12, state: 'zarolt', lockReason: 'a 10 hetes együttműködés lezárása után nyílik meg, ha a szint kezdete óta eltelt 2 hét ÉS legalább 10 edzésnapod volt.' },
]

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

              <div className="d-flex flex-column gap-1">
                {level.exercises!.map((ex) => (
                  <h3 key={ex} className="h6 mb-0">{ex}</h3>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

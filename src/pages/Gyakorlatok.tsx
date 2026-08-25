import { useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon'

type LevelState = 'lezart' | 'aktiv' | 'zarolt'

type Exercise = { code: string; desc: string }

type Level = {
  num: number
  state: LevelState
  exercises?: Exercise[]
  period?: string
  lockReason?: string
}

const levels: Level[] = [
  {
    num: 1,
    state: 'lezart',
    period: '2026.05.05. – 2026.05.19.',
    exercises: [
      { code: 'S01 háton fekve, alsó háti tartás', desc: 'a medence semleges helyzetben, a bordaív nem emelkedik meg — ez a kiindulás minden további gyakorlathoz.' },
      { code: 'S02 semleges gerinctartás ülésben', desc: 'a napi ülőmunka közbeni tartás gyakorlása, tükör vagy fal segítségével ellenőrizve.' },
      { code: 'S03 hasi légzés fekvésben', desc: 'a rekeszizom bekapcsolása, kéz a hasra téve, lassú, mély levegővétel.' },
      { code: 'S04 vállöv lazítás állásban', desc: 'a válltartás felszabadítása körkörös mozdulatokkal, a nyak terhelésének csökkentésére.' },
    ],
  },
  {
    num: 2,
    state: 'lezart',
    period: '2026.05.19. – 2026.06.02.',
    exercises: [
      { code: 'S01 térdelő csípőhajlító nyújtás', desc: 'ülőmunka mellett ez a leggyorsabban beszűkülő izomcsoport — 30 másodperces tartás oldalanként.' },
      { code: 'S02 pillangó-ülés combközelítő nyújtás', desc: 'talpak összeérnek, térdek lefelé engedve, egyenes háttal.' },
      { code: 'S03 fekvő csípőhajlító nyújtás', desc: 'a csípő stabilizálása mellett a combhajlító izom nyújtása kontrollált mozdulattal.' },
      { code: 'S04 dinamikus csípőkör állásban', desc: 'bemelegítő jellegű, kis amplitúdójú körzés mindkét irányba.' },
    ],
  },
  {
    num: 3,
    state: 'lezart',
    period: '2026.06.02. – 2026.06.16.',
    exercises: [
      { code: 'S01 hasonfekvő „szuperman" tartás', desc: 'a mély hátizmok bekapcsolása, kar és láb egyidejű, kontrollált emelése.' },
      { code: 'S02 négykézláb ellentétes végtag emelés', desc: 'törzsstabilitás fejlesztése egyensúlyvesztés nélkül, lassú tempóban.' },
      { code: 'S03 oldalfekvő csípőemelés', desc: 'a törzs oldalsó stabilizátorainak erősítése, mindkét oldalon egyenlő ismétlésszámmal.' },
      { code: 'S04 híd-tartás lábemeléssel', desc: 'a farizom és a törzs együttes bekapcsolása, medence-billenés nélkül.' },
    ],
  },
  {
    num: 4,
    state: 'lezart',
    period: '2026.06.16. – 2026.06.30.',
    exercises: [
      { code: 'S01 ülő rekeszizom-légzés', desc: 'hogyan segít a helyes légzés a napközbeni terhelés csökkentésében, íróasztalnál is gyakorolható.' },
      { code: 'S02 bordaközi nyújtás karral', desc: 'a mellkas mozgásterének növelése, mélyebb légvétel elősegítésére.' },
      { code: 'S03 légzésvezérelt derékforgatás', desc: 'kilégzésre történő, kontrollált törzsrotáció ülő helyzetben.' },
      { code: 'S04 mellkasnyitó nyújtás ajtókeretben', desc: 'a hosszan görnyedt tartás ellensúlyozása, napi többszöri alkalmazásra.' },
    ],
  },
  {
    num: 5,
    state: 'aktiv',
    period: '2026.06.30. – jelenleg is tart',
    exercises: [
      { code: 'S01 plank alapváltozat', desc: 'az előző szint gyakorlatainak folytatása, nagyobb terheléssel és több ismétléssel.' },
      { code: 'S02 oldalsó plank térdtámasszal', desc: 'a törzs oldalsó stabilizátorainak további erősítése, fokozatosan növelt tartásidővel.' },
      { code: 'S03 híd egy lábbal', desc: 'a farizom egyoldali, kontrollált terhelése, medence-billenés nélkül.' },
      { code: 'S04 négykézláb dinamikus törzsrotáció', desc: 'a mély hátizmok és a törzs együttes, dinamikus bekapcsolása.' },
    ],
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
      {level.state === 'zarolt' ? <Icon src="/icons/ikon_lakat.svg" /> : level.num}
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
    <section className="py-4 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 860 }}>
        <h1 className="mb-4">szintjeid</h1>

        <div className={`level-select mb-4 ${open ? 'is-open' : ''}`} ref={wrapRef}>
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

        <div className="card-fyb card-fyb-accent">
          <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
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
              <p className="small mb-3" style={{ color: 'var(--color-text-muted)' }}>{level.period}</p>

              <div className="d-flex flex-column gap-3">
                {level.exercises!.map((ex) => (
                  <div key={ex.code}>
                    <h3 className="h6 mb-1">{ex.code}</h3>
                    <p className="small mb-0" style={{ color: 'var(--color-text-muted)' }}>{ex.desc}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

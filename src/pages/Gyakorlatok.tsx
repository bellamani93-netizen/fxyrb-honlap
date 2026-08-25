import { useState } from 'react'
import Icon from '../components/Icon'

type LevelState = 'lezart' | 'aktiv' | 'zarolt'

type Level = {
  num: number
  state: LevelState
  video?: { title: string; desc: string }
  period?: string
  lockReason?: string
}

const levels: Level[] = [
  { num: 1, state: 'lezart', video: { title: 'gerinc alapok', desc: 'a legfontosabb tartás- és légzéstechnikai alapok, amikre az összes további szint épül.' }, period: '2026.05.05. – 2026.05.19.' },
  { num: 2, state: 'lezart', video: { title: 'csípőnyitás', desc: 'a csípőhajlító izmok nyújtása — ülőmunka mellett ez a leggyorsabban beszűkülő izomcsoport.' }, period: '2026.05.19. – 2026.06.02.' },
  { num: 3, state: 'lezart', video: { title: 'törzsstabilizáció I.', desc: 'a mély hátizmok bekapcsolása, hogy a gerinced ne a felszíni izmokra támaszkodjon.' }, period: '2026.06.02. – 2026.06.16.' },
  { num: 4, state: 'lezart', video: { title: 'légzéstechnika munka közben', desc: 'hogyan segít a helyes légzés a napközbeni terhelés csökkentésében.' }, period: '2026.06.16. – 2026.06.30.' },
  { num: 5, state: 'aktiv', video: { title: 'törzsstabilizáció II.', desc: 'az előző szint gyakorlatainak folytatása, nagyobb terheléssel és több ismétléssel.' }, period: '2026.06.30. – jelenleg is tart' },
  { num: 6, state: 'zarolt', lockReason: 'a jelenlegi (5.) szint lezárása után nyílik meg — a következő videót a gyógytornászod választja ki a 6. konzultáción.' },
  { num: 7, state: 'zarolt', lockReason: 'a 10 hetes együttműködés lezárása után nyílik meg, ha a szint kezdete óta eltelt 2 hét ÉS legalább 10 edzésnapod volt.' },
  { num: 8, state: 'zarolt', lockReason: 'a 10 hetes együttműködés lezárása után nyílik meg, ha a szint kezdete óta eltelt 2 hét ÉS legalább 10 edzésnapod volt.' },
  { num: 9, state: 'zarolt', lockReason: 'a 10 hetes együttműködés lezárása után nyílik meg, ha a szint kezdete óta eltelt 2 hét ÉS legalább 10 edzésnapod volt.' },
  { num: 10, state: 'zarolt', lockReason: 'a 10 hetes együttműködés lezárása után nyílik meg, ha a szint kezdete óta eltelt 2 hét ÉS legalább 10 edzésnapod volt.' },
  { num: 11, state: 'zarolt', lockReason: 'a 10 hetes együttműködés lezárása után nyílik meg, ha a szint kezdete óta eltelt 2 hét ÉS legalább 10 edzésnapod volt.' },
  { num: 12, state: 'zarolt', lockReason: 'a 10 hetes együttműködés lezárása után nyílik meg, ha a szint kezdete óta eltelt 2 hét ÉS legalább 10 edzésnapod volt.' },
]

export default function Gyakorlatok() {
  const [selected, setSelected] = useState(5)
  const level = levels.find((l) => l.num === selected)!

  return (
    <section className="py-4 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 860 }}>
        <span className="eyebrow-fyb">gyakorlatok</span>
        <h1 className="mb-4">szintjeid</h1>

        <div className="level-tabs mb-4">
          {levels.map((l) => (
            <button
              key={l.num}
              type="button"
              className={`level-tab level-tab--${l.state} ${selected === l.num ? 'is-selected' : ''}`}
              onClick={() => setSelected(l.num)}
              aria-label={`${l.num}. szint`}
            >
              {l.state === 'lezart' ? '✓' : l.state === 'zarolt' ? <Icon src="/icons/ikon_lakat.svg" /> : l.num}
            </button>
          ))}
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
              <div className="row g-3 align-items-center mb-3">
                <div className="col-md-5">
                  <div className="video-thumb">
                    <span className="play-btn">▶</span>
                  </div>
                </div>
                <div className="col-md-7">
                  <h3 className="h6 mb-1">{level.video!.title}</h3>
                  <p className="small mb-2" style={{ color: 'var(--color-text-muted)' }}>{level.video!.desc}</p>
                  <p className="small mb-0" style={{ color: 'var(--color-text-muted)' }}>{level.period}</p>
                </div>
              </div>

              <div className="locked-card">
                <div className="locked-header">
                  <Icon src="/icons/ikon_checklist.svg" />
                  napi checklist
                </div>
                <p className="mb-0">ez a rész egy következő fázisban készül el — itt fogod tudni naponta rögzíteni a gyakorlásod eredményét.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

import { useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon'

const VIDEOS = [
  'V01 Gerinc alapok',
  'V02 Csípőnyitás',
  'V03 Törzsstabilizáció I.',
  'V04 Légzéstechnika munka közben',
  'V05 Törzsstabilizáció II.',
  'V06 Vállöv mobilizálás',
  'V07 Csuklyásizom lazítás',
  'V08 Mély hátizom aktiválás',
  'V09 Medencei stabilizáció',
  'V10 Combhajlító nyújtás',
  'V11 Hátsó lánc erősítés',
  'V12 Nyaki tartásjavítás',
  'V13 Rekeszizom-légzés haladó',
  'V14 Egyensúly és propriocepció',
  'V15 Dinamikus bemelegítés',
  'V16 Csípőfeszítő aktiválás',
  'V17 Oldalsó törzsstabilizáció',
  'V18 Gerincmobilizáló nyújtássor',
  'V19 Terhelés alatti tartás',
  'V20 Funkcionális emelés-technika',
  'V21 Ülőmunka-ellensúlyozó sor',
  'V22 Alsó háti erősítés',
  'V23 Csípő-térd koordináció',
  'V24 Teljes test bemelegítés',
  'V25 Záró nyújtássor és relaxáció',
]

type LevelState = 'lezart' | 'nyitva' | 'zarolt'

type GytLevel = {
  num: number
  state: LevelState
  video?: string
  lockReason?: string
}

type Client = {
  id: string
  name: string
  mode: 'kozben' | 'utana'
  levels?: GytLevel[]
  history?: { num: number; video: string }[]
  bulkLevels?: { num: number; video: string | null }[]
}

const clients: Client[] = [
  {
    id: 'peter',
    name: 'Péter',
    mode: 'utana',
    history: [
      { num: 1, video: 'Gerinc alapok' },
      { num: 2, video: 'Csípőnyitás' },
      { num: 3, video: 'Törzsstabilizáció I.' },
      { num: 4, video: 'Légzéstechnika munka közben' },
      { num: 5, video: 'Törzsstabilizáció II.' },
    ],
    bulkLevels: [
      { num: 6, video: 'Vállöv mobilizálás' },
      { num: 7, video: 'Mély hátizom aktiválás' },
      { num: 8, video: null },
      { num: 9, video: null },
      { num: 10, video: null },
      { num: 11, video: null },
      { num: 12, video: null },
    ],
  },
  {
    id: 'gabor',
    name: 'Kovács Gábor',
    mode: 'kozben',
    levels: [
      { num: 1, state: 'lezart', video: 'Gerinc alapok' },
      { num: 2, state: 'lezart', video: 'Csípőnyitás' },
      { num: 3, state: 'nyitva' },
      { num: 4, state: 'zarolt', lockReason: 'a 3. szint videójának kiosztása és a következő konzultáció után nyílik meg.' },
      { num: 5, state: 'zarolt', lockReason: 'a 3. szint videójának kiosztása és a következő konzultáció után nyílik meg.' },
    ],
  },
]

function LevelDot({ state }: { state: LevelState }) {
  return (
    <span className={`level-select-badge level-select-badge--${state === 'nyitva' ? 'aktiv' : state}`}>
      {state === 'zarolt' && <Icon src="/icons/ikon_lakat.svg" />}
      {state === 'lezart' && <Icon src="/icons/ikon_pipa.svg" />}
    </span>
  )
}

function VideoPickerRow({ label, assigned, onAssign }: { label: string; assigned: string | null; onAssign: (video: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <span className="fw-bold">{label}</span>
      <div className={`level-select ${open ? 'is-open' : ''}`} ref={ref}>
        <button type="button" className="level-select-toggle" onClick={() => setOpen((o) => !o)}>
          <span style={{ color: assigned ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
            {assigned ?? 'válassz videót'}
          </span>
          <span className="level-select-chevron">▾</span>
        </button>

        {open && (
          <ul className="level-select-menu">
            {VIDEOS.map((v) => (
              <li key={v}>
                <button
                  type="button"
                  className={`level-select-item ${assigned === v ? 'is-selected' : ''}`}
                  onClick={() => {
                    onAssign(v)
                    setOpen(false)
                  }}
                >
                  <span>{v}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default function GytVideokiosztas() {
  const [clientId, setClientId] = useState('peter')
  const [clientPickerOpen, setClientPickerOpen] = useState(false)
  const clientRef = useRef<HTMLDivElement>(null)
  const client = clients.find((c) => c.id === clientId)!

  const [levels, setLevels] = useState(() => clients.find((c) => c.id === 'gabor')!.levels!)
  const [bulk, setBulk] = useState(() => clients.find((c) => c.id === 'peter')!.bulkLevels!)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (clientRef.current && !clientRef.current.contains(e.target as Node)) setClientPickerOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const openLevel = levels.find((l) => l.state === 'nyitva')

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 900 }}>
        <div className="app-page-header mb-3">
          <h1 className="app-page-title mb-0">videókiosztás</h1>

          <div className={`level-select ${clientPickerOpen ? 'is-open' : ''}`} ref={clientRef}>
            <button type="button" className="level-select-toggle" onClick={() => setClientPickerOpen((o) => !o)}>
              <span>{client.name}</span>
              <span className="level-select-chevron">▾</span>
            </button>

            {clientPickerOpen && (
              <ul className="level-select-menu">
                {clients.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className={`level-select-item ${c.id === clientId ? 'is-selected' : ''}`}
                      onClick={() => {
                        setClientId(c.id)
                        setClientPickerOpen(false)
                      }}
                    >
                      <span>{c.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {client.mode === 'kozben' && (
          <>
            <div className="d-flex flex-wrap gap-2 mb-3">
              {levels.map((l) => (
                <div key={l.num} className="d-flex align-items-center gap-1">
                  <LevelDot state={l.state} />
                  <span className="small" style={{ color: 'var(--color-text-muted)' }}>{l.num}.</span>
                </div>
              ))}
            </div>

            <div className="card-fyb card-fyb-accent">
              <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                <h2 className="h5 mb-0">{openLevel ? `${openLevel.num}. szint` : 'nincs kiosztásra váró szint'}</h2>
                {openLevel && <span className="badge-fyb">kiosztásra vár</span>}
              </div>

              {openLevel && (
                <VideoPickerRow
                  label={`${openLevel.num}. szint videója`}
                  assigned={openLevel.video ?? null}
                  onAssign={(video) =>
                    setLevels((prev) => prev.map((l) => (l.num === openLevel.num ? { ...l, video, state: 'lezart' as LevelState } : l)))
                  }
                />
              )}

              <div className="d-flex flex-column mt-2">
                {levels
                  .filter((l) => l.num !== openLevel?.num)
                  .map((l) => (
                    <div key={l.num} className="d-flex align-items-center justify-content-between gap-2 py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <span className="small" style={{ color: 'var(--color-text-muted)' }}>{l.num}. szint</span>
                      <span className="small">{l.state === 'lezart' ? l.video : l.lockReason}</span>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}

        {client.mode === 'utana' && (
          <>
            <div className="locked-card mb-3">
              <div className="locked-header">
                <Icon src="/icons/ikon_naptar.svg" />
                az együttműködés lezárult
              </div>
              <p className="mb-0">Állítsd össze a következő 7 szint videóit sorrendben. A hozzáférés automatikusan nyílik meg, ha a szint kezdete óta eltelt 2 hét ÉS legalább 10 edzésnap volt.</p>
            </div>

            <div className="d-flex flex-wrap gap-2 mb-3">
              {client.history!.map((h) => (
                <div key={h.num} className="d-flex align-items-center gap-1" title={h.video}>
                  <LevelDot state="lezart" />
                  <span className="small" style={{ color: 'var(--color-text-muted)' }}>{h.num}.</span>
                </div>
              ))}
            </div>

            <div className="card-fyb card-fyb-accent">
              <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                <h2 className="h5 mb-0">következő 7 szint</h2>
                <span className="small" style={{ color: 'var(--color-text-muted)' }}>
                  {bulk.filter((b) => b.video).length} / {bulk.length} kiosztva
                </span>
              </div>

              <div className="d-flex flex-column">
                {bulk.map((b) => (
                  <VideoPickerRow
                    key={b.num}
                    label={`${b.num}. szint`}
                    assigned={b.video}
                    onAssign={(video) => setBulk((prev) => prev.map((x) => (x.num === b.num ? { ...x, video } : x)))}
                  />
                ))}
              </div>

              <button type="button" className="btn-fyb btn-fyb-primary mt-3" disabled={bulk.some((b) => !b.video)}>
                kiosztás mentése
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

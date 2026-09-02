import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import Chevron from '../components/Chevron'
import { EXERCISES, type ExerciseCode, type ClientVariables, codeLabel, suggestedSequence } from '../data/tornaSzintek'
import { getSelectedClientId, type GytLevel, type LevelState } from '../data/initialClients'
import { useClients } from '../context/ClientsContext'
import { useAdminEditGuard, AdminModifiedBadge } from '../hooks/useAdminEditGuard'

const VIDEOS = (Object.keys(EXERCISES) as ExerciseCode[]).map((code) => `${code} ${EXERCISES[code].name}`)

function LevelDot({ state }: { state: LevelState }) {
  return (
    <span className={`level-select-badge level-select-badge--${state === 'nyitva' ? 'aktiv' : state}`}>
      {state === 'zarolt' && <Icon src="/icons/ikon_lakat.svg" />}
      {state === 'lezart' && <Icon src="/icons/ikon_pipa.svg" />}
    </span>
  )
}

function AssignmentDot({ done }: { done: boolean }) {
  return (
    <span
      className="level-select-badge"
      style={{ borderColor: done ? 'var(--color-primary)' : 'var(--color-border)', color: 'var(--color-primary)', opacity: done ? 1 : 0.45 }}
    >
      {done && <Icon src="/icons/ikon_pipa.svg" />}
    </span>
  )
}

function splitLabel(label: string) {
  const idx = label.indexOf(' ')
  return { code: label.slice(0, idx), title: label.slice(idx + 1) }
}

function VideoPickerInline({
  suggested,
  onAssign,
  chipSized,
}: {
  suggested?: string
  onAssign: (video: string) => void
  /** a "még nem kiosztható" jelvénnyel megegyező méretre húzza a legördülő gombot (2026.08.31.). */
  chipSized?: boolean
}) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <>
      {suggested && (
        <button
          type="button"
          className="btn-fyb btn-fyb-suggested"
          style={{ padding: '0.35rem 0.85rem', fontSize: '0.9rem', textTransform: 'none' }}
          onClick={(e) => {
            e.stopPropagation()
            onAssign(suggested)
          }}
        >
          javasolt: {suggested}
        </button>
      )}
      <div
        className={`level-select ${pickerOpen ? 'is-open' : ''} ${chipSized ? 'level-select--chip-sized' : ''}`}
        style={chipSized ? { flex: 1 } : undefined}
        ref={pickerRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="level-select-toggle" onClick={() => setPickerOpen((o) => !o)}>
          <span style={{ color: 'var(--color-text-muted)' }}>más videó</span>
          <span className="level-select-chevron">▾</span>
        </button>

        {pickerOpen && (
          <ul className="level-select-menu">
            {VIDEOS.map((v) => (
              <li key={v}>
                <button
                  type="button"
                  className="level-select-item"
                  onClick={() => {
                    onAssign(v)
                    setPickerOpen(false)
                  }}
                >
                  <span>{v}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

function LevelRow({
  level,
  suggested,
  editable,
  onAssign,
  modified,
}: {
  level: GytLevel
  suggested?: string
  editable?: boolean
  onAssign?: (video: string) => void
  modified?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const [correcting, setCorrecting] = useState(false)
  const statusLabel = level.state === 'lezart' ? 'kiosztva' : level.state === 'nyitva' ? 'kiosztásra vár' : 'még nem kiosztható'
  const statusClass = level.state === 'lezart' ? 'status-chip--done' : level.state === 'nyitva' ? 'status-chip--pending' : 'status-chip--locked'
  const assigned = level.video ? splitLabel(level.video) : null
  const suggestedParsed = suggested ? splitLabel(suggested) : null
  const isDoneDisplay = level.state === 'lezart' && assigned && !correcting
  const showCorrectButton = level.state === 'lezart' && editable && !!onAssign && !correcting

  const noteSuffix = level.note ? <span className="fst-italic small" style={{ color: 'var(--color-text-muted)' }}> ({level.note})</span> : null
  const isPending = level.state === 'nyitva'

  // "kiosztásra vár" sor — a felette lévő "kiosztva" sor kód/név-elrendezését követve.
  // Kattintható, enyhe lime háttérrel — kattintásra rögtön a javasolt videó kerül kiosztásra.
  // A gomb bal paddingját negatív margó semlegesíti (mint a szám-jelvénynél), a kód pedig
  // fix szélességű + a rács oszlopközével egyező jobb margóval — így a kód ÉS a név is
  // pontosan a fölötte lévő "kiosztva" sor kód/cím-oszlopaival egy vonalban jelenik meg.
  const suggestedButton = suggestedParsed && onAssign && (
    <button
      type="button"
      className="btn-fyb btn-fyb-suggested suggested-video-btn"
      onClick={() => onAssign(suggested!)}
    >
      <span className="fw-bold suggested-video-btn-code">{suggestedParsed.code}</span>
      <span style={{ color: 'var(--color-text-muted)', marginRight: '0.4rem' }}>{suggestedParsed.title}</span>
      <span className="fst-italic" style={{ color: 'var(--color-text-muted)' }}>-javasolt</span>
    </button>
  )
  // mobilon a kisméretű nyíl a javasolt-gomb előtt jelenik meg, a mellette lévő szöveggel
  // egyező magassággal (asztalon a nyíl a szint-szám jelvényén "lóg túl", ld. lent).
  const suggestedInline = suggestedButton && (
    <span className="d-flex align-items-center gap-2 flex-wrap">
      <Chevron direction="right" double color="var(--lime)" className="chevron-svg--text-height" />
      {suggestedButton}
    </span>
  )

  // Mobilon (és a "kiosztva" eset kódját/címét NEM külön oszlopba rendező, folyó szövegű megjelenítéshez) egyben.
  const flowContent = (
    <>
      {isDoneDisplay && (
        <>
          <span className="fw-bold">{assigned!.code}</span>
          <span style={{ color: 'var(--color-text-muted)' }}>{assigned!.title}</span>
          {noteSuffix}
        </>
      )}
      {level.state === 'lezart' && correcting && onAssign && (
        <VideoPickerInline
          onAssign={(video) => {
            onAssign(video)
            setCorrecting(false)
          }}
        />
      )}
      {level.state === 'zarolt' && <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
      {level.state === 'nyitva' && onAssign && <VideoPickerInline suggested={suggested} onAssign={onAssign} />}
    </>
  )

  const correctButton = showCorrectButton && (
    <button
      type="button"
      className="btn-fyb btn-fyb-danger"
      style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
      onClick={(e) => {
        e.stopPropagation()
        setCorrecting(true)
      }}
    >
      javítás
    </button>
  )

  return (
    <div className="level-row">
      {/* asztali/tablet: valódi rács — a szintek, kódok, címek és jelvények oszloponként egymás alatt */}
      <div className="level-row-grid">
        <span className="level-row-num-cell" style={{ gridColumn: 1 }}>
          <span className={`level-row-num ${isPending ? 'level-row-num--highlight' : ''}`}>{level.num}. szint</span>
          {isPending && <Chevron direction="right" double color="var(--lime)" className="level-row-num-chevron" />}
        </span>

        {isDoneDisplay ? (
          <>
            <span style={{ gridColumn: 2 }} className="fw-bold">
              {assigned!.code}
            </span>
            <span style={{ gridColumn: 3, color: 'var(--color-text-muted)' }}>
              {assigned!.title}
              {noteSuffix}
            </span>
          </>
        ) : (
          <div style={{ gridColumn: '2 / span 2' }} className="d-flex align-items-center gap-2 flex-wrap">
            {isPending ? suggestedButton : flowContent}
          </div>
        )}

        <span style={{ gridColumn: 4, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {isPending && onAssign ? (
            <VideoPickerInline onAssign={onAssign} chipSized />
          ) : (
            <>
              <span className={`status-chip ${statusClass}`} style={correctButton ? undefined : { flex: 1, textAlign: 'center' }}>
                {statusLabel}
              </span>
              {correctButton}
            </>
          )}
        </span>

        {modified && (
          <span style={{ gridColumn: '1 / -1' }}>
            <AdminModifiedBadge />
          </span>
        )}
      </div>

      {/* mobil: összecsukva — szint az elején, ikon a végén, a kód/javaslat középen, arányosan elosztva ("sorkizárt") */}
      <div className="d-flex d-lg-none flex-column w-100">
        <div className="d-flex align-items-center justify-content-between gap-2" role="button" tabIndex={0} onClick={() => setExpanded((e) => !e)} style={{ cursor: 'pointer' }}>
          <span className={`level-row-num ${isPending ? 'level-row-num--highlight' : ''}`}>{level.num}. szint</span>
          {assigned && <span className="small fw-bold">{assigned.code}</span>}
          {!assigned && isPending && suggestedParsed && (
            <span className="small fw-bold">javasolt {suggestedParsed.code}</span>
          )}
          <LevelDot state={level.state} />
        </div>

        {expanded && (
          <div className="d-flex flex-column align-items-center gap-2 mt-2 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
            {isPending ? suggestedInline : flowContent}
            {isPending && onAssign ? (
              <VideoPickerInline onAssign={onAssign} />
            ) : (
              <span className="d-flex align-items-center gap-2">
                <span className={`status-chip ${statusClass}`}>{statusLabel}</span>
                {correctButton}
              </span>
            )}
            {modified && <AdminModifiedBadge />}
          </div>
        )}
      </div>
    </div>
  )
}

function VideoPickerRow({
  label,
  assigned,
  note,
  suggested,
  onAssign,
  onNoteChange,
  modified,
}: {
  label: string
  assigned: string | null
  note?: string
  suggested?: string
  onAssign: (video: string) => void
  onNoteChange?: (note: string) => void
  modified?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [showNoteInput, setShowNoteInput] = useState(!!note)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div className="py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
      {/* mobilon MINDIG egymás alá kerül a szint-címke és a videó-választó,
         függetlenül attól, hogy a kiválasztott videó neve rövid vagy hosszú —
         korábban ez tartalom-függő flex-wrap volt, ezért soronként hol egy,
         hol két sorba tört, "össze-vissza" hatást keltve (2026.09.01., Marci
         kérésére: "szintenként az elemeket egymás alá rakja"). Asztalon
         (lg+) változatlanul egy sorban, széthúzva. */}
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-lg-between gap-2">
        <span className="d-flex align-items-center gap-2 fw-bold">
          <AssignmentDot done={!!assigned} />
          {label}
          {modified && <AdminModifiedBadge />}
        </span>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {suggested && !assigned && (
            <button type="button" className="btn-fyb btn-fyb-suggested" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', textTransform: 'none' }} onClick={() => onAssign(suggested)}>
              javasolt: {suggested}
            </button>
          )}
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
      </div>

      {assigned && onNoteChange && (
        showNoteInput ? (
          <input
            type="text"
            className="form-control form-control-sm mt-2"
            placeholder="lábjegyzet a videóhoz (opcionális) — pl. „csak az első 2 gyakorlat ebből a szintből”"
            value={note ?? ''}
            onChange={(e) => onNoteChange(e.target.value)}
          />
        ) : (
          <button
            type="button"
            className="btn-fyb btn-fyb-ghost mt-2"
            style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
            onClick={() => setShowNoteInput(true)}
          >
            + lábjegyzet hozzáadása
          </button>
        )
      )}
    </div>
  )
}

function TraitRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <span className="small" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <div className="auth-tabs auth-tabs-sm flex-shrink-0">{children}</div>
    </div>
  )
}

function VariablesPanel({
  variables,
  onChange,
  locked,
  onLockedChange,
  modified,
}: {
  variables: ClientVariables
  onChange: (v: ClientVariables) => void
  locked: boolean
  onLockedChange: (locked: boolean) => void
  modified?: boolean
}) {
  // ha a panel FELOLDVA indul (vadonatúj kliens, még nincs mentett limitáció),
  // legyen egyből nyitva is — a GYT-nek látnia kell, hogy van itt tennivaló,
  // mielőtt a videókiosztást elindítaná (2026.09.01., Marci kérésére).
  const [expanded, setExpanded] = useState(() => !locked)

  return (
    <div className="card-fyb mb-3">
      <button
        type="button"
        className="d-flex align-items-center gap-2 flex-wrap w-100 text-start"
        style={{ background: 'none', border: 'none', padding: 0, marginBottom: expanded ? '0.5rem' : 0, color: 'var(--color-text)' }}
        onClick={() => {
          const next = !expanded
          setExpanded(next)
          // becsukáskor, ha még nem volt mentve, automatikusan mentse
          if (!next && !locked) onLockedChange(true)
        }}
      >
        <Icon src="/icons/ikon_beallitasok.svg" />
        <strong>limitációk</strong>
        {/* mobilon elhagyva, hogy a doboz összecsukva alacsony maradjon, és a
           szint-lista görgetés nélkül beleférjen (2026.09.01., Marci kérésére) */}
        <span className="small d-none d-lg-inline" style={{ color: 'var(--color-text-muted)' }}>(ideiglenes — a felvételi kérdőívig kézzel állítva, egyszer az elején)</span>
        {modified && <AdminModifiedBadge />}
        <span className="level-select-chevron ms-auto" style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>

      {expanded && (
        <>
      <TraitRow label="fájdalom helye">
        <button type="button" disabled={locked} className={`auth-tab ${variables.painLocation === 'also' ? 'active' : ''}`} onClick={() => onChange({ ...variables, painLocation: 'also' })}>
          alsó lumbális
        </button>
        <button type="button" disabled={locked} className={`auth-tab ${variables.painLocation === 'felso' ? 'active' : ''}`} onClick={() => onChange({ ...variables, painLocation: 'felso' })}>
          felső lumbális / háti
        </button>
      </TraitRow>

      <TraitRow label="hason fekvés kivitelezhető">
        <button type="button" disabled={locked} className={`auth-tab ${variables.proneOk ? 'active' : ''}`} onClick={() => onChange({ ...variables, proneOk: true })}>
          igen
        </button>
        <button type="button" disabled={locked} className={`auth-tab ${!variables.proneOk ? 'active' : ''}`} onClick={() => onChange({ ...variables, proneOk: false })}>
          nem
        </button>
      </TraitRow>

      <TraitRow label="váll feletti kartartás lehetséges">
        <button type="button" disabled={locked} className={`auth-tab ${variables.shoulderOk ? 'active' : ''}`} onClick={() => onChange({ ...variables, shoulderOk: true })}>
          igen
        </button>
        <button type="button" disabled={locked} className={`auth-tab ${!variables.shoulderOk ? 'active' : ''}`} onClick={() => onChange({ ...variables, shoulderOk: false })}>
          nem
        </button>
      </TraitRow>

      <TraitRow label="térdfájdalom (négykézláb helyzetekhez)">
        <button type="button" disabled={locked} className={`auth-tab ${variables.kneePain ? 'active' : ''}`} onClick={() => onChange({ ...variables, kneePain: true })}>
          van
        </button>
        <button type="button" disabled={locked} className={`auth-tab ${!variables.kneePain ? 'active' : ''}`} onClick={() => onChange({ ...variables, kneePain: false })}>
          nincs
        </button>
      </TraitRow>

      <TraitRow label="magas vérnyomás">
        <button type="button" disabled={locked} className={`auth-tab ${variables.highBloodPressure ? 'active' : ''}`} onClick={() => onChange({ ...variables, highBloodPressure: true })}>
          van
        </button>
        <button type="button" disabled={locked} className={`auth-tab ${!variables.highBloodPressure ? 'active' : ''}`} onClick={() => onChange({ ...variables, highBloodPressure: false })}>
          nincs
        </button>
      </TraitRow>

      {variables.highBloodPressure && (
        <p className="small mb-0 mt-2" style={{ color: 'var(--color-text-muted)' }}>
          megjegyzés a checklist-fázishoz: magas vérnyomásnál a napi megtartás-idő maximuma 4 mp (a szokásos 10 mp helyett).
        </p>
      )}

      <div className="d-flex justify-content-end mt-3">
        <button
          type="button"
          className={`btn-fyb ${locked ? 'btn-fyb-outline' : 'btn-fyb-primary'}`}
          style={{ padding: '0.5rem 1.25rem' }}
          onClick={() => onLockedChange(!locked)}
        >
          {locked ? 'módosítás' : 'mentés'}
        </button>
      </div>
        </>
      )}
    </div>
  )
}

// ha még nincs (érvényesen) kiválasztott ügyfél, ne a fallback első ügyféllel
// dolgozzunk. KORÁBBAN ez egy néma átirányítás volt az "ügyfeleim" oldalra
// (`navigate(..., { replace: true })`) — mobilon, ha valaki a hamburger-
// menüből egyenesen a "videókiosztás" pontra koppintott anélkül, hogy előtte
// kiválasztott volna egy ügyfelet, ez úgy nézett ki, mintha a modul EGYÁLTALÁN
// NEM NYÍLNA MEG (a koppintás után "semmi sem történt", csak egy másik oldal
// jelent meg magyarázat nélkül) — Marci hibajelzésére (2026.09.02.) inkább
// MARADUNK ezen az oldalon, és egy egyértelmű üzenetet + gombot mutatunk.
export default function GytVideokiosztas() {
  const navigate = useNavigate()
  const [clientId] = useState(getSelectedClientId)

  if (!clientId) {
    return (
      <section className="py-3 py-lg-5">
        <div className="container-fluid" style={{ maxWidth: 900 }}>
          <div className="app-page-header mb-3">
            <h1 className="app-page-title mb-0">videókiosztás</h1>
          </div>
          <div className="select-client-notice mb-3">
            <Icon src="/icons/ikon_csengo.svg" style={{ width: '1.4rem', height: '1.4rem', flexShrink: 0 }} />
            <span>előbb válassz ügyfelet — a videókiosztás egy konkrét ügyfélhez tartozik.</span>
          </div>
          <button type="button" className="btn-fyb btn-fyb-primary" onClick={() => navigate('/gyt/ugyfelek')}>
            ügyfeleim megnyitása
          </button>
        </div>
      </section>
    )
  }
  return <GytVideokiosztasInner clientId={clientId} />
}

function GytVideokiosztasInner({ clientId }: { clientId: string }) {
  const { clients, updateClient } = useClients()
  const client = clients.find((c) => c.id === clientId)!

  // az állapotfelmérő értékei mostantól az összevont Client rekord RÉSZE
  // (variables mező, mindig jelen van) — a korábbi, id szerint kulcsolt külön
  // "initialVariables" map megszűnt (2026.09.01., ügyfél-nyilvántartások
  // összevonása, ld. Design jegyzet 49. pont). A helyi másolat (mint a
  // szintek/mód esetén is) csak ezen az oldalon él, nem íródik vissza.
  const [variablesByClient, setVariablesByClient] = useState(() => {
    const map: Record<string, ClientVariables> = {}
    for (const c of clients) map[c.id] = c.variables
    return map
  })
  const clientVariables = variablesByClient[clientId]
  const suggested = suggestedSequence(clientVariables)

  // egy SALES-oldalról frissen hozzárendelt, teljesen új ügyfélnek még nincs
  // "mode"-ja (se "kozben", se "utana") — a helyi másolat teszi lehetővé,
  // hogy a GYT itt, a "videókiosztás" oldalon indítsa el vele a munkát.
  const [modeByClient, setModeByClient] = useState<Record<string, 'kozben' | 'utana' | undefined>>(() => {
    const map: Record<string, 'kozben' | 'utana' | undefined> = {}
    for (const c of clients) map[c.id] = c.mode
    return map
  })
  const mode = modeByClient[clientId]

  // A limitációk a MÁR elindított (van mode-ja) klienseknél alapból "mentett"
  // (rögzített) állapotban indulnak — ezek már korábban felvett adatok, nem
  // üres űrlapok, módosításhoz elő kell hívni. Egy vadonatúj (SALES-től frissen
  // kapott, mode nélküli) kliensnél viszont a panel NYITVA, FELOLDVA indul —
  // a videókiosztás csak a limitációk elmentése UTÁN indítható (2026.09.01.,
  // Marci kérésére: "előbb be kell állítani a limitációkat").
  const [variablesLockedByClient, setVariablesLockedByClient] = useState(() => {
    const map: Record<string, boolean> = {}
    for (const c of clients) map[c.id] = !!c.mode
    return map
  })
  const variablesLocked = variablesLockedByClient[clientId]
  const setVariablesLocked = (locked: boolean) => setVariablesLockedByClient((prev) => ({ ...prev, [clientId]: locked }))

  const [levelsByClient, setLevelsByClient] = useState(() => {
    const map: Record<string, GytLevel[]> = {}
    for (const c of clients) if (c.levels) map[c.id] = c.levels
    return map
  })
  const levels = levelsByClient[clientId] ?? []
  const setLevels = (updater: (prev: GytLevel[]) => GytLevel[]) =>
    setLevelsByClient((prev) => ({ ...prev, [clientId]: updater(prev[clientId]) }))

  const [bulk, setBulk] = useState(() => clients.find((c) => c.id === 'peter')!.bulkLevels!)

  // a "kiosztás mentése" gomb is a VariablesPanel-nél már megszokott
  // zár/mentés mintát követi: mentés után a gomb "módosítás"-ra vált, mellette
  // pedig megjelenik egy külön "mentve" felirat (2026.09.01., Marci kérésére).
  const [bulkLockedByClient, setBulkLockedByClient] = useState<Record<string, boolean>>({})
  const bulkLocked = !!bulkLockedByClient[clientId]
  const setBulkLocked = (locked: boolean) => setBulkLockedByClient((prev) => ({ ...prev, [clientId]: locked }))

  const { guard: adminGuard, isModified, modal: adminModal } = useAdminEditGuard('gyt')

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 900 }}>
        {/* mobilon a cím+ügyfélnév fixen a tetején marad, csak a limitációk/
           szintek görgetnek alatta (2026.09.01., Marci kérésére). */}
        <div className="app-page-header mb-3 mobile-sticky-header">
          <h1 className="app-page-title mb-0">videókiosztás</h1>
          <span className="fw-bold">{client.name}</span>
        </div>

        <VariablesPanel
          variables={clientVariables}
          onChange={(v) => adminGuard('limitaciok', () => setVariablesByClient((prev) => ({ ...prev, [clientId]: v })))}
          locked={variablesLocked}
          onLockedChange={setVariablesLocked}
          modified={isModified('limitaciok')}
        />

        {!mode && (
          <div className="card-fyb card-fyb-accent text-center py-4">
            <p className="mb-3">{client.name} még nem kezdte el a videókiosztást. Indítsd el az 1. szinttel!</p>
            {!variablesLocked && (
              <p className="small mb-3" style={{ color: 'var(--color-text-muted)' }}>
                előbb állítsd be és mentsd el a fenti limitációkat.
              </p>
            )}
            <button
              type="button"
              className="btn-fyb btn-fyb-primary"
              disabled={!variablesLocked}
              onClick={() => {
                setModeByClient((prev) => ({ ...prev, [clientId]: 'kozben' }))
                setLevelsByClient((prev) => ({
                  ...prev,
                  [clientId]: prev[clientId] ?? [
                    { num: 1, state: 'nyitva' },
                    { num: 2, state: 'zarolt' },
                    { num: 3, state: 'zarolt' },
                    { num: 4, state: 'zarolt' },
                    { num: 5, state: 'zarolt' },
                  ],
                }))
                if (client.isNew) updateClient(clientId, { isNew: false })
              }}
            >
              videókiosztás indítása
            </button>
          </div>
        )}

        {mode === 'kozben' && (() => {
          // A GYT csak a 2 legutóbb kiosztott szintet javíthatja utólag — a korábbiakat nem,
          // hogy ne lehessen véletlenül az egész előzményt átírni.
          const editableNums = new Set(
            levels
              .filter((l) => l.state === 'lezart')
              .slice(-2)
              .map((l) => l.num)
          )
          return (
            <div className="card-fyb card-fyb-accent">
              {levels.map((l) => (
                <LevelRow
                  key={l.num}
                  level={l}
                  suggested={l.state === 'nyitva' && suggested[l.num - 1] ? codeLabel(suggested[l.num - 1]) : undefined}
                  editable={editableNums.has(l.num)}
                  modified={isModified(`level-${l.num}`)}
                  onAssign={
                    l.state === 'nyitva'
                      ? (video) => adminGuard(`level-${l.num}`, () => setLevels((prev) => prev.map((x) => (x.num === l.num ? { ...x, video, state: 'lezart' as LevelState } : x))))
                      : editableNums.has(l.num)
                        ? (video) => adminGuard(`level-${l.num}`, () => setLevels((prev) => prev.map((x) => (x.num === l.num ? { ...x, video } : x))))
                        : undefined
                  }
                />
              ))}
            </div>
          )
        })()}

        {mode === 'utana' && (
          <>
            <div className="locked-card mb-3">
              <div className="locked-header">
                <Icon src="/icons/ikon_naptar.svg" />
                az együttműködés lezárult
              </div>
              <p className="mb-0">Állítsd össze a következő szintek videóit sorrendben. A hozzáférés automatikusan nyílik meg, ha a szint kezdete óta eltelt 2 hét ÉS legalább 10 edzésnap volt.</p>
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
                <h2 className="h5 mb-0">következő {bulk.length} szint</h2>
                <span className="small" style={{ color: 'var(--color-text-muted)' }}>
                  {bulk.filter((b) => b.video).length} / {bulk.length} kiosztva
                </span>
              </div>

              <button
                type="button"
                className="btn-fyb btn-fyb-ghost mb-2"
                onClick={() =>
                  adminGuard(
                    bulk.map((b) => `bulk-${b.num}`),
                    () =>
                      setBulk((prev) =>
                        prev.map((b) => {
                          const code = suggested[b.num - 1]
                          return code ? { ...b, video: codeLabel(code) } : b
                        })
                      )
                  )
                }
              >
                javasolt csomag alkalmazása (felülírja a jelenlegi kiosztást)
              </button>

              <div className="d-flex flex-column">
                {bulk.map((b) => (
                  <VideoPickerRow
                    key={b.num}
                    label={`${b.num}. szint`}
                    assigned={b.video}
                    note={b.note}
                    modified={isModified(`bulk-${b.num}`)}
                    onAssign={(video) => adminGuard(`bulk-${b.num}`, () => setBulk((prev) => prev.map((x) => (x.num === b.num ? { ...x, video } : x))))}
                    onNoteChange={(note) => adminGuard(`bulk-${b.num}`, () => setBulk((prev) => prev.map((x) => (x.num === b.num ? { ...x, note } : x))))}
                  />
                ))}
              </div>

              <div className="d-flex align-items-center gap-2 mt-3">
                <button
                  type="button"
                  className="btn-fyb btn-fyb-primary"
                  disabled={!bulkLocked && bulk.some((b) => !b.video)}
                  onClick={() => setBulkLocked(!bulkLocked)}
                >
                  {bulkLocked ? 'módosítás' : 'kiosztás mentése'}
                </button>
                {bulkLocked && <span className="fw-bold" style={{ color: 'var(--color-success)' }}>mentve</span>}
              </div>
            </div>
          </>
        )}

        {adminModal}
      </div>
    </section>
  )
}

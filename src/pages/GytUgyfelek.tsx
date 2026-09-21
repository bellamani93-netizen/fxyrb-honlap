import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { useClients } from '../context/ClientsContext'
import { getSelectedClientId, setSelectedClientId, type Client } from '../data/initialClients'
import { LOGGED_IN_GYT_ID } from '../data/colleagues'
import { useCalendar } from '../context/CalendarContext'
import { formatISODate } from '../data/calendarData'

const WEEKDAY_NAMES = ['vasárnap', 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat']

type PhaseFilter = 'mai' | 'osszes' | 'utankovetes' | 'archivalt'

const PHASE_FILTER_OPTIONS: { value: PhaseFilter; label: string }[] = [
  { value: 'osszes', label: 'összes ügyfél' },
  { value: 'mai', label: 'mai ügyfelek' },
  { value: 'utankovetes', label: '14 hetes utánkövetés' },
  { value: 'archivalt', label: 'archivált ügyfelek' },
]

// az ügyfél kezdő napja/dátuma a listában (2026.09.01., Marci kérésére) —
// a "startTime" datetime-local string dátum-részéből számolt hétköznap-név
// + a dátum, pl. "kedd, 2026.06.30."
function formatStartDay(startTime: string | undefined) {
  if (!startTime) return null
  const [datePart] = startTime.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  if (!y || !m || !d) return null
  const weekday = WEEKDAY_NAMES[new Date(y, m - 1, d).getDay()]
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${weekday}, ${y}.${pad(m)}.${pad(d)}.`
}

export default function GytUgyfelek() {
  const navigate = useNavigate()
  const location = useLocation()
  const { clients } = useClients()
  const { getClientConsultations, today } = useCalendar()
  const [search, setSearch] = useState('')
  // "Szűrés" legördülő (2026.09.21., Marci kérésére) — alapértelmezetten
  // "mai ügyfelek", a Marci kérése szerint. A "14 hetes utánkövetés"/
  // "archivált ügyfelek" a `Client.programPhase` mezőre épül, amit egyelőre
  // SEMMI nem állít be (a lezáró funkció még nem létezik, ld.
  // initialClients.ts jegyzete) — ez a 2 kategória emiatt most mindig
  // üres listát ad, ez szándékos, nem hiba.
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>('mai')
  // csak a saját (hozzá rendelt) ügyfelek — az összevont nyilvántartásban
  // MINDEN gyt ugyanazt a listát olvassa, ezért itt szűrünk (2026.09.01.,
  // ügyfél-nyilvántartások összevonása, ld. Design jegyzet 49. pont)
  const ownClients = clients.filter((c) => c.assignedGytId === LOGGED_IN_GYT_ID)
  const todayISO = formatISODate(today)
  // "mai ügyfelek" — akiknek VAN ténylegesen rögzített (nem "terv") mai
  // konzultációja a naptárban (ld. CalendarContext.tsx getClientConsultations)
  // — a demo-generált, vizuális kitöltő időpontokat figyelmen kívül hagyja.
  function isTodayClient(client: Client): boolean {
    return getClientConsultations(client.id).some((c) => c.dateISO === todayISO)
  }
  const phaseFilteredClients = ownClients.filter((c) => {
    if (phaseFilter === 'osszes') return true
    if (phaseFilter === 'mai') return isTodayClient(c)
    return c.programPhase === phaseFilter
  })
  // ha nincs kiválasztott ügyfél (első belépés, vagy egy másik almenüről
  // idekerülve, mert még nem volt kiválasztás), erre hívjuk fel a figyelmet —
  // ez a jelzés csak az induló állapotot mutatja, egy választás után eltűnik.
  // A tárolt id-t a LIVE saját-ügyfél listával szemben is ellenőrizzük, mert
  // getSelectedClientId() önmagában már nem validál (ld. initialClients.ts).
  const [noSelection] = useState(() => {
    const id = getSelectedClientId()
    return id === null || !ownClients.some((c) => c.id === id)
  })

  // ha egy másik GYT-oldal (videókiosztás/állapotfelmérők/munkafüzet)
  // "előbb válassz ügyfelet" jelzése miatt kerültünk ide, a `location.state`
  // `from`-ja tárolja, honnan jöttünk (ld. a 3 érintett oldal "ügyfeleim
  // megnyitása" gombját) — választás után ODA térünk vissza, nem mindig a
  // videókiosztásra (2026.09.19., Marci kérésére: "miután választottam
  // ügyfelet, akkor egyből [az onnan navigált] oldalt akarom látni").
  // Közvetlenül a nav-menüből idenavigálva (nincs `from`) a régi, alapértelmezett
  // célra megyünk, változatlanul.
  const from = (location.state as { from?: string } | null)?.from

  function choose(id: string) {
    setSelectedClientId(id)
    navigate(from ?? '/gyt/videokiosztas')
  }

  const filtered = phaseFilteredClients.filter((c) => c.name.toLowerCase().includes(search.trim().toLowerCase()))

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 900 }}>
        {/* mobilon a cím + keresés fixen a tetején marad, csak a lista (és a
           fölötte lévő tájékoztató szövegek) görgetnek alatta — asztalon
           változatlan, egyszerű dokumentum-görgetés (2026.09.01., Marci
           kérésére). */}
        <div className="mobile-sticky-header">
          <div className="app-page-header mb-3">
            <h1 className="app-page-title mb-0">ügyfeleim</h1>
          </div>
          <input
            type="search"
            className="form-control mb-3"
            style={{ maxWidth: '16rem' }}
            placeholder="keresés név szerint…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {noSelection && (
          <div className="select-client-notice mb-3">
            <Icon src="/icons/ikon_csengo.svg" style={{ width: '1.4rem', height: '1.4rem', flexShrink: 0 }} />
            <span>kivel dolgozunk? válassz ügyfelet a listából!</span>
          </div>
        )}

        <p className="mb-3" style={{ color: 'var(--color-text-muted)' }}>
          válaszd ki, melyik ügyféllel szeretnél most dolgozni — a további almenük (videókiosztás, dokumentáció stb.) innentől erre az ügyfélre vonatkoznak.
        </p>

        <div className="d-flex align-items-center gap-2 mb-3">
          <label htmlFor="phase-filter" className="small fw-bold mb-0" style={{ whiteSpace: 'nowrap' }}>
            Szűrés:
          </label>
          <select
            id="phase-filter"
            className="form-select form-select-sm"
            style={{ maxWidth: '14rem' }}
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value as PhaseFilter)}
          >
            {PHASE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="card-fyb">
          {filtered.length === 0 ? (
            <p className="mb-0 text-center" style={{ color: 'var(--color-text-muted)' }}>nincs találat</p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                className="module-item d-flex align-items-center w-100 text-start"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}
                onClick={() => choose(c.id)}
              >
                <span className="module-index">{c.name.charAt(0)}</span>
                <span className="flex-grow-1" style={{ minWidth: 0 }}>
                  <span className="fw-bold d-flex align-items-center gap-2">
                    {c.name}
                    {c.isNew && <span className="new-client-badge">új</span>}
                  </span>
                  {formatStartDay(c.startTime) && (
                    <span className="small d-block" style={{ color: 'var(--color-text-muted)' }}>
                      kezdés: {formatStartDay(c.startTime)}
                    </span>
                  )}
                </span>
                <span style={{ color: 'var(--color-text-muted)' }}>›</span>
              </button>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

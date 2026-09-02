import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { useClients } from '../context/ClientsContext'
import { getSelectedClientId, setSelectedClientId } from '../data/initialClients'
import { LOGGED_IN_GYT_ID } from '../data/colleagues'

const WEEKDAY_NAMES = ['vasárnap', 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat']

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
  const { clients } = useClients()
  const [search, setSearch] = useState('')
  // csak a saját (hozzá rendelt) ügyfelek — az összevont nyilvántartásban
  // MINDEN gyt ugyanazt a listát olvassa, ezért itt szűrünk (2026.09.01.,
  // ügyfél-nyilvántartások összevonása, ld. Design jegyzet 49. pont)
  const ownClients = clients.filter((c) => c.assignedGytId === LOGGED_IN_GYT_ID)
  // ha nincs kiválasztott ügyfél (első belépés, vagy egy másik almenüről
  // idekerülve, mert még nem volt kiválasztás), erre hívjuk fel a figyelmet —
  // ez a jelzés csak az induló állapotot mutatja, egy választás után eltűnik.
  // A tárolt id-t a LIVE saját-ügyfél listával szemben is ellenőrizzük, mert
  // getSelectedClientId() önmagában már nem validál (ld. initialClients.ts).
  const [noSelection] = useState(() => {
    const id = getSelectedClientId()
    return id === null || !ownClients.some((c) => c.id === id)
  })

  function choose(id: string) {
    setSelectedClientId(id)
    navigate('/gyt/videokiosztas')
  }

  const filtered = ownClients.filter((c) => c.name.toLowerCase().includes(search.trim().toLowerCase()))

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

import { useEffect, useRef, useState } from 'react'
import { GYT_STAFF, initialSalesClients, type SalesClient } from '../data/salesClients'

function GytPicker({ assigned, onAssign }: { assigned: string | null; onAssign: (gyt: string) => void }) {
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
    <div className={`level-select ${open ? 'is-open' : ''}`} ref={ref}>
      <button type="button" className="level-select-toggle" onClick={() => setOpen((o) => !o)}>
        <span style={{ color: assigned ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
          {assigned ?? 'válassz gyógytornászt'}
        </span>
        <span className="level-select-chevron">▾</span>
      </button>

      {open && (
        <ul className="level-select-menu">
          {GYT_STAFF.map((g) => (
            <li key={g}>
              <button
                type="button"
                className={`level-select-item ${assigned === g ? 'is-selected' : ''}`}
                onClick={() => {
                  onAssign(g)
                  setOpen(false)
                }}
              >
                <span>{g}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function SalesHozzarendeles() {
  const [clients, setClients] = useState<SalesClient[]>(initialSalesClients)
  const [search, setSearch] = useState('')

  function assign(id: string, gyt: string) {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, assignedGyt: gyt } : c)))
  }

  const pendingCount = clients.filter((c) => !c.assignedGyt).length

  const filtered = clients
    .filter((c) => c.name.toLowerCase().includes(search.trim().toLowerCase()))
    // a hozzárendelésre váró ügyfelek kerüljenek előre, hogy a SALES elsőként azokat lássa, akikkel teendő van
    .sort((a, b) => Number(!!a.assignedGyt) - Number(!!b.assignedGyt))

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 900 }}>
        <div className="app-page-header mb-3">
          <h1 className="app-page-title mb-0">ügyfél–GYT hozzárendelés</h1>
        </div>

        <p className="mb-3" style={{ color: 'var(--color-text-muted)' }}>
          {pendingCount > 0
            ? `${pendingCount} ügyfél vár még gyógytornász-hozzárendelésre.`
            : 'minden ügyfélhez tartozik gyógytornász.'}
        </p>

        <input
          type="search"
          className="form-control mb-3"
          style={{ maxWidth: '16rem' }}
          placeholder="keresés név szerint…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="card-fyb">
          {filtered.length === 0 ? (
            <p className="mb-0 text-center" style={{ color: 'var(--color-text-muted)' }}>nincs találat</p>
          ) : (
            filtered.map((c) => (
              <div key={c.id} className="py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                  <span className="d-flex align-items-center gap-2 fw-bold">
                    {c.name}
                    <span className={`status-chip ${c.assignedGyt ? 'status-chip--done' : 'status-chip--pending'}`}>
                      {c.assignedGyt ? 'hozzárendelve' : 'vár hozzárendelésre'}
                    </span>
                  </span>
                  <GytPicker assigned={c.assignedGyt} onAssign={(gyt) => assign(c.id, gyt)} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

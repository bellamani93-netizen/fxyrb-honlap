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

function SwitchToggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="switch-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch-toggle-track">
        <span className="switch-toggle-thumb" />
      </span>
      <span>{label}</span>
    </label>
  )
}

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="modal-backdrop-fyb" onClick={onCancel}>
      <div className="modal-fyb card-fyb" onClick={(e) => e.stopPropagation()}>
        <p className="mb-3">{message}</p>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn-fyb btn-fyb-ghost" onClick={onCancel}>mégse</button>
          <button type="button" className="btn-fyb btn-fyb-danger" onClick={onConfirm}>igen, nem fizetett be</button>
        </div>
      </div>
    </div>
  )
}

function formatStart(value: string) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}. ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

type FormState = {
  name: string
  email: string
  phone: string
  startTime: string
  gyt: string | null
  paid: boolean
}

const emptyForm: FormState = { name: '', email: '', phone: '', startTime: '', gyt: null, paid: false }

export default function SalesHozzarendeles() {
  const [clients, setClients] = useState<SalesClient[]>(initialSalesClients)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState('')
  const [unpayTargetId, setUnpayTargetId] = useState<string | null>(null)

  function setPaid(id: string, paid: boolean) {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, paid } : c)))
  }

  // a "befizetve" kapcsoló kikapcsolása visszavonhatatlan hatásúnak tűnhet (a GYT
  // naptárából eltűnik az időpont), ezért csak megerősítés után lehet visszakapcsolni;
  // bekapcsolni (nem fizetettről fizetettre) megerősítés nélkül lehet.
  function handleTogglePaid(client: SalesClient, next: boolean) {
    if (client.paid && !next) {
      setUnpayTargetId(client.id)
      return
    }
    setPaid(client.id, next)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.gyt) {
      setError('válassz gyógytornászt az ügyfélhez')
      return
    }
    setError('')
    setClients((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        startTime: form.startTime,
        assignedGyt: form.gyt,
        paid: form.paid,
      },
    ])
    setForm(emptyForm)
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

        <div className="card-fyb card-fyb-accent mb-4">
          <h2 className="h5 mb-3">új ügyfél felvétele</h2>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold" htmlFor="sales-name">név</label>
                <input
                  id="sales-name"
                  type="text"
                  className="form-control"
                  placeholder="Kovács Anna"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold" htmlFor="sales-email">e-mail</label>
                <input
                  id="sales-email"
                  type="email"
                  className="form-control"
                  placeholder="anna@pelda.hu"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold" htmlFor="sales-phone">telefonszám</label>
                <input
                  id="sales-phone"
                  type="tel"
                  className="form-control"
                  placeholder="+36 30 123 4567"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold" htmlFor="sales-start">kezdő időpont</label>
                <input
                  id="sales-start"
                  type="datetime-local"
                  className="form-control"
                  required
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <span className="form-label small fw-bold d-block">gyógytornász</span>
                <GytPicker assigned={form.gyt} onAssign={(gyt) => setForm({ ...form, gyt })} />
              </div>
              <div className="col-12 col-md-6">
                <span className="form-label small fw-bold d-block">befizetett</span>
                <SwitchToggle checked={form.paid} onChange={(paid) => setForm({ ...form, paid })} label={form.paid ? 'igen' : 'nem'} />
                <p className="small mb-0 mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  csak befizetés után jelenik meg az időpont a gyógytornász naptárában.
                </p>
              </div>
            </div>

            {error && (
              <p className="small mb-0 mt-3" style={{ color: 'var(--color-danger)' }}>{error}</p>
            )}

            <button type="submit" className="btn-fyb btn-fyb-primary mt-3">ügyfél felvétele</button>
          </form>
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
          <div
            className="d-none d-lg-flex align-items-center gap-3 pb-2 mb-1 small fw-bold text-uppercase"
            style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}
          >
            <span style={{ minWidth: '9rem' }}>név</span>
            <span style={{ minWidth: '11rem' }}>email</span>
            <span style={{ minWidth: '9rem' }}>kezdés</span>
            <span style={{ minWidth: '8rem' }}>gyógytornász</span>
            <span>befizetett</span>
          </div>

          {filtered.length === 0 ? (
            <p className="mb-0 text-center" style={{ color: 'var(--color-text-muted)' }}>nincs találat</p>
          ) : (
            filtered.map((c) => (
              <div key={c.id} className="py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <span className="fw-bold" style={{ minWidth: '9rem' }}>{c.name}</span>
                  <span className="small" style={{ color: 'var(--color-text-muted)', minWidth: '11rem' }}>{c.email}</span>
                  <span className="small" style={{ minWidth: '9rem' }}>{formatStart(c.startTime)}</span>
                  <span className="small" style={{ minWidth: '8rem', color: c.assignedGyt ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                    {c.assignedGyt ?? '—'}
                  </span>
                  <SwitchToggle checked={c.paid} onChange={(paid) => handleTogglePaid(c, paid)} label="befizetve" />
                </div>
              </div>
            ))
          )}
        </div>

        {unpayTargetId && (
          <ConfirmDialog
            message="Tényleg nem fizetett be?"
            onCancel={() => setUnpayTargetId(null)}
            onConfirm={() => {
              setPaid(unpayTargetId, false)
              setUnpayTargetId(null)
            }}
          />
        )}
      </div>
    </section>
  )
}

import { useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon'
import { GYT_STAFF, initialSalesClients, type SalesClient } from '../data/salesClients'
import { useAdminEditGuard, AdminModifiedBadge } from '../hooks/useAdminEditGuard'

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

// a lista "befizetve" mezője klasszikus pipálható négyzet (nem csúszka-kapcsoló) —
// az űrlap saját "befizetett" mezője továbbra is a SwitchToggle-t használja
function CheckboxToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <input
      type="checkbox"
      className="form-check-input"
      style={{ width: '1.4rem', height: '1.4rem', cursor: 'pointer', flexShrink: 0 }}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      aria-label="befizetve"
    />
  )
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="ügyfél törlése"
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
    >
      <Icon src="/icons/ikon_kuka.svg" className="sales-delete-icon" style={{ width: '1.4rem', height: '1.4rem' }} />
    </button>
  )
}

function ConfirmDialog({ message, confirmLabel, onConfirm, onCancel }: { message: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="modal-backdrop-fyb" onClick={onCancel}>
      <div className="modal-fyb card-fyb" onClick={(e) => e.stopPropagation()}>
        <p className="mb-3">{message}</p>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn-fyb btn-fyb-ghost" onClick={onCancel}>mégse</button>
          <button type="button" className="btn-fyb btn-fyb-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

type SortKey = 'name' | 'date' | 'gyt'
type SortState = { key: SortKey; dir: 'asc' | 'desc' } | null

function SortButton({ label, sortKey, current, onClick }: { label: string; sortKey: SortKey; current: SortState; onClick: (key: SortKey) => void }) {
  const active = current?.key === sortKey
  return (
    <button
      type="button"
      className="small fw-bold text-uppercase"
      onClick={() => onClick(sortKey)}
      style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer', color: 'var(--color-text-muted)', textAlign: 'left', justifySelf: 'start' }}
    >
      {label}
      {active ? (current!.dir === 'asc' ? ' ▲' : ' ▼') : ''}
    </button>
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

type PendingAction = { type: 'unpay' | 'delete'; client: SalesClient }

export default function SalesHozzarendeles() {
  const [clients, setClients] = useState<SalesClient[]>(initialSalesClients)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<FormState>(emptyForm)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [sort, setSort] = useState<SortState>(null)
  const { active: adminActive, guard: adminGuard, isModified, modal: adminModal } = useAdminEditGuard('sales')

  function toggleSort(key: SortKey) {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' }
      if (prev.dir === 'asc') return { key, dir: 'desc' }
      return null
    })
  }

  function setPaid(id: string, paid: boolean) {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, paid } : c)))
  }

  function deleteClient(id: string) {
    setClients((prev) => prev.filter((c) => c.id !== id))
  }

  // a "befizetve" kapcsoló/négyzet kikapcsolása visszavonhatatlan hatásúnak tűnhet (a GYT
  // naptárából eltűnik az időpont), ezért csak megerősítés után lehet visszakapcsolni;
  // bekapcsolni (nem fizetettről fizetettre) megerősítés nélkül lehet.
  function handleTogglePaid(client: SalesClient, next: boolean) {
    // admin-nézetben minden fizetés-váltás az egységes "biztosan módosítod?"
    // ablakon megy át (a domain-specifikus "Tényleg nem fizetett be?" ablak
    // helyett), és a sor piros "admin által módosítva" címkét kap
    if (adminActive) {
      adminGuard(`paid-${client.id}`, () => setPaid(client.id, next))
      return
    }
    if (client.paid && !next) {
      setPendingAction({ type: 'unpay', client })
      return
    }
    setPaid(client.id, next)
  }

  const formValid = Boolean(form.name.trim() && form.email.trim() && form.phone.trim() && form.startTime && form.gyt)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formValid) return
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

  const bySearch = clients.filter((c) => c.name.toLowerCase().includes(search.trim().toLowerCase()))

  const filtered = sort
    ? [...bySearch].sort((a, b) => {
        let cmp = 0
        if (sort.key === 'name') cmp = a.name.localeCompare(b.name, 'hu')
        else if (sort.key === 'date') cmp = a.startTime.localeCompare(b.startTime)
        else cmp = (a.assignedGyt ?? '').localeCompare(b.assignedGyt ?? '', 'hu')
        return sort.dir === 'asc' ? cmp : -cmp
      })
    // rendezés nélkül a legfrissebben hozzáadott ügyfél legyen a lista tetején
    // (a clients tömb hozzáadási sorrendben bővül, ezért ez egyszerű megfordítás)
    : [...bySearch].reverse()

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

            <button type="submit" className="btn-fyb btn-fyb-primary mt-3" disabled={!formValid}>ügyfél felvétele</button>
            {!formValid && (
              <p className="small mb-0 mt-2" style={{ color: 'var(--color-text-muted)' }}>
                a gombhoz minden mezőt ki kell tölteni (a "befizetett" kivételével).
              </p>
            )}
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
          {/* asztali/tablet fejléc */}
          <div
            className="sales-row-grid pb-2 mb-1 small fw-bold text-uppercase"
            style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}
          >
            <SortButton label="ügyfél" sortKey="name" current={sort} onClick={toggleSort} />
            <span>email</span>
            <SortButton label="kezdés" sortKey="date" current={sort} onClick={toggleSort} />
            <SortButton label="gyt" sortKey="gyt" current={sort} onClick={toggleSort} />
            <span>fizetve</span>
            <span />
          </div>

          {/* mobil fejléc — kevesebb oszlop, mert a név+dátum egy blokkba van vonva.
             A dátum szerinti rendezés itt nincs külön gombhoz kötve (nincs saját
             "kezdés" fejléc-cellája), de a rendezési állapot megosztott, ezért ha
             asztali nézetben aktiválva volt, mobilon is érvényben marad. */}
          <div
            className="sales-row-grid-mobile pb-2 mb-1 small fw-bold text-uppercase"
            style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}
          >
            <SortButton label="ügyfél" sortKey="name" current={sort} onClick={toggleSort} />
            <SortButton label="gyt" sortKey="gyt" current={sort} onClick={toggleSort} />
            <span>fizetve</span>
          </div>

          {filtered.length === 0 ? (
            <p className="mb-0 text-center" style={{ color: 'var(--color-text-muted)' }}>nincs találat</p>
          ) : (
            filtered.map((c) => (
              <div key={c.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                {/* asztali/tablet sor — valódi rács, hogy az oszlopok minden sorban egymás alá kerüljenek */}
                <div className="sales-row-grid py-2">
                  <span className="fw-bold">{c.name}</span>
                  <span className="small" style={{ color: 'var(--color-text-muted)' }}>{c.email}</span>
                  <span className="small">{formatStart(c.startTime)}</span>
                  <span className="small" style={{ color: c.assignedGyt ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                    {c.assignedGyt ?? '—'}
                  </span>
                  <CheckboxToggle checked={c.paid} onChange={(paid) => handleTogglePaid(c, paid)} />
                  <span className="sales-delete-cell">
                    {!c.paid && <DeleteButton onClick={() => setPendingAction({ type: 'delete', client: c })} />}
                  </span>
                </div>

                {/* mobil sor — név+dátum egy blokkban, mellette a gyógytornász, mellette a pipálható négyzet */}
                <div className="sales-row-grid-mobile py-2">
                  <span style={{ minWidth: 0 }}>
                    <span className="fw-bold d-block">{c.name}</span>
                    <span className="small d-block" style={{ color: 'var(--color-text-muted)' }}>{formatStart(c.startTime)}</span>
                  </span>
                  <span className="small" style={{ color: c.assignedGyt ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                    {c.assignedGyt ?? '—'}
                  </span>
                  <span className="sales-action-cell">
                    <CheckboxToggle checked={c.paid} onChange={(paid) => handleTogglePaid(c, paid)} />
                    {!c.paid && <DeleteButton onClick={() => setPendingAction({ type: 'delete', client: c })} />}
                  </span>
                </div>

                {isModified(`paid-${c.id}`) && (
                  <div className="pb-2" style={{ paddingLeft: '0.1rem' }}>
                    <AdminModifiedBadge />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {pendingAction && pendingAction.type === 'unpay' && (
          <ConfirmDialog
            message="Tényleg nem fizetett be?"
            confirmLabel="tényleg nem"
            onCancel={() => setPendingAction(null)}
            onConfirm={() => {
              setPaid(pendingAction.client.id, false)
              setPendingAction(null)
            }}
          />
        )}

        {pendingAction && pendingAction.type === 'delete' && (
          <ConfirmDialog
            message={`biztosan törölni szeretnéd "${pendingAction.client.name}" ügyfelet a rendszerből?`}
            confirmLabel="igen, törlöm"
            onCancel={() => setPendingAction(null)}
            onConfirm={() => {
              deleteClient(pendingAction.client.id)
              setPendingAction(null)
            }}
          />
        )}

        {adminModal}
      </div>
    </section>
  )
}

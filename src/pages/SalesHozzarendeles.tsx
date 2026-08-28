import { useState } from 'react'
import Icon from '../components/Icon'
import type { SalesClient } from '../data/salesClients'
import { AdminModifiedBadge } from '../hooks/useAdminEditGuard'
import { GYT_COLLEAGUES, addDays, formatDateOnly, getMondayOf } from '../data/calendarData'
import GytWeeklyCalendar from '../components/GytWeeklyCalendar'
import { useSalesData } from '../context/SalesDataContext'

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
  gytId: string | null
  startTime: string // csak a naptár-modalból tölthető ki, ld. lent
  paid: boolean
}

const emptyForm: FormState = { name: '', email: '', phone: '', gytId: null, startTime: '', paid: false }

type PendingAction = { type: 'unpay' | 'delete'; client: SalesClient }

type Tab = 'hozzarendeles' | 'gyt'

export default function SalesHozzarendeles() {
  const {
    clients,
    setClients,
    getEffectiveSlot,
    addBooking,
    today,
    adminActive,
    adminGuard,
    isModified,
    adminAddedIds,
    markAdminAdded,
    openBookingModal,
  } = useSalesData()

  const [search, setSearch] = useState('')
  const [form, setForm] = useState<FormState>(emptyForm)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [sort, setSort] = useState<SortState>(null)

  const [tab, setTab] = useState<Tab>('hozzarendeles')
  // az űrlapból választott, de MÉG BE NEM KÜLDÖTT foglalás — csak a tényleges
  // "ügyfél felvétele" gombnyomáskor válik valódi (naptárban is látszó)
  // foglalássá, hogy egy félbehagyott/törölt űrlap ne foglaljon le hiába egy sávot
  const [pendingFormSlot, setPendingFormSlot] = useState<{ gytId: string; dateISO: string; hour: number } | null>(null)
  const [calSelectedGyt, setCalSelectedGyt] = useState<string | null>(null) // null = összesített nézet
  const [weekOffset, setWeekOffset] = useState<0 | 1>(0)

  const weekStart = addDays(getMondayOf(today), weekOffset * 7)

  function openFormBookingModal() {
    openBookingModal({
      clientPreview: form.name.trim() ? { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() } : undefined,
      preselectedGytId: calSelectedGyt,
      onConfirm: (slot) => {
        setForm((prev) => ({ ...prev, gytId: slot.gytId, startTime: `${slot.dateISO}T${String(slot.hour).padStart(2, '0')}:00` }))
        setPendingFormSlot({ gytId: slot.gytId, dateISO: slot.dateISO, hour: slot.hour })
      },
    })
  }

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

  const formGytName = GYT_COLLEAGUES.find((g) => g.id === form.gytId)?.name ?? null
  const formValid = Boolean(form.name.trim() && form.email.trim() && form.phone.trim() && form.startTime && form.gytId)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formValid || !pendingFormSlot) return
    const id = `${Date.now()}`
    setClients((prev) => [
      ...prev,
      {
        id,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        startTime: form.startTime,
        assignedGyt: formGytName,
        paid: form.paid,
      },
    ])
    addBooking(pendingFormSlot.gytId, pendingFormSlot.dateISO, pendingFormSlot.hour, `${form.name.trim()} 1`)
    if (adminActive) markAdminAdded(id)
    setForm(emptyForm)
    setPendingFormSlot(null)
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

        <div className="auth-tabs mb-4">
          <button type="button" className={`auth-tab ${tab === 'hozzarendeles' ? 'active' : ''}`} onClick={() => setTab('hozzarendeles')}>
            ügyfelek
          </button>
          <button type="button" className={`auth-tab ${tab === 'gyt' ? 'active' : ''}`} onClick={() => setTab('gyt')}>
            gyt naptárak
          </button>
        </div>

        {tab === 'hozzarendeles' && (
        <>
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
              <div className="col-12">
                <span className="form-label small fw-bold d-block">gyógytornász és időpont</span>
                {form.gytId && form.startTime ? (
                  <div className="d-flex align-items-center flex-wrap gap-2">
                    <span className="fw-bold">{formGytName}</span>
                    <span className="small" style={{ color: 'var(--color-text-muted)' }}>{formatStart(form.startTime)}</span>
                    <button
                      type="button"
                      className="btn-fyb btn-fyb-ghost"
                      style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}
                      onClick={openFormBookingModal}
                    >
                      módosítás
                    </button>
                  </div>
                ) : (
                  <button type="button" className="btn-fyb btn-fyb-outline" onClick={openFormBookingModal}>
                    időpont választása a naptárból
                  </button>
                )}
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

                {(adminAddedIds.has(c.id) || isModified(`paid-${c.id}`)) && (
                  <div className="pb-2 d-flex flex-wrap gap-2" style={{ paddingLeft: '0.1rem' }}>
                    {adminAddedIds.has(c.id) && <AdminModifiedBadge label="admin által felvéve" />}
                    {isModified(`paid-${c.id}`) && <AdminModifiedBadge />}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        </>
        )}

        {tab === 'gyt' && (
          <div className="card-fyb">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
              <div className="auth-tabs" style={{ flexWrap: 'wrap' }}>
                <button type="button" className={`auth-tab ${calSelectedGyt === null ? 'active' : ''}`} onClick={() => setCalSelectedGyt(null)}>
                  összes
                </button>
                {GYT_COLLEAGUES.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className={`auth-tab ${calSelectedGyt === g.id ? 'active' : ''}`}
                    onClick={() => setCalSelectedGyt(g.id)}
                  >
                    {g.name}
                  </button>
                ))}
              </div>

              <div className="d-flex align-items-center gap-2">
                <button type="button" className="btn-fyb btn-fyb-ghost" disabled={weekOffset === 0} onClick={() => setWeekOffset(0)}>
                  ‹ ez a hét
                </button>
                <span className="small fw-bold">
                  {formatDateOnly(weekStart)} – {formatDateOnly(addDays(weekStart, 6))}
                </span>
                <button type="button" className="btn-fyb btn-fyb-ghost" disabled={weekOffset === 1} onClick={() => setWeekOffset(1)}>
                  következő hét ›
                </button>
              </div>
            </div>

            {/* ez a fül csak KAPACITÁS-áttekintő — nincs kattintható szabad sáv itt,
               a tényleges foglalás mindig a "hívásaim" oldal hívás-kártyáról vagy
               az "új ügyfél felvétele" űrlapról indul (ugyanazzal a modallal) */}
            <GytWeeklyCalendar
              weekStart={weekStart}
              today={today}
              gytList={GYT_COLLEAGUES}
              selectedGytId={calSelectedGyt}
              getSlot={getEffectiveSlot}
            />
            <p className="small mt-3 mb-0" style={{ color: 'var(--color-text-muted)' }}>
              ez a nézet csak áttekintő — időpontot a "hívásaim" oldalon egy hívásnál, vagy az "új ügyfél felvétele" űrlapon lehet lefoglalni.
            </p>
          </div>
        )}

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
      </div>
    </section>
  )
}

import { useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon'
import { DEFAULT_VARIABLES, type Client } from '../data/initialClients'
import { AdminModifiedBadge } from '../hooks/useAdminEditGuard'
import { BUSINESS_HOURS, GYT_COLLEAGUES, addDays, formatDateOnly, getMondayOf, gytColorVar, type SalesCall } from '../data/calendarData'
import GytWeeklyCalendar from '../components/GytWeeklyCalendar'
import AppointmentEditorModal, { type AppointmentEditorInitial, type AppointmentEditorResult, type ConflictInfo } from '../components/AppointmentEditorModal'
import { useSalesData } from '../context/SalesDataContext'

// "adatok importálása" legördülő — a "hívásaim" oldalról érkezett, MÉG NEM
// GYT-hez rendelt hívások neveit listázza, hogy egy kattintással átvehető
// legyen a Calendly-ből már ismert név/email/telefon (2026.08.28., 4. kör)
function ImportCallDropdown({ calls, onSelect }: { calls: SalesCall[]; onSelect: (call: SalesCall) => void }) {
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
      <button type="button" className="btn-fyb btn-fyb-outline" style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }} onClick={() => setOpen((o) => !o)}>
        adatok importálása
      </button>
      {open && (
        <ul className="level-select-menu">
          {calls.length === 0 ? (
            <li className="px-3 py-2 small" style={{ color: 'var(--color-text-muted)' }}>nincs importálható hívás</li>
          ) : (
            calls.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className="level-select-item"
                  onClick={() => {
                    onSelect(c)
                    setOpen(false)
                  }}
                >
                  <span>{c.name}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

// mobil nézetben a gyt-választó pirula-sor helyett egy kompakt legördülő
// (2026.08.28., 7. kör, Marci kérésére) — a "+" gomb mellé kerül, felül
function MobileGytPicker({ value, onChange, gytList }: { value: string | null; onChange: (id: string | null) => void; gytList: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const currentLabel = value === null ? 'összes' : gytList.find((g) => g.id === value)?.name ?? 'összes'

  return (
    <div className={`level-select mobile-gyt-picker ${open ? 'is-open' : ''}`} ref={ref}>
      <button type="button" className="level-select-toggle" onClick={() => setOpen((o) => !o)}>
        <span>{currentLabel}</span>
        <span className="level-select-chevron">▾</span>
      </button>
      {open && (
        <ul className="level-select-menu">
          <li>
            <button type="button" className={`level-select-item ${value === null ? 'is-selected' : ''}`} onClick={() => { onChange(null); setOpen(false) }}>
              <span>összes</span>
            </button>
          </li>
          {gytList.map((g) => (
            <li key={g.id}>
              <button type="button" className={`level-select-item ${value === g.id ? 'is-selected' : ''}`} onClick={() => { onChange(g.id); setOpen(false) }}>
                <span>{g.name}</span>
                <span className="auth-tab-color-dot" style={{ backgroundColor: gytColorVar(g.id) }} />
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

function formatStart(value: string | undefined) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}. ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// az összevont Client típuson mostantól nincs külön "assignedGyt" névmező,
// csak "assignedGytId" — a megjelenített nevet innen vezetjük le (2026.09.01.,
// ügyfél-nyilvántartások összevonása, ld. Design jegyzet 49. pont).
function gytNameFor(assignedGytId: string | undefined): string | null {
  return GYT_COLLEAGUES.find((g) => g.id === assignedGytId)?.name ?? null
}

type FormState = {
  name: string
  email: string
  phone: string
  gytId: string | null
  startTime: string // csak a naptárból választható ki, ld. lent
  paid: boolean
}

const emptyForm: FormState = { name: '', email: '', phone: '', gytId: null, startTime: '', paid: false }

type PendingAction = { type: 'unpay' | 'delete'; client: Client }

type Tab = 'hozzarendeles' | 'gyt'
// ha van clientId, egy MEGLÉVŐ (valódi) foglalás szerkesztése folyik, egyébként
// egy teljesen új időpont létrehozása (2026.08.28., 6. kör)
type BookingEditorTarget = { initial: AppointmentEditorInitial; clientId?: string }

export default function SalesHozzarendeles() {
  const {
    clients,
    setClients,
    salesCalls,
    setSalesCalls,
    getEffectiveSlot,
    getBookingClientId,
    addBooking,
    removeBooking,
    today,
    adminActive,
    adminGuard,
    isModified,
    adminAddedIds,
    markAdminAdded,
  } = useSalesData()

  const [search, setSearch] = useState('')
  const [form, setForm] = useState<FormState>(emptyForm)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [sort, setSort] = useState<SortState>(null)
  // ha az űrlap adatai egy "hívásaim"-beli hívásból lettek importálva, ennek
  // az id-ja itt van, hogy a beküldéskor a forrás-hívást is meg lehessen
  // jelölni "hozzárendelve"-ként (ld. handleSubmit)
  const [importedCallId, setImportedCallId] = useState<string | null>(null)

  const [tab, setTab] = useState<Tab>('hozzarendeles')
  // az űrlapból választott, de MÉG BE NEM KÜLDÖTT foglalás — csak a tényleges
  // "ügyfél felvétele" gombnyomáskor válik valódi (naptárban is látszó)
  // foglalássá, hogy egy félbehagyott/törölt űrlap ne foglaljon le hiába egy sávot
  const [pendingFormSlot, setPendingFormSlot] = useState<{ gytId: string; dateISO: string; hour: number } | null>(null)
  const [calSelectedGyt, setCalSelectedGyt] = useState<string | null>(null) // null = összesített nézet
  const [weekOffset, setWeekOffset] = useState<0 | 1>(0)
  // "időpont választása a naptárból" mostantól ténylegesen átvált a "gyt
  // naptárak" fülre, "kiválasztás módban" (2026.08.28., 6. kör, Marci
  // kérésére — a korábbi, szöveges listás popup helyett a vizuális rácson
  // lehet kattintva választani)
  const [pickingMode, setPickingMode] = useState(false)
  const [bookingEditor, setBookingEditor] = useState<BookingEditorTarget | null>(null)

  const weekStart = addDays(getMondayOf(today), weekOffset * 7)

  // csak a MÉG NEM gyt-hez rendelt hívások importálhatók; a legelső a "most"-
  // hoz (abszolút időkülönbségben) legközelebbi hívás, utána a TÖBBI időrendben,
  // az egyre régebbiek felé (Marci pontos specifikációja) — ez a 2 lépés azért
  // különbözik egy sima csökkenő rendezéstől, mert ha van jövőbeli hívás is a
  // listában, egy távoli jövőbeli időpont sima időrendi rendezésnél az összes
  // közelmúltbeli elé kerülne, holott nem az van "legközelebb a mosthoz"
  const unassignedCalls = salesCalls.filter((c) => c.status === 'var_gyt_re')
  const nowMs = today.getTime()
  const callMs = (c: SalesCall) => new Date(c.callTime).getTime()
  const importableCalls: SalesCall[] = (() => {
    if (unassignedCalls.length === 0) return []
    const closest = [...unassignedCalls].sort((a, b) => Math.abs(callMs(a) - nowMs) - Math.abs(callMs(b) - nowMs))[0]
    const rest = unassignedCalls.filter((c) => c.id !== closest.id).sort((a, b) => callMs(b) - callMs(a))
    return [closest, ...rest]
  })()

  function handleImportCall(call: SalesCall) {
    setForm((prev) => ({ ...prev, name: call.name, email: call.email, phone: call.phone }))
    setImportedCallId(call.id)
  }

  function startPicking() {
    setPickingMode(true)
    setTab('gyt')
  }

  function goToUgyfelek() {
    setPickingMode(false)
    setTab('hozzarendeles')
  }

  function handleFreeSlotClick(gytId: string, _gytName: string, dateISO: string, hour: number) {
    if (pickingMode) {
      setForm((prev) => ({ ...prev, gytId, startTime: `${dateISO}T${String(hour).padStart(2, '0')}:00` }))
      setPendingFormSlot({ gytId, dateISO, hour })
      goToUgyfelek()
      return
    }
    setBookingEditor({ initial: { dateISO, hour, gytId } })
  }

  // meglévő sávra kattintva csak akkor nyitjuk a szerkesztőt, ha VALÓDI
  // (session alatt létrehozott) foglalásról van szó — a demó-adat generált
  // "foglalt" sávjai mögött nincs valódi ügyfél-rekord, azokat nem lehet
  // megnyitni (ld. SalesDataContext.tsx getBookingClientId dokumentációja)
  function handleBookedSlotClick(gytId: string, dateISO: string, hour: number) {
    const clientId = getBookingClientId(gytId, dateISO, hour)
    if (!clientId) return
    const client = clients.find((c) => c.id === clientId)
    if (!client) return
    setBookingEditor({
      clientId,
      initial: { dateISO, hour, gytId, name: client.name, email: client.email, phone: client.phone, note: client.note },
    })
  }

  // a "+" gomb mostantól csak a "gyt naptárak" fülre vált (2026.08.28., 7. kör,
  // Marci kérésére) — a tényleges létrehozás onnan, egy konkrét sávra kattintva
  // indul (ugyanaz az élmény, mint amikor valaki magától nyitja meg a naptárat)
  function openNewBookingEditor() {
    setTab('gyt')
  }

  // "booking" módban egy ütközés VALÓDI (blokkoló, nem felülbírálható) —
  // egy GYT fizikailag nem lehet két helyen egyszerre. A "szabad" jelzésű
  // sávok nem számítanak ütközésnek (ld. getEffectiveSlot 'szabad' ága).
  // Ha épp ugyanazt a foglalást szerkesztjük ugyanarra a helyre (nincs
  // változás), nem önmagával ütközik. Mivel egy nem kerek órakor kezdődő
  // időpont vizuálisan átlóg a szomszédos órás sávba is (ld.
  // GytWeeklyCalendar verticalOffsetPct), a KÖVETKEZŐ órát (ha az új
  // időpont maga lóg bele) és az ELŐZŐ órát (ha ANNAK van olyan perce,
  // amivel EBBE lóg) is figyelembe vesszük (2026.09.01., Marci kérésére).
  function checkBookingConflict(dateISO: string, hour: number, gytIdOrNull: string | null, minute: number): ConflictInfo | null {
    if (!gytIdOrNull) return null
    const gytId = gytIdOrNull
    function slotConflict(h: number): ConflictInfo | null {
      if (
        bookingEditor?.clientId &&
        bookingEditor.initial.gytId === gytId &&
        bookingEditor.initial.dateISO === dateISO &&
        bookingEditor.initial.hour === h
      ) {
        return null
      }
      const slot = getEffectiveSlot(gytId, dateISO, h)
      if (slot.status === 'foglalt') return { name: slot.label ?? 'foglalt', hour: h }
      return null
    }
    const own = slotConflict(hour)
    if (own) return own
    if (minute && BUSINESS_HOURS.includes(hour + 1)) {
      const next = slotConflict(hour + 1)
      if (next) return next
    }
    if (BUSINESS_HOURS.includes(hour - 1)) {
      const isSelf =
        bookingEditor?.clientId &&
        bookingEditor.initial.gytId === gytId &&
        bookingEditor.initial.dateISO === dateISO &&
        bookingEditor.initial.hour === hour - 1
      const prevSlot = getEffectiveSlot(gytId, dateISO, hour - 1)
      if (!isSelf && prevSlot.status === 'foglalt' && prevSlot.minute) {
        return { name: prevSlot.label ?? 'foglalt', hour: hour - 1 }
      }
    }
    return null
  }

  function handleSaveBooking(data: AppointmentEditorResult) {
    if (!data.gytId) return
    const gytId = data.gytId
    const startTime = `${data.dateISO}T${String(data.hour).padStart(2, '0')}:${String(data.minute).padStart(2, '0')}`

    if (bookingEditor?.clientId) {
      // meglévő foglalás szerkesztése: ha a gyt/dátum/óra változott, a régi
      // naptár-sávot fel kell szabadítani, mielőtt az újat lefoglalnánk
      const prevInitial = bookingEditor.initial
      if (prevInitial.gytId && (prevInitial.gytId !== gytId || prevInitial.dateISO !== data.dateISO || prevInitial.hour !== data.hour)) {
        removeBooking(prevInitial.gytId, prevInitial.dateISO, prevInitial.hour)
      }
      addBooking(gytId, data.dateISO, data.hour, `${data.name} 1`, bookingEditor.clientId)
      setClients((prev) =>
        prev.map((c) =>
          c.id === bookingEditor.clientId
            ? { ...c, name: data.name, email: data.email, phone: data.phone, note: data.note || undefined, startTime, assignedGytId: gytId }
            : c
        )
      )
    } else {
      const id = `${Date.now()}`
      // "isNew" + "variables" alapérték: hogy a frissen felvett ügyfél a GYT
      // "ügyfeleim" listájában azonnal "új"-ként (lime jelöléssel) jelenjen
      // meg, és az állapotfelmérő panel se találjon hiányzó bejegyzést
      // (2026.09.01., ügyfél-nyilvántartások összevonása).
      setClients((prev) => [
        ...prev,
        { id, name: data.name, email: data.email, phone: data.phone, note: data.note || undefined, startTime, assignedGytId: gytId, isNew: true, paid: false, variables: DEFAULT_VARIABLES },
      ])
      addBooking(gytId, data.dateISO, data.hour, `${data.name} 1`, id)
      if (adminActive) markAdminAdded(id)
    }
    setBookingEditor(null)
  }

  function handleDeleteBooking() {
    if (!bookingEditor?.clientId) return
    const { gytId, dateISO, hour } = bookingEditor.initial
    if (gytId) removeBooking(gytId, dateISO, hour)
    setClients((prev) => prev.filter((c) => c.id !== bookingEditor.clientId))
    setBookingEditor(null)
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
  function handleTogglePaid(client: Client, next: boolean) {
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
        assignedGytId: form.gytId ?? undefined,
        isNew: true,
        paid: form.paid,
        variables: DEFAULT_VARIABLES,
      },
    ])
    addBooking(pendingFormSlot.gytId, pendingFormSlot.dateISO, pendingFormSlot.hour, `${form.name.trim()} 1`, id)
    if (adminActive) markAdminAdded(id)
    if (importedCallId) {
      setSalesCalls((prev) =>
        prev.map((c) =>
          c.id === importedCallId
            ? { ...c, status: 'hozzarendelve', assignedGyt: formGytName ?? undefined, assignedGytId: pendingFormSlot.gytId, assignedStart: form.startTime, assignedClientId: id }
            : c
        )
      )
    }
    setForm(emptyForm)
    setPendingFormSlot(null)
    setImportedCallId(null)
  }

  const pendingCount = clients.filter((c) => !c.assignedGytId).length

  const bySearch = clients.filter((c) => c.name.toLowerCase().includes(search.trim().toLowerCase()))

  const filtered = sort
    ? [...bySearch].sort((a, b) => {
        let cmp = 0
        if (sort.key === 'name') cmp = a.name.localeCompare(b.name, 'hu')
        else if (sort.key === 'date') cmp = (a.startTime ?? '').localeCompare(b.startTime ?? '')
        else cmp = (gytNameFor(a.assignedGytId) ?? '').localeCompare(gytNameFor(b.assignedGytId) ?? '', 'hu')
        return sort.dir === 'asc' ? cmp : -cmp
      })
    // rendezés nélkül a legfrissebben hozzáadott ügyfél legyen a lista tetején
    // (a clients tömb hozzáadási sorrendben bővül, ezért ez egyszerű megfordítás)
    : [...bySearch].reverse()

  return (
    <section className="py-3 py-lg-5">
      {/* a "gyt naptárak" fülön a teljes rendelkezésre álló szélességet
         használjuk (2026.08.28., 7. kör, Marci kérésére — csak minimális
         szélső margóval), az "ügyfelek" fül megtartja az olvasható
         max-szélességet (form + lista) */}
      <div className="container-fluid" style={{ maxWidth: tab === 'gyt' ? undefined : 900 }}>
        <div className="app-page-header mb-3">
          <h1 className="app-page-title mb-0">ügyfél–GYT hozzárendelés</h1>
        </div>

        <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
          <div className="auth-tabs">
            <button type="button" className={`auth-tab ${tab === 'hozzarendeles' ? 'active' : ''}`} onClick={goToUgyfelek}>
              ügyfelek
            </button>
            <button type="button" className={`auth-tab ${tab === 'gyt' ? 'active' : ''}`} onClick={() => setTab('gyt')}>
              gyt naptárak
            </button>
          </div>
          <button
            type="button"
            className="circle-icon-btn circle-icon-btn--add"
            aria-label="új időpont létrehozása"
            onClick={openNewBookingEditor}
          >
            +
          </button>
          {/* mobilon a gyt-választó pirula-sor helyett ez a kompakt legördülő
             kerül a "+" mellé (2026.08.28., 7. kör) — a pirula-sor ilyenkor
             lent (a naptár fölött) rejtve marad, ld. d-none d-lg-flex ott */}
          {tab === 'gyt' && (
            <div className="d-lg-none">
              <MobileGytPicker value={calSelectedGyt} onChange={setCalSelectedGyt} gytList={GYT_COLLEAGUES} />
            </div>
          )}
        </div>

        {tab === 'hozzarendeles' && (
        <>
        <div className="card-fyb card-fyb-accent mb-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <h2 className="h5 mb-0">új ügyfél felvétele</h2>
            <ImportCallDropdown calls={importableCalls} onSelect={handleImportCall} />
          </div>
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
                      onClick={startPicking}
                    >
                      módosítás
                    </button>
                  </div>
                ) : (
                  <button type="button" className="btn-fyb btn-fyb-outline" onClick={startPicking}>
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
                  <span className="small" style={{ color: c.assignedGytId ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                    {gytNameFor(c.assignedGytId) ?? '—'}
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
                  <span className="small" style={{ color: c.assignedGytId ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                    {gytNameFor(c.assignedGytId) ?? '—'}
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
            {pickingMode && (
              <div className="picking-mode-banner mb-3">
                <span>válassz egy szabad időpontot <strong>{form.name.trim() || 'az ügyfélnek'}</strong> számára</span>
                <button type="button" className="btn-fyb btn-fyb-outline" style={{ padding: '0.3rem 0.9rem', fontSize: '0.8rem' }} onClick={goToUgyfelek}>
                  mégse
                </button>
              </div>
            )}

            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
              <div className="auth-tabs d-none d-lg-flex" style={{ flexWrap: 'wrap' }}>
                <button type="button" className={`auth-tab ${calSelectedGyt === null ? 'active' : ''}`} onClick={() => setCalSelectedGyt(null)}>
                  összes
                </button>
                {GYT_COLLEAGUES.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className={`auth-tab auth-tab--proper-case ${calSelectedGyt === g.id ? 'active' : ''}`}
                    onClick={() => setCalSelectedGyt(g.id)}
                  >
                    {g.name}
                    <span className="auth-tab-color-dot" style={{ backgroundColor: gytColorVar(g.id) }} />
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

            <GytWeeklyCalendar
              weekStart={weekStart}
              today={today}
              gytList={GYT_COLLEAGUES}
              selectedGytId={calSelectedGyt}
              getSlot={getEffectiveSlot}
              onFreeSlotClick={handleFreeSlotClick}
              onBookedSlotClick={pickingMode ? undefined : handleBookedSlotClick}
            />
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

        {bookingEditor && (
          <AppointmentEditorModal
            mode="booking"
            isEditing={Boolean(bookingEditor.clientId)}
            initial={bookingEditor.initial}
            gytOptions={GYT_COLLEAGUES}
            checkConflict={checkBookingConflict}
            onSave={handleSaveBooking}
            onDelete={bookingEditor.clientId ? handleDeleteBooking : undefined}
            onClose={() => setBookingEditor(null)}
          />
        )}
      </div>
    </section>
  )
}

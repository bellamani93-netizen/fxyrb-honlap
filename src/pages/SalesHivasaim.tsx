import { useState } from 'react'
import { addDays, formatDateOnly, formatISODate, getMondayOf, type SalesCall, type TimeSlot } from '../data/calendarData'
import GytWeeklyCalendar from '../components/GytWeeklyCalendar'
import { useSalesData } from '../context/SalesDataContext'
import type { PickedSlot } from '../components/GytBookingModal'

const OWN_ID = 'sajat'
const OWN_LIST = [{ id: OWN_ID, name: 'saját hívásaim' }]

function formatStart(value: string) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}. ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function telHref(phone: string) {
  return `tel:${phone.replace(/\s+/g, '')}`
}

type SubView = 'mai' | 'naptar'

export default function SalesHivasaim() {
  const { salesCalls, setSalesCalls, setClients, addBooking, today, adminActive, markAdminAdded, openBookingModal } = useSalesData()
  const [view, setView] = useState<SubView>('mai')
  const [weekOffset, setWeekOffset] = useState<0 | 1>(0)

  const weekStart = addDays(getMondayOf(today), weekOffset * 7)
  const todayISO = formatISODate(today)
  const todaysCalls = salesCalls.filter((c) => c.callTime.startsWith(todayISO))

  function getOwnSlot(_id: string, dateISO: string, hour: number): TimeSlot {
    const match = salesCalls.find((c) => c.callTime.startsWith(`${dateISO}T${String(hour).padStart(2, '0')}`))
    return match ? { hour, status: 'foglalt', label: match.name } : { hour }
  }

  // a hívás-kártyáról induló foglalás AZONNAL létrehozza az ügyfelet + a
  // naptár-sávot is (minden adat — név/email/telefon — már megvan a
  // Calendly-hívásból, nincs mit "beküldeni" utólag, ellentétben az "új
  // ügyfél felvétele" űrlappal, ld. SalesHozzarendeles.tsx)
  function handleCallBookingConfirm(call: SalesCall, slot: PickedSlot) {
    const startTime = `${slot.dateISO}T${String(slot.hour).padStart(2, '0')}:00`
    addBooking(slot.gytId, slot.dateISO, slot.hour, `${call.name} 1`)
    const newId = `${Date.now()}`
    setClients((prev) => [
      ...prev,
      { id: newId, name: call.name, email: call.email, phone: call.phone, startTime, assignedGyt: slot.gytName, paid: false },
    ])
    if (adminActive) markAdminAdded(newId)
    setSalesCalls((prev) =>
      prev.map((c) => (c.id === call.id ? { ...c, status: 'hozzarendelve', assignedGyt: slot.gytName, assignedStart: startTime } : c))
    )
  }

  function bookForCall(call: SalesCall) {
    openBookingModal({
      clientPreview: { name: call.name, email: call.email, phone: call.phone },
      onConfirm: (slot) => handleCallBookingConfirm(call, slot),
    })
  }

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 900 }}>
        <div className="app-page-header mb-3">
          <h1 className="app-page-title mb-0">hívásaim</h1>
        </div>

        <p className="mb-3" style={{ color: 'var(--color-text-muted)' }}>
          a Calendly-foglalásokból érkező sales-hívások — a Calendly már megadja az ügyfél nevét, e-mailjét és telefonszámát, ezt egy kattintással viheted át a gyógytornász naptárába.
        </p>

        <div className="auth-tabs mb-4">
          <button type="button" className={`auth-tab ${view === 'mai' ? 'active' : ''}`} onClick={() => setView('mai')}>
            mai hívások
          </button>
          <button type="button" className={`auth-tab ${view === 'naptar' ? 'active' : ''}`} onClick={() => setView('naptar')}>
            naptár
          </button>
        </div>

        {view === 'mai' && (
          <div className="card-fyb">
            <div
              className="call-row-grid pb-2 mb-1 small fw-bold text-uppercase"
              style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}
            >
              <span>ügyfél</span>
              <span>email</span>
              <span>telefon</span>
              <span>hívás időpontja</span>
              <span>állapot</span>
            </div>

            {todaysCalls.length === 0 ? (
              <p className="mb-0 text-center" style={{ color: 'var(--color-text-muted)' }}>ma nincs hívás.</p>
            ) : (
              todaysCalls.map((call) => (
                <CallRow key={call.id} call={call} onBook={() => bookForCall(call)} />
              ))
            )}
          </div>
        )}

        {view === 'naptar' && (
          <div className="card-fyb">
            <div className="d-flex align-items-center justify-content-end gap-2 mb-3">
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

            <GytWeeklyCalendar
              weekStart={weekStart}
              today={today}
              gytList={OWN_LIST}
              selectedGytId={OWN_ID}
              getSlot={getOwnSlot}
            />
          </div>
        )}
      </div>
    </section>
  )
}

function CallRow({ call, onBook }: { call: SalesCall; onBook: () => void }) {
  return (
    <div className="py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <div className="call-row-grid">
        <span className="fw-bold">{call.name}</span>
        <span className="small" style={{ color: 'var(--color-text-muted)' }}>{call.email}</span>
        <a href={telHref(call.phone)} className="small" style={{ color: 'var(--color-primary)' }}>{call.phone}</a>
        <span className="small">{formatStart(call.callTime)}</span>
        {call.status === 'hozzarendelve' ? (
          <span className="small" style={{ color: 'var(--color-text-muted)' }}>
            hozzárendelve: {call.assignedGyt}, {formatStart(call.assignedStart ?? '')}
          </span>
        ) : (
          <button
            type="button"
            className="btn-fyb btn-fyb-primary"
            style={{ padding: '0.35rem 0.9rem', fontSize: '0.8rem', justifySelf: 'start' }}
            onClick={onBook}
          >
            GYT-időpont foglalása
          </button>
        )}
      </div>

      <div className="d-lg-none">
        <span className="fw-bold d-block">{call.name}</span>
        <span className="small d-block" style={{ color: 'var(--color-text-muted)' }}>{call.email}</span>
        <a href={telHref(call.phone)} className="small d-block mb-2" style={{ color: 'var(--color-primary)' }}>{call.phone}</a>
        <span className="small d-block mb-2" style={{ color: 'var(--color-text-muted)' }}>hívás: {formatStart(call.callTime)}</span>
        {call.status === 'hozzarendelve' ? (
          <span className="small" style={{ color: 'var(--color-text-muted)' }}>
            hozzárendelve: {call.assignedGyt}, {formatStart(call.assignedStart ?? '')}
          </span>
        ) : (
          <button
            type="button"
            className="btn-fyb btn-fyb-primary"
            style={{ padding: '0.35rem 0.9rem', fontSize: '0.8rem' }}
            onClick={onBook}
          >
            GYT-időpont foglalása
          </button>
        )}
      </div>
    </div>
  )
}

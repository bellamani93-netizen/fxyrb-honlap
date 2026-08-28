import { useState } from 'react'
import { addDays, formatDateOnly, formatISODate, getMondayOf, type SalesCall, type SalesCallOutcome, type TimeSlot } from '../data/calendarData'
import GytWeeklyCalendar from '../components/GytWeeklyCalendar'
import CallDetailModal from '../components/CallDetailModal'
import Icon from '../components/Icon'
import { useSalesData } from '../context/SalesDataContext'
import type { PickedSlot } from '../components/GytBookingModal'

const OWN_ID = 'sajat'
const OWN_LIST = [{ id: OWN_ID, name: 'saját hívásaim' }]

function formatTime(value: string) {
  const t = value.split('T')[1]
  return t ? t.slice(0, 5) : '—'
}

function telHref(phone: string) {
  return `tel:${phone.replace(/\s+/g, '')}`
}

function OutcomeBadge({ outcome }: { outcome?: SalesCallOutcome }) {
  if (!outcome) return null
  return (
    <span className={`call-outcome-badge call-outcome-badge--${outcome === 'rendben' ? 'success' : 'warning'}`}>
      {outcome === 'rendben' ? 'rendben' : 'nem jött'}
    </span>
  )
}

function GearButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="circle-icon-btn circle-icon-btn--gear" aria-label="hívás módosítása" onClick={onClick}>
      <Icon src="/icons/ikon_beallitasok.svg" style={{ width: '1.1rem', height: '1.1rem' }} />
    </button>
  )
}

type SubView = 'mai' | 'naptar'

export default function SalesHivasaim() {
  const {
    salesCalls,
    setSalesCalls,
    setClients,
    addBooking,
    removeBooking,
    today,
    adminActive,
    markAdminAdded,
    openBookingModal,
  } = useSalesData()
  const [view, setView] = useState<SubView>('mai')
  const [weekOffset, setWeekOffset] = useState<0 | 1>(0)
  const [modifyingCall, setModifyingCall] = useState<SalesCall | null>(null)
  const [previewCall, setPreviewCall] = useState<SalesCall | null>(null)

  const weekStart = addDays(getMondayOf(today), weekOffset * 7)
  const todayISO = formatISODate(today)
  const todaysCalls = salesCalls.filter((c) => c.callTime.startsWith(todayISO))

  function findCallAt(dateISO: string, hour: number) {
    return salesCalls.find((c) => c.callTime.startsWith(`${dateISO}T${String(hour).padStart(2, '0')}`))
  }

  function getOwnSlot(_id: string, dateISO: string, hour: number): TimeSlot {
    const match = findCallAt(dateISO, hour)
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
      prev.map((c) =>
        c.id === call.id
          ? { ...c, status: 'hozzarendelve', assignedGyt: slot.gytName, assignedGytId: slot.gytId, assignedStart: startTime, assignedClientId: newId }
          : c
      )
    )
  }

  function bookForCall(call: SalesCall) {
    openBookingModal({
      clientPreview: { name: call.name, email: call.email, phone: call.phone },
      onConfirm: (slot) => handleCallBookingConfirm(call, slot),
    })
  }

  function handleSetOutcome(callId: string, outcome: SalesCallOutcome) {
    setSalesCalls((prev) => prev.map((c) => (c.id === callId ? { ...c, outcome } : c)))
  }

  // piros gomb: ha a hívás már foglalt GYT-időponttal járt, azt a naptár-
  // sávot és a belőle létrehozott ügyfelet is töröljük — nem maradhat "árva"
  // foglalás egy elutasított hívás mögött
  function handleReject(call: SalesCall) {
    if (call.assignedGytId && call.assignedStart && call.assignedClientId) {
      const [dateISO, hm] = call.assignedStart.split('T')
      removeBooking(call.assignedGytId, dateISO, Number(hm.split(':')[0]))
      setClients((prev) => prev.filter((c) => c.id !== call.assignedClientId))
    }
    setSalesCalls((prev) => prev.filter((c) => c.id !== call.id))
    setModifyingCall(null)
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
              <span>időpont</span>
              <span>ügyfél</span>
              <span>email</span>
              <span>telefon</span>
              <span>állapot</span>
              <span />
            </div>

            {todaysCalls.length === 0 ? (
              <p className="mb-0 text-center" style={{ color: 'var(--color-text-muted)' }}>ma nincs hívás.</p>
            ) : (
              todaysCalls.map((call) => (
                <CallRow key={call.id} call={call} onBook={() => bookForCall(call)} onModify={() => setModifyingCall(call)} />
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
              onBookedSlotClick={(_gytId, dateISO, hour) => {
                const match = findCallAt(dateISO, hour)
                if (match) setPreviewCall(match)
              }}
            />
          </div>
        )}

        {previewCall && (
          <div className="modal-backdrop-fyb" onClick={() => setPreviewCall(null)}>
            <div className="modal-fyb card-fyb" onClick={(e) => e.stopPropagation()}>
              <h2 className="h6 mb-3">{formatTime(previewCall.callTime)}</h2>
              <p className="fw-bold mb-1">{previewCall.name}</p>
              <p className="small mb-3" style={{ color: 'var(--color-text-muted)' }}>{previewCall.phone}</p>
              <div className="d-flex justify-content-between align-items-center">
                <button type="button" className="btn-fyb btn-fyb-ghost" onClick={() => setPreviewCall(null)}>bezár</button>
                <GearButton
                  onClick={() => {
                    setModifyingCall(previewCall)
                    setPreviewCall(null)
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {modifyingCall && (
          <CallDetailModal
            call={modifyingCall}
            onClose={() => setModifyingCall(null)}
            onSetOutcome={(outcome) => handleSetOutcome(modifyingCall.id, outcome)}
            onReject={() => handleReject(modifyingCall)}
          />
        )}
      </div>
    </section>
  )
}

function CallRow({ call, onBook, onModify }: { call: SalesCall; onBook: () => void; onModify: () => void }) {
  const assigned = call.status === 'hozzarendelve'
  return (
    <div className="py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <div className="call-row-grid">
        <span className="call-row-time">{formatTime(call.callTime)}</span>
        <span className="fw-bold">{call.name}</span>
        <span className="small" style={{ color: 'var(--color-text-muted)' }}>{call.email}</span>
        <a href={telHref(call.phone)} className="small" style={{ color: 'var(--color-primary)' }}>{call.phone}</a>
        <span className="d-flex align-items-center gap-2 flex-wrap">
          {assigned ? (
            <span className="small" style={{ color: 'var(--color-text-muted)' }}>
              hozzárendelve: {call.assignedGyt}
            </span>
          ) : (
            <button type="button" className="btn-fyb btn-fyb-primary" style={{ padding: '0.35rem 0.9rem', fontSize: '0.8rem' }} onClick={onBook}>
              GYT-időpont foglalása
            </button>
          )}
          <OutcomeBadge outcome={call.outcome} />
        </span>
        <GearButton onClick={onModify} />
      </div>

      {/* mobil sor — nagy időpont vezeti a sort, alatta a többi adat, a jobb
         szélen a "+" (foglalás, csak ha még nincs GYT-hez rendelve) és a
         fogaskerék (módosítás) kör-gombok (2026.08.28., 3. kör) */}
      <div className="d-lg-none">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className="call-row-time">{formatTime(call.callTime)}</span>
          <div className="d-flex gap-2">
            {!assigned && (
              <button type="button" className="circle-icon-btn circle-icon-btn--add" aria-label="gyt-időpont foglalása" onClick={onBook}>+</button>
            )}
            <GearButton onClick={onModify} />
          </div>
        </div>
        <span className="fw-bold d-block">{call.name}</span>
        <span className="small d-block" style={{ color: 'var(--color-text-muted)' }}>{call.email}</span>
        <a href={telHref(call.phone)} className="small d-block" style={{ color: 'var(--color-primary)' }}>{call.phone}</a>
        <div className="mt-2 d-flex align-items-center gap-2 flex-wrap">
          {assigned && (
            <span className="small" style={{ color: 'var(--color-text-muted)' }}>
              hozzárendelve: {call.assignedGyt}
            </span>
          )}
          <OutcomeBadge outcome={call.outcome} />
        </div>
      </div>
    </div>
  )
}

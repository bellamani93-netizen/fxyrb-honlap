import { useState } from 'react'
import {
  BUSINESS_HOURS,
  addDays,
  formatDateOnly,
  formatHour,
  formatISODate,
  generateMeetLink,
  getBaseDaySlots,
  getMondayOf,
  parseISODateLocal,
  type TimeSlot,
} from '../data/calendarData'
import GytWeeklyCalendar from '../components/GytWeeklyCalendar'
import AppointmentEditorModal, { type AppointmentEditorResult, type ConflictInfo } from '../components/AppointmentEditorModal'

// A demóban a bejelentkezett GYT mindig "Kollé Gábor" (kollega@kollega.hu) —
// ugyanaz az azonosító, amit a SALES oldal "gyt naptárak" nézete is használ
// (ld. calendarData.ts DEMO_CLIENTS_BY_GYT), így a két oldal UGYANAZT a
// demo-beosztást mutatja, anélkül hogy valódi, szerepkörök közötti adatmegosztást
// kellene építeni ehhez a UI-tervhez (2026.08.31., Marci kérésére).
const OWN_ID = 'kollegabor'
const OWN_LIST = [{ id: OWN_ID, name: 'Kollé Gábor' }]

type OverlayEntry = { name: string; email: string; phone: string; note: string }
type SubView = 'mai' | 'naptar'

function slotKey(dateISO: string, hour: number) {
  return `${dateISO}__${hour}`
}

export default function GytNaptar() {
  const [today] = useState(() => new Date())
  const [view, setView] = useState<SubView>('mai')
  const [weekOffset, setWeekOffset] = useState<0 | 1>(0)
  // a GYT saját maga is felvehet/módosíthat konzultációt (2026.08.31., Marci
  // kérésére) — ez az overlay a SALES SalesDataContext bookings-mintáját
  // követi, csak ennek az egy oldalnak a helyi állapotaként (nincs még másik
  // GYT-oldal, aminek meg kellene osztania).
  const [overlay, setOverlay] = useState<Record<string, OverlayEntry>>({})
  const [editingSlot, setEditingSlot] = useState<{ dateISO: string; hour: number } | null>(null)

  const weekStart = addDays(getMondayOf(today), weekOffset * 7)
  const todayISO = formatISODate(today)

  function getEffectiveSlot(dateISO: string, hour: number): TimeSlot {
    const o = overlay[slotKey(dateISO, hour)]
    if (o) return { hour, status: 'foglalt', label: o.name }
    return getBaseDaySlots(OWN_ID, parseISODateLocal(dateISO), today).find((s) => s.hour === hour) ?? { hour }
  }

  // "call" módban ütközés csak FIGYELMEZTETÉS (felülbírálható), mint a SALES
  // saját naptáránál — a szerkesztett sáv saját magával sosem ütközik.
  function checkConflict(dateISO: string, hour: number): ConflictInfo | null {
    if (editingSlot && editingSlot.dateISO === dateISO && editingSlot.hour === hour) return null
    const slot = getEffectiveSlot(dateISO, hour)
    return slot.status === 'foglalt' ? { name: slot.label ?? '', hour } : null
  }

  function handleSave(data: AppointmentEditorResult) {
    setOverlay((prev) => {
      const next = { ...prev }
      if (editingSlot && slotKey(editingSlot.dateISO, editingSlot.hour) !== slotKey(data.dateISO, data.hour)) {
        delete next[slotKey(editingSlot.dateISO, editingSlot.hour)]
      }
      next[slotKey(data.dateISO, data.hour)] = { name: data.name, email: data.email, phone: data.phone, note: data.note }
      return next
    })
    setEditingSlot(null)
  }

  function handleDelete() {
    if (!editingSlot) return
    setOverlay((prev) => {
      const next = { ...prev }
      delete next[slotKey(editingSlot.dateISO, editingSlot.hour)]
      return next
    })
    setEditingSlot(null)
  }

  const editingOverlay = editingSlot ? overlay[slotKey(editingSlot.dateISO, editingSlot.hour)] : undefined
  const isEditingExisting = !!editingOverlay

  const todaysConsultations = BUSINESS_HOURS.map((hour) => ({ hour, slot: getEffectiveSlot(todayISO, hour) }))
    .filter((entry): entry is { hour: number; slot: TimeSlot & { label: string } } => entry.slot.status === 'foglalt' && !!entry.slot.label)
    .map(({ hour, slot }) => ({ hour, name: slot.label, meetLink: generateMeetLink(`${todayISO}-${hour}-${slot.label}`) }))

  return (
    <section className="py-3 py-lg-5">
      {/* a naptár-nézet a teljes rendelkezésre álló szélességet használja, mint a
         SALES oldalon — a "mai konzultációk" lista viszont olvasható max-szélességű */}
      <div className="container-fluid" style={{ maxWidth: view === 'naptar' ? undefined : 900 }}>
        <div className="app-page-header mb-3">
          <h1 className="app-page-title mb-0">naptár</h1>
        </div>

        <div className="auth-tabs mb-4">
          <button type="button" className={`auth-tab ${view === 'mai' ? 'active' : ''}`} onClick={() => setView('mai')}>
            mai konzultációk
          </button>
          <button type="button" className={`auth-tab ${view === 'naptar' ? 'active' : ''}`} onClick={() => setView('naptar')}>
            naptáram
          </button>
        </div>

        {view === 'mai' && (
          <div className="card-fyb">
            <div
              className="consultation-row-grid pb-2 mb-1 small fw-bold text-uppercase"
              style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}
            >
              <span>időpont</span>
              <span>név</span>
              <span>google meet</span>
            </div>

            {todaysConsultations.length === 0 ? (
              <p className="mb-0 text-center" style={{ color: 'var(--color-text-muted)' }}>ma nincs konzultáció.</p>
            ) : (
              todaysConsultations.map((c) => (
                <div key={c.hour} className="consultation-row-grid py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <span className="fw-bold">{formatHour(c.hour)}</span>
                  <span>{c.name}</span>
                  <a href={`https://${c.meetLink}`} target="_blank" rel="noreferrer" className="small text-truncate" style={{ color: 'var(--color-primary)' }}>
                    {c.meetLink}
                  </a>
                </div>
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
              getSlot={(_id, dateISO, hour) => getEffectiveSlot(dateISO, hour)}
              onFreeSlotClick={(_gytId, _gytName, dateISO, hour) => setEditingSlot({ dateISO, hour })}
              onBookedSlotClick={(_gytId, dateISO, hour) => {
                if (overlay[slotKey(dateISO, hour)]) setEditingSlot({ dateISO, hour })
              }}
            />
          </div>
        )}

        {editingSlot && (
          <AppointmentEditorModal
            mode="call"
            isEditing={isEditingExisting}
            initial={{
              dateISO: editingSlot.dateISO,
              hour: editingSlot.hour,
              name: editingOverlay?.name,
              email: editingOverlay?.email,
              phone: editingOverlay?.phone,
              note: editingOverlay?.note,
            }}
            checkConflict={checkConflict}
            onSave={handleSave}
            onDelete={isEditingExisting ? handleDelete : undefined}
            onClose={() => setEditingSlot(null)}
          />
        )}
      </div>
    </section>
  )
}

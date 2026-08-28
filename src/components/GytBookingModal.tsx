import { useState } from 'react'
import { addDays, formatDateOnly, formatHour, formatISODate, getBaseDaySlots, type TimeSlot } from '../data/calendarData'

type GytOption = { id: string; name: string }
export type PickedSlot = { gytId: string; gytName: string; dateISO: string; hour: number }

type GytBookingModalProps = {
  gytOptions: GytOption[]
  today: Date
  isBooked: (gytId: string, dateISO: string, hour: number) => boolean
  clientPreview?: { name: string; email: string; phone: string }
  preselectedGytId?: string | null
  onConfirm: (slot: PickedSlot) => void
  onCancel: () => void
}

export default function GytBookingModal({
  gytOptions,
  today,
  isBooked,
  clientPreview,
  preselectedGytId = null,
  onConfirm,
  onCancel,
}: GytBookingModalProps) {
  const [gytId, setGytId] = useState<string | null>(preselectedGytId)
  const [picked, setPicked] = useState<{ dateISO: string; hour: number } | null>(null)

  // a következő 14 naptári nap szabad sávjai — a getBaseDaySlots már csak
  // a "most" hetére és a következő hétre ad vissza ténylegesen meghirdetett
  // (szabad/foglalt) állapotot, ezen túl mindent üresen ad vissza
  const freeSlotsByDay: { date: Date; slots: TimeSlot[] }[] = []
  if (gytId) {
    for (let i = 0; i < 14; i++) {
      const date = addDays(today, i)
      const dateISO = formatISODate(date)
      const base = getBaseDaySlots(gytId, date, today)
      const free = base.filter((s) => s.status === 'szabad' && !isBooked(gytId, dateISO, s.hour))
      if (free.length) freeSlotsByDay.push({ date, slots: free })
    }
  }

  const gytName = gytOptions.find((g) => g.id === gytId)?.name ?? ''

  function handleConfirm() {
    if (!gytId || !picked) return
    onConfirm({ gytId, gytName, dateISO: picked.dateISO, hour: picked.hour })
  }

  return (
    <div className="modal-backdrop-fyb" onClick={onCancel}>
      <div className="modal-fyb card-fyb gyt-booking-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="h6 mb-3">időpont foglalása</h2>

        {clientPreview && (
          <div className="gyt-booking-preview mb-3">
            <span className="fw-bold">{clientPreview.name}</span>
            <span className="small" style={{ color: 'var(--color-text-muted)' }}>{clientPreview.email} · {clientPreview.phone}</span>
          </div>
        )}

        <span className="form-label small fw-bold d-block mb-2">gyógytornász</span>
        <div className="auth-tabs mb-3" style={{ flexWrap: 'wrap' }}>
          {gytOptions.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`auth-tab ${gytId === g.id ? 'active' : ''}`}
              onClick={() => {
                setGytId(g.id)
                setPicked(null)
              }}
            >
              {g.name}
            </button>
          ))}
        </div>

        {gytId && (
          <>
            <span className="form-label small fw-bold d-block mb-2">szabad időpontok (következő 2 hét)</span>
            <div className="gyt-booking-slotlist mb-3">
              {freeSlotsByDay.length === 0 ? (
                <p className="small mb-0" style={{ color: 'var(--color-text-muted)' }}>{gytName}-nak nincs szabad időpontja a következő 2 hétben.</p>
              ) : (
                freeSlotsByDay.map(({ date, slots }) => (
                  <div key={date.toISOString()} className="mb-2">
                    <p className="small fw-bold mb-1">{formatDateOnly(date)}</p>
                    <div className="d-flex flex-wrap gap-2">
                      {slots.map((s) => {
                        const dateISO = formatISODate(date)
                        const isSelected = picked?.dateISO === dateISO && picked.hour === s.hour
                        return (
                          <button
                            key={s.hour}
                            type="button"
                            className={`btn-fyb ${isSelected ? 'btn-fyb-primary' : 'btn-fyb-outline'}`}
                            style={{ padding: '0.3rem 0.75rem', fontSize: '0.85rem' }}
                            onClick={() => setPicked({ dateISO, hour: s.hour })}
                          >
                            {formatHour(s.hour)}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn-fyb btn-fyb-ghost" onClick={onCancel}>mégse</button>
          <button type="button" className="btn-fyb btn-fyb-primary" disabled={!gytId || !picked} onClick={handleConfirm}>
            időpont lefoglalása
          </button>
        </div>
      </div>
    </div>
  )
}

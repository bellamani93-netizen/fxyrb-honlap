import { useState } from 'react'
import { BUSINESS_HOURS, formatHour } from '../data/calendarData'

export type AppointmentEditorMode = 'call' | 'booking'

export type AppointmentEditorInitial = {
  dateISO: string
  hour: number
  name?: string
  email?: string
  phone?: string
  note?: string
  gytId?: string | null
}

export type AppointmentEditorResult = {
  dateISO: string
  hour: number
  name: string
  email: string
  phone: string
  note: string
  gytId: string | null
}

type GytOption = { id: string; name: string }

type AppointmentEditorModalProps = {
  mode: AppointmentEditorMode
  initial: AppointmentEditorInitial
  gytOptions?: GytOption[] // 'booking' módban kötelezően kitöltve
  isEditing: boolean
  onSave: (data: AppointmentEditorResult) => void
  onDelete?: () => void
  onClose: () => void
}

// Közös időpont-létrehozó/-szerkesztő popup — két helyen használjuk:
// "hívásaim/saját naptár" (mode="call", nincs gyt-választó, a sales saját
// naptárába kerül) és "hozzárendelések/gyt naptárak" (mode="booking", a
// gyt-választóval eldönthető, kinek a naptárába kerüljön az ÜF).
// 2026.08.28., 6. kör, Marci kérésére.
export default function AppointmentEditorModal({ mode, initial, gytOptions = [], isEditing, onSave, onDelete, onClose }: AppointmentEditorModalProps) {
  const [dateISO, setDateISO] = useState(initial.dateISO)
  const [hour, setHour] = useState(initial.hour)
  const [name, setName] = useState(initial.name ?? '')
  const [email, setEmail] = useState(initial.email ?? '')
  const [phone, setPhone] = useState(initial.phone ?? '')
  const [note, setNote] = useState(initial.note ?? '')
  const [gytId, setGytId] = useState<string | null>(initial.gytId ?? null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const valid = Boolean(dateISO && name.trim() && email.trim() && phone.trim() && (mode === 'call' || gytId))

  function handleSave() {
    if (!valid) return
    onSave({ dateISO, hour, name: name.trim(), email: email.trim(), phone: phone.trim(), note: note.trim(), gytId: mode === 'booking' ? gytId : null })
  }

  if (confirmingDelete) {
    return (
      <div className="modal-backdrop-fyb" onClick={() => setConfirmingDelete(false)}>
        <div className="modal-fyb card-fyb" onClick={(e) => e.stopPropagation()}>
          <p className="mb-3">biztosan törlöd ezt az időpontot?</p>
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn-fyb btn-fyb-ghost" onClick={() => setConfirmingDelete(false)}>mégse</button>
            <button type="button" className="btn-fyb btn-fyb-danger" onClick={onDelete}>igen, törlöm</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-backdrop-fyb" onClick={onClose}>
      <div className="modal-fyb card-fyb gyt-booking-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="h6 mb-3">{isEditing ? 'időpont szerkesztése' : 'új időpont létrehozása'}</h2>

        <div className="row g-3 mb-3">
          <div className="col-6">
            <label className="form-label small fw-bold" htmlFor="appt-date">dátum</label>
            <input id="appt-date" type="date" className="form-control" value={dateISO} onChange={(e) => setDateISO(e.target.value)} />
          </div>
          <div className="col-6">
            <label className="form-label small fw-bold" htmlFor="appt-hour">időpont</label>
            <select id="appt-hour" className="form-control" value={hour} onChange={(e) => setHour(Number(e.target.value))}>
              {BUSINESS_HOURS.map((h) => (
                <option key={h} value={h}>{formatHour(h)}</option>
              ))}
            </select>
          </div>
          <div className="col-12">
            <label className="form-label small fw-bold" htmlFor="appt-name">név</label>
            <input id="appt-name" type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold" htmlFor="appt-email">e-mail</label>
            <input id="appt-email" type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold" htmlFor="appt-phone">telefonszám</label>
            <input id="appt-phone" type="tel" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="col-12">
            <label className="form-label small fw-bold" htmlFor="appt-note">megjegyzés</label>
            <textarea id="appt-note" className="form-control" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          {mode === 'booking' && (
            <div className="col-12">
              <span className="form-label small fw-bold d-block">gyógytornász</span>
              <div className="auth-tabs" style={{ flexWrap: 'wrap' }}>
                {gytOptions.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className={`auth-tab auth-tab--proper-case ${gytId === g.id ? 'active' : ''}`}
                    onClick={() => setGytId(g.id)}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <div>
            {isEditing && onDelete && (
              <button type="button" className="btn-fyb btn-fyb-ghost" style={{ color: 'var(--color-danger)' }} onClick={() => setConfirmingDelete(true)}>
                időpont törlése
              </button>
            )}
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="btn-fyb btn-fyb-ghost" onClick={onClose}>mégse</button>
            <button type="button" className="btn-fyb btn-fyb-primary" disabled={!valid} onClick={handleSave}>mentés</button>
          </div>
        </div>
      </div>
    </div>
  )
}

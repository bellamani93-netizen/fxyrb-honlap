import { useState } from 'react'
import { BUSINESS_HOURS, formatHour, generateMeetLink } from '../data/calendarData'
import Icon from './Icon'

export type GytSlotType = 'szabad' | 'terv' | 'konzultacio'

export type GytAppointmentInitial = {
  dateISO: string
  hour: number
  minute?: number
  type?: GytSlotType
  clientId?: string
  meetLink?: string
  /** szerkesztésnél a bejegyzés már rögzített alkalom-száma (ld. previewAlkalom új felvételnél). */
  alkalom?: number
}

export type GytAppointmentResult = {
  dateISO: string
  hour: number
  minute: number
  type: GytSlotType
  clientId?: string
  meetLink?: string
}

const pad = (n: number) => String(n).padStart(2, '0')
// a naptár-rács 1 órás sávokban gondolkodik (a `hour` dönti el, melyik cella
// foglalódik le) — az óra-választó ezért a meghirdetett sávokra (BUSINESS_HOURS)
// korlátozza a natív időválasztót, a perc viszont szabadon, tetszőleges
// pontossággal választható (2026.09.01., Marci kérésére: "óra:perc pontosan
// tudjon választani").
const MIN_TIME = `${pad(BUSINESS_HOURS[0])}:00`
const MAX_TIME = `${pad(BUSINESS_HOURS[BUSINESS_HOURS.length - 1])}:59`

export type GytClientOption = { id: string; name: string; email: string; phone: string }
export type GytConflictInfo = { name: string; hour: number }

type GytAppointmentModalProps = {
  initial: GytAppointmentInitial
  isEditing: boolean
  clientOptions: GytClientOption[]
  // a `minute` azért kell a hívónak is, mert egy nem kerek órakor kezdődő
  // időpont vizuálisan átlóg a KÖVETKEZŐ órás sávba is (ld. GytWeeklyCalendar
  // verticalOffsetPct) — ezért a szomszédos órát is ütközésnek kell
  // tekinteni, nem csak a sajátját (2026.09.01., Marci kérésére).
  checkConflict?: (dateISO: string, hour: number, minute: number) => GytConflictInfo | null
  // új felvételnél (nincs még rögzített alkalom-szám) ebből tudjuk meg, hányadik
  // alkalom lenne a kiválasztott ügyfélnek — az 1. alkalomnál a sales már
  // elküldte a hívás-linket, ott nem kell a "meet link létrehozása" gomb.
  previewAlkalom: (clientId: string) => number
  onSave: (data: GytAppointmentResult) => void
  onDelete?: () => void
  onClose: () => void
}

// A GYT saját naptárának időpont-szerkesztője — a SALES AppointmentEditorModal-jától
// szándékosan KÜLÖN komponens, mert a mezőkészlet típusonként (szabad/terv/konzultáció)
// eltér (szabadnál csak dátum+idő, terv/konzultációnál ügyfél-legördülő, nem szabad
// szöveg — az e-mail/telefon a kiválasztott ügyfél adataiból jön), és a SALES oldal
// modalját ez a divergencia feleslegesen bonyolította volna (2026.08.31., Marci kérésére).
export default function GytAppointmentModal({ initial, isEditing, clientOptions, checkConflict, previewAlkalom, onSave, onDelete, onClose }: GytAppointmentModalProps) {
  const [dateISO, setDateISO] = useState(initial.dateISO)
  const [hour, setHour] = useState(initial.hour)
  const [minute, setMinute] = useState(initial.minute ?? 0)
  const [type, setType] = useState<GytSlotType>(initial.type ?? 'szabad')
  const [clientId, setClientId] = useState<string | null>(initial.clientId ?? null)
  const [meetLink] = useState<string | undefined>(initial.meetLink)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [conflict, setConflict] = useState<GytConflictInfo | null>(null)
  const [copied, setCopied] = useState(false)

  const needsClient = type !== 'szabad'
  const selectedClient = clientOptions.find((c) => c.id === clientId) ?? null
  const valid = Boolean(dateISO) && (!needsClient || !!clientId)
  // szerkesztésnél a már rögzített számot vesszük, új felvételnél a
  // kiválasztott ügyfélre előre kiszámoljuk, hányadik alkalom lenne
  const currentAlkalom = isEditing ? initial.alkalom : clientId ? previewAlkalom(clientId) : undefined
  // az 1. alkalom hívás-linkjét már a sales elküldte (2026.09.01., Marci kérésére)
  const isFirstAlkalom = currentAlkalom === 1

  // A linket mostantól NEM kell külön gombbal "létrehozni" — automatikusan,
  // determinisztikusan (mindig ugyanazt adva ugyanarra a sávra/ügyfélre)
  // elkészül, amint van kiválasztott ügyfél (2026.09.01., Marci kérésére:
  // "a link generálódjon automatikusan, ne kelljen külön létrehozás gombra
  // kattintani"). A ténylegesen ELMENTETT (initial.meetLink) érték élvez
  // elsőbbséget, hogy szerkesztésnél ne változzon meg a korábban látott/
  // kiküldött link.
  const displayMeetLink = needsClient && clientId ? meetLink ?? generateMeetLink(`${dateISO}-${hour}-${clientId}`) : undefined

  function clearConflict() {
    setConflict(null)
  }

  function doSave() {
    onSave({ dateISO, hour, minute, type, clientId: needsClient ? clientId ?? undefined : undefined, meetLink: needsClient ? displayMeetLink : undefined })
  }

  // a GYT saját naptárában egy ütközés MINDIG valódi blokk — ez az ő fizikai
  // időbeosztása, nem lehet két dolgot csinálnia ugyanabban az órában
  // (a SALES "saját naptár"-ánál ez felülbírálható volt, mert az egy hívás-
  // lista, nem fizikai foglaltság — itt más a helyzet).
  function handleSaveClick() {
    if (!valid) return
    const found = checkConflict?.(dateISO, hour, minute) ?? null
    if (found) {
      setConflict(found)
      return
    }
    doSave()
  }

  async function handleCopyMeetLink() {
    if (!displayMeetLink) return
    try {
      await navigator.clipboard.writeText(`https://${displayMeetLink}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // a vágólap-hozzáférés böngészőtől függően megtagadható — ilyenkor a
      // link szövegként (link + "megnyitás" gomb formájában) attól még ott
      // marad, kézzel kimásolható.
    }
  }

  const shareHref = selectedClient && displayMeetLink
    ? `mailto:${selectedClient.email}?subject=${encodeURIComponent('Videóhívás linkje')}&body=${encodeURIComponent(
        `Szia ${selectedClient.name}!\n\nItt a linked a konzultációhoz: https://${displayMeetLink}\n\nÜdv,\na FixYourBack csapat`
      )}`
    : undefined

  // a "szabad" jelölés mögött nincs ügyfél-adat, triviálisan pótolható —
  // ennél felesleges a megerősítő kérdés, csak terv/konzultáció törlésénél
  // (valódi ügyfél-foglalás) kérdezünk vissza (2026.09.01., Marci kérésére).
  function handleDeleteClick() {
    if (type === 'szabad') {
      onDelete?.()
      return
    }
    setConfirmingDelete(true)
  }

  if (confirmingDelete) {
    return (
      <div className="modal-backdrop-fyb" onClick={() => setConfirmingDelete(false)}>
        <div className="modal-fyb card-fyb" onClick={(e) => e.stopPropagation()}>
          <p className="mb-3">biztos, hogy törlöd az időpontot?</p>
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn-fyb btn-fyb-ghost" onClick={() => setConfirmingDelete(false)}>nem</button>
            <button type="button" className="btn-fyb btn-fyb-danger" onClick={onDelete}>igen</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-backdrop-fyb" onClick={onClose}>
      <div className="modal-fyb card-fyb gyt-booking-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="h6 mb-3">{isEditing ? 'időpont szerkesztése' : 'új időpont létrehozása'}</h2>

        <div className="mb-3">
          <span className="form-label small fw-bold d-block">időpont típusa</span>
          {/* a 3 opció mobilon is mindig egy sorba férjen ki, ne törjön 2
             sorba (2026.09.02., Marci kérésére) — kisebb pirula-méret
             (`.auth-tabs-sm`) + tiltott sortörés. */}
          <div className="auth-tabs auth-tabs-sm gyt-booking-type-tabs" style={{ flexWrap: 'nowrap' }}>
            <button
              type="button"
              className={`auth-tab ${type === 'szabad' ? 'active' : ''}`}
              onClick={() => {
                setType('szabad')
                clearConflict()
              }}
            >
              szabad
            </button>
            <button
              type="button"
              className={`auth-tab ${type === 'terv' ? 'active' : ''}`}
              onClick={() => {
                setType('terv')
                clearConflict()
              }}
            >
              terv
            </button>
            <button
              type="button"
              className={`auth-tab ${type === 'konzultacio' ? 'active' : ''}`}
              onClick={() => {
                setType('konzultacio')
                clearConflict()
              }}
            >
              konzultáció
            </button>
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-6">
            <label className="form-label small fw-bold" htmlFor="gyt-appt-date">dátum</label>
            <input
              id="gyt-appt-date"
              type="date"
              className="form-control"
              value={dateISO}
              onChange={(e) => {
                setDateISO(e.target.value)
                clearConflict()
              }}
            />
          </div>
          <div className="col-6">
            <label className="form-label small fw-bold" htmlFor="gyt-appt-hour">időpont</label>
            <input
              id="gyt-appt-hour"
              type="time"
              className="form-control"
              min={MIN_TIME}
              max={MAX_TIME}
              value={`${pad(hour)}:${pad(minute)}`}
              onChange={(e) => {
                const [h, m] = e.target.value.split(':').map(Number)
                if (!Number.isNaN(h)) setHour(h)
                if (!Number.isNaN(m)) setMinute(m)
                clearConflict()
              }}
            />
          </div>

          {needsClient && (
            <div className="col-12">
              <label className="form-label small fw-bold" htmlFor="gyt-appt-client">név</label>
              <select
                id="gyt-appt-client"
                className="form-control"
                value={clientId ?? ''}
                onChange={(e) => {
                  setClientId(e.target.value || null)
                  clearConflict()
                }}
              >
                <option value="">válassz ügyfelet…</option>
                {clientOptions.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {selectedClient && (
            <div className="col-12 d-flex gap-3 flex-wrap small" style={{ color: 'var(--color-text-muted)' }}>
              <span>{selectedClient.email}</span>
              <span>{selectedClient.phone}</span>
            </div>
          )}

          {needsClient && displayMeetLink && (
            <div className="col-12">
              <div className="d-flex flex-wrap align-items-center gap-2">
                <a href={`https://${displayMeetLink}`} target="_blank" rel="noreferrer" className="small">
                  {displayMeetLink}
                </a>
                <button type="button" className="btn-fyb btn-fyb-ghost btn-fyb-sm" onClick={handleCopyMeetLink}>
                  {copied ? 'másolva ✓' : 'másolás'}
                </button>
                {shareHref && (
                  <a className="btn-fyb btn-fyb-ghost btn-fyb-sm" href={shareHref}>
                    megosztás
                  </a>
                )}
              </div>
              {isFirstAlkalom && (
                <p className="small fst-italic mb-0 mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  az 1. alkalomnál ezt már a sales elküldte az ügyfélnek.
                </p>
              )}
            </div>
          )}
        </div>

        {conflict && (
          <div className="conflict-warning mb-3">
            <p className="small fw-bold mb-0">
              időpont ütközés ezzel: {conflict.name}, {formatHour(conflict.hour)}
            </p>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            {isEditing && onDelete && (
              <button
                type="button"
                className="btn-fyb btn-fyb-ghost d-flex align-items-center gap-2"
                style={{ color: 'var(--color-danger)' }}
                onClick={handleDeleteClick}
              >
                <Icon src="/icons/ikon_kuka.svg" style={{ width: '1.2rem', height: '1.2rem' }} />
                időpont törlése
              </button>
            )}
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="btn-fyb btn-fyb-ghost" onClick={onClose}>mégse</button>
            <button type="button" className="btn-fyb btn-fyb-primary" disabled={!valid || !!conflict} onClick={handleSaveClick}>mentés</button>
          </div>
        </div>
      </div>
    </div>
  )
}

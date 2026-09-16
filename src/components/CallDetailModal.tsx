import { useState } from 'react'
import Icon from './Icon'
import { useSalesData } from '../context/SalesDataContext'
import { formatCallScheduleParts, type SalesCall } from '../data/calendarData'

function formatStart(value: string) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}. ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** a "Pozitív elbírálás" sablon `{Név}`/`{Hónap}`/`{Nap}`/`{Időpont}`
 * jelölőit a hívás saját adataira cseréli (2026.09.16., Marci kérésére) —
 * a 2 elutasító sablonnál eddig sosem volt SZÜKSÉG a tényleges behelyettesí-
 * tett szöveg megjelenítésére (csak a `name` rövid elnevezés látszott a
 * gombon), a pozitívnál viszont a dátum/idő hívásonként ELTÉR, ezért itt
 * ÉRDEMES ténylegesen megmutatni a kész szöveget küldés előtt. */
function substitute(template: string, call: SalesCall): string {
  const { month, day, time } = formatCallScheduleParts(call.callTime)
  return template
    .replaceAll('{Név}', call.name)
    .replaceAll('{Hónap}', month)
    .replaceAll('{Nap}', day)
    .replaceAll('{Időpont}', time)
}

type CallDetailModalProps = {
  call: SalesCall
  onClose: () => void
  onSetOutcome: (outcome: 'nem_jelent_meg' | 'rendben') => void
  onReject: (templateIndex: 0 | 1) => void
  /** "Pozitív elbírálás" — elküldi a pozitív sablont (ld. SalesDataContext
   * `positiveTemplate`) és törli a hívás lime "új" jelzőjét (2026.09.16.,
   * Marci kérésére). Nem törlő/nem visszafordíthatatlan lépés, de a
   * behelyettesített dátum/idő hívásonként eltér, ezért — az elutasító
   * sablonokhoz hasonlóan — van hozzá egy megerősítő lépés, ami a TÉNYLEGES
   * tárgyat+szöveget is megmutatja (ld. lent `confirmingAccept`). */
  onAccept: () => void
}

// A hívás-sorok fogaskerék ikonja (ill. az időpontra kattintás, ld.
// SalesHivasaim.tsx) nyitja meg ezt a popupot — minden adat, a Calendly-
// válaszok, a 2 kimenet-gomb (sárga = "nem jött", zöld = "rendben") és a
// "email küldése" szekció (2026.09.16., Marci kérésére) egy helyen. Az
// "email küldése" szekció MINDHÁROM lehetőséget (1 pozitív + 2 elutasító
// sablon) EGYSZERRE, egyenrangúan mutatja — korábban a 2 elutasító sablon
// egy KÜLÖN "törlés" ikon MÖGÉ volt rejtve, ez a lépés megszűnt. Az
// elutasító gombok (törléssel is járnak) megtartják a saját, könnyű
// megerősítő lépését; a pozitív gomb azonnal hat, mert nem törlő művelet.
export default function CallDetailModal({ call, onClose, onSetOutcome, onReject, onAccept }: CallDetailModalProps) {
  const { messageTemplates, positiveTemplate } = useSalesData()
  const [pendingRejectIndex, setPendingRejectIndex] = useState<0 | 1 | null>(null)
  const [confirmingAccept, setConfirmingAccept] = useState(false)

  if (pendingRejectIndex !== null) {
    const tpl = messageTemplates[pendingRejectIndex]
    return (
      <div className="modal-backdrop-fyb" onClick={() => setPendingRejectIndex(null)}>
        <div className="modal-fyb card-fyb" onClick={(e) => e.stopPropagation()}>
          <p className="mb-3">
            biztosan töröljük az időpontot, és elküldjük ezt az üzenetet: <span className="fw-bold">{tpl.name}</span>?
          </p>
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn-fyb btn-fyb-ghost" onClick={() => setPendingRejectIndex(null)}>mégse</button>
            <button type="button" className="btn-fyb btn-fyb-danger" onClick={() => onReject(pendingRejectIndex)}>igen, küldés</button>
          </div>
        </div>
      </div>
    )
  }

  // "Pozitív elbírálás" — a 2 elutasító sablontól eltérően itt a TÉNYLEGES,
  // behelyettesített tárgyat+szöveget is megmutatjuk küldés előtt (ld.
  // `substitute` fenti jegyzete), mert a dátum/idő hívásonként változik.
  if (confirmingAccept) {
    return (
      <div className="modal-backdrop-fyb" onClick={() => setConfirmingAccept(false)}>
        <div className="modal-fyb card-fyb" onClick={(e) => e.stopPropagation()}>
          <p className="small fw-bold mb-1">tárgy</p>
          <p className="mb-3">{substitute(positiveTemplate.subject ?? '', call)}</p>
          <p className="small fw-bold mb-1">üzenet</p>
          <p className="mb-3" style={{ whiteSpace: 'pre-wrap' }}>{substitute(positiveTemplate.body, call)}</p>
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn-fyb btn-fyb-ghost" onClick={() => setConfirmingAccept(false)}>mégse</button>
            <button type="button" className="btn-fyb btn-fyb-highlight" onClick={onAccept}>igen, küldés</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-backdrop-fyb" onClick={onClose}>
      <div className="modal-fyb card-fyb" onClick={(e) => e.stopPropagation()}>
        <h2 className="h6 mb-3">hívás módosítása</h2>

        <div className="gyt-booking-preview mb-3">
          <span className="fw-bold">{call.name}</span>
          <span className="small" style={{ color: 'var(--color-text-muted)' }}>{formatStart(call.callTime)}</span>
          <span className="small" style={{ color: 'var(--color-text-muted)' }}>{call.email}</span>
          <span className="small" style={{ color: 'var(--color-text-muted)' }}>{call.phone}</span>
        </div>

        {/* Calendly-válaszok (2026.09.16., Marci kérésére: "amikor érkezik
           egy foglalás a Calendly-től, akkor a Calendly-ben megadott
           válaszokat látnunk kell az időpontra kattintva") — csak akkor
           jelenik meg, ha van hozzá rögzített válasz (a sales saját maga
           által, kézzel felvett hívásoknál, ld. SalesHivasaim.tsx
           handleCreateCall, nincs Calendly-adat). */}
        {call.answers && call.answers.length > 0 && (
          <div className="mb-3">
            <h3 className="h6 mb-2" style={{ fontSize: '0.9rem' }}>Calendly-válaszok</h3>
            <div className="d-flex flex-column gap-2">
              {call.answers.map((qa, i) => (
                <div key={i}>
                  <div className="small fw-bold">{qa.question}</div>
                  <div className="small" style={{ color: 'var(--color-text-muted)' }}>{qa.answer}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="d-flex justify-content-center gap-4 mb-3">
          <div className="text-center">
            <button
              type="button"
              className="circle-icon-btn circle-icon-btn--warning"
              aria-label="nem jelent meg"
              onClick={() => {
                onSetOutcome('nem_jelent_meg')
                onClose()
              }}
            >
              !
            </button>
            <p className="small mb-0 mt-1">nem jött</p>
          </div>
          <div className="text-center">
            <button
              type="button"
              className="circle-icon-btn circle-icon-btn--success"
              aria-label="rendben"
              onClick={() => {
                onSetOutcome('rendben')
                onClose()
              }}
            >
              <Icon src="/icons/ikon_pipa.svg" />
            </button>
            <p className="small mb-0 mt-1">rendben</p>
          </div>
        </div>

        <div className="mb-3">
          <h3 className="h6 mb-2" style={{ fontSize: '0.9rem' }}>email küldése</h3>
          <div className="d-flex flex-column gap-2">
            <button type="button" className="btn-fyb btn-fyb-highlight text-start" onClick={() => setConfirmingAccept(true)}>
              {positiveTemplate.name}
            </button>
            {messageTemplates.map((tpl, i) => (
              <button
                key={i}
                type="button"
                className="btn-fyb btn-fyb-danger text-start"
                onClick={() => setPendingRejectIndex(i as 0 | 1)}
              >
                {tpl.name}
              </button>
            ))}
          </div>
        </div>

        <div className="d-flex justify-content-end">
          <button type="button" className="btn-fyb btn-fyb-ghost" onClick={onClose}>bezár</button>
        </div>
      </div>
    </div>
  )
}

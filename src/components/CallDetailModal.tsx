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
  /** sima törlés, email/sablon NÉLKÜL — kizárólag a sales SAJÁT maga
   * felvette hívásainál jelenik meg, a 2 elutasító-sablon HELYETT
   * (2026.09.17., Marci kérésére, ld. lent `isOwnCall` jegyzete). A
   * ténylegesen elvégzett teendő (törlés + a hozzá tartozó GYT-foglalás/
   * ügyfél takarítása, ha időközben mégis hozzárendelték) UGYANAZ, mint az
   * `onReject`-é — külön prop csak azért, hogy a hívó oldal (SalesHivasaim.tsx)
   * és e komponens is EGYÉRTELMŰEN, névvel kifejezze a 2 eltérő szándékot. */
  onDelete: () => void
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
export default function CallDetailModal({ call, onClose, onSetOutcome, onReject, onAccept, onDelete }: CallDetailModalProps) {
  const { messageTemplates, positiveTemplate } = useSalesData()
  const [pendingRejectIndex, setPendingRejectIndex] = useState<0 | 1 | null>(null)
  const [confirmingAccept, setConfirmingAccept] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  // egy Calendly-foglalásnak MINDIG van legalább 1 rögzített válasza (ld. a
  // demó-adat `buildInitialSalesCalls`-át, calendarData.ts) — a sales SAJÁT,
  // kézzel felvett hívásainál (SalesHivasaim.tsx `handleCreateCall`) viszont
  // sosincs `answers` (nincs Calendly-adat, amiből származna), ezért ez
  // megbízható jel arra, hogy a hívás NEM valódi, külső Calendly-foglalás,
  // hanem a sales saját maga vette fel (2026.09.17., Marci kérésére: "a
  // sales által létrehozott saját hívás időpont popupon legyen a lemondó
  // email opciók helyett törlés opció" — nincs külső jelentkező, akinek
  // elutasító e-mailt kellene küldeni, ezért az egész "sablon-választás"
  // értelmét veszti, sima törlés marad).
  const isOwnCall = !call.answers || call.answers.length === 0

  if (confirmingDelete) {
    return (
      <div className="modal-backdrop-fyb" onClick={() => setConfirmingDelete(false)}>
        <div className="modal-fyb card-fyb" onClick={(e) => e.stopPropagation()}>
          <p className="mb-3">biztosan törlöd ezt az időpontot?</p>
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn-fyb btn-fyb-ghost" onClick={() => setConfirmingDelete(false)}>mégse</button>
            <button type="button" className="btn-fyb btn-fyb-danger" onClick={onDelete}>igen, törlés</button>
          </div>
        </div>
      </div>
    )
  }

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
  // `substitute` fenti jegyzete), mert a dátum/idő hívásonként változik. A
  // `.call-detail-modal` (2026.09.17., Marci kérésére: "a pozitív elbírálás
  // gombra kattintva felugró popup is legyen landscape") ugyanazt a szélesebb
  // osztályt kapja, mint a fő nézet — a hosszabb, 3 bekezdéses üzenet-szöveg
  // így kényelmesebben, kevesebb sortöréssel fér el.
  if (confirmingAccept) {
    return (
      <div className="modal-backdrop-fyb" onClick={() => setConfirmingAccept(false)}>
        <div className="modal-fyb card-fyb call-detail-modal" onClick={(e) => e.stopPropagation()}>
          <p className="small fw-bold mb-1">tárgy</p>
          <p className="mb-3">{substitute(positiveTemplate.subject ?? '', call)}</p>
          <p className="small fw-bold mb-1">üzenet</p>
          <p className="mb-3" style={{ whiteSpace: 'pre-wrap' }}>{substitute(positiveTemplate.body, call)}</p>
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn-fyb btn-fyb-ghost" onClick={() => setConfirmingAccept(false)}>mégse</button>
            {/* küldés UTÁN a fő nézetre lépünk vissza (NEM zárjuk be a popupot,
               ld. SalesHivasaim.tsx handleAccept jegyzete), hogy a "Pozitív
               elbírálás" gomb megváltozott — letiltott, "visszaigazolás
               kiküldve" — állapota rögtön látható legyen. */}
            <button
              type="button"
              className="btn-fyb btn-fyb-highlight"
              onClick={() => {
                onAccept()
                setConfirmingAccept(false)
              }}
            >
              igen, küldés
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-backdrop-fyb" onClick={onClose}>
      <div className="modal-fyb card-fyb call-detail-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="h6 mb-3">hívás módosítása</h2>

        {/* asztali nézetben (≥992px) 2 oszlopos, fekvő elrendezés (2026.09.17.,
           Marci kérésére) — bal: alapadatok+Calendly-válaszok, jobb: kimenet-
           gombok+email küldése; mobilon/táblagépen a `.call-detail-modal-grid`
           grid nélkül egyszerűen egymás alá rendezi a 2 oszlopot, UGYANABBAN a
           sorrendben, mint eddig (ld. components.css jegyzete). */}
        <div className="call-detail-modal-grid">
          <div>
            <div className="gyt-booking-preview mb-3">
              <span className="fw-bold">{call.name}</span>
              <span className="small" style={{ color: 'var(--color-text-muted)' }}>{formatStart(call.callTime)}</span>
              <span className="small" style={{ color: 'var(--color-text-muted)' }}>{call.email}</span>
              <span className="small" style={{ color: 'var(--color-text-muted)' }}>{call.phone}</span>
            </div>

            {/* Calendly-válaszok (2026.09.16., Marci kérésére: "amikor
               érkezik egy foglalás a Calendly-től, akkor a Calendly-ben
               megadott válaszokat látnunk kell az időpontra kattintva") —
               csak akkor jelenik meg, ha van hozzá rögzített válasz (a
               sales saját maga által, kézzel felvett hívásoknál, ld.
               SalesHivasaim.tsx handleCreateCall, nincs Calendly-adat). */}
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
          </div>

          <div>
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
                {/* küldés után letiltva, felirata "visszaigazolás kiküldve"-
                   re vált (2026.09.17., Marci kérésére) — a `.btn-fyb:disabled`
                   meglévő stílusa (halványítás, tiltott kurzor) automatikusan
                   érvényesül. */}
                <button
                  type="button"
                  className="btn-fyb btn-fyb-highlight text-start"
                  onClick={() => setConfirmingAccept(true)}
                  disabled={call.positiveSent}
                >
                  {call.positiveSent ? 'visszaigazolás kiküldve' : positiveTemplate.name}
                </button>
                {/* saját, kézzel felvett hívásnál (ld. `isOwnCall` fenti
                   jegyzete) nincs külső jelentkező, akinek elutasító e-mailt
                   kellene küldeni — a 2 sablon-gomb helyett sima törlés. */}
                {isOwnCall ? (
                  <button
                    type="button"
                    className="btn-fyb btn-fyb-danger text-start"
                    onClick={() => setConfirmingDelete(true)}
                  >
                    törlés
                  </button>
                ) : (
                  messageTemplates.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      className="btn-fyb btn-fyb-danger text-start"
                      onClick={() => setPendingRejectIndex(i as 0 | 1)}
                    >
                      {tpl.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end">
          <button type="button" className="btn-fyb btn-fyb-ghost" onClick={onClose}>bezár</button>
        </div>
      </div>
    </div>
  )
}

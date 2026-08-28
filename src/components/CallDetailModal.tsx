import { useState } from 'react'
import Icon from './Icon'
import { useSalesData } from '../context/SalesDataContext'
import type { SalesCall } from '../data/calendarData'

function formatStart(value: string) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}. ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

type CallDetailModalProps = {
  call: SalesCall
  onClose: () => void
  onSetOutcome: (outcome: 'nem_jelent_meg' | 'rendben') => void
  onReject: (templateIndex: 0 | 1) => void
}

// A hívás-sorok fogaskerék ikonja nyitja meg ezt a popupot — minden adat +
// a 3 státuszgomb (piros = törlés+elutasító üzenet, sárga = "nem jött",
// zöld = "rendben") egy helyen. A piros gomb nem azonnal töröl, hanem egy
// második lépésben a 2 elutasító-sablon közül kell választani (ld. Design
// jegyzet, 2026.08.28., 3. kör — Marci döntése: a megerősítés és a
// sablon-választás EGY lépés, nem két külön képernyő).
export default function CallDetailModal({ call, onClose, onSetOutcome, onReject }: CallDetailModalProps) {
  const { messageTemplates } = useSalesData()
  const [confirmingReject, setConfirmingReject] = useState(false)

  if (confirmingReject) {
    return (
      <div className="modal-backdrop-fyb" onClick={() => setConfirmingReject(false)}>
        <div className="modal-fyb card-fyb" onClick={(e) => e.stopPropagation()}>
          <p className="mb-3">biztosan töröljük az időpontot, és küldjünk értesítőt? válaszd ki, melyik üzenetet küldjük:</p>
          <div className="d-flex flex-column gap-2 mb-3">
            {messageTemplates.map((tpl, i) => (
              <button
                key={i}
                type="button"
                className="btn-fyb btn-fyb-danger text-start"
                onClick={() => onReject(i as 0 | 1)}
              >
                {tpl.name}
              </button>
            ))}
          </div>
          <div className="d-flex justify-content-end">
            <button type="button" className="btn-fyb btn-fyb-ghost" onClick={() => setConfirmingReject(false)}>mégse</button>
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

        <div className="d-flex justify-content-center gap-4 mb-3">
          <div className="text-center">
            <button
              type="button"
              className="circle-icon-btn circle-icon-btn--danger"
              aria-label="időpont törlése"
              onClick={() => setConfirmingReject(true)}
            >
              <Icon src="/icons/ikon_kuka.svg" />
            </button>
            <p className="small mb-0 mt-1">törlés</p>
          </div>
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

        <div className="d-flex justify-content-end">
          <button type="button" className="btn-fyb btn-fyb-ghost" onClick={onClose}>bezár</button>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import Icon from './Icon'

// A "mini-kurzus"/"gyorsítósáv" oldal még nincs kész (2026.09.03., Marci
// kérésére) — minden rá mutató gomb/link ezt a popupot nyitja meg helyette,
// ami elmondja, hogy addig is a Derekas Levelek hírlevélen és a Facebookon
// kommunikálunk. A hírlevél-feliratkozás itt is csak UI-terv (nincs valódi
// backend), ugyanúgy, ahogy a főoldali hírlevél-blokké sem az.
const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=100089450116040'
export default function MiniKurzusComingSoonModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="modal-backdrop-fyb" onClick={onClose}>
      <div className="modal-fyb card-fyb" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div className="newsletter-icon-badge mb-3" style={{ width: '3.5rem', height: '3.5rem' }}>
          <Icon src="/icons/ikon_video.svg" style={{ width: '1.6rem', height: '1.6rem' }} />
        </div>
        <h2 className="h5 mb-3">a mini-kurzus még készül</h2>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          A 4 videós gyorsítósávon még dolgozunk. Addig is iratkozz fel a Derekas Levelekre — jelenleg ott, illetve a Facebookon kommunikálunk.
        </p>

        {submitted ? (
          <p className="fw-bold mb-4" style={{ color: 'var(--color-primary)' }}>Köszi a feliratkozást! Hamarosan jelentkezünk.</p>
        ) : (
          <form className="d-flex flex-wrap gap-2 mb-4" onSubmit={handleSubmit}>
            <input
              type="email"
              className="form-control"
              placeholder="e-mail címed"
              aria-label="e-mail cím"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ minWidth: '12rem', flex: 1 }}
            />
            <button type="submit" className="btn-fyb btn-fyb-highlight text-nowrap">feliratkozom</button>
          </form>
        )}

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="small" style={{ color: 'var(--color-primary)' }}>vagy kövess a Facebookon</a>
          <button type="button" className="btn-fyb btn-fyb-ghost" onClick={onClose}>bezár</button>
        </div>
      </div>
    </div>
  )
}

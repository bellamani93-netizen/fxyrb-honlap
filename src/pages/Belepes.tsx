import { useState } from 'react'
import Icon from '../components/Icon'

type Tab = 'login' | 'register'

export default function Belepes() {
  const [tab, setTab] = useState<Tab>('login')
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <section className="py-5">
        <div className="container text-center" style={{ maxWidth: 480 }}>
          <div className="card-fyb card-fyb-accent">
            <Icon src="/icons/ikon_fiok.svg" className="mb-3 mx-auto d-block" style={{ width: '3rem', height: '3rem' }} />
            <h1 className="h4 mb-2">{tab === 'login' ? 'sikeresen bejelentkeztél' : 'sikeres regisztráció'}</h1>
            <p className="mb-0" style={{ color: 'var(--color-text-muted)' }}>
              ez a felület a következő fázisban készül el — itt fogod majd elérni a gyakorlataidat, a checklistet
              és a dokumentációdat.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-5">
      <div className="container" style={{ maxWidth: 480 }}>
        <div className="text-center mb-4">
          <div className="d-flex align-items-center justify-content-center gap-3">
            <div className="process-step-icon-badge">
              <Icon src="/icons/ikon_fiok.svg" />
            </div>
            <h1 className="mb-0">fiók</h1>
          </div>
        </div>

        <div className="d-flex justify-content-center mb-4">
          <div className="auth-tabs">
            <button type="button" className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>
              belépés
            </button>
            <button type="button" className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>
              regisztráció
            </button>
          </div>
        </div>

        <div className="card-fyb card-fyb-accent">
          {tab === 'login' ? (
            <form className="d-flex flex-column gap-3" onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }}>
              <div>
                <label className="form-label small fw-bold" htmlFor="login-email">e-mail cím</label>
                <input id="login-email" type="email" className="form-control" placeholder="te@pelda.hu" required />
              </div>
              <div>
                <label className="form-label small fw-bold" htmlFor="login-password">jelszó</label>
                <input id="login-password" type="password" className="form-control" placeholder="••••••••" required />
              </div>
              <div className="text-end">
                <a href="#" className="small" style={{ color: 'var(--color-primary)' }}>elfelejtett jelszó</a>
              </div>
              <button type="submit" className="btn-fyb btn-fyb-primary w-100">bejelentkezem</button>
            </form>
          ) : (
            <form className="d-flex flex-column gap-3" onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }}>
              <div>
                <label className="form-label small fw-bold" htmlFor="reg-name">teljes név</label>
                <input id="reg-name" type="text" className="form-control" placeholder="Kovács Anna" required />
              </div>
              <div>
                <label className="form-label small fw-bold" htmlFor="reg-email">e-mail cím</label>
                <input id="reg-email" type="email" className="form-control" placeholder="te@pelda.hu" required />
              </div>
              <div>
                <label className="form-label small fw-bold" htmlFor="reg-password">jelszó</label>
                <input id="reg-password" type="password" className="form-control" placeholder="••••••••" required />
              </div>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="gdpr" required />
                <label className="form-check-label small" htmlFor="gdpr" style={{ color: 'var(--color-text-muted)' }}>
                  elfogadom az <a href="#" style={{ color: 'var(--color-primary)' }}>adatkezelési tájékoztatót</a>,
                  és hozzájárulok az egészségügyi adataim GDPR szerinti kezeléséhez.
                </label>
              </div>
              <button type="submit" className="btn-fyb btn-fyb-primary w-100">regisztrálok</button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

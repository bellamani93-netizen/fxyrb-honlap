import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'

type Tab = 'login' | 'register'
type Role = 'ugyfel' | 'gyt'
type Session = { name: string; role: Role }

const TEST_ACCOUNTS: Record<string, Session> = {
  'peldabela@peldabela.hu': { name: 'Példa Béla', role: 'ugyfel' },
  'kollega@kollega.hu': { name: 'Kollé Gábor', role: 'gyt' },
}

const ROLE_PATH: Record<Role, string> = {
  ugyfel: '/gyakorlatok',
  gyt: '/gyt/ugyfelek',
}

export default function Belepes() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('login')
  const [loginEmail, setLoginEmail] = useState('')
  const [error, setError] = useState('')

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const match = TEST_ACCOUNTS[loginEmail.trim().toLowerCase()]
    if (!match) {
      setError('ismeretlen teszt-fiók — próbáld: peldabela@peldabela.hu (ügyfél) vagy kollega@kollega.hu (gyógytornász)')
      return
    }
    localStorage.setItem('fyb-session', JSON.stringify(match))
    navigate(ROLE_PATH[match.role])
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const name = (form.elements.namedItem('reg-name') as HTMLInputElement).value.trim() || 'új ügyfél'
    const newSession: Session = { name, role: 'ugyfel' }
    localStorage.setItem('fyb-session', JSON.stringify(newSession))
    navigate(ROLE_PATH.ugyfel)
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
            <button type="button" className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError('') }}>
              belépés
            </button>
            <button type="button" className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError('') }}>
              regisztráció
            </button>
          </div>
        </div>

        <div className="card-fyb card-fyb-accent">
          {tab === 'login' ? (
            <form className="d-flex flex-column gap-3" onSubmit={handleLogin}>
              <div>
                <label className="form-label small fw-bold" htmlFor="login-email">e-mail cím</label>
                <input
                  id="login-email"
                  type="email"
                  className="form-control"
                  placeholder="te@pelda.hu"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label small fw-bold" htmlFor="login-password">jelszó</label>
                <input id="login-password" type="password" className="form-control" placeholder="••••••••" required />
              </div>
              {error && (
                <p className="small mb-0" style={{ color: 'var(--color-danger)' }}>{error}</p>
              )}
              <p className="small mb-0" style={{ color: 'var(--color-text-muted)' }}>
                teszt-fiókok: <strong>peldabela@peldabela.hu</strong> (ügyfél) · <strong>kollega@kollega.hu</strong> (gyógytornász) — a jelszó tetszőleges
              </p>
              <div className="text-end">
                <a href="#" className="small" style={{ color: 'var(--color-primary)' }}>elfelejtett jelszó</a>
              </div>
              <button type="submit" className="btn-fyb btn-fyb-primary w-100">bejelentkezem</button>
            </form>
          ) : (
            <form className="d-flex flex-column gap-3" onSubmit={handleRegister}>
              <div>
                <label className="form-label small fw-bold" htmlFor="reg-name">teljes név</label>
                <input id="reg-name" name="reg-name" type="text" className="form-control" placeholder="Kovács Anna" required />
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

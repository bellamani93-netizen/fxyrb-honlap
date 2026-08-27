import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { initialColleagues, type Colleague, type ColleagueRole } from '../data/colleagues'
import { setAdminView } from '../hooks/useAdminEditGuard'

const ROLE_LABEL: Record<ColleagueRole, string> = { gyt: 'gyógytornász', sales: 'értékesítő' }
const ROLE_PATH: Record<ColleagueRole, string> = { gyt: '/gyt/ugyfelek', sales: '/sales/hozzarendeles' }

type FormState = { name: string; email: string; role: ColleagueRole }
const emptyForm: FormState = { name: '', email: '', role: 'gyt' }

export default function AdminMunkatarsak() {
  const navigate = useNavigate()
  const [colleagues, setColleagues] = useState<Colleague[]>(initialColleagues)
  const [form, setForm] = useState<FormState>(emptyForm)

  const formValid = Boolean(form.name.trim() && form.email.trim())

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formValid) return
    setColleagues((prev) => [
      ...prev,
      { id: `${Date.now()}`, name: form.name.trim(), email: form.email.trim(), role: form.role },
    ])
    setForm(emptyForm)
  }

  function enterAs(colleague: Colleague) {
    setAdminView({ id: colleague.id, name: colleague.name, role: colleague.role })
    navigate(ROLE_PATH[colleague.role])
  }

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 900 }}>
        <div className="app-page-header mb-3">
          <h1 className="app-page-title mb-0">munkatársak</h1>
        </div>

        <div className="card-fyb card-fyb-accent mb-4">
          <h2 className="h5 mb-3">új munkatárs felvétele</h2>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold" htmlFor="colleague-name">név</label>
                <input
                  id="colleague-name"
                  type="text"
                  className="form-control"
                  placeholder="Kovács Anna"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold" htmlFor="colleague-email">e-mail</label>
                <input
                  id="colleague-email"
                  type="email"
                  className="form-control"
                  placeholder="anna@pelda.hu"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="col-12">
                <span className="form-label small fw-bold d-block">szerepkör</span>
                <div className="auth-tabs">
                  <button type="button" className={`auth-tab ${form.role === 'gyt' ? 'active' : ''}`} onClick={() => setForm({ ...form, role: 'gyt' })}>
                    gyógytornász
                  </button>
                  <button type="button" className={`auth-tab ${form.role === 'sales' ? 'active' : ''}`} onClick={() => setForm({ ...form, role: 'sales' })}>
                    értékesítő
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-fyb btn-fyb-primary mt-3" disabled={!formValid}>munkatárs felvétele</button>
          </form>
        </div>

        <div className="card-fyb">
          <div
            className="sales-row-grid pb-2 mb-1 small fw-bold text-uppercase"
            style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', gridTemplateColumns: '9rem 13rem 8rem 1fr' }}
          >
            <span>név</span>
            <span>email</span>
            <span>szerepkör</span>
            <span />
          </div>
          <div
            className="sales-row-grid-mobile pb-2 mb-1 small fw-bold text-uppercase"
            style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', gridTemplateColumns: '1fr 6rem' }}
          >
            <span>munkatárs</span>
            <span />
          </div>

          {colleagues.map((c) => (
            <div key={c.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
              <div className="sales-row-grid py-2" style={{ gridTemplateColumns: '9rem 13rem 8rem 1fr' }}>
                <span className="fw-bold">{c.name}</span>
                <span className="small" style={{ color: 'var(--color-text-muted)' }}>{c.email}</span>
                <span className="small">{ROLE_LABEL[c.role]}</span>
                <button type="button" className="btn-fyb btn-fyb-outline" style={{ padding: '0.35rem 0.9rem', fontSize: '0.8rem', justifySelf: 'end' }} onClick={() => enterAs(c)}>
                  belépés a nevében
                </button>
              </div>

              <div className="sales-row-grid-mobile py-2" style={{ gridTemplateColumns: '1fr 6rem' }}>
                <span style={{ minWidth: 0 }}>
                  <span className="fw-bold d-block">{c.name}</span>
                  <span className="small d-block" style={{ color: 'var(--color-text-muted)' }}>{ROLE_LABEL[c.role]}</span>
                </span>
                <button type="button" className="btn-fyb btn-fyb-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', justifySelf: 'end' }} onClick={() => enterAs(c)}>
                  belépés
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

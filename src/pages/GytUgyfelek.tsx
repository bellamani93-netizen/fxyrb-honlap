import { useNavigate } from 'react-router-dom'
import { clients, setSelectedClientId } from '../data/gytClients'

export default function GytUgyfelek() {
  const navigate = useNavigate()

  function choose(id: string) {
    setSelectedClientId(id)
    navigate('/gyt/videokiosztas')
  }

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 900 }}>
        <div className="app-page-header mb-3">
          <h1 className="app-page-title mb-0">ügyfeleim</h1>
        </div>
        <p className="mb-3" style={{ color: 'var(--color-text-muted)' }}>
          válaszd ki, melyik ügyféllel szeretnél most dolgozni — a további almenük (videókiosztás, dokumentáció stb.) innentől erre az ügyfélre vonatkoznak.
        </p>

        <div className="card-fyb">
          {clients.map((c) => (
            <button
              key={c.id}
              type="button"
              className="module-item d-flex align-items-center w-100 text-start"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}
              onClick={() => choose(c.id)}
            >
              <span className="module-index">{c.name.charAt(0)}</span>
              <span className="flex-grow-1 fw-bold">{c.name}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>›</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

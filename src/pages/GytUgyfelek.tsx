import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { clients, getSelectedClientId, setSelectedClientId } from '../data/gytClients'

export default function GytUgyfelek() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  // ha nincs kiválasztott ügyfél (első belépés, vagy egy másik almenüről
  // idekerülve, mert még nem volt kiválasztás), erre hívjuk fel a figyelmet —
  // ez a jelzés csak az induló állapotot mutatja, egy választás után eltűnik
  const [noSelection] = useState(() => getSelectedClientId() === null)

  function choose(id: string) {
    setSelectedClientId(id)
    navigate('/gyt/videokiosztas')
  }

  const filtered = clients.filter((c) => c.name.toLowerCase().includes(search.trim().toLowerCase()))

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 900 }}>
        <div className="app-page-header mb-3">
          <h1 className="app-page-title mb-0">ügyfeleim</h1>
        </div>

        {noSelection && (
          <div className="select-client-notice mb-3">
            <Icon src="/icons/ikon_csengo.svg" style={{ width: '1.4rem', height: '1.4rem', flexShrink: 0 }} />
            <span>kivel dolgozunk? válassz ügyfelet a listából!</span>
          </div>
        )}

        <p className="mb-3" style={{ color: 'var(--color-text-muted)' }}>
          válaszd ki, melyik ügyféllel szeretnél most dolgozni — a további almenük (videókiosztás, dokumentáció stb.) innentől erre az ügyfélre vonatkoznak.
        </p>

        <input
          type="search"
          className="form-control mb-3"
          style={{ maxWidth: '16rem' }}
          placeholder="keresés név szerint…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="card-fyb">
          {filtered.length === 0 ? (
            <p className="mb-0 text-center" style={{ color: 'var(--color-text-muted)' }}>nincs találat</p>
          ) : (
            filtered.map((c) => (
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
            ))
          )}
        </div>
      </div>
    </section>
  )
}

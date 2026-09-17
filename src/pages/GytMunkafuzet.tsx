import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Icon from '../components/Icon'
import { useClients } from '../context/ClientsContext'
import { getSelectedClientId } from '../data/initialClients'
import { useWorkbook, WORKBOOK_QUESTIONS } from '../context/WorkbookContext'

// GYT-oldali, csak olvasható nézet az ÜF munkafüzetére (2026.09.17., Marci
// kérésére: "munkafüzet hozzáférés a gyt számára") — ugyanaz az ügyfél-
// választós "előbb válassz ügyfelet" minta, mint az Állapotfelmérő
// eredménylapnál (ld. GytAllapotfelmerok.tsx). Mivel nincs backend, a
// ténylegesen megjelenő válaszok a közös, munkamenet-szintű
// `WorkbookContext` demó-adatai (ugyanaz, amit az ÜF a saját "munkafüzet"
// oldalán lát), a fejlécben csak a kiválasztott ügyfél NEVE cserélődik.
export default function GytMunkafuzet() {
  const navigate = useNavigate()
  const [clientId] = useState(getSelectedClientId)

  if (!clientId) {
    return (
      <section className="py-3 py-lg-5">
        <div className="container-fluid" style={{ maxWidth: 780 }}>
          <div className="app-page-header mb-3">
            <h1 className="app-page-title mb-0">munkafüzet</h1>
          </div>
          <div className="select-client-notice mb-3">
            <Icon src="/icons/ikon_csengo.svg" style={{ width: '1.4rem', height: '1.4rem', flexShrink: 0 }} />
            <span>előbb válassz ügyfelet — a munkafüzet egy konkrét ügyfélhez tartozik.</span>
          </div>
          <button type="button" className="btn-fyb btn-fyb-primary" onClick={() => navigate('/gyt/ugyfelek')}>
            ügyfeleim megnyitása
          </button>
        </div>
      </section>
    )
  }
  return <GytMunkafuzetInner clientId={clientId} />
}

function GytMunkafuzetInner({ clientId }: { clientId: string }) {
  const { clients } = useClients()
  const client = clients.find((c) => c.id === clientId)!
  const { answers, savedAt } = useWorkbook()

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 780 }}>
        <div className="app-page-header mb-3 mobile-sticky-header">
          <h1 className="app-page-title mb-0">munkafüzet — {client.name}</h1>
        </div>

        {savedAt && (
          <p className="small mb-3" style={{ color: 'var(--color-text-muted)' }}>utoljára mentve: {savedAt}</p>
        )}

        <div className="card-fyb">
          {WORKBOOK_QUESTIONS.map((q, i) => (
            <div className={i > 0 ? 'mt-4' : ''} key={q.id}>
              <div className="fw-bold mb-1">{q.question}</div>
              <p className="mb-0" style={{ color: answers[q.id] ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                {answers[q.id] || 'még nincs kitöltve'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

import { useState } from 'react'
import { useClients } from '../context/ClientsContext'
import { getSelectedClientId } from '../data/initialClients'
import { useChecklist } from '../context/ChecklistContext'
import { suggestedSequence, codeLabel } from '../data/tornaSzintek'
import { ChecklistCharts } from './Checklist'

// GYT-oldali "checklist" nézet (2026.09.23., Marci kérésére, 5. fázis):
// "A gyt erre rálát, és szinthez kötött" — a Projekt specifikáció szerint
// ("Saját GYT látja a checklist eredményjelzőjét, nem szerkesztheti")
// TISZTÁN CSAK-OLVASHATÓ: nincs beviteli mező, nincs "Rögzítés" — csak a
// diagramok, egy szint-választóval (bármelyik korábbi/jelenlegi szintet
// megnézheti, nem csak az aktuálisat). Az "előbb válassz ügyfelet" esetet
// a `GytClientGate` (App.tsx) route-szintű kapuja kezeli.
export default function GytChecklist() {
  const { clients } = useClients()
  const client = clients.find((c) => c.id === getSelectedClientId())!
  const { getState } = useChecklist()
  const sequence = suggestedSequence(client.variables)
  const state = getState(client.id)
  const [viewedLevel, setViewedLevel] = useState(state.currentLevel)
  const viewedCode = sequence[viewedLevel - 1]
  const entries = state.entries.filter((e) => e.level === viewedLevel)

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 720 }}>
        <div className="app-page-header mb-3 mobile-sticky-header">
          <h1 className="app-page-title mb-0">checklist — {client.name}</h1>
        </div>

        <div className="card-fyb">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <h2 className="h6 mb-0">
              {viewedLevel}. szint {viewedCode ? <span style={{ color: 'var(--color-text-muted)' }}>— {codeLabel(viewedCode)}</span> : null}
              {viewedLevel === state.currentLevel && <span className="badge-fyb ms-2">jelenlegi</span>}
            </h2>
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={viewedLevel}
              onChange={(e) => setViewedLevel(Number(e.target.value))}
            >
              {sequence.map((_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1}. szint
                </option>
              ))}
            </select>
          </div>
          <ChecklistCharts entries={entries} />
        </div>
      </div>
    </section>
  )
}

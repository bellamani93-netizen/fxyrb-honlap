import { useState } from 'react'
import { useClients } from '../context/ClientsContext'
import { getSelectedClientId } from '../data/initialClients'
import { useChecklist, getHoldSecondsForDay } from '../context/ChecklistContext'
import { suggestedSequence, codeLabel } from '../data/tornaSzintek'
import { ChecklistCharts } from './Checklist'

// GYT-oldali "checklist" nézet (2026.09.23., Marci kérésére, 5. fázis):
// "A gyt erre rálát, és szinthez kötött" — a Projekt specifikáció szerint
// ("Saját GYT látja a checklist eredményjelzőjét, nem szerkesztheti")
// TISZTÁN CSAK-OLVASHATÓ: nincs beviteli mező, nincs "Rögzítés" — csak a
// diagramok, egy szint-választóval (bármelyik korábbi/jelenlegi szintet
// megnézheti, nem csak az aktuálisat). Az "előbb válassz ügyfelet" esetet
// a `GytClientGate` (App.tsx) route-szintű kapuja kezeli.
//
// 178. PONT (2026.09.24., Marci kérésére): "a gyt is láthassa a teljes
// időszakot, vagy egy kiválasztott szintet" — az ÜF-oldalon (Checklist.tsx)
// már meglévő "ezen a szinten"/"teljes időszak" váltó (`auth-tabs` minta)
// ide is átkerült. "Teljes időszak" nézetben a szint-választó legördülő
// (aminek nincs értelme, ha amúgy is minden szint adata látszik egyszerre)
// eltűnik, és a diagramok a `levelStartDate` elhagyásával a bejegyzések
// TERMÉSZETES (nem 14 napra kényszerített) szélességét mutatják — pontosan
// ugyanaz a mintázat, mint az ÜF oldalon.
export default function GytChecklist() {
  const { clients } = useClients()
  const client = clients.find((c) => c.id === getSelectedClientId())!
  const { getState } = useChecklist()
  const sequence = suggestedSequence(client.variables)
  const state = getState(client.id)
  const [viewedLevel, setViewedLevel] = useState(state.currentLevel)
  const [scope, setScope] = useState<'szint' | 'teljes'>('szint')
  const viewedCode = sequence[viewedLevel - 1]
  const entries = scope === 'szint' ? state.entries.filter((e) => e.level === viewedLevel) : state.entries
  const levelStartDate = scope === 'szint' ? state.levelStartDates[viewedLevel] : undefined
  const holdSecondsFor = (date: string, level: number) => getHoldSecondsForDay(state, date, level, client.variables)

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 720 }}>
        <div className="app-page-header mb-3 mobile-sticky-header">
          <h1 className="app-page-title mb-0">checklist — {client.name}</h1>
        </div>

        <div className="card-fyb">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <h2 className="h6 mb-0">
              {scope === 'szint' ? (
                <>
                  {viewedLevel}. szint{' '}
                  {viewedCode ? <span style={{ color: 'var(--color-text-muted)' }}>— {codeLabel(viewedCode)}</span> : null}
                  {viewedLevel === state.currentLevel && <span className="badge-fyb ms-2">jelenlegi</span>}
                </>
              ) : (
                'teljes időszak'
              )}
            </h2>
            <div className="auth-tabs auth-tabs-sm">
              <button type="button" className={`auth-tab ${scope === 'szint' ? 'active' : ''}`} onClick={() => setScope('szint')}>
                kiválasztott szint
              </button>
              <button type="button" className={`auth-tab ${scope === 'teljes' ? 'active' : ''}`} onClick={() => setScope('teljes')}>
                teljes időszak
              </button>
            </div>
          </div>
          {scope === 'szint' && (
            <select
              className="form-select form-select-sm mb-3"
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
          )}
          <ChecklistCharts entries={entries} levelStartDate={levelStartDate} holdSecondsFor={holdSecondsFor} />
        </div>
      </div>
    </section>
  )
}

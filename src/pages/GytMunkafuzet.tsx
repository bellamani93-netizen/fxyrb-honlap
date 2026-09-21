import { useClients } from '../context/ClientsContext'
import { getSelectedClientId } from '../data/initialClients'
import { useWorkbook, WORKBOOK_FELADATOK } from '../context/WorkbookContext'

// GYT-oldali, csak olvasható nézet az ÜF munkafüzetére (2026.09.18., Marci
// kérésére: "munkafüzet hozzáférés a gyt számára"). Mivel nincs backend, a
// ténylegesen megjelenő válaszok a közös, munkamenet-szintű
// `WorkbookContext` demó-adatai (ugyanaz, amit az ÜF a saját "munkafüzet"
// oldalán lát/ment), a fejlécben csak a kiválasztott ügyfél NEVE cserélődik.
// Az "előbb válassz ügyfelet" eset mostantól a `GytClientGate` (App.tsx)
// route-szintű kapuja kezeli (2026.09.21., Marci kérésére) — ez a
// komponens csak akkor renderelődik, ha MÁR van kiválasztott ügyfél, ezért
// a korábbi, önálló "nincs kiválasztás" ág innen törölve.
export default function GytMunkafuzet() {
  const { clients } = useClients()
  const client = clients.find((c) => c.id === getSelectedClientId())!
  const { answers, savedAt } = useWorkbook()

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 860 }}>
        <div className="app-page-header mb-3 mobile-sticky-header">
          <h1 className="app-page-title mb-0">munkafüzet — {client.name}</h1>
        </div>

        {savedAt && (
          <p className="small mb-3" style={{ color: 'var(--color-text-muted)' }}>utoljára mentve: {savedAt}</p>
        )}

        {WORKBOOK_FELADATOK.map((feladat) => {
          const rows = answers[feladat.id].filter((r) => r.left.trim() || r.right.trim())
          return (
            <div className="card-fyb mb-4" key={feladat.id}>
              <h2 className="h6 mb-2">{feladat.cim}</h2>
              {rows.length === 0 ? (
                <p className="small mb-0" style={{ color: 'var(--color-text-muted)' }}>még nincs kitöltve</p>
              ) : (
                <>
                  <div className="workbook-desktop-only" style={{ overflowX: 'auto' }}>
                    <table className="table workbook-table mb-0">
                      <colgroup>
                        <col className="workbook-col" />
                        <col className="workbook-arrow-col" />
                        <col className="workbook-col" />
                      </colgroup>
                      <thead>
                        <tr>
                          <th className="workbook-th-bad">{feladat.oszlopBal}</th>
                          <th className="workbook-th-arrow" aria-hidden="true"></th>
                          <th className="workbook-th-good">helyette</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, i) => (
                          <tr key={i}>
                            <td className="workbook-readonly-bad">{row.left || '—'}</td>
                            <td className="workbook-arrow-cell" aria-hidden="true">→</td>
                            <td className="workbook-readonly-good">{row.right || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="workbook-mobile-only">
                    {rows.map((row, i) => (
                      <div className="workbook-pair-card" key={i}>
                        <div className="workbook-pair-readonly workbook-readonly-bad">{row.left || '—'}</div>
                        <div className="workbook-pair-arrow">↓ helyette</div>
                        <div className="workbook-pair-readonly workbook-readonly-good">{row.right || '—'}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

import { formatDateOnly, parseISODateLocal } from '../data/calendarData'
import { useClients } from '../context/ClientsContext'
import { useCalendar } from '../context/CalendarContext'
import { LOGGED_IN_UF_ID } from '../data/initialClients'

// A demóban a bejelentkezett ÜF mindig "Péter" (ld. AppLayout.tsx alapértelmezett
// userName-je). A lista a KÖZÖS naptár-állapotból (CalendarContext) olvassa ki a
// ténylegesen rögzített ("konzultáció" típusú, tehát NEM "terv") bejegyzéseit —
// pontosan úgy nő, ahogy Marci kérte (2026.09.01.): az 1. tétel a SALES
// foglalásával jön létre, minden további a GYT által ténylegesen lefixált
// (nem csak "terv") időponttal. A lista CSAK akkor jelenik meg, ha a SALES már
// bepipálta a "fizetve" jelölőt az ügyfélnél — eddig egy tájékoztató üzenet látszik.
const OWN_ID = LOGGED_IN_UF_ID

function formatHourMinute(hour: number, minute?: number) {
  return `${hour}:${String(minute ?? 0).padStart(2, '0')}`
}

export default function UgyfelKonzultaciok() {
  const { clients } = useClients()
  const { getClientConsultations } = useCalendar()

  const client = clients.find((c) => c.id === OWN_ID)
  const consultations = client?.paid ? getClientConsultations(OWN_ID) : []

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 860 }}>
        <div className="app-page-header mb-3">
          <h1 className="app-page-title mb-0">konzultációk</h1>
        </div>

        <div className="card-fyb">
          {!client?.paid ? (
            <p className="mb-0 text-center" style={{ color: 'var(--color-text-muted)' }}>
              még nincs elérhető konzultációd — értékesítő kollégánk hamarosan felveszi veled a kapcsolatot.
            </p>
          ) : (
            <>
              <div
                className="consultation-row-grid pb-2 mb-1 small fw-bold text-uppercase"
                style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}
              >
                <span>alkalom</span>
                <span>dátum</span>
                <span>időpont</span>
                <span>hívás linkje</span>
              </div>

              {consultations.length === 0 ? (
                <p className="mb-0 text-center" style={{ color: 'var(--color-text-muted)' }}>
                  még nincs rögzített konzultációd.
                </p>
              ) : (
                consultations.map((c) => (
                  <div key={c.alkalom} className="consultation-row-grid py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <span className="fw-bold">{c.alkalom}.</span>
                    <span>{formatDateOnly(parseISODateLocal(c.dateISO))}</span>
                    <span>{formatHourMinute(c.hour, c.minute)}</span>
                    {c.meetLink ? (
                      <a href={`https://${c.meetLink}`} target="_blank" rel="noreferrer" className="small text-truncate" style={{ color: 'var(--color-primary)' }}>
                        {c.meetLink}
                      </a>
                    ) : (
                      <span className="small" style={{ color: 'var(--color-text-muted)' }}>—</span>
                    )}
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

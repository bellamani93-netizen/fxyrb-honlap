import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ToggleSwitch from './ToggleSwitch'
import { getCookieConsent, onOpenCookieSettings, setCookieConsent, useCookieConsent } from '../lib/legal'

// Sütisáv (Eht. 155. § (4)) — a működéshez szükséges tárolókhoz nem kell
// hozzájárulás; a harmadik féltől beágyazott tartalmak (Calendly, YouTube)
// és a lejátszásmérés (Mux) csak hozzájárulás után töltődnek be.
// A „csak a szükségesek" és az „elfogadom mindet" egyenrangú gomb.
export default function CookieConsentBanner() {
  const consent = useCookieConsent()
  const [open, setOpen] = useState(false)
  const [details, setDetails] = useState(false)
  const [functional, setFunctional] = useState(false)
  const [measurement, setMeasurement] = useState(false)

  useEffect(() => onOpenCookieSettings(() => {
    const c = getCookieConsent()
    setFunctional(c?.functional ?? false)
    setMeasurement(c?.measurement ?? false)
    setDetails(true)
    setOpen(true)
  }), [])

  if (consent && !open) return null

  function save(f: boolean, m: boolean) {
    setCookieConsent({ functional: f, measurement: m })
    setOpen(false)
    setDetails(false)
  }

  return (
    <div className="cookie-banner-fyb" role="dialog" aria-modal="false" aria-labelledby="cookie-banner-title">
      <div className="container">
        <h2 id="cookie-banner-title" className="h6 mb-2">sütik a honlapon</h2>
        <p className="small mb-3">
          A belépéshez és a honlap működéséhez szükséges sütiket mindig használjuk. A beágyazott időpontfoglalót
          (Calendly), a videós véleményeket (YouTube) és a videólejátszás mérését csak akkor töltjük be, ha ehhez
          hozzájárulsz. Részletek: <Link to="/cookie">Cookie-tájékoztató</Link>.
        </p>

        {details && (
          <div className="cookie-banner-options mb-3">
            <div className="d-flex align-items-center justify-content-between gap-3 py-2">
              <div>
                <div className="small fw-bold">szükséges</div>
                <div className="small cookie-banner-muted">belépés, biztonság, felületi beállítások — mindig aktív</div>
              </div>
              <span className="small fw-bold">mindig</span>
            </div>
            <div className="d-flex align-items-center justify-content-between gap-3 py-2">
              <div>
                <div className="small fw-bold">beágyazott tartalmak</div>
                <div className="small cookie-banner-muted">Calendly időpontfoglaló, YouTube-videók</div>
              </div>
              <ToggleSwitch checked={functional} onChange={setFunctional} label="beágyazott tartalmak" />
            </div>
            <div className="d-flex align-items-center justify-content-between gap-3 py-2">
              <div>
                <div className="small fw-bold">mérés</div>
                <div className="small cookie-banner-muted">a videólejátszás minőségének mérése (Mux)</div>
              </div>
              <ToggleSwitch checked={measurement} onChange={setMeasurement} label="mérés" />
            </div>
          </div>
        )}

        <div className="d-flex flex-wrap gap-2">
          <button type="button" className="btn-fyb btn-fyb-primary" onClick={() => save(false, false)}>csak a szükségesek</button>
          <button type="button" className="btn-fyb btn-fyb-primary" onClick={() => save(true, true)}>elfogadom mindet</button>
          {details ? (
            <button type="button" className="btn-fyb btn-fyb-ghost" onClick={() => save(functional, measurement)}>választásom mentése</button>
          ) : (
            <button type="button" className="btn-fyb btn-fyb-ghost" onClick={() => setDetails(true)}>beállítások</button>
          )}
        </div>
      </div>
    </div>
  )
}

/** Hozzájáruláshoz kötött beágyazás helyén megjelenő doboz (YouTube, Calendly). */
export function ConsentPlaceholder({ label, service, onEnable, minHeight }: { label: string; service: string; onEnable: () => void; minHeight?: number }) {
  return (
    <div className="consent-placeholder-fyb" style={{ minHeight }}>
      <p className="small mb-2">
        {label} a sütibeállításaid miatt nincs betöltve. Betöltéskor a {service} sütiket
        helyezhet el az eszközödön (<Link to="/cookie">részletek</Link>).
      </p>
      <button type="button" className="btn-fyb btn-fyb-ghost btn-fyb-sm" onClick={onEnable}>
        engedélyezem és betöltöm
      </button>
    </div>
  )
}

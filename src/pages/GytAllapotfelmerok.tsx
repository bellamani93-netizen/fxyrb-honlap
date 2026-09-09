import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Icon from '../components/Icon'
import { useClients } from '../context/ClientsContext'
import { getSelectedClientId } from '../data/initialClients'
import Eredmenyeim from './Eredmenyeim'

// "állapotfelmérők" — a GYT fiók saját nézete az ÜF-oldali Eredménylapra
// (2026.09.10., Marci kérésére: "az eredménylap üf-hez rendelve legyen
// látható a gyt fiókban is: állapotfelmérők menüpont alatt"). Mivel nincs
// backend, az ügyfél-specifikus KIVÁLASZTÁS (ld. lent, ugyanaz a minta, mint
// GytVideokiosztas.tsx-nél) csak a fejlécben megjelenő NEVET cseréli — a
// ténylegesen megjelenő mutatók/válaszok továbbra is a közös, munkamenet-
// szintű `AllapotfelmeroContext` demó-adatai (ugyanaz, amit az ÜF a saját
// "eredményeim" oldalán is lát). A "nyomtatás" gomb Marci kérésére KIZÁRÓLAG
// itt jelenik meg — az ÜF saját oldaláról törölve (ld. Eredmenyeim.tsx
// `showPrint` prop).
export default function GytAllapotfelmerok() {
  const navigate = useNavigate()
  const [clientId] = useState(getSelectedClientId)

  if (!clientId) {
    return (
      <section className="py-3 py-lg-5">
        <div className="container-fluid" style={{ maxWidth: 900 }}>
          <div className="app-page-header mb-3">
            <h1 className="app-page-title mb-0">állapotfelmérők</h1>
          </div>
          <div className="select-client-notice mb-3">
            <Icon src="/icons/ikon_csengo.svg" style={{ width: '1.4rem', height: '1.4rem', flexShrink: 0 }} />
            <span>előbb válassz ügyfelet — az állapotfelmérő egy konkrét ügyfélhez tartozik.</span>
          </div>
          <button type="button" className="btn-fyb btn-fyb-primary" onClick={() => navigate('/gyt/ugyfelek')}>
            ügyfeleim megnyitása
          </button>
        </div>
      </section>
    )
  }
  return <GytAllapotfelmerokInner clientId={clientId} />
}

function GytAllapotfelmerokInner({ clientId }: { clientId: string }) {
  const { clients } = useClients()
  const client = clients.find((c) => c.id === clientId)!
  return <Eredmenyeim displayName={client.name} showPrint />
}

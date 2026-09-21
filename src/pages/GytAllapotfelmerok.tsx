import { useClients } from '../context/ClientsContext'
import { getSelectedClientId } from '../data/initialClients'
import Eredmenyeim from './Eredmenyeim'

// "állapotfelmérők" — a GYT fiók saját nézete az ÜF-oldali Eredménylapra
// (2026.09.10., Marci kérésére: "az eredménylap üf-hez rendelve legyen
// látható a gyt fiókban is: állapotfelmérők menüpont alatt"). Mivel nincs
// backend, az ügyfél-specifikus KIVÁLASZTÁS csak a fejlécben megjelenő
// NEVET cseréli — a ténylegesen megjelenő mutatók/válaszok továbbra is a
// közös, munkamenet-szintű `AllapotfelmeroContext` demó-adatai (ugyanaz,
// amit az ÜF a saját "eredményeim" oldalán is lát). A "nyomtatás" gomb
// Marci kérésére KIZÁRÓLAG itt jelenik meg — az ÜF saját oldaláról törölve
// (ld. Eredmenyeim.tsx `showPrint` prop). Az "előbb válassz ügyfelet" eset
// a `GytClientGate` (App.tsx) route-szintű kapuja kezeli (2026.09.21.,
// Marci kérésére) — ez a komponens csak akkor renderelődik, ha MÁR van
// kiválasztott ügyfél.
export default function GytAllapotfelmerok() {
  const { clients } = useClients()
  const client = clients.find((c) => c.id === getSelectedClientId())!
  return <Eredmenyeim displayName={client.name} showPrint />
}

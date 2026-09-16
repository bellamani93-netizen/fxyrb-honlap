import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import type { Client } from '../data/initialClients'
import { buildInitialSalesCalls, type SalesCall, type TimeSlot } from '../data/calendarData'
import { useAdminEditGuard } from '../hooks/useAdminEditGuard'
import { useCalendar } from './CalendarContext'
import { useClients } from './ClientsContext'

// 2 szerkeszthető elutasító-üzenet sablon (2026.08.28., 3-4. kör) — a "{Név}"
// jelölő a küldéskor az ügyfél nevére cserélődik; az "üzenetek" oldal ezt a
// 2 sablont szerkeszti, a hívás-módosító popup pirosgombja pedig ezek közül
// választva küld (helyettesítő, backend nélküli) elutasítót. Külön "name"
// mező (2026.08.28., 4. kör, Marci kérésére) — a törlés-popup gombján NEM a
// teljes üzenetszöveg, csak ez a rövid elnevezés jelenik meg. A "subject"
// OPCIONÁLIS (2026.09.16., Marci kérésére, a "Pozitív elbírálás" sablonhoz
// adva, ld. lent) — a 2 elutasító sablonnál eddig nem merült fel igény rá,
// ezért azoknál üresen marad.
export type MessageTemplate = { name: string; subject?: string; body: string }

const DEFAULT_MESSAGE_TEMPLATES: [MessageTemplate, MessageTemplate] = [
  {
    // Marci kérésére (2026.09.16.: "a lemondás üzeneteknél a gombon csak
    // ennyi legyen: lemondás1 lemondás2") — a korábbi, hosszabb elnevezések
    // (pl. "lemondás — új időpont egyeztetése") helyett ez a rövid, sorszámozott
    // forma jelenik meg a gombon (ld. CallDetailModal.tsx, a gomb ezt az
    // `elnevezés` mezőt jeleníti meg) — az Üzenetek oldalon továbbra is
    // szabadon átírható.
    name: 'lemondás1',
    body: 'Kedves {Név}! Sajnálattal értesítünk, hogy a foglalt konzultációs időpontodat törölnünk kellett. Kérjük, vedd fel velünk a kapcsolatot egy új időpont egyeztetéséhez. Üdvözlettel, a FixYourBack csapata.',
  },
  {
    name: 'lemondás2',
    body: 'Kedves {Név}! Sajnos jelenleg nincs szabad gyógytornász-kapacitásunk a foglalt időpontodra, ezért azt törölnünk kellett. Hamarosan jelentkezünk egy új javaslattal. Üdvözlettel, a FixYourBack csapata.',
  },
]

// a "Pozitív elbírálás" e-mail sablonja — a 2 elutasító sablontól KÜLÖN
// tárolva (nem egy közös 3-elemű tömbben), mert más a jelentése (elfogadás,
// nem törlés) és más a felület, ami szerkeszti (ld. SalesUzenetek.tsx saját,
// külön kártyája) (2026.09.16., Marci kérésére: "a kiküldendő emailek között
// legyen olyan lehetőség is, hogy 'Pozitív elbírálás' — ezt lekattintva
// tűnik el a lime 'új' jelző az üf neve mellől"). Elküldése (ld.
// CallDetailModal.tsx) NEM törli a hívást — kizárólag a `SalesCall.isNew`
// jelzőt állítja `false`-ra. A `{Hónap}`/`{Nap}`/`{Időpont}` jelölők a hívás
// SAJÁT, már lefoglalt időpontjából (`SalesCall.callTime`) töltődnek ki,
// ld. `formatCallScheduleParts` (calendarData.ts) — a "45 perces
// konzultáció", amire a levél hivatkozik, maga a Calendly-foglalás, nem egy
// KÉSŐBBI GYT-időpont. A pontos szöveg Marci saját megfogalmazása
// (2026.09.16.), szó szerint átvéve.
const DEFAULT_POSITIVE_TEMPLATE: MessageTemplate = {
  name: 'Pozitív elbírálás',
  subject: 'Pozitív elbírálás: hívni foglak {Hónap} {Nap}-n!',
  body: 'Kedves {Név}!\n\nÖrömmel jelentem, hogy átnéztem a jelentkezésed a 45 perces konzultációra, és hívni foglak a lefoglalt időpontban. {Hónap} {Nap} {Időpont} -kor.\n\nÍrd be te is az időpontot a naptáradba, illetve legyél majd olyan környezetben, ahol zavartalanul tudsz beszélni, és legyen nálad jegyzetelésre alkalmas eszköz is!\n\n\nÜdvözlettel\nBella Márton\nés a FixYourBack csapata',
}

type SalesDataContextValue = {
  clients: Client[]
  setClients: Dispatch<SetStateAction<Client[]>>
  salesCalls: SalesCall[]
  setSalesCalls: Dispatch<SetStateAction<SalesCall[]>>
  isBooked: (gytId: string, dateISO: string, hour: number) => boolean
  getEffectiveSlot: (gytId: string, dateISO: string, hour: number) => TimeSlot
  getBookingClientId: (gytId: string, dateISO: string, hour: number) => string | undefined
  addBooking: (gytId: string, dateISO: string, hour: number, label: string, clientId?: string) => void
  removeBooking: (gytId: string, dateISO: string, hour: number) => void
  today: Date
  adminActive: boolean
  adminGuard: (id: string | string[], action: () => void) => void
  isModified: (id: string) => boolean
  adminAddedIds: Set<string>
  markAdminAdded: (id: string) => void
  messageTemplates: [MessageTemplate, MessageTemplate]
  setMessageTemplates: Dispatch<SetStateAction<[MessageTemplate, MessageTemplate]>>
  positiveTemplate: MessageTemplate
  setPositiveTemplate: Dispatch<SetStateAction<MessageTemplate>>
}

const SalesDataContext = createContext<SalesDataContextValue | null>(null)

// A "hívásaim" és a "hozzárendelések" mostantól KÜLÖN oldal (külön route),
// de a mögöttük álló adat (ügyfelek, sales-hívások, naptár-foglalások, admin-
// jelölések) egy közös, egyetlen forrás — ez a context ezt a megosztást
// biztosítja route-váltás közben is (ld. Design jegyzet, naptár-integráció
// 2. kör: Marci kérdésére nem külön demo-adatot vezettünk be, hanem ugyanazt
// az egy állapotot osztja meg a két oldal).
export function useSalesData() {
  const ctx = useContext(SalesDataContext)
  if (!ctx) throw new Error('useSalesData csak SalesDataProvideren belül használható')
  return ctx
}

export function SalesDataProvider({ children }: { children: ReactNode }) {
  // a naptár-foglalások (bookings) mostantól a CalendarContext-ből jönnek —
  // ez az EGY állapot közös a SALES ÉS a GYT szerepkör között, hogy egy
  // SALES-oldali foglalás ténylegesen megjelenjen a GYT saját naptárában is
  // (2026.09.01., Marci kérésére — ld. Design jegyzet 47-48. pont).
  const { today, isBooked, getEffectiveSlot, getBookingClientId, addBooking, removeBooking } = useCalendar()
  // az ügyfél-lista mostantól a közös ClientsContext-ből jön — a SALES ÉS a
  // GYT szerepkör EGY listát olvas/ír (2026.09.01., Marci kérésére: "vonjuk
  // össze a két ügyfél nyilvántartó rendszert", ld. Design jegyzet 49. pont).
  const { clients, setClients } = useClients()
  const [salesCalls, setSalesCalls] = useState<SalesCall[]>(() => buildInitialSalesCalls(today))
  const [adminAddedIds, setAdminAddedIds] = useState<Set<string>>(new Set())
  const [messageTemplates, setMessageTemplates] = useState<[MessageTemplate, MessageTemplate]>(DEFAULT_MESSAGE_TEMPLATES)
  const [positiveTemplate, setPositiveTemplate] = useState<MessageTemplate>(DEFAULT_POSITIVE_TEMPLATE)
  const { active: adminActive, guard: adminGuard, isModified, modal: adminModal } = useAdminEditGuard('sales')

  function markAdminAdded(id: string) {
    setAdminAddedIds((prev) => new Set(prev).add(id))
  }

  const value: SalesDataContextValue = {
    clients,
    setClients,
    salesCalls,
    setSalesCalls,
    isBooked,
    getEffectiveSlot,
    getBookingClientId,
    addBooking,
    removeBooking,
    today,
    adminActive,
    adminGuard,
    isModified,
    adminAddedIds,
    markAdminAdded,
    messageTemplates,
    setMessageTemplates,
    positiveTemplate,
    setPositiveTemplate,
  }

  return (
    <SalesDataContext.Provider value={value}>
      {children}
      {adminModal}
    </SalesDataContext.Provider>
  )
}

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
// teljes üzenetszöveg, csak ez a rövid elnevezés jelenik meg.
export type MessageTemplate = { name: string; body: string }

const DEFAULT_MESSAGE_TEMPLATES: [MessageTemplate, MessageTemplate] = [
  {
    name: 'lemondás — új időpont egyeztetése',
    body: 'Kedves {Név}! Sajnálattal értesítünk, hogy a foglalt konzultációs időpontodat törölnünk kellett. Kérjük, vedd fel velünk a kapcsolatot egy új időpont egyeztetéséhez. Üdvözlettel, a FixYourBack csapata.',
  },
  {
    name: 'lemondás — kapacitáshiány',
    body: 'Kedves {Név}! Sajnos jelenleg nincs szabad gyógytornász-kapacitásunk a foglalt időpontodra, ezért azt törölnünk kellett. Hamarosan jelentkezünk egy új javaslattal. Üdvözlettel, a FixYourBack csapata.',
  },
]

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
  }

  return (
    <SalesDataContext.Provider value={value}>
      {children}
      {adminModal}
    </SalesDataContext.Provider>
  )
}

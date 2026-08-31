import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { initialSalesClients, type SalesClient } from '../data/salesClients'
import { buildInitialSalesCalls, getBaseDaySlots, parseISODateLocal, type SalesCall, type TimeSlot } from '../data/calendarData'
import { useAdminEditGuard } from '../hooks/useAdminEditGuard'

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

// egy naptár-sáv foglalása — a "label" mindig megvan (ez jelenik meg a
// rácsban), a "clientId" csak akkor, ha a foglalás egy VALÓDI, a session
// alatt létrehozott ügyfélhez tartozik (a demó-adat generált "foglalt" sávjai
// — ld. getBaseDaySlots — sosem kapnak clientId-t, ezért nem szerkeszthetők
// utólag: nincs mögöttük valódi adat, amit meg lehetne nyitni)
type Booking = { label: string; clientId?: string }

type SalesDataContextValue = {
  clients: SalesClient[]
  setClients: Dispatch<SetStateAction<SalesClient[]>>
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

function bookingKey(gytId: string, dateISO: string, hour: number) {
  return `${gytId}__${dateISO}__${hour}`
}

export function SalesDataProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<SalesClient[]>(initialSalesClients)
  const [today] = useState(() => new Date())
  const [salesCalls, setSalesCalls] = useState<SalesCall[]>(() => buildInitialSalesCalls(today))
  const [bookings, setBookings] = useState<Record<string, Booking>>({})
  const [adminAddedIds, setAdminAddedIds] = useState<Set<string>>(new Set())
  const [messageTemplates, setMessageTemplates] = useState<[MessageTemplate, MessageTemplate]>(DEFAULT_MESSAGE_TEMPLATES)
  const { active: adminActive, guard: adminGuard, isModified, modal: adminModal } = useAdminEditGuard('sales')

  function isBooked(gytId: string, dateISO: string, hour: number) {
    return Boolean(bookings[bookingKey(gytId, dateISO, hour)])
  }

  function getEffectiveSlot(gytId: string, dateISO: string, hour: number): TimeSlot {
    const override = bookings[bookingKey(gytId, dateISO, hour)]
    if (override) return { hour, status: 'foglalt', label: override.label }
    return getBaseDaySlots(gytId, parseISODateLocal(dateISO), today).find((s) => s.hour === hour) ?? { hour }
  }

  function getBookingClientId(gytId: string, dateISO: string, hour: number) {
    return bookings[bookingKey(gytId, dateISO, hour)]?.clientId
  }

  function addBooking(gytId: string, dateISO: string, hour: number, label: string, clientId?: string) {
    setBookings((prev) => ({ ...prev, [bookingKey(gytId, dateISO, hour)]: { label, clientId } }))
  }

  // pl. egy hívás elutasításakor, ha közben már le is foglaltuk a GYT-időpontot —
  // ilyenkor a foglalást is fel kell szabadítani, ne maradjon "árva" bejegyzés
  function removeBooking(gytId: string, dateISO: string, hour: number) {
    setBookings((prev) => {
      const next = { ...prev }
      delete next[bookingKey(gytId, dateISO, hour)]
      return next
    })
  }

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

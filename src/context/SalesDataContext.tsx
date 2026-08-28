import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { initialSalesClients, type SalesClient } from '../data/salesClients'
import {
  GYT_COLLEAGUES,
  buildInitialSalesCalls,
  getBaseDaySlots,
  parseISODateLocal,
  type SalesCall,
  type TimeSlot,
} from '../data/calendarData'
import { useAdminEditGuard } from '../hooks/useAdminEditGuard'
import GytBookingModal, { type PickedSlot } from '../components/GytBookingModal'

export type BookingModalConfig = {
  clientPreview?: { name: string; email: string; phone: string }
  preselectedGytId?: string | null
  onConfirm: (slot: PickedSlot) => void
}

type SalesDataContextValue = {
  clients: SalesClient[]
  setClients: Dispatch<SetStateAction<SalesClient[]>>
  salesCalls: SalesCall[]
  setSalesCalls: Dispatch<SetStateAction<SalesCall[]>>
  bookings: Record<string, string>
  isBooked: (gytId: string, dateISO: string, hour: number) => boolean
  getEffectiveSlot: (gytId: string, dateISO: string, hour: number) => TimeSlot
  addBooking: (gytId: string, dateISO: string, hour: number, label: string) => void
  today: Date
  adminActive: boolean
  adminGuard: (id: string | string[], action: () => void) => void
  isModified: (id: string) => boolean
  adminAddedIds: Set<string>
  markAdminAdded: (id: string) => void
  openBookingModal: (config: BookingModalConfig) => void
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
  const [bookings, setBookings] = useState<Record<string, string>>({})
  const [adminAddedIds, setAdminAddedIds] = useState<Set<string>>(new Set())
  const [modalConfig, setModalConfig] = useState<BookingModalConfig | null>(null)
  const { active: adminActive, guard: adminGuard, isModified, modal: adminModal } = useAdminEditGuard('sales')

  function isBooked(gytId: string, dateISO: string, hour: number) {
    return Boolean(bookings[bookingKey(gytId, dateISO, hour)])
  }

  function getEffectiveSlot(gytId: string, dateISO: string, hour: number): TimeSlot {
    const override = bookings[bookingKey(gytId, dateISO, hour)]
    if (override) return { hour, status: 'foglalt', label: override }
    return getBaseDaySlots(gytId, parseISODateLocal(dateISO), today).find((s) => s.hour === hour) ?? { hour }
  }

  function addBooking(gytId: string, dateISO: string, hour: number, label: string) {
    setBookings((prev) => ({ ...prev, [bookingKey(gytId, dateISO, hour)]: label }))
  }

  function markAdminAdded(id: string) {
    setAdminAddedIds((prev) => new Set(prev).add(id))
  }

  const value: SalesDataContextValue = {
    clients,
    setClients,
    salesCalls,
    setSalesCalls,
    bookings,
    isBooked,
    getEffectiveSlot,
    addBooking,
    today,
    adminActive,
    adminGuard,
    isModified,
    adminAddedIds,
    markAdminAdded,
    openBookingModal: setModalConfig,
  }

  return (
    <SalesDataContext.Provider value={value}>
      {children}
      {modalConfig && (
        <GytBookingModal
          gytOptions={GYT_COLLEAGUES}
          today={today}
          isBooked={isBooked}
          clientPreview={modalConfig.clientPreview}
          preselectedGytId={modalConfig.preselectedGytId ?? null}
          onConfirm={(slot) => {
            modalConfig.onConfirm(slot)
            setModalConfig(null)
          }}
          onCancel={() => setModalConfig(null)}
        />
      )}
      {adminModal}
    </SalesDataContext.Provider>
  )
}

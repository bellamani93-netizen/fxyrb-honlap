import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { initialClients, type Client } from '../data/initialClients'

// Az összevont ügyfél-nyilvántartás közös állapota — a SALES ÉS a GYT
// szerepkör EGY közös listát olvas/ír (2026.09.01., Marci kérésére: "vonjuk
// össze a két ügyfél nyilvántartó rendszert", ld. Design jegyzet 49. pont).
// Korábban a SALES (salesClients.ts) és a GYT (gytClients.ts) teljesen
// független, saját listát vezetett ugyanazokról az emberekről.

type ClientsContextValue = {
  clients: Client[]
  setClients: Dispatch<SetStateAction<Client[]>>
  updateClient: (id: string, patch: Partial<Client>) => void
}

const ClientsContext = createContext<ClientsContextValue | null>(null)

export function useClients() {
  const ctx = useContext(ClientsContext)
  if (!ctx) throw new Error('useClients csak ClientsProvideren belül használható')
  return ctx
}

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(initialClients)

  function updateClient(id: string, patch: Partial<Client>) {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }

  return <ClientsContext.Provider value={{ clients, setClients, updateClient }}>{children}</ClientsContext.Provider>
}

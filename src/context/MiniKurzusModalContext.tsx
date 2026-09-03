import { createContext, useContext, useState, type ReactNode } from 'react'
import MiniKurzusComingSoonModal from '../components/MiniKurzusComingSoonModal'

// A mini-kurzus/"gyorsítósáv" még nincs kész (2026.09.03., Marci kérésére) —
// minden rá mutató belépési pont (fejléc, lábléc, főoldal 2 gombja,
// időpontfoglalás oldal gombja) helyette ezt a "hamarosan" popupot nyitja
// meg. Egyetlen, a publikus `Layout`-ban élő állapot, hogy bármelyik oldal
// (Header/Footer is, ami minden publikus oldalon jelen van) ugyanazt az
// EGY popupot tudja megnyitni, prop-drilling nélkül.
type MiniKurzusModalContextValue = {
  open: () => void
}

const MiniKurzusModalContext = createContext<MiniKurzusModalContextValue | null>(null)

export function useMiniKurzusModal() {
  const ctx = useContext(MiniKurzusModalContext)
  if (!ctx) throw new Error('useMiniKurzusModal csak MiniKurzusModalProvideren belül használható')
  return ctx
}

export function MiniKurzusModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <MiniKurzusModalContext.Provider value={{ open: () => setIsOpen(true) }}>
      {children}
      {isOpen && <MiniKurzusComingSoonModal onClose={() => setIsOpen(false)} />}
    </MiniKurzusModalContext.Provider>
  )
}

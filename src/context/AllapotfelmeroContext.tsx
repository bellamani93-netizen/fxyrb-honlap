import { createContext, useContext, useState, type ReactNode } from 'react'

// Az ÜF-oldali "állapotfelmérő" kérdőív közös állapota (2026.09.03., Marci
// kérésére, 2. fázis indítása). Ez a fiók LEGELSŐ pontja: amíg nincs kitöltve
// és elmentve, a többi ÜF menüpont nem nyitható meg (ld. AppLayout.tsx
// buildUfNavItems + App.tsx UgyfelGate). Ebben a körben csak a design/UI
// készül el — a válaszok logikája és a generált eredménylap KÉSŐBBI fázis
// (Marci kérése). Nincs backend, ezért az állapot csak munkamenet-szintű
// (React state), oldal-frissítéskor elvész, ahogy a többi Context-nél is.

export type BodyChartMeret = 'pontszeru' | 'kis' | 'nagy'
export type BodyChartHely = 'kozepen' | 'ketoldalt' | 'egyikoldalt'
export type BodyChartNezet = 'hat' | 'rtg'

export type BodyChartJel = { x: number; y: number; meret: BodyChartMeret }

export type AllapotfelmeroAdatok = {
  megszolitas: string
  szuletesiEv: string
  szuletesiHo: string
  magassag: string
  suly: string
  tunetLeiras: string
  gyakorisag: string
  idotartam: string
  intenzitas: number
  bodyChartNezet: BodyChartNezet
  bodyChartMeret: BodyChartMeret
  bodyChartHely: BodyChartHely | ''
  bodyChartJelek: BodyChartJel[]
  kezdodesIdo: string
  voltMarKorabban: string
  miEsikJol: string
  mikorErzedLegjobban: string
  szerintedMiOka: string
  rizikofaktorokI: string[]
  rizikofaktorokII: string[]
  painLocation: 'also' | 'felso'
  proneOk: boolean
  shoulderOk: boolean
  kneePain: boolean
  highBloodPressure: boolean
  szemelyesCel: string
}

export const DEFAULT_ALLAPOTFELMERO_ADATOK: AllapotfelmeroAdatok = {
  megszolitas: '',
  szuletesiEv: '',
  szuletesiHo: '',
  magassag: '',
  suly: '',
  tunetLeiras: '',
  gyakorisag: '',
  idotartam: '',
  intenzitas: 5,
  bodyChartNezet: 'hat',
  bodyChartMeret: 'pontszeru',
  bodyChartHely: '',
  bodyChartJelek: [],
  kezdodesIdo: '',
  voltMarKorabban: '',
  miEsikJol: '',
  mikorErzedLegjobban: '',
  szerintedMiOka: '',
  rizikofaktorokI: [],
  rizikofaktorokII: [],
  painLocation: 'also',
  proneOk: true,
  shoulderOk: true,
  kneePain: false,
  highBloodPressure: false,
  szemelyesCel: '',
}

type AllapotfelmeroContextValue = {
  completed: boolean
  adatok: AllapotfelmeroAdatok
  setAdatok: (patch: Partial<AllapotfelmeroAdatok>) => void
  complete: () => void
}

const AllapotfelmeroContext = createContext<AllapotfelmeroContextValue | null>(null)

export function useAllapotfelmero() {
  const ctx = useContext(AllapotfelmeroContext)
  if (!ctx) throw new Error('useAllapotfelmero csak AllapotfelmeroProvideren belül használható')
  return ctx
}

export function AllapotfelmeroProvider({ children }: { children: ReactNode }) {
  const [completed, setCompleted] = useState(false)
  const [adatok, setAdatokState] = useState<AllapotfelmeroAdatok>(DEFAULT_ALLAPOTFELMERO_ADATOK)

  function setAdatok(patch: Partial<AllapotfelmeroAdatok>) {
    setAdatokState((prev) => ({ ...prev, ...patch }))
  }

  return (
    <AllapotfelmeroContext.Provider value={{ completed, adatok, setAdatok, complete: () => setCompleted(true) }}>
      {children}
    </AllapotfelmeroContext.Provider>
  )
}

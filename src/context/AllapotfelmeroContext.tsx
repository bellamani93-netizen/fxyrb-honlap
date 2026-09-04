import { createContext, useContext, useState, type ReactNode } from 'react'

// Az ÜF-oldali "állapotfelmérő" kérdőív közös állapota (2026.09.03., Marci
// kérésére, 2. fázis indítása). Ez a fiók LEGELSŐ pontja: amíg nincs kitöltve
// és elmentve, a többi ÜF menüpont nem nyitható meg (ld. AppLayout.tsx
// buildUfNavItems + App.tsx UgyfelGate). Ebben a körben csak a design/UI
// készül el — a válaszok logikája és a generált eredménylap KÉSŐBBI fázis
// (Marci kérése). Nincs backend, ezért az állapot csak munkamenet-szintű
// (React state), oldal-frissítéskor elvész, ahogy a többi Context-nél is.

export type BodyChartMeret = 'pontszeru' | 'kis' | 'nagy'
export type BodyChartNezet = 'hat' | 'rtg'

export type BodyChartPont = { x: number; y: number }

/** egy "jelölés" mostantól egy PONTSOR (nem csak egyetlen x/y) — 1 pont =
 * pontszerű koppintás, 2+ pont = kézzel húzott vonal (2026.09.04., Marci
 * kérésére: "rajzolni pontszerű rákoppintással, és vonalhúzással is lehet"). */
export type BodyChartJel = { points: BodyChartPont[]; meret: BodyChartMeret }

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
  intenzitas: 0,
  bodyChartNezet: 'hat',
  bodyChartMeret: 'pontszeru',
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
  /** új jelölés indítása egy ponttal (koppintás VAGY egy húzás kezdete). */
  addBodyChartStroke: (meret: BodyChartMeret, point: BodyChartPont) => void
  /** a LEGUTOLSÓ jelöléshez ad hozzá egy pontot (húzás közben, pointermove-onként) —
   * mindig a friss állapotból indul (funkcionális setState), hogy gyors, egymást
   * követő pointermove-eseményeknél se maradjon le pont. */
  extendLastBodyChartStroke: (point: BodyChartPont) => void
  /** a legutóbbi jelölés (pont vagy vonal) törlése — "visszavonás" gomb. */
  undoLastBodyChartStroke: () => void
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

  function addBodyChartStroke(meret: BodyChartMeret, point: BodyChartPont) {
    setAdatokState((prev) => ({ ...prev, bodyChartJelek: [...prev.bodyChartJelek, { points: [point], meret }] }))
  }

  function extendLastBodyChartStroke(point: BodyChartPont) {
    setAdatokState((prev) => {
      if (prev.bodyChartJelek.length === 0) return prev
      const jelek = prev.bodyChartJelek.slice()
      const last = jelek[jelek.length - 1]
      jelek[jelek.length - 1] = { ...last, points: [...last.points, point] }
      return { ...prev, bodyChartJelek: jelek }
    })
  }

  function undoLastBodyChartStroke() {
    setAdatokState((prev) => ({ ...prev, bodyChartJelek: prev.bodyChartJelek.slice(0, -1) }))
  }

  return (
    <AllapotfelmeroContext.Provider
      value={{ completed, adatok, setAdatok, complete: () => setCompleted(true), addBodyChartStroke, extendLastBodyChartStroke, undoLastBodyChartStroke }}
    >
      {children}
    </AllapotfelmeroContext.Provider>
  )
}

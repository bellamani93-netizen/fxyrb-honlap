import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import type { GerincterhelesEredmeny } from '../components/GerincterhelesKalkulator'

// Az ÜF-oldali "állapotfelmérő" kérdőív közös állapota (2026.09.03., Marci
// kérésére, 2. fázis indítása). Ez a fiók LEGELSŐ pontja: amíg nincs kitöltve
// és elmentve, a többi ÜF menüpont nem nyitható meg (ld. AppLayout.tsx
// buildUfNavItems + App.tsx UgyfelGate). Nincs backend, ezért az állapot
// csak munkamenet-szintű (React state), oldal-frissítéskor elvész, ahogy a
// többi Context-nél is — ez az Eredménylapra (ld. src/pages/Eredmenyeim.tsx,
// 2026.09.07.) is érvényes.

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
  proneOk: boolean
  /** korábban boolean (igen/nem) volt — Marci kérésére (2026.09.04.) egy
   * harmadik válasz-lehetőséggel bővült ("igen, de érzékeny"). */
  shoulderOk: 'igen' | 'nem' | 'erzekeny'
  kneePain: boolean
  /** új mező (2026.09.04., Marci kérésére) — "nyaki panaszod van?" igen/nem. */
  nyakiPanasz: boolean
  szemelyesCel: string
  /** a gerincterhelés kalkulátor (10. lap) legutóbbi eredménye — az
   * Eredménylap "Gerincterhelés szakasza" ezt jeleníti meg újra, ugyanazzal
   * a logikával, amit a kalkulátor számolt (2026.09.07., Marci kérésére).
   * `null`, amíg a kalkulátor még nem futott le legalább egyszer. */
  gerincterhelesEredmeny: GerincterhelesEredmeny | null
  /** a "beküldés" pillanatában rögzített dátum (ld. Allapotfelmero.tsx
   * handleNext) — az Eredménylap "Kitöltés időpontja" sora ezt mutatja
   * (2026.09.07., Marci kérésére). `null`, amíg nincs beküldve. */
  kitoltesDatuma: string | null
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
  proneOk: true,
  shoulderOk: 'igen',
  kneePain: false,
  nyakiPanasz: false,
  szemelyesCel: '',
  gerincterhelesEredmeny: null,
  kitoltesDatuma: null,
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

  // Mindegyik `useCallback`-kel STABIL referenciájú (üres függőségi tömb) —
  // egyik sem hivatkozik a `completed`/`adatok` külső változóra, mindig a
  // funkcionális `setAdatokState((prev) => ...)` formát használják. Ez
  // fontos: a GerincterhelesKalkulator `React.memo`-ba van csomagolva (ld.
  // ott a jegyzetet), és ha a neki átadott `onResultChange` callback minden
  // render alkalmával ÚJ függvény-referenciát kapna (mert pl. `setAdatok`
  // maga instabil), a memo hiába van, a szülő újrarenderelése MÉGIS
  // érintené — pontosan az a hiba térne vissza, amit korábban ez a memo
  // orvosolt (2026.09.07.).
  const setAdatok = useCallback((patch: Partial<AllapotfelmeroAdatok>) => {
    setAdatokState((prev) => ({ ...prev, ...patch }))
  }, [])

  const addBodyChartStroke = useCallback((meret: BodyChartMeret, point: BodyChartPont) => {
    setAdatokState((prev) => ({ ...prev, bodyChartJelek: [...prev.bodyChartJelek, { points: [point], meret }] }))
  }, [])

  const extendLastBodyChartStroke = useCallback((point: BodyChartPont) => {
    setAdatokState((prev) => {
      if (prev.bodyChartJelek.length === 0) return prev
      const jelek = prev.bodyChartJelek.slice()
      const last = jelek[jelek.length - 1]
      jelek[jelek.length - 1] = { ...last, points: [...last.points, point] }
      return { ...prev, bodyChartJelek: jelek }
    })
  }, [])

  const undoLastBodyChartStroke = useCallback(() => {
    setAdatokState((prev) => ({ ...prev, bodyChartJelek: prev.bodyChartJelek.slice(0, -1) }))
  }, [])

  const complete = useCallback(() => setCompleted(true), [])

  return (
    <AllapotfelmeroContext.Provider
      value={{ completed, adatok, setAdatok, complete, addBodyChartStroke, extendLastBodyChartStroke, undoLastBodyChartStroke }}
    >
      {children}
    </AllapotfelmeroContext.Provider>
  )
}

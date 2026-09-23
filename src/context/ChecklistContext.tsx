import { createContext, useContext, useState, type ReactNode } from 'react'
import { HOLD_START_SECONDS, HOLD_STEP_SECONDS, HOLD_STEP_DAYS, maxHoldSeconds, type ClientVariables } from '../data/tornaSzintek'

// GYT/ÜF-oldali "checklist" (2026.09.23., Marci kérésére, 5. fázis — a
// Projekt specifikáció "Checklist (naponta tölthető)" építőeleme alapján):
// "egy olyan, nagyon egyszerűen használható felület, ahova naponta tudja az
// üf követni az állapotát/a torna kivitelezését. Ezt szintenként könnyen
// érthető, látványos diagramokon lehet látni. A gyt erre rálát, és
// szinthez kötött."
//
// Egyeztetés eredménye (AskUserQuestion, kódírás előtt):
// - EGYSZERŰBB ELSŐ VERZIÓ: a spec dicséretei/figyelmeztető üzenetei,
//   pontszámítása és az automatikus (10/14 napos) szint-zárolási szabálya
//   EBBŐL A KÖRBŐL KIMARAD — csak a napi adatrögzítés + diagramok + GYT-
//   rálátás + szabad szint-váltás épül meg. A spec maga is külön fázisként
//   kezeli a "gamification"-t (dicséretek, ranglista), ami erre épül majd.
// - a "Következő szint kezdése" gombot az ÜF maga nyomja meg, SZABADON,
//   nincs 10/14 napos feltétel-ellenőrzés ebben a körben.
// - egy nap EGY bejegyzés (nem edzésenkénti külön rekord) — "Még egy
//   edzést hozzáadok" csak egy számlálót növel (`extraWorkouts`).
// - a diagramokhoz a `recharts` könyvtár került bevezetésre (Marci
//   kifejezett választása egy kézzel rajzolt SVG-s alternatíva helyett).
//
// A szint-szám ÜGYFÉLFÜGGŐ (12 VAGY 13, ld. `tornaSzintek.ts` SEQUENCES) —
// NEM fix 12, ahogy a spec (a Design jegyzet korábban ezt jelezte,
// tisztázandóként a checklist-fázisra) — a tényleges kiszámított
// sorrend (`suggestedSequence`) hosszát használjuk.
//
// FONTOS, SZÁNDÉKOS EGYSZERŰSÍTÉS: ez a "szint" ÁLLAPOT (jelenlegi szint,
// kezdő dátum) SAJÁT, a checklisthez tartozó állapot — NEM ugyanaz, mint a
// GYT-oldali videókiosztás `Client.levels` (GytLevel[]) mezője, ami a
// VIDEÓ-HOZZÁFÉRÉS zárolási állapotát követi. A két rendszer még nincs
// összekötve (a `Gyakorlatok.tsx` ÜF-oldali "szintjeid" nézet is jelenleg
// teljesen statikus/demó-adat, nem kontextusból jön) — ez egy tudatos,
// dokumentált hiány, amit egy KÉSŐBBI kör köthet majd össze.
//
// Nincs backend, ezért session-szintű állapot — ugyanaz a minta, mint a
// többi Provider esetében.

export type SymptomDuringExercise = 'nincs' | 'izomlaz' | 'pici_feszules' | 'pici_huzodas' | 'fajdalom' | 'gorcs' | 'egyeb'

export const SYMPTOM_OPTIONS: { value: SymptomDuringExercise; label: string }[] = [
  { value: 'nincs', label: 'nincs' },
  { value: 'izomlaz', label: 'izomláz' },
  { value: 'pici_feszules', label: 'pici feszülés' },
  { value: 'pici_huzodas', label: 'pici húzódás' },
  { value: 'fajdalom', label: 'fájdalom' },
  { value: 'gorcs', label: 'görcs' },
  { value: 'egyeb', label: 'egyéb' },
]

/** "0, 0.25, 0.5, 0.75, 1, majd félóránként 24-ig" (Projekt specifikáció,
 * "Mért paraméterek" — Tünet napi időtartam). */
export const DURATION_STEPS: number[] = (() => {
  const steps = [0, 0.25, 0.5, 0.75]
  for (let h = 1; h <= 24; h += 0.5) steps.push(h)
  return steps
})()

export type ChecklistEntry = {
  /** ISO dátum (YYYY-MM-DD) — naponta egy bejegyzés. */
  date: string
  /** melyik szinthez tartozik a bejegyzés — a diagramok "csak ezen a
   * szinten" nézete ezzel szűr. */
  level: number
  trained: boolean
  /** "Még egy edzést hozzáadok" — hányszor jelezte az ÜF, hogy aznap TÖBB
   * edzés is volt (az alap `trained` mellett). */
  extraWorkouts: number
  symptom: SymptomDuringExercise
  symptomDurationHours: number
  symptomIntensity: number
  loadOptimization: number
  savedAt: string
}

type ChecklistClientState = {
  currentLevel: number
  levelStartDate: string
  entries: ChecklistEntry[]
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function emptyState(): ChecklistClientState {
  return { currentLevel: 1, levelStartDate: todayISO(), entries: [] }
}

/** a mai napra "kitűzött" megtartás-idő (mp) — csak TÁJÉKOZTATÓ, nem
 * bevihető érték (ld. Projekt specifikáció: "Dátum: csak a kezdődátum
 * állítandó, utána automatikus számítás"). A szint kezdő dátuma óta eltelt
 * napok száma alapján, `HOLD_STEP_DAYS`-enként +`HOLD_STEP_SECONDS`,
 * `maxHoldSeconds()`-ig (magas vérnyomásnál alacsonyabb felső korlát). */
export function computeHoldSeconds(levelStartDate: string, date: string, variables: Pick<ClientVariables, 'highBloodPressure'>): number {
  const start = new Date(levelStartDate)
  const current = new Date(date)
  const daysSinceStart = Math.max(0, Math.floor((current.getTime() - start.getTime()) / 86400000))
  const steps = Math.floor(daysSinceStart / HOLD_STEP_DAYS)
  return Math.min(HOLD_START_SECONDS + steps * HOLD_STEP_SECONDS, maxHoldSeconds(variables))
}

export type DailyEntryInput = {
  trained: boolean
  symptom: SymptomDuringExercise
  symptomDurationHours: number
  symptomIntensity: number
  loadOptimization: number
}

type ChecklistContextValue = {
  getState: (clientId: string) => ChecklistClientState
  getTodayEntry: (clientId: string) => ChecklistEntry | undefined
  saveTodayEntry: (clientId: string, data: DailyEntryInput) => void
  addExtraWorkout: (clientId: string) => void
  advanceLevel: (clientId: string, maxLevel: number) => void
}

const ChecklistContext = createContext<ChecklistContextValue | null>(null)

export function useChecklist() {
  const ctx = useContext(ChecklistContext)
  if (!ctx) throw new Error('useChecklist csak ChecklistProvideren belül használható')
  return ctx
}

export function ChecklistProvider({ children }: { children: ReactNode }) {
  const [stateByClient, setStateByClient] = useState<Record<string, ChecklistClientState>>({})

  function getState(clientId: string): ChecklistClientState {
    return stateByClient[clientId] ?? emptyState()
  }

  // FONTOS: egy bejegyzést a (dátum, szint) PÁR azonosít, nem csak a dátum
  // — ha az ÜF ugyanazon a napon vált szintet (pl. "Következő szint
  // kezdése" gomb), az ÚJ szinten a mai nap ÚJRA üresen induljon, ne a
  // korábbi (előző szintes) mai bejegyzést mutassa/írja felül. Ez egy
  // ténylegesen előforduló hiba volt a böngészős tesztelés során.
  function getTodayEntry(clientId: string): ChecklistEntry | undefined {
    const current = getState(clientId)
    const today = todayISO()
    return current.entries.find((e) => e.date === today && e.level === current.currentLevel)
  }

  function saveTodayEntry(clientId: string, data: DailyEntryInput) {
    setStateByClient((prev) => {
      const current = prev[clientId] ?? emptyState()
      const today = todayISO()
      const existing = current.entries.find((e) => e.date === today && e.level === current.currentLevel)
      const entry: ChecklistEntry = {
        date: today,
        level: current.currentLevel,
        extraWorkouts: existing?.extraWorkouts ?? 0,
        savedAt: existing?.savedAt ?? new Date().toISOString(),
        ...data,
      }
      const entries = existing
        ? current.entries.map((e) => (e.date === today && e.level === current.currentLevel ? entry : e))
        : [...current.entries, entry]
      return { ...prev, [clientId]: { ...current, entries } }
    })
  }

  function addExtraWorkout(clientId: string) {
    setStateByClient((prev) => {
      const current = prev[clientId] ?? emptyState()
      const today = todayISO()
      const entries = current.entries.map((e) =>
        e.date === today && e.level === current.currentLevel ? { ...e, extraWorkouts: e.extraWorkouts + 1 } : e
      )
      return { ...prev, [clientId]: { ...current, entries } }
    })
  }

  /** "Következő szint kezdése" — Marci kérésére (2026.09.23.) szabadon, az
   * ÜF saját döntése alapján, feltétel-ellenőrzés NÉLKÜL (ld. modul-tető
   * jegyzet). `maxLevel` a hívó (ÜF oldal) adja át, a kliens tényleges
   * gyakorlat-sorrendjének hossza alapján — az utolsó szintnél a gomb
   * onnantól nem hoz létre újabbat. */
  function advanceLevel(clientId: string, maxLevel: number) {
    setStateByClient((prev) => {
      const current = prev[clientId] ?? emptyState()
      if (current.currentLevel >= maxLevel) return prev
      return { ...prev, [clientId]: { ...current, currentLevel: current.currentLevel + 1, levelStartDate: todayISO() } }
    })
  }

  return (
    <ChecklistContext.Provider value={{ getState, getTodayEntry, saveTodayEntry, addExtraWorkout, advanceLevel }}>
      {children}
    </ChecklistContext.Provider>
  )
}

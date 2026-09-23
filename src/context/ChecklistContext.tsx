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
  /** a JELENLEGI szint kezdő dátuma — `computeHoldSeconds()`-hoz. */
  levelStartDate: string
  /** MINDEN valaha elkezdett szint kezdő dátuma, szint szerint kulcsolva —
   * a diagramok "1 szint = 2 hetes idősáv" rögzített szélességéhez kell
   * (ld. 171. pont, Marci kérésére), akkor is, ha a GYT egy KORÁBBI
   * szintet néz vissza, aminek már nem `levelStartDate` a kezdete. */
  levelStartDates: Record<number, string>
  entries: ChecklistEntry[]
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function emptyState(): ChecklistClientState {
  const start = todayISO()
  return { currentLevel: 1, levelStartDate: start, levelStartDates: { 1: start }, entries: [] }
}

function daysAgoISO(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

/** Péter (ÜF-demó, `id: 'peter'`) 1. szintjéhez előre kitöltött, 9 napos
 * példa-adatsor (2026.09.23., Marci kérésére: "csinálj egy példaszintet,
 * amikor ki van töltve adatokkal a Péter checklistje az 1. szintre, hogy
 * megnézzem, mi látszik a diagramokon") — SZÁNDÉKOSAN javuló tendenciájú
 * (csökkenő tünet-időtartam/intenzitás, növekvő terhelés-optimalizálás),
 * hogy a diagramok érdemi, jól leolvasható trendet mutassanak, ne csak
 * szórt pontokat. A dátumok mindig a MAI naphoz képest relatívak (nem
 * hardkódolt naptári dátumok), hogy a példa akkor is friss/értelmes
 * maradjon, ha valaki egy KÉSŐBBI napon nyitja meg a prototípust. A MAI
 * nap szándékosan ÜRESEN marad, hogy a napi rögzítés folyamata is
 * kipróbálható legyen rajta keresztül. */
const DEMO_SEED_PETER: ChecklistClientState = {
  currentLevel: 1,
  levelStartDate: daysAgoISO(9),
  levelStartDates: { 1: daysAgoISO(9) },
  entries: [
    { date: daysAgoISO(9), level: 1, trained: true, extraWorkouts: 0, symptom: 'fajdalom', symptomDurationHours: 3, symptomIntensity: 6, loadOptimization: 35, savedAt: `${daysAgoISO(9)}T18:00:00.000Z` },
    { date: daysAgoISO(8), level: 1, trained: true, extraWorkouts: 0, symptom: 'fajdalom', symptomDurationHours: 2.5, symptomIntensity: 6, loadOptimization: 40, savedAt: `${daysAgoISO(8)}T18:00:00.000Z` },
    { date: daysAgoISO(7), level: 1, trained: false, extraWorkouts: 0, symptom: 'pici_huzodas', symptomDurationHours: 2, symptomIntensity: 5, loadOptimization: 45, savedAt: `${daysAgoISO(7)}T18:00:00.000Z` },
    { date: daysAgoISO(6), level: 1, trained: true, extraWorkouts: 1, symptom: 'pici_huzodas', symptomDurationHours: 1.5, symptomIntensity: 4, loadOptimization: 50, savedAt: `${daysAgoISO(6)}T18:00:00.000Z` },
    { date: daysAgoISO(5), level: 1, trained: true, extraWorkouts: 0, symptom: 'pici_feszules', symptomDurationHours: 1.5, symptomIntensity: 4, loadOptimization: 55, savedAt: `${daysAgoISO(5)}T18:00:00.000Z` },
    { date: daysAgoISO(4), level: 1, trained: true, extraWorkouts: 0, symptom: 'pici_feszules', symptomDurationHours: 1, symptomIntensity: 3, loadOptimization: 60, savedAt: `${daysAgoISO(4)}T18:00:00.000Z` },
    { date: daysAgoISO(3), level: 1, trained: true, extraWorkouts: 0, symptom: 'izomlaz', symptomDurationHours: 0.75, symptomIntensity: 2, loadOptimization: 65, savedAt: `${daysAgoISO(3)}T18:00:00.000Z` },
    { date: daysAgoISO(2), level: 1, trained: true, extraWorkouts: 1, symptom: 'nincs', symptomDurationHours: 0.5, symptomIntensity: 1, loadOptimization: 70, savedAt: `${daysAgoISO(2)}T18:00:00.000Z` },
    { date: daysAgoISO(1), level: 1, trained: true, extraWorkouts: 0, symptom: 'nincs', symptomDurationHours: 0, symptomIntensity: 0, loadOptimization: 75, savedAt: `${daysAgoISO(1)}T18:00:00.000Z` },
  ],
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
  const [stateByClient, setStateByClient] = useState<Record<string, ChecklistClientState>>({ peter: DEMO_SEED_PETER })

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
      const newLevel = current.currentLevel + 1
      const start = todayISO()
      return {
        ...prev,
        [clientId]: {
          ...current,
          currentLevel: newLevel,
          levelStartDate: start,
          levelStartDates: { ...current.levelStartDates, [newLevel]: start },
        },
      }
    })
  }

  return (
    <ChecklistContext.Provider value={{ getState, getTodayEntry, saveTodayEntry, addExtraWorkout, advanceLevel }}>
      {children}
    </ChecklistContext.Provider>
  )
}

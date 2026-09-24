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
// - a diagramokhoz a `recharts` könyvtár került bevezetésre (Marci
//   kifejezett választása egy kézzel rajzolt SVG-s alternatíva helyett).
//
// A szint-szám ÜGYFÉLFÜGGŐ (12 VAGY 13, ld. `tornaSzintek.ts` SEQUENCES) —
// NEM fix 12, ahogy a spec — a tényleges kiszámított sorrend
// (`suggestedSequence`) hosszát használjuk.
//
// FONTOS, SZÁNDÉKOS EGYSZERŰSÍTÉS: ez a "szint" ÁLLAPOT (jelenlegi szint,
// kezdő dátum) SAJÁT, a checklisthez tartozó állapot — NEM ugyanaz, mint a
// GYT-oldali videókiosztás `Client.levels` (GytLevel[]) mezője, ami a
// VIDEÓ-HOZZÁFÉRÉS zárolási állapotát követi. A két rendszer még nincs
// összekötve — ez egy tudatos, dokumentált hiány, amit egy KÉSŐBBI kör
// köthet majd össze.
//
// Nincs backend, ezért session-szintű állapot — ugyanaz a minta, mint a
// többi Provider esetében.
//
// 172. PONT (2026.09.24., Marci kérésére) — a fő adatmodell két helyen
// bővült:
// - egy nap EGY bejegyzés (`ChecklistEntry`) marad, de a "hányszor volt
//   edzés aznap" mostantól NEM egy puszta számláló (`extraWorkouts`), hanem
//   egy `workouts: SymptomDuringExercise[]` TÖMB, EDZÉSENKÉNT saját
//   tünet-válasszal — "Ha még egy edzést hozzáadok, akkor megint lehessen
//   jelölni, hogy volt-e közben tünet. Ez megjelenik a diagramon is, az
//   adott oszlop lehet pl. alul sárga, mert ott volt tünet, de fölötte
//   türkiz, mert ott meg nem volt" (a halmozott oszlop-diagramhoz kell). A
//   nap ÖSSZESÍTETT tünet-időtartama/-intenzitása (`symptomDurationHours`/
//   `symptomIntensity`) továbbra is NAPI szintű, egyetlen érték marad — nem
//   edzésenkénti —, ahogy eddig is.
// - a "mai javasolt megtartási idő" mostantól KÉZZEL FELÜLBÍRÁLHATÓ ("csak
//   ugyanakkora, vagy kisebb másodperc választható, min. 1-ig") — ezt EGY
//   ÖNÁLLÓ `holdOverrides` térkép tárolja, (dátum, szint) kulccsal, NEM a
//   `ChecklistEntry` mezőjeként — mert a felülbírálás FÜGGETLEN attól, hogy
//   a nap fő űrlapja (edzés/tünet/terhelés) már mentve van-e (ld.
//   `getHoldSecondsForDay`).

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
  /** minden aznapi edzés (a fő + a "még egy edzést hozzáadok" extrák) saját
   * tünet-válasza, sorrendben — a fő űrlap "tünet gyakorlat közben"
   * mezője adja a `workouts[0]`-t, minden további edzés a saját, önállóan
   * választott tünet-típusával kerül a tömb végére. `trained === false`
   * esetén üres tömb. */
  workouts: SymptomDuringExercise[]
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
   * a diagramok "1 szint = 2 hetes idősáv" rögzített szélességéhez, és az
   * "előző szint" gombhoz kell (a korábbi szint kezdő dátuma NEM tolódik
   * el, amikor visszalépünk rá). */
  levelStartDates: Record<number, string>
  /** a "mai javasolt megtartási idő" kézi felülbírálása, (dátum, szint)
   * kulccsal (ld. `holdKey`) — ha egy adott napra/szintre nincs bejegyzés
   * itt, a `computeHoldSeconds()` szerinti alapértelmezett érvényes. */
  holdOverrides: Record<string, number>
  entries: ChecklistEntry[]
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function holdKey(date: string, level: number): string {
  return `${date}_${level}`
}

function emptyState(): ChecklistClientState {
  const start = todayISO()
  return { currentLevel: 1, levelStartDate: start, levelStartDates: { 1: start }, holdOverrides: {}, entries: [] }
}

function daysAgoISO(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

/** Péter (ÜF-demó, `id: 'peter'`) 1. szintjéhez előre kitöltött, 9 napos
 * példa-adatsor (2026.09.23., Marci kérésére) — SZÁNDÉKOSAN javuló
 * tendenciájú (csökkenő tünet-időtartam/intenzitás, növekvő
 * terhelés-optimalizálás). A dátumok mindig a MAI naphoz képest relatívak.
 * A MAI nap szándékosan ÜRESEN marad, hogy a napi rögzítés kipróbálható
 * legyen. A két, extra edzést is tartalmazó nap (-6, -2) mostantól VEGYES
 * `workouts` tömböt kap (2026.09.24., 172. pont), hogy a halmozott
 * oszlop-diagram szín-keveredése ("alul sárga... fölötte türkiz") is
 * rögtön látszódjon a példán. */
const DEMO_SEED_PETER: ChecklistClientState = {
  currentLevel: 1,
  levelStartDate: daysAgoISO(9),
  levelStartDates: { 1: daysAgoISO(9) },
  holdOverrides: {},
  entries: [
    { date: daysAgoISO(9), level: 1, trained: true, workouts: ['fajdalom'], symptomDurationHours: 3, symptomIntensity: 6, loadOptimization: 35, savedAt: `${daysAgoISO(9)}T18:00:00.000Z` },
    { date: daysAgoISO(8), level: 1, trained: true, workouts: ['fajdalom'], symptomDurationHours: 2.5, symptomIntensity: 6, loadOptimization: 40, savedAt: `${daysAgoISO(8)}T18:00:00.000Z` },
    { date: daysAgoISO(7), level: 1, trained: false, workouts: [], symptomDurationHours: 2, symptomIntensity: 5, loadOptimization: 45, savedAt: `${daysAgoISO(7)}T18:00:00.000Z` },
    { date: daysAgoISO(6), level: 1, trained: true, workouts: ['pici_huzodas', 'nincs'], symptomDurationHours: 1.5, symptomIntensity: 4, loadOptimization: 50, savedAt: `${daysAgoISO(6)}T18:00:00.000Z` },
    { date: daysAgoISO(5), level: 1, trained: true, workouts: ['pici_feszules'], symptomDurationHours: 1.5, symptomIntensity: 4, loadOptimization: 55, savedAt: `${daysAgoISO(5)}T18:00:00.000Z` },
    { date: daysAgoISO(4), level: 1, trained: true, workouts: ['pici_feszules'], symptomDurationHours: 1, symptomIntensity: 3, loadOptimization: 60, savedAt: `${daysAgoISO(4)}T18:00:00.000Z` },
    { date: daysAgoISO(3), level: 1, trained: true, workouts: ['izomlaz'], symptomDurationHours: 0.75, symptomIntensity: 2, loadOptimization: 65, savedAt: `${daysAgoISO(3)}T18:00:00.000Z` },
    { date: daysAgoISO(2), level: 1, trained: true, workouts: ['nincs', 'izomlaz'], symptomDurationHours: 0.5, symptomIntensity: 1, loadOptimization: 70, savedAt: `${daysAgoISO(2)}T18:00:00.000Z` },
    { date: daysAgoISO(1), level: 1, trained: true, workouts: ['nincs'], symptomDurationHours: 0, symptomIntensity: 0, loadOptimization: 75, savedAt: `${daysAgoISO(1)}T18:00:00.000Z` },
  ],
}

/** a "javasolt" megtartás-idő (mp) — a szint kezdő dátuma óta eltelt napok
 * száma alapján, `HOLD_STEP_DAYS`-enként +`HOLD_STEP_SECONDS`,
 * `maxHoldSeconds()`-ig (magas vérnyomásnál alacsonyabb felső korlát). Ez
 * MINDIG a számított, felülbírálás NÉLKÜLI érték — a kézi felülbírálás
 * FELSŐ HATÁRA is ebből jön (ld. `getHoldSecondsForDay`, Checklist.tsx). */
export function computeHoldSeconds(levelStartDate: string, date: string, variables: Pick<ClientVariables, 'highBloodPressure'>): number {
  const start = new Date(levelStartDate)
  const current = new Date(date)
  const daysSinceStart = Math.max(0, Math.floor((current.getTime() - start.getTime()) / 86400000))
  const steps = Math.floor(daysSinceStart / HOLD_STEP_DAYS)
  return Math.min(HOLD_START_SECONDS + steps * HOLD_STEP_SECONDS, maxHoldSeconds(variables))
}

/** a TÉNYLEGES (esetleg kézzel felülbírált) megtartás-idő egy adott
 * napra/szintre — ha nincs felülbírálás, a `computeHoldSeconds()` szerinti
 * javasolt érték. Tisztán függvény (nem context-hívás), hogy a diagramok
 * (`ChecklistCharts`) és az oldal-komponensek (Checklist.tsx,
 * GytChecklist.tsx) is egyformán, közvetlenül használhassák, akár korábbi
 * (nem csak a "mai") napokra is. */
export function getHoldSecondsForDay(
  state: Pick<ChecklistClientState, 'levelStartDate' | 'levelStartDates' | 'holdOverrides'>,
  date: string,
  level: number,
  variables: Pick<ClientVariables, 'highBloodPressure'>
): number {
  const override = state.holdOverrides[holdKey(date, level)]
  if (override !== undefined) return override
  const start = state.levelStartDates[level] ?? state.levelStartDate
  return computeHoldSeconds(start, date, variables)
}

export type DailyEntryInput = {
  trained: boolean
  /** a fő edzés (a nap `workouts[0]`-ja) tünet-válasza. */
  symptom: SymptomDuringExercise
  symptomDurationHours: number
  symptomIntensity: number
  loadOptimization: number
}

type ChecklistContextValue = {
  getState: (clientId: string) => ChecklistClientState
  getTodayEntry: (clientId: string) => ChecklistEntry | undefined
  saveTodayEntry: (clientId: string, data: DailyEntryInput) => void
  /** "Még egy edzést hozzáadok" — a mai bejegyzés `workouts` tömbjéhez ad
   * egy ÚJ, önállóan választott tünet-válaszú edzést (2026.09.24., 172.
   * pont — a korábbi, puszta számláló helyett). */
  addWorkout: (clientId: string, symptom: SymptomDuringExercise) => void
  advanceLevel: (clientId: string, maxLevel: number) => void
  /** "Van olyan gomb, hogy következő szint kezdése, de nincs olyan, hogy
   * előző szint. Legyen ilyen gomb." (2026.09.24.) — a korábbi szintre
   * lép vissza, a korábbi szint EREDETI kezdő dátumát használva (NEM
   * indítja újra a megtartás-idő progresszióját). */
  previousLevel: (clientId: string) => void
  setHoldOverride: (clientId: string, date: string, level: number, seconds: number) => void
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
  // — ha az ÜF ugyanazon a napon vált szintet, az ÚJ szinten a mai nap
  // ÚJRA üresen induljon, ne a korábbi (előző szintes) mai bejegyzést
  // mutassa/írja felül.
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
      // a "szerkesztés"-sel újra mentett fő edzés a workouts[0]-t cseréli,
      // de a KÖZBEN esetleg már hozzáadott extra edzéseket (workouts[1..])
      // megőrzi — ugyanaz az elv, mint korábban az `extraWorkouts` számláló
      // megőrzésénél.
      const existingExtras = existing?.workouts.slice(1) ?? []
      const entry: ChecklistEntry = {
        date: today,
        level: current.currentLevel,
        trained: data.trained,
        workouts: data.trained ? [data.symptom, ...existingExtras] : [],
        symptomDurationHours: data.symptomDurationHours,
        symptomIntensity: data.symptomIntensity,
        loadOptimization: data.loadOptimization,
        savedAt: existing?.savedAt ?? new Date().toISOString(),
      }
      const entries = existing
        ? current.entries.map((e) => (e.date === today && e.level === current.currentLevel ? entry : e))
        : [...current.entries, entry]
      return { ...prev, [clientId]: { ...current, entries } }
    })
  }

  function addWorkout(clientId: string, symptom: SymptomDuringExercise) {
    setStateByClient((prev) => {
      const current = prev[clientId] ?? emptyState()
      const today = todayISO()
      const entries = current.entries.map((e) =>
        e.date === today && e.level === current.currentLevel ? { ...e, workouts: [...e.workouts, symptom] } : e
      )
      return { ...prev, [clientId]: { ...current, entries } }
    })
  }

  /** "Következő szint kezdése" — Marci kérésére szabadon, az ÜF saját
   * döntése alapján, feltétel-ellenőrzés NÉLKÜL. `maxLevel` a hívó (ÜF
   * oldal) adja át, a kliens tényleges gyakorlat-sorrendjének hossza
   * alapján — az utolsó szintnél a gomb onnantól nem hoz létre újabbat. */
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

  function previousLevel(clientId: string) {
    setStateByClient((prev) => {
      const current = prev[clientId] ?? emptyState()
      if (current.currentLevel <= 1) return prev
      const newLevel = current.currentLevel - 1
      // a korábbi szint MÁR ELTÁROLT kezdő dátumát használjuk — nem
      // indítjuk újra, hogy a megtartás-idő progressziója ne csússzon.
      const start = current.levelStartDates[newLevel] ?? todayISO()
      return {
        ...prev,
        [clientId]: { ...current, currentLevel: newLevel, levelStartDate: start },
      }
    })
  }

  function setHoldOverride(clientId: string, date: string, level: number, seconds: number) {
    setStateByClient((prev) => {
      const current = prev[clientId] ?? emptyState()
      return {
        ...prev,
        [clientId]: { ...current, holdOverrides: { ...current.holdOverrides, [holdKey(date, level)]: seconds } },
      }
    })
  }

  return (
    <ChecklistContext.Provider
      value={{ getState, getTodayEntry, saveTodayEntry, addWorkout, advanceLevel, previousLevel, setHoldOverride }}
    >
      {children}
    </ChecklistContext.Provider>
  )
}

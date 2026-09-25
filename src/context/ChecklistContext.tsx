import { createContext, useContext, useState, type ReactNode } from 'react'
import { HOLD_START_SECONDS, HOLD_STEP_SECONDS, HOLD_STEP_DAYS, maxHoldSeconds, type ClientVariables } from '../data/tornaSzintek'

// GYT/ÜF-oldali "checklist" (2026.09.23., Marci kérésére, 5. fázis — a
// Projekt specifikáció "Checklist (naponta tölthető)" építőeleme alapján):
// "egy olyan, nagyon egyszerűen használható felület, ahova naponta tudja az
// üf követni az állapotát/a torna kivitelezését. Ezt szintenként könnyen
// érthető, látványos diagramokon lehet látni. A gyt erre rálát, és
// szinthez kötött."
//
// A szint-szám ÜGYFÉLFÜGGŐ (12 VAGY 13, ld. `tornaSzintek.ts` SEQUENCES) —
// NEM fix 12, ahogy a spec — a tényleges kiszámított sorrend
// (`suggestedSequence`) hosszát használjuk.
//
// FONTOS, SZÁNDÉKOS EGYSZERŰSÍTÉS: ez a "szint" ÁLLAPOT (jelenlegi szint,
// kezdő dátum) SAJÁT, a checklisthez tartozó állapot — NEM ugyanaz, mint a
// GYT-oldali videókiosztás `Client.levels` (GytLevel[]) mezője.
//
// Nincs backend, ezért session-szintű állapot.
//
// 181. PONT (2026.09.24., Marci kérésére: "A checklist eredményei kártya az
// rendben van, a logikák is rendben, de a beviteli mező nem jó.
// Újrakészítjük nulláról.") — a napi BEVITELI ŰRLAP teljes újratervezése,
// diktált specifikáció alapján:
// - a tünet-legördülő ÚJ opciólistát kapott ("nem" az alapértelmezett "nincs"
//   helyett, "más" az "egyéb" helyett, "pici feszülés" megszűnt, "nyilallás"
//   új opcióként bekerült) — ld. `SymptomDuringExercise`/`SYMPTOM_OPTIONS`.
// - a tünet napi időtartama a korábbi, folytonos (fél óránkénti) csúszka
//   helyett egy DISZKRÉT, sávos legördülő lett (5 perc / 10 perc / fél
//   óra / 1-3 óra / 4-6 / 7-9 / 10-12 / 12+) — ld. `DURATION_OPTIONS`
//   (a "nincs" opciót — 0 óra — Marci diktálása NEM tartalmazta explicit
//   módon, de a lista elején hiánya ellentmondott volna a napi
//   alapértelmezésnek, ezért pótolva).
// - a `workouts` tömböt (edzésenkénti tünet-válasz) a beviteli ŰRLAP most
//   egyben, a "Mentés" gombbal küldi el — a korábbi, mentés UTÁNI, önálló
//   "még egy edzést hozzáadok" context-művelet (`addWorkout`) megszűnt,
//   mert az űrlap mostantól MINDIG szerkeszthető (nincs külön "szerkesztés"
//   mód), a felhasználó bármikor hozzáadhat/módosíthat egy edzést, majd
//   újra Mentéssel commitolja az egészet.
// - a `trained` mező mostantól SZÁRMAZTATOTT (`workouts.length > 0`), nem
//   önálló checkbox-állapot — eggyel kevesebb, redundáns mező.

export type SymptomDuringExercise = 'nem' | 'huzodas' | 'gorcs' | 'fajdalom' | 'nyilallas' | 'izomlaz' | 'mas'

export const SYMPTOM_OPTIONS: { value: SymptomDuringExercise; label: string }[] = [
  { value: 'nem', label: 'nem' },
  { value: 'huzodas', label: 'húzódás' },
  { value: 'gorcs', label: 'görcs' },
  { value: 'fajdalom', label: 'fájdalom' },
  { value: 'nyilallas', label: 'nyilallás' },
  { value: 'izomlaz', label: 'izomláz' },
  { value: 'mas', label: 'más' },
]

/** "Csak rákattintásra lesz legördülő menü, és ki lehet választani ezeket
 * (5 perc, 10 perc, fél óra, 1 óra, 2 óra .... egészen 24 óráig óránként)"
 * (2026.09.25., Marci kérésére) — a 181. pontban bevezetett SÁVOS ("4-6
 * óra" stb.) legördülő helyett most PONTOS, óránkénti bontás 2 órától
 * 24 óráig, a rövidebb időtartamokra pedig ugyanaz a finomabb bontás
 * (5 perc/10 perc/fél óra/1 óra), mint korábban. A "nincs" (0 óra) opciót
 * Marci diktálása ezúttal SEM tartalmazta explicit módon, de — ugyanúgy,
 * mint a 181. pontnál — a hiánya ellentmondana a napi alapértelmezésnek
 * (tünetmentes nap), ezért pótolva, a lista elején. */
export const DURATION_OPTIONS: { hours: number; label: string }[] = [
  { hours: 0, label: 'nincs' },
  { hours: 5 / 60, label: '5 perc' },
  { hours: 10 / 60, label: '10 perc' },
  { hours: 0.5, label: 'fél óra' },
  ...Array.from({ length: 24 }, (_, i) => ({ hours: i + 1, label: `${i + 1} óra` })),
]

/** az állapotfelmérő "időtartam (óra/nap)" kérdésének (durva, sávos)
 * válaszát képezi le az ÚJ, óránkénti `DURATION_OPTIONS` egy konkrét
 * értékére — a checklist ELSŐ kitöltésekor ez adja az alapértelmezett
 * "tünet időtartama" értéket (2026.09.25., Marci kérésére: "Alapértelmezettként
 * első kitöltésnél az állapotfelmérő 'tünet időtartama' értéket mutatja").
 * SAJÁT DÖNTÉS (a konkrét óraszám nem volt diktálva): minden sáv a sáv
 * KÖZEPÉHEZ (vagy annak a `DURATION_OPTIONS`-ban ténylegesen létező,
 * legközelebbi értékéhez) lett hozzárendelve. */
export function mapAssessmentDurationToHours(idotartam: string): number {
  switch (idotartam) {
    case 'kevesebb, mint 1 óra':
      return 0.5
    case '1–2 óra':
      return 2
    case '3–5 óra':
      return 4
    case '6–8 óra':
      return 7
    case 'szinte egész nap':
      return 24
    default:
      return 0
  }
}

export type ChecklistEntry = {
  /** ISO dátum (YYYY-MM-DD) — naponta egy bejegyzés. */
  date: string
  /** melyik szinthez tartozik a bejegyzés — a diagramok "csak ezen a
   * szinten" nézete ezzel szűr. */
  level: number
  /** SZÁRMAZTATOTT (`workouts.length > 0`) — nincs önálló UI-váltója, a
   * mentéskor számoljuk (181. pont). */
  trained: boolean
  /** minden aznapi edzés saját tünet-válasza, sorrendben — "edzés
   * rögzítése"-re az első, "+"-ra minden további. Üres tömb, ha nem volt
   * edzés aznap. */
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
  /** MINDEN valaha elkezdett szint kezdő dátuma, szint szerint kulcsolva. */
  levelStartDates: Record<number, string>
  /** a "mai javasolt megtartási idő" kézi felülbírálása, (dátum, szint)
   * kulccsal (ld. `holdKey`). */
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
 * példa-adatsor — SZÁNDÉKOSAN javuló tendenciájú. A dátumok mindig a MAI
 * naphoz képest relatívak. A MAI nap szándékosan ÜRESEN marad. A 181. pont
 * óta a `workouts`/`symptomDurationHours` értékek az ÚJ tünet-lista és
 * időtartam-sávok közül valók (a korábbi, folytonos/más-enumú értékek nem
 * lennének érvényesek az új típusban). */
const DEMO_SEED_PETER: ChecklistClientState = {
  currentLevel: 1,
  levelStartDate: daysAgoISO(9),
  levelStartDates: { 1: daysAgoISO(9) },
  holdOverrides: {},
  entries: [
    { date: daysAgoISO(9), level: 1, trained: true, workouts: ['fajdalom'], symptomDurationHours: 3, symptomIntensity: 6, loadOptimization: 35, savedAt: `${daysAgoISO(9)}T18:00:00.000Z` },
    { date: daysAgoISO(8), level: 1, trained: true, workouts: ['fajdalom'], symptomDurationHours: 2, symptomIntensity: 6, loadOptimization: 40, savedAt: `${daysAgoISO(8)}T18:00:00.000Z` },
    { date: daysAgoISO(7), level: 1, trained: false, workouts: [], symptomDurationHours: 2, symptomIntensity: 5, loadOptimization: 45, savedAt: `${daysAgoISO(7)}T18:00:00.000Z` },
    { date: daysAgoISO(6), level: 1, trained: true, workouts: ['huzodas', 'nem'], symptomDurationHours: 1, symptomIntensity: 4, loadOptimization: 50, savedAt: `${daysAgoISO(6)}T18:00:00.000Z` },
    { date: daysAgoISO(5), level: 1, trained: true, workouts: ['izomlaz'], symptomDurationHours: 1, symptomIntensity: 4, loadOptimization: 55, savedAt: `${daysAgoISO(5)}T18:00:00.000Z` },
    { date: daysAgoISO(4), level: 1, trained: true, workouts: ['izomlaz'], symptomDurationHours: 0.5, symptomIntensity: 3, loadOptimization: 60, savedAt: `${daysAgoISO(4)}T18:00:00.000Z` },
    { date: daysAgoISO(3), level: 1, trained: true, workouts: ['izomlaz'], symptomDurationHours: 10 / 60, symptomIntensity: 2, loadOptimization: 65, savedAt: `${daysAgoISO(3)}T18:00:00.000Z` },
    { date: daysAgoISO(2), level: 1, trained: true, workouts: ['nem', 'izomlaz'], symptomDurationHours: 5 / 60, symptomIntensity: 1, loadOptimization: 70, savedAt: `${daysAgoISO(2)}T18:00:00.000Z` },
    { date: daysAgoISO(1), level: 1, trained: true, workouts: ['nem'], symptomDurationHours: 0, symptomIntensity: 0, loadOptimization: 75, savedAt: `${daysAgoISO(1)}T18:00:00.000Z` },
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
 * javasolt érték. */
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
  /** a nap ÖSSZES edzésének tünet-válasza, sorrendben — üres tömb, ha nem
   * volt edzés aznap (181. pont: az űrlap egyben küldi az egészet). */
  workouts: SymptomDuringExercise[]
  symptomDurationHours: number
  symptomIntensity: number
  loadOptimization: number
}

type ChecklistContextValue = {
  getState: (clientId: string) => ChecklistClientState
  getTodayEntry: (clientId: string) => ChecklistEntry | undefined
  saveTodayEntry: (clientId: string, data: DailyEntryInput) => void
  advanceLevel: (clientId: string, maxLevel: number) => void
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
      const entry: ChecklistEntry = {
        date: today,
        level: current.currentLevel,
        trained: data.workouts.length > 0,
        workouts: data.workouts,
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

  /** "Következő szint kezdése" — Marci kérésére szabadon, az ÜF saját
   * döntése alapján, feltétel-ellenőrzés NÉLKÜL. */
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
    <ChecklistContext.Provider value={{ getState, getTodayEntry, saveTodayEntry, advanceLevel, previousLevel, setHoldOverride }}>
      {children}
    </ChecklistContext.Provider>
  )
}

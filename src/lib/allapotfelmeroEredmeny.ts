import type { AllapotfelmeroAdatok, BodyChartJel, BodyChartMeret } from '../context/AllapotfelmeroContext'

// Az Eredménylaphoz (és a KÉSŐBBI GYT-oldali "torna szintek" összekötéshez)
// tartozó, tiszta (side-effect-mentes) számítási/levezetési logika — a
// "Design elemek/allapot logika.odt"-ben leírt szabályok alapján
// (2026.09.07., Marci pontosításaira). Ezek a függvények egyelőre CSAK az
// ÜF-oldali Eredménylapon futnak le; a `src/data/tornaSzintek.ts` saját
// `ClientVariables`-ét (a GYT-oldali fázis-1 limitáció-rendszert) EZ A KÖR
// MÉG NEM íJa felül — az Marci kérésére egy KÉSŐBBI fázis ("később, ha
// teljesen elkészült, akkor a GYT fiókban is").

/** Életkor — csak év+hónap áll rendelkezésre (nap nincs), ezért a hónap
 * 1. napjával számolunk (2026.09.07., Marci megerősítésére). */
const MONTH_NAMES = [
  'január', 'február', 'március', 'április', 'május', 'június',
  'július', 'augusztus', 'szeptember', 'október', 'november', 'december',
]

export function calculateAge(birthYear: string, birthMonth: string): number | null {
  const year = parseInt(birthYear, 10)
  const monthIndex = MONTH_NAMES.indexOf(birthMonth)
  if (!year || monthIndex === -1) return null
  const now = new Date()
  let age = now.getFullYear() - year
  if (now.getMonth() < monthIndex) age -= 1
  return age
}

/** BMI = súly / (magasság/100)² — a "allapot logika" doksi szerinti
 * kategóriahatárokkal. */
export function calculateBmi(heightCm: string, weightKg: string): number | null {
  const h = parseFloat(heightCm)
  const w = parseFloat(weightKg)
  if (!h || !w) return null
  const hm = h / 100
  return w / (hm * hm)
}

export type BmiCategory = { key: 'sovany' | 'optimalis' | 'tulsuly' | 'elhizas'; label: string }

export function bmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return { key: 'sovany', label: 'enyhe soványság' }
  if (bmi < 25) return { key: 'optimalis', label: 'optimális testsúly' }
  if (bmi < 30) return { key: 'tulsuly', label: 'túlsúly' }
  return { key: 'elhizas', label: 'elhízás' }
}

/** A "fájdalom helye" (alsó/felső) levezetése a bodychart-jelölésekből, a
 * fázis-1 manuális kapcsoló HELYETT (2026.09.07., Marci megadására):
 * - a hát.svg nézet fejtetőtől nézve 33%-ánál fut a határvonal (a
 *   BodyChartPont.y ugyanabban a 0-100-as skálában van, mint ez a
 *   határérték, mert a hát/röntgen kép közös, illesztett vászonra készült —
 *   ld. Allapotfelmero.tsx CHART_W/CHART_H és a hozzá tartozó jegyzet);
 * - ha TÖBB jelölés is van, azé a szabály érvényesül, amelyiknek a
 *   "területe" (itt: a jelölés méret-kategóriájával [pontszerű/kis/nagy]
 *   súlyozott pontszáma — a pontos geometriai terület-integrálás túlmutat
 *   ezen a prototípuson) NAGYOBB a határvonal egyik vagy másik oldalán. */
const PAIN_LOCATION_BOUNDARY_Y = 33

const SIZE_WEIGHT: Record<BodyChartMeret, number> = { pontszeru: 1, kis: 2, nagy: 3 }

export type PainLocation = 'also' | 'felso'

export function derivePainLocation(jelek: BodyChartJel[]): PainLocation | null {
  if (jelek.length === 0) return null
  let felsoWeight = 0
  let alsoWeight = 0
  for (const jel of jelek) {
    const weight = SIZE_WEIGHT[jel.meret]
    for (const p of jel.points) {
      if (p.y < PAIN_LOCATION_BOUNDARY_Y) felsoWeight += weight
      else alsoWeight += weight
    }
  }
  return felsoWeight > alsoWeight ? 'felso' : 'also'
}

/** A "hason tudsz feküdni" fázis-1 limitáció EFFEKTÍV értéke — nyaki
 * panasz esetén úgy kezeljük, MINTHA nem tudna hason feküdni, függetlenül
 * attól, mit válaszolt magára a "hason tudsz feküdni" kérdésre
 * (2026.09.07., Marci kérésére: "nyaki panasz, ha igen, az olyan, mintha
 * nem tudna hason feküdni"). */
export function deriveProneOkForLimitations(proneOk: boolean, nyakiPanasz: boolean): boolean {
  return proneOk && !nyakiPanasz
}

/** A háromállású ("igen"/"nem"/"igen, de érzékeny") vállkapcsoló fázis-1
 * boolean megfelelője — "igen, de érzékeny" = nem (2026.09.07., Marci
 * kérésére). */
export function deriveShoulderOkBoolean(shoulderOk: AllapotfelmeroAdatok['shoulderOk']): boolean {
  return shoulderOk === 'igen'
}

/** A magas vérnyomás fázis-1 limitáció mostantól a rizikófaktor-listából
 * (checkbox) jön, nem külön kérdésből (2026.09.07., Marci kérésére). */
export function deriveHighBloodPressure(rizikofaktorokI: string[]): boolean {
  return rizikofaktorokI.includes('magas vérnyomás')
}

/** Az összes fázis-1 limitáció egy csokorban — a KÉSŐBBI GYT-oldali
 * `ClientVariables` összekötéshez lesz készen, ld. a fájl tetején lévő
 * jegyzetet. */
export type DerivedLimitations = {
  painLocation: PainLocation | null
  proneOk: boolean
  shoulderOk: boolean
  kneePain: boolean
  highBloodPressure: boolean
}

export function deriveLimitations(adatok: AllapotfelmeroAdatok): DerivedLimitations {
  return {
    painLocation: derivePainLocation(adatok.bodyChartJelek),
    proneOk: deriveProneOkForLimitations(adatok.proneOk, adatok.nyakiPanasz),
    shoulderOk: deriveShoulderOkBoolean(adatok.shoulderOk),
    kneePain: adatok.kneePain,
    highBloodPressure: deriveHighBloodPressure(adatok.rizikofaktorokI),
  }
}

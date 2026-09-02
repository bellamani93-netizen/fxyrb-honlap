import { initialColleagues } from './colleagues'

// A GYT 1-2 héttel előre tervez, 1 órás konzultációkkal, munkaidőben —
// ez a "torna szintek" videó-adatmodelltől (tornaSzintek.ts) teljesen
// független, önálló demo-adatforrás: a naptár-integráció más réteg
// (időbeosztás/kapacitás), nem a gyakorlat-kiosztás rendszere.
// Időkiosztás 6:00–21:00 (Marci kérésére, 2026.08.28., 2. kör) — 15 db 1 órás sáv.
export const BUSINESS_HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
const LUNCH_HOUR = 13

export type SlotStatus = 'szabad' | 'foglalt'
// a `minute` csak akkor van kitöltve, ha a bejegyzés ténylegesen NEM kerek
// egész órakor kezdődik — a naptár-rács ezt vizuálisan is jelzi (ld.
// GytWeeklyCalendar.tsx, 2026.09.01., Marci kérésére: "vizuálisan látszódjon,
// ha egy időpont nem kerek egész órakor kezdődik").
export type TimeSlot = { hour: number; status?: SlotStatus; label?: string; minute?: number }

export const GYT_COLOR_VAR: Record<string, string> = {
  kollegabor: 'kollegabor',
  nagyreka: 'nagyreka',
  tothbence: 'tothbence',
}

export function gytColorVar(gytId: string, alpha?: number) {
  const key = GYT_COLOR_VAR[gytId] ?? 'default'
  if (alpha === undefined) return `var(--gyt-color-${key})`
  return `rgba(var(--gyt-color-${key}-rgb), ${alpha})`
}

export const GYT_COLLEAGUES = initialColleagues
  .filter((c) => c.role === 'gyt')
  .map((c) => ({ id: c.id, name: c.name }))

// minden GYT-hez néhány, a demóban visszatérő ügyfél-név a "foglalt" sávok
// címkézéséhez — Kollé Gábornál a már ismert (salesClients.ts-beli) ügyfelek,
// a másik két kollégánál kitalált, csak ide tartozó nevek
const DEMO_CLIENTS_BY_GYT: Record<string, string[]> = {
  kollegabor: ['Péter', 'Kovács Gábor', 'Varga Dániel'],
  nagyreka: ['Fehér Anna', 'Szabó Előd'],
  tothbence: ['Nagy Botond', 'Kiss Judit'],
}

function seedFor(gytId: string) {
  let sum = 0
  for (const ch of gytId) sum += ch.charCodeAt(0)
  return sum
}

export function getMondayOf(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay() // 0 = vasárnap
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function formatISODate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// "yyyy-mm-dd" → helyi (nem UTC) éjféli Date — new Date("yyyy-mm-dd") UTC-ként
// értelmezné a stringet, ami negatív időzóna-eltolásnál egy nappal korábbi
// helyi dátumra csúszhat; ez a függvény ezt kerüli el
export function parseISODateLocal(dateISO: string): Date {
  const [y, m, d] = dateISO.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const WEEKDAY_SHORT = ['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V']

export function formatDayHeader(date: Date) {
  const idx = date.getDay() === 0 ? 6 : date.getDay() - 1
  return { weekday: WEEKDAY_SHORT[idx], day: date.getDate() }
}

export function formatHour(hour: number) {
  return `${hour}:00`
}

export function formatDateOnly(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}.`
}

const MONTH_NAMES = [
  'január', 'február', 'március', 'április', 'május', 'június',
  'július', 'augusztus', 'szeptember', 'október', 'november', 'december',
]
const MONTH_ABBR = ['jan', 'febr', 'márc', 'ápr', 'máj', 'jún', 'júl', 'aug', 'szept', 'okt', 'nov', 'dec']

// egy heti naptár-nézet mobil fejlécének "év, hónap" felirata (2026.09.02.,
// Marci kérésére) — a hét (7 nap) KEZDŐ napjának hónapját mutatja teljes
// névvel, KIVÉVE ha a hét átnyúlik egy hónapváltáson: ilyenkor mindkét hónap
// rövidítve, "/"-jellel elválasztva jelenik meg (pl. "2026 aug/szept"), év-
// váltás esetén (dec./jan.) mindkét év kiírva a saját hónapja mellett.
export function formatYearMonth(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6)
  const sameMonth = weekStart.getFullYear() === weekEnd.getFullYear() && weekStart.getMonth() === weekEnd.getMonth()
  if (sameMonth) return `${weekStart.getFullYear()}. ${MONTH_NAMES[weekStart.getMonth()]}`
  if (weekStart.getFullYear() === weekEnd.getFullYear()) {
    return `${weekStart.getFullYear()} ${MONTH_ABBR[weekStart.getMonth()]}/${MONTH_ABBR[weekEnd.getMonth()]}`
  }
  return `${weekStart.getFullYear()} ${MONTH_ABBR[weekStart.getMonth()]} / ${weekEnd.getFullYear()} ${MONTH_ABBR[weekEnd.getMonth()]}`
}

// Egy stabil (ugyanarra a bemenetre mindig ugyanazt adó) álca-Google Meet link —
// a valós Google Naptár/Meet-integráció a leendő programozó feladata, ez itt
// csak a UI-terv szintjén mutatja be, hogy egy konzultációhoz tartozik egy link.
const MEET_CHARS = 'abcdefghijklmnopqrstuvwxyz'
export function generateMeetLink(seed: string): string {
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  function chunk(len: number) {
    let out = ''
    for (let i = 0; i < len; i++) {
      out += MEET_CHARS[h % MEET_CHARS.length]
      h = (h * 31 + i + 7) >>> 0
    }
    return out
  }
  return `meet.google.com/${chunk(3)}-${chunk(4)}-${chunk(3)}`
}

// egy adott GYT egy adott napjának alap (nem admin/sales-módosított) időrácsa —
// csak a "most" hetére és a következő hétre van meghirdetett sáv (a spec
// szerinti "1-2 héttel előre tervez"); hétvégén és ezen a két héten túl a
// GYT nem hirdet meg semmit
export function getBaseDaySlots(gytId: string, date: Date, today: Date): TimeSlot[] {
  const monday = getMondayOf(today)
  const diffDays = Math.round((date.getTime() - monday.getTime()) / 86400000)
  const dayIndex = diffDays % 7 // 0=hétfő..6=vasárnap (a hét eleji napokra is helyesen, mert diffDays>=0 ebben a használatban)
  const weekIndex = Math.floor(diffDays / 7)

  if (dayIndex >= 5) return BUSINESS_HOURS.map((hour) => ({ hour })) // hétvége, nincs meghirdetve
  if (weekIndex < 0 || weekIndex > 1) return BUSINESS_HOURS.map((hour) => ({ hour })) // ezen a 2 héten kívül még/már nincs beosztás

  const seed = seedFor(gytId)
  const clients = DEMO_CLIENTS_BY_GYT[gytId] ?? []

  return BUSINESS_HOURS.map((hour) => {
    if (hour === LUNCH_HOUR) return { hour } // ebédszünet, nincs meghirdetve
    const bucket = (hour + dayIndex * 2 + weekIndex * 3 + seed) % 5
    if (bucket === 0 && clients.length) {
      const client = clients[(hour + dayIndex) % clients.length]
      const session = ((hour + dayIndex + weekIndex) % 4) + 1
      return { hour, status: 'foglalt', label: `${client} ${session}` }
    }
    if (bucket === 1) return { hour } // ezt a sávot a GYT nem hirdette meg
    return { hour, status: 'szabad' }
  })
}

export type SalesCallStatus = 'var_gyt_re' | 'hozzarendelve'
// a hívás UTÓLAGOS kimenete (2026.08.28., 3. kör) — a "módosítás" popup piros/
// sárga/zöld gombjaiból a sárga/zöld tartósan ráíródik a hívásra (jelvényként
// látszik a listában); a piros nem "outcome", hanem törli magát a hívást
export type SalesCallOutcome = 'nem_jelent_meg' | 'rendben'

export type SalesCall = {
  id: string
  name: string
  email: string
  phone: string
  callTime: string // datetime-local, pl. "2026-08-29T11:00"
  status: SalesCallStatus
  note?: string
  assignedGyt?: string
  assignedGytId?: string
  assignedStart?: string
  assignedClientId?: string
  outcome?: SalesCallOutcome
}

// a Calendly-ből (placeholder-adatként) érkező sales-hívások — ezek MÉG NEM
// szerepelnek a salesClients.ts listájában; a "GYT-időpont foglalása" hozza
// létre belőlük az első valódi ügyfél-bejegyzést. A "mai hívások" nézet
// (2026.08.28., 2. kör) miatt a dátumok a MINDENKORI "ma"-hoz képest relatívak
// (nem fix naptári dátumok), hogy a demó bármikor tesztelve mutasson mai elemet.
export function buildInitialSalesCalls(today: Date): SalesCall[] {
  const iso = (offset: number) => formatISODate(addDays(today, offset))
  return [
    {
      id: 'call-hajdu-zsofia',
      name: 'Hajdú Zsófia',
      email: 'hajdu.zsofia@pelda.hu',
      phone: '+36 30 678 9012',
      callTime: `${iso(0)}T09:00`,
      status: 'var_gyt_re',
    },
    {
      id: 'call-molnar-tamas',
      name: 'Molnár Tamás',
      email: 'molnar.tamas@pelda.hu',
      phone: '+36 30 789 0123',
      callTime: `${iso(0)}T15:00`,
      status: 'var_gyt_re',
    },
    {
      id: 'call-szucs-viktoria',
      name: 'Szűcs Viktória',
      email: 'szucs.viktoria@pelda.hu',
      phone: '+36 30 890 1234',
      callTime: `${iso(3)}T14:00`,
      status: 'hozzarendelve',
      assignedGyt: 'Kollé Gábor',
      assignedStart: `${iso(4)}T10:00`,
    },
    {
      id: 'call-farkas-milan',
      name: 'Farkas Milán',
      email: 'farkas.milan@pelda.hu',
      phone: '+36 30 901 2345',
      callTime: `${iso(5)}T16:30`,
      status: 'var_gyt_re',
    },
  ]
}

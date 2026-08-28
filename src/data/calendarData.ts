import { initialColleagues } from './colleagues'

// A GYT 1-2 héttel előre tervez, 1 órás konzultációkkal, munkaidőben —
// ez a "torna szintek" videó-adatmodelltől (tornaSzintek.ts) teljesen
// független, önálló demo-adatforrás: a naptár-integráció más réteg
// (időbeosztás/kapacitás), nem a gyakorlat-kiosztás rendszere.
export const BUSINESS_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
const LUNCH_HOUR = 13

export type SlotStatus = 'szabad' | 'foglalt'
export type TimeSlot = { hour: number; status?: SlotStatus; label?: string }

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

export type SalesCall = {
  id: string
  name: string
  email: string
  phone: string
  callTime: string // datetime-local, pl. "2026-08-29T11:00"
  status: SalesCallStatus
  assignedGyt?: string
  assignedStart?: string
}

// a Calendly-ből (placeholder-adatként) érkező sales-hívások — ezek MÉG NEM
// szerepelnek a salesClients.ts listájában; a "GYT-időpont foglalása" hozza
// létre belőlük az első valódi ügyfél-bejegyzést
export const initialSalesCalls: SalesCall[] = [
  {
    id: 'call-hajdu-zsofia',
    name: 'Hajdú Zsófia',
    email: 'hajdu.zsofia@pelda.hu',
    phone: '+36 30 678 9012',
    callTime: '2026-08-29T11:00',
    status: 'var_gyt_re',
  },
  {
    id: 'call-molnar-tamas',
    name: 'Molnár Tamás',
    email: 'molnar.tamas@pelda.hu',
    phone: '+36 30 789 0123',
    callTime: '2026-08-31T09:30',
    status: 'var_gyt_re',
  },
  {
    id: 'call-szucs-viktoria',
    name: 'Szűcs Viktória',
    email: 'szucs.viktoria@pelda.hu',
    phone: '+36 30 890 1234',
    callTime: '2026-09-02T14:00',
    status: 'hozzarendelve',
    assignedGyt: 'Kollé Gábor',
    assignedStart: '2026-09-03T10:00',
  },
  {
    id: 'call-farkas-milan',
    name: 'Farkas Milán',
    email: 'farkas.milan@pelda.hu',
    phone: '+36 30 901 2345',
    callTime: '2026-09-03T16:30',
    status: 'var_gyt_re',
  },
]

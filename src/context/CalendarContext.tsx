import { createContext, useContext, useState, type ReactNode } from 'react'
import { addDays, formatISODate, getBaseDaySlots, getMondayOf, parseISODateLocal, type TimeSlot } from '../data/calendarData'
import { clients as gytClientsList } from '../data/gytClients'

// Közös, a SALES ÉS a GYT szerepkör között OSZTOTT naptár-állapot (2026.09.01.,
// Marci kérésére — a korábbi, két teljesen független overlay helyett, ld.
// Design jegyzet 44. és 47. pont). Egy SALES által Kollé Gábornak felvett
// foglalás innentől TÉNYLEGESEN megjelenik a GYT saját "naptár" oldalán is,
// és fordítva — mindkét oldal ugyanezt az EGY állapotot olvassa/írja.

export type BookingType = 'szabad' | 'terv' | 'konzultacio'
export type Booking = { type: BookingType; clientId?: string; name?: string; alkalom?: number; meetLink?: string }
// a GYT-oldal (részletesebb) igényeihez — kiegészíti a demo-eredetű
// bejegyzéseket egy, a gytClients.ts-ben név szerint egyező clientId-vel is,
// hogy szerkeszthetők legyenek (ld. Design jegyzet 46. pont). A SALES oldal
// EZT NEM használja — ő a nyers getBookingClientId()-t nézi, ami demo-eredetű
// sávnál sosem ad vissza clientId-t (ld. Design jegyzet 36. pont, ez a
// szabály a refaktor után is érvényben marad).
export type BookingMeta = { kind: BookingType | null; alkalom?: number; name?: string; meetLink?: string; clientId?: string }

type CalendarContextValue = {
  today: Date
  isBooked: (gytId: string, dateISO: string, hour: number) => boolean
  getBooking: (gytId: string, dateISO: string, hour: number) => Booking | undefined
  getEffectiveSlot: (gytId: string, dateISO: string, hour: number) => TimeSlot
  getBookingClientId: (gytId: string, dateISO: string, hour: number) => string | undefined
  getBookingMeta: (gytId: string, dateISO: string, hour: number) => BookingMeta
  // SALES-oldali kényelmi függvény — a "label" (pl. "Kovács Gábor 1") szövegből
  // nyeri ki a nevet/alkalmat, mindig "konzultáció" típusú, valódi foglalásként
  addBooking: (gytId: string, dateISO: string, hour: number, label: string, clientId?: string) => void
  // GYT-oldali, teljes (típus/alkalom/meetLink) bejegyzés felvétele/módosítása
  setBooking: (gytId: string, dateISO: string, hour: number, booking: Booking) => void
  removeBooking: (gytId: string, dateISO: string, hour: number) => void
  nextAlkalomForClient: (gytId: string, clientName: string) => number
}

const CalendarContext = createContext<CalendarContextValue | null>(null)

export function useCalendar() {
  const ctx = useContext(CalendarContext)
  if (!ctx) throw new Error('useCalendar csak CalendarProvideren belül használható')
  return ctx
}

function bookingKey(gytId: string, dateISO: string, hour: number) {
  return `${gytId}__${dateISO}__${hour}`
}

// FONTOS: a gytClients.ts és a salesClients.ts EGYMÁSTÓL FÜGGETLENÜL, saját
// egyszerű azonosítókat használ (mindkettőben van pl. 'daniel', 'gabor',
// 'peter' — véletlen ütközés, mert a két demo-adat ugyanazokat a neveket
// modellezte külön-külön). A közös naptár-állapotban EZÉRT névtér-előtaggal
// tároljuk a clientId-t, különben egy SALES-eredetű foglalás clientId-je
// véletlenül egyezhetne egy GYT-eredetű ügyfél id-jével (és fordítva),
// aminek a SALES/GYT oldal tévesen "sajátjaként" nyitná meg a másik
// szerepkör bejegyzését szerkesztésre (2026.09.01., böngészős teszt közben
// derült ki, ld. Design jegyzet 48. pont).
const GYT_CLIENT_PREFIX = 'gyt:'
const SALES_CLIENT_PREFIX = 'sales:'

// a demó-címkék "Név szám" alakúak (pl. "Kovács Gábor 4") — az "alkalom" a
// végén álló szám
function parseLabel(label: string): { name: string; alkalom?: number } {
  const m = label.match(/^(.*?)\s+(\d+)$/)
  if (m) return { name: m[1], alkalom: Number(m[2]) }
  return { name: label }
}

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [today] = useState(() => new Date())
  const [bookings, setBookings] = useState<Record<string, Booking>>({})
  // ha egy DEMO-generált (getBaseDaySlots) sávot töröl valamelyik szerepkör,
  // azt itt jelöljük — a demo-függvény maga nem módosítható (tiszta függvény),
  // ezért egy "elfedő" halmazzal biztosítjuk, hogy törlés után a sáv
  // ténylegesen üresnek látsszon, MINDKÉT oldalon.
  const [removedKeys, setRemovedKeys] = useState<Set<string>>(new Set())

  function getBooking(gytId: string, dateISO: string, hour: number): Booking | undefined {
    const key = bookingKey(gytId, dateISO, hour)
    if (removedKeys.has(key)) return undefined
    return bookings[key]
  }

  function isBooked(gytId: string, dateISO: string, hour: number) {
    return !!getBooking(gytId, dateISO, hour)
  }

  function getEffectiveSlot(gytId: string, dateISO: string, hour: number): TimeSlot {
    const key = bookingKey(gytId, dateISO, hour)
    if (removedKeys.has(key)) return { hour }
    const b = bookings[key]
    if (b) {
      if (b.type === 'szabad') return { hour, status: 'szabad' }
      const label = b.name ? (b.alkalom ? `${b.name} ${b.alkalom}` : b.name) : undefined
      return { hour, status: 'foglalt', label }
    }
    return getBaseDaySlots(gytId, parseISODateLocal(dateISO), today).find((s) => s.hour === hour) ?? { hour }
  }

  // a SALES oldal ezt nézi, hogy egy "foglalt" sáv mögött van-e VALÓDI, ŐÁLTALA
  // kezelhető adat — demo-eredetű ÉS GYT-eredetű sávnál szándékosan sosem ad
  // vissza clientId-t (csak a "sales:" névtérrel tárolt, tehát TÉNYLEG egy
  // SalesClient-hez tartozó foglalásoknál oldja fel az azonosítót)
  function getBookingClientId(gytId: string, dateISO: string, hour: number) {
    const raw = getBooking(gytId, dateISO, hour)?.clientId
    if (!raw || !raw.startsWith(SALES_CLIENT_PREFIX)) return undefined
    return raw.slice(SALES_CLIENT_PREFIX.length)
  }

  // a GYT oldal ezt nézi — a demo-eredetű "konzultáció" bejegyzésekhez is
  // felold egy clientId-t (név szerinti egyezés a gytClients.ts listájával),
  // hogy a GYT saját naptárában MINDEN látható időpont szerkeszthető legyen
  // (ld. Design jegyzet 46. pont). Egy TÁROLT bejegyzésnél csak a "gyt:"
  // névtérrel mentett azonosítót oldja fel — egy SALES-eredetű foglalásnál
  // (clientId "sales:"-prefixű) nincs megfeleltethető gytClients.ts rekord,
  // ott a clientId üresen marad (a név/alkalom/meetLink attól még megjelenik).
  function getBookingMeta(gytId: string, dateISO: string, hour: number): BookingMeta {
    const b = getBooking(gytId, dateISO, hour)
    if (b) {
      const clientId = b.clientId?.startsWith(GYT_CLIENT_PREFIX) ? b.clientId.slice(GYT_CLIENT_PREFIX.length) : undefined
      return { kind: b.type, alkalom: b.alkalom, name: b.name, meetLink: b.meetLink, clientId }
    }
    const base = getBaseDaySlots(gytId, parseISODateLocal(dateISO), today).find((s) => s.hour === hour)
    if (!base?.status) return { kind: null }
    if (base.status === 'szabad') return { kind: 'szabad' }
    const { name, alkalom } = parseLabel(base.label ?? '')
    const matchedClient = gytClientsList.find((c) => c.name === name)
    return { kind: 'konzultacio', alkalom, name, clientId: matchedClient?.id }
  }

  function clearRemoved(key: string) {
    setRemovedKeys((prev) => {
      if (!prev.has(key)) return prev
      const next = new Set(prev)
      next.delete(key)
      return next
    })
  }

  // SALES-oldali kényelmi wrapper — a meglévő hívóhelyek (SalesHozzarendeles.tsx)
  // egy kész "Név szám" labelt adnak át, ezt bontjuk szét név+alkalom-ra. A
  // clientId-t "sales:" névtérrel tároljuk (ld. GYT_CLIENT_PREFIX fenti megjegyzése).
  function addBooking(gytId: string, dateISO: string, hour: number, label: string, clientId?: string) {
    const key = bookingKey(gytId, dateISO, hour)
    const { name, alkalom } = parseLabel(label)
    clearRemoved(key)
    setBookings((prev) => ({
      ...prev,
      [key]: { type: 'konzultacio', clientId: clientId ? `${SALES_CLIENT_PREFIX}${clientId}` : undefined, name: name || label, alkalom: alkalom ?? 1 },
    }))
  }

  // GYT-oldali, teljes bejegyzés felvétele/módosítása (típus/alkalom/meetLink is)
  // — a `booking.clientId`-t BARE (a gytClients.ts saját, előtag nélküli)
  // formában várja, és "gyt:" névtérrel tárolja el.
  function setBooking(gytId: string, dateISO: string, hour: number, booking: Booking) {
    const key = bookingKey(gytId, dateISO, hour)
    clearRemoved(key)
    const stored: Booking = { ...booking, clientId: booking.clientId ? `${GYT_CLIENT_PREFIX}${booking.clientId}` : undefined }
    setBookings((prev) => ({ ...prev, [key]: stored }))
  }

  function removeBooking(gytId: string, dateISO: string, hour: number) {
    const key = bookingKey(gytId, dateISO, hour)
    setBookings((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    // demo-eredetű bejegyzésnél ez tünteti el ténylegesen a sávot
    setRemovedKeys((prev) => new Set(prev).add(key))
  }

  function nextAlkalomForClient(gytId: string, clientName: string): number {
    let max = 0
    const prefix = `${gytId}__`
    for (const [key, entry] of Object.entries(bookings)) {
      if (!key.startsWith(prefix) || removedKeys.has(key)) continue
      if (entry.name === clientName && entry.alkalom) max = Math.max(max, entry.alkalom)
    }
    for (let w = 0; w <= 1; w++) {
      for (let d = 0; d < 7; d++) {
        const date = addDays(addDays(getMondayOf(today), w * 7), d)
        const dateISO = formatISODate(date)
        for (const slot of getBaseDaySlots(gytId, date, today)) {
          if (removedKeys.has(bookingKey(gytId, dateISO, slot.hour))) continue
          if (slot.status === 'foglalt' && slot.label) {
            const parsed = parseLabel(slot.label)
            if (parsed.name === clientName && parsed.alkalom) max = Math.max(max, parsed.alkalom)
          }
        }
      }
    }
    return max + 1
  }

  const value: CalendarContextValue = {
    today,
    isBooked,
    getBooking,
    getEffectiveSlot,
    getBookingClientId,
    getBookingMeta,
    addBooking,
    setBooking,
    removeBooking,
    nextAlkalomForClient,
  }

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>
}

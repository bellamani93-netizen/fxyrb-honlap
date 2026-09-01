import { createContext, useContext, useState, type ReactNode } from 'react'
import { addDays, formatISODate, generateMeetLink, getBaseDaySlots, getMondayOf, parseISODateLocal, type TimeSlot } from '../data/calendarData'
import { useClients } from './ClientsContext'

// Közös, a SALES ÉS a GYT szerepkör között OSZTOTT naptár-állapot (2026.09.01.,
// Marci kérésére — a korábbi, két teljesen független overlay helyett, ld.
// Design jegyzet 44. és 47. pont). Egy SALES által Kollé Gábornak felvett
// foglalás innentől TÉNYLEGESEN megjelenik a GYT saját "naptár" oldalán is,
// és fordítva — mindkét oldal ugyanezt az EGY állapotot olvassa/írja.

export type BookingType = 'szabad' | 'terv' | 'konzultacio'
// a `minute` csak a GYT-oldali pontos időpont-megjelenítéshez kell (ld.
// GytAppointmentModal — 2026.09.01., Marci kérésére: "óra:perc pontosan
// választható legyen") — a naptár-RÁCS maga változatlanul 1 órás sávokban
// gondolkodik (a `hour` dönti el, melyik cellát foglalja le), a perc pusztán
// a bejegyzés pontos, megjelenített kezdési idejét finomítja.
export type Booking = { type: BookingType; clientId?: string; name?: string; alkalom?: number; meetLink?: string; minute?: number }
// a GYT-oldal (részletesebb) igényeihez — kiegészíti a demo-eredetű
// bejegyzéseket egy, a közös ügyfél-listában név szerint egyező clientId-vel
// is, hogy szerkeszthetők legyenek (ld. Design jegyzet 46. pont). A SALES oldal
// EZT NEM használja — ő a nyers getBookingClientId()-t nézi, ami demo-eredetű
// sávnál sosem ad vissza clientId-t (ld. Design jegyzet 36. pont, ez a
// szabály a refaktor után is érvényben marad).
export type BookingMeta = { kind: BookingType | null; alkalom?: number; name?: string; meetLink?: string; clientId?: string; minute?: number }

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
  // az ÜF saját "konzultációk" oldalának — az adott ügyfélhez (bármelyik
  // gyt-nél, bármelyik szerepkör által) TÉNYLEGESEN, valódi bejegyzésként
  // rögzített (nem demo-eredetű, nem "terv") konzultációk, alkalom szerint
  // növekvő sorrendben (ld. Design jegyzet, "ÜF konzultációk" pont).
  getClientConsultations: (clientId: string) => ClientConsultation[]
}

export type ClientConsultation = { alkalom: number; dateISO: string; hour: number; minute?: number; meetLink?: string }

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

// A demo-naptár (getBaseDaySlots) a "hányadik alkalom" számot egy, a
// gyakorlat-kiosztástól TELJESEN FÜGGETLEN, órától/naptól függő képlettel
// generálja (ld. calendarData.ts megjegyzése) — emiatt egy VALÓS, ismert
// ügyfélnél (pl. Varga Dániel) a naptár akár teljesen más "alkalom"-ot és
// színt mutatott, mint amit az "ügyfeleim" oldal tényleges szint-állapota
// (levels) sugallt. Marci kérésére (2026.09.01., "legyen kapcsolat az
// ügyfeleim és a naptár között") a MÉG FOLYAMATBAN LÉVŐ (mode: 'kozben',
// vagy még el sem indított) valós ügyfeleknél a demo-címke alkalom-számát
// felülírjuk a tényleges haladással: a lezárt szintek száma + 1 (ez a
// KÖVETKEZŐ, még ki nem osztott alkalom). A "mode: 'utana'" (lezárt
// együttműködésű) ügyfeleknél nincs ilyen egyértelmű megfeleltetés, ott a
// demo-szám változatlan marad.
function realNextAlkalom(client: { mode?: 'kozben' | 'utana'; levels?: { state: string }[] } | undefined): number | undefined {
  if (!client || client.mode === 'utana') return undefined
  const closed = (client.levels ?? []).filter((l) => l.state === 'lezart').length
  return closed + 1
}

// Az 1. alkalom hívás-linkjét mindig a SALES küldi ki a foglaláskor (ld.
// GytAppointmentModal "az 1. alkalom hívás-linkjét már elküldte a sales"
// szövege) — eddig ez csak egy tájékoztató MONDAT volt, tényleges link
// nélkül, mert sem a demo-generált, sem a SALES saját addBooking-jával
// felvett bejegyzés nem tárolt hozzá linket. Marci kérésére (2026.09.01.,
// "mutassa a gyt naptárjában a megnyitott 1. alkalom popupjában a meet
// linket") mostantól MINDIG van megjeleníthető link 1. alkalomnál: ha a
// bejegyzésnek van már ténylegesen elmentett linkje, azt mutatjuk; ha nincs
// (demo-eredetű, vagy a SALES-oldali addBooking sosem generált), egy
// determinisztikus (a sáv koordinátáiból/névből számolt, mindig ugyanazt
// adó) álca-linket generálunk — nem íródik vissza az állapotba, csak
// megjelenítéskor számolódik.
function resolveMeetLink(existing: string | undefined, alkalom: number | undefined, seed: string): string | undefined {
  if (existing) return existing
  if (alkalom !== 1) return undefined
  return generateMeetLink(seed)
}

export function CalendarProvider({ children }: { children: ReactNode }) {
  // a demo-eredetű bejegyzések clientId-feloldásához kell a közös,
  // ÉLŐ ügyfél-lista (ld. Design jegyzet 49. pont — korábban egy statikus
  // gytClients.ts importra hivatkozott, ami a két nyilvántartás
  // összevonásával megszűnt).
  const { clients } = useClients()
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
      if (b.type === 'szabad') return { hour, status: 'szabad', minute: b.minute }
      const label = b.name ? (b.alkalom ? `${b.name} ${b.alkalom}` : b.name) : undefined
      return { hour, status: 'foglalt', label, minute: b.minute }
    }
    const base = getBaseDaySlots(gytId, parseISODateLocal(dateISO), today).find((s) => s.hour === hour) ?? { hour }
    if (base.status !== 'foglalt' || !base.label) return base
    const { name } = parseLabel(base.label)
    const matchedClient = clients.find((c) => c.name === name && (!c.assignedGytId || c.assignedGytId === gytId))
    const realAlkalom = realNextAlkalom(matchedClient)
    if (realAlkalom === undefined) return base
    return { ...base, label: `${name} ${realAlkalom}` }
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
      const meetLink = resolveMeetLink(b.meetLink, b.alkalom, `${gytId}-${dateISO}-${hour}-${b.name ?? clientId ?? 'x'}`)
      return { kind: b.type, alkalom: b.alkalom, name: b.name, meetLink, clientId, minute: b.minute }
    }
    const base = getBaseDaySlots(gytId, parseISODateLocal(dateISO), today).find((s) => s.hour === hour)
    if (!base?.status) return { kind: null }
    if (base.status === 'szabad') return { kind: 'szabad' }
    const { name, alkalom: rawAlkalom } = parseLabel(base.label ?? '')
    const matchedClient = clients.find((c) => c.name === name && (!c.assignedGytId || c.assignedGytId === gytId))
    const alkalom = realNextAlkalom(matchedClient) ?? rawAlkalom
    const meetLink = resolveMeetLink(undefined, alkalom, `${gytId}-${dateISO}-${hour}-${name}`)
    return { kind: 'konzultacio', alkalom, name, meetLink, clientId: matchedClient?.id }
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
    // valós, ismert ügyfélnél a tényleges haladásból számolt érték a mérvadó
    // (ld. realNextAlkalom fenti megjegyzése) — az alábbi, demo-sávokat
    // pásztázó heurisztika csak a nyilvántartásban nem szereplő, kitalált
    // demo-ügyfelekre (pl. "Fehér Anna") marad érvényben.
    const matchedClient = clients.find((c) => c.name === clientName && (!c.assignedGytId || c.assignedGytId === gytId))
    const real = realNextAlkalom(matchedClient)
    if (real !== undefined) return real

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

  // ld. Design jegyzet — az ÜF "konzultációk" oldala EZT olvassa: csak a
  // ténylegesen (SALES vagy GYT által) rögzített, "konzultáció" típusú
  // (tehát NEM "terv") bejegyzéseket, a demo-generált zajt (getBaseDaySlots)
  // figyelmen kívül hagyva — a lista pontosan úgy nő, ahogy Marci kérte:
  // az 1. tétel a SALES foglalásával jön létre, minden további a GYT által
  // ténylegesen lefixált (nem csak "terv") időponttal.
  function getClientConsultations(clientId: string): ClientConsultation[] {
    const results: ClientConsultation[] = []
    for (const [key, b] of Object.entries(bookings)) {
      if (removedKeys.has(key) || b.type !== 'konzultacio' || !b.alkalom) continue
      const bareId = b.clientId?.startsWith(GYT_CLIENT_PREFIX)
        ? b.clientId.slice(GYT_CLIENT_PREFIX.length)
        : b.clientId?.startsWith(SALES_CLIENT_PREFIX)
          ? b.clientId.slice(SALES_CLIENT_PREFIX.length)
          : undefined
      if (bareId !== clientId) continue
      const [, dateISO, hourStr] = key.split('__')
      const meetLink = resolveMeetLink(b.meetLink, b.alkalom, `${key}-${b.name ?? clientId}`)
      results.push({ alkalom: b.alkalom, dateISO, hour: Number(hourStr), minute: b.minute, meetLink })
    }
    return results.sort((a, b) => a.alkalom - b.alkalom)
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
    getClientConsultations,
  }

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>
}

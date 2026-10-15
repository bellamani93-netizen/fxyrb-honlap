import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

// A 14 hetes utánkövetés heti csoportos mítingjei: minden GYT a saját
// utánkövetésben lévő ügyfeleinek hirdet egy mítinget (időpont + Google Meet
// link + létszám-keret), az ügyfelek pedig egy-két mondatos
// problémaleírással jelentkeznek, jelentkezési sorrendben, amíg be nem telik
// a keret. A jelentkezéseket mindenki látja, aki rálát a felületre (a saját
// GYT és a többi utánkövetett ügyfél).
//
// Backend nincs, ezért az állapot localStorage-ban él (fülek között
// szinkronban), mint a kérdéseknél.

export const DEFAULT_CAPACITY = 6
export const MAX_SENTENCES = 2
export const MAX_SIGNUP_CHARS = 300

export type Meeting = {
  id: string
  gytId: string
  /** datetime-local formátum: "2026-10-20T18:00" */
  startsAt: string
  meetLink: string
  capacity: number
}

export type Signup = {
  id: string
  meetingId: string
  clientId: string
  text: string
  at: number
}

type Data = { meetings: Meeting[]; signups: Signup[] }
const KEY = 'fyb-utankovetes'

function load(): Data {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Data) : { meetings: [], signups: [] }
  } catch {
    return { meetings: [], signups: [] }
  }
}

export type SignupResult = 'ok' | 'full' | 'duplicate' | 'invalid'

type Ctx = {
  meetings: Meeting[]
  signups: Signup[]
  /** a GYT jelenlegi (legutóbb kiírt) mítingje */
  currentMeeting: (gytId: string) => Meeting | undefined
  /** az aktuális míting adatainak módosítása (a jelentkezések megmaradnak) vagy, ha nincs, első kiírása */
  saveMeeting: (gytId: string, patch: Omit<Meeting, 'id' | 'gytId'>) => void
  /** új heti míting kiírása: a korábbi lezárul, a jelentkezések újraindulnak */
  newMeeting: (gytId: string, data: Omit<Meeting, 'id' | 'gytId'>) => void
  signUp: (meetingId: string, clientId: string, text: string) => SignupResult
  removeSignup: (signupId: string) => void
}

const UtankovetesContext = createContext<Ctx | null>(null)

export function useUtankovetes() {
  const ctx = useContext(UtankovetesContext)
  if (!ctx) throw new Error('useUtankovetes csak UtankovetesProvideren belül használható')
  return ctx
}

/** hány mondat van a szövegben (. ! ? ... lezárók alapján) */
export function countSentences(text: string): number {
  return text
    .trim()
    .split(/[.!?…]+(?:\s+|$)/)
    .filter((s) => s.trim().length > 0).length
}

export function isValidSignupText(text: string): boolean {
  const t = text.trim()
  return t.length > 0 && t.length <= MAX_SIGNUP_CHARS && countSentences(t) <= MAX_SENTENCES
}

export function isGoogleMeetLink(link: string): boolean {
  try {
    const u = new URL(link.trim())
    return u.protocol === 'https:' && u.hostname === 'meet.google.com'
  } catch {
    return false
  }
}

const WEEKDAYS = ['vasárnap', 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat']

/** "2026.10.20. (kedd) 18:00" */
export function formatMeetingTime(startsAt: string): string {
  const d = new Date(startsAt)
  if (Number.isNaN(d.getTime())) return startsAt
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}. (${WEEKDAYS[d.getDay()]}) ${p(d.getHours())}:${p(d.getMinutes())}`
}

export function isMeetingPast(startsAt: string): boolean {
  const t = new Date(startsAt).getTime()
  return !Number.isNaN(t) && t < Date.now()
}

export function UtankovetesProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data))
    } catch {
      // a munkamenet memóriában tovább működik
    }
  }, [data])

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === KEY) setData(load())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const currentMeeting = useCallback(
    (gytId: string) => [...data.meetings].reverse().find((m) => m.gytId === gytId),
    [data.meetings],
  )

  const saveMeeting = useCallback((gytId: string, patch: Omit<Meeting, 'id' | 'gytId'>) => {
    setData((prev) => {
      const current = [...prev.meetings].reverse().find((m) => m.gytId === gytId)
      if (!current) {
        return { ...prev, meetings: [...prev.meetings, { id: `m-${Date.now()}`, gytId, ...patch }] }
      }
      return { ...prev, meetings: prev.meetings.map((m) => (m.id === current.id ? { ...m, ...patch } : m)) }
    })
  }, [])

  const newMeeting = useCallback((gytId: string, d: Omit<Meeting, 'id' | 'gytId'>) => {
    setData((prev) => ({ ...prev, meetings: [...prev.meetings, { id: `m-${Date.now()}`, gytId, ...d }] }))
  }, [])

  const signUp = useCallback(
    (meetingId: string, clientId: string, text: string): SignupResult => {
      const meeting = data.meetings.find((m) => m.id === meetingId)
      if (!meeting || !isValidSignupText(text)) return 'invalid'
      const forMeeting = data.signups.filter((s) => s.meetingId === meetingId)
      if (forMeeting.some((s) => s.clientId === clientId)) return 'duplicate'
      if (forMeeting.length >= meeting.capacity) return 'full'
      const at = Date.now()
      setData((prev) => ({
        ...prev,
        signups: [...prev.signups, { id: `s-${at}`, meetingId, clientId, text: text.trim(), at }],
      }))
      return 'ok'
    },
    [data],
  )

  const removeSignup = useCallback((signupId: string) => {
    setData((prev) => ({ ...prev, signups: prev.signups.filter((s) => s.id !== signupId) }))
  }, [])

  return (
    <UtankovetesContext.Provider
      value={{ meetings: data.meetings, signups: data.signups, currentMeeting, saveMeeting, newMeeting, signUp, removeSignup }}
    >
      {children}
    </UtankovetesContext.Provider>
  )
}

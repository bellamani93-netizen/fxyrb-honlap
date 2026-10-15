import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

// Az ÜF "kérdéseim" és a GYT "kérdések" közös állapota: az ÜF szabad szöveggel
// kérdést tesz fel, amit a saját (hozzárendelt) GYT-je lát és hozzászólásban
// megválaszol. A menüsoron jelzőpötty mutatja az olvasatlant: az ÜF-nél a
// még nem látott választ, a GYT-nél a még meg nem nyitott kérdést.
//
// Backend nincs, ezért az állapot a böngésző localStorage-ában él (és fülek
// között szinkronban marad), hogy az ÜF- és a GYT-fiók két külön fülön is
// kipróbálható legyen.

export type KerdesReply = {
  id: string
  text: string
  at: number
  /** a válaszoló GYT megjelenített neve */
  authorName: string
  /** az ÜF már látta-e ezt a választ (a menüpötty ezt számolja) */
  seenByUf: boolean
}

export type Kerdes = {
  id: string
  /** a kérdező ügyfél azonosítója (Client.id) */
  clientId: string
  text: string
  at: number
  /** a GYT már megnyitotta-e a kérdést (a GYT menüpötty ezt számolja) */
  seenByGyt: boolean
  replies: KerdesReply[]
}

const KEY = 'fyb-kerdesek'

function load(): Kerdes[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Kerdes[]) : []
  } catch {
    return []
  }
}

type KerdesekContextValue = {
  kerdesek: Kerdes[]
  /** új kérdés az ügyféltől */
  askQuestion: (clientId: string, text: string) => void
  /** hozzászólás-válasz a GYT-től */
  replyToQuestion: (questionId: string, text: string, authorName: string) => void
  markSeenByGyt: (questionId: string) => void
  markRepliesSeenByUf: (clientId: string) => void
}

const KerdesekContext = createContext<KerdesekContextValue | null>(null)

export function useKerdesek() {
  const ctx = useContext(KerdesekContext)
  if (!ctx) throw new Error('useKerdesek csak KerdesekProvideren belül használható')
  return ctx
}

export function KerdesekProvider({ children }: { children: ReactNode }) {
  const [kerdesek, setKerdesek] = useState<Kerdes[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(kerdesek))
    } catch {
      // a munkamenet memóriában tovább működik
    }
  }, [kerdesek])

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === KEY) setKerdesek(load())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const askQuestion = useCallback((clientId: string, text: string) => {
    const at = Date.now()
    setKerdesek((prev) => [{ id: `k-${at}`, clientId, text, at, seenByGyt: false, replies: [] }, ...prev])
  }, [])

  const replyToQuestion = useCallback((questionId: string, text: string, authorName: string) => {
    const at = Date.now()
    setKerdesek((prev) =>
      prev.map((k) =>
        k.id === questionId
          ? { ...k, seenByGyt: true, replies: [...k.replies, { id: `r-${at}`, text, at, authorName, seenByUf: false }] }
          : k,
      ),
    )
  }, [])

  const markSeenByGyt = useCallback((questionId: string) => {
    setKerdesek((prev) => prev.map((k) => (k.id === questionId && !k.seenByGyt ? { ...k, seenByGyt: true } : k)))
  }, [])

  const markRepliesSeenByUf = useCallback((clientId: string) => {
    setKerdesek((prev) =>
      prev.map((k) =>
        k.clientId === clientId && k.replies.some((r) => !r.seenByUf)
          ? { ...k, replies: k.replies.map((r) => ({ ...r, seenByUf: true })) }
          : k,
      ),
    )
  }, [])

  return (
    <KerdesekContext.Provider value={{ kerdesek, askQuestion, replyToQuestion, markSeenByGyt, markRepliesSeenByUf }}>
      {children}
    </KerdesekContext.Provider>
  )
}

/** az ÜF még nem látott válaszainak száma (menüpötty) */
export function countUnseenReplies(kerdesek: Kerdes[], clientId: string): number {
  return kerdesek
    .filter((k) => k.clientId === clientId)
    .reduce((n, k) => n + k.replies.filter((r) => !r.seenByUf).length, 0)
}

/** a GYT még meg nem nyitott kérdéseinek száma a megadott ügyfelek közül (menüpötty) */
export function countUnseenQuestions(kerdesek: Kerdes[], clientIds: Set<string>): number {
  return kerdesek.filter((k) => clientIds.has(k.clientId) && !k.seenByGyt).length
}

export function formatQuestionTime(at: number): string {
  const d = new Date(at)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}. ${p(d.getHours())}:${p(d.getMinutes())}`
}

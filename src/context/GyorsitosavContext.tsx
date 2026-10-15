import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

// A "gyorsítósáv" (4 videós, regisztrációhoz kötött belépő-sor) közös állapota.
//
// Menete: e-mailes regisztráció → az 1. videó → végignézés után tudáscheck
// (kérdések, a válaszok kommentként jelennek meg a videó alatt) → következő
// videó ... → a legutolsó után automatikus átirányítás az időpontfoglalóra.
// A regisztrációtól visszaszámláló fut: ha a résztvevő a beállított határidőn
// belül végigér, ajándékot kap (pl. letölthető anyag).
//
// Backend nincs, ezért az admin-beállítások (`config`) ÉS a résztvevő
// előrehaladása (`progress`) a böngésző localStorage-ában él (ugyanazon a
// böngészőn az admin szerkesztése és a látogatói nézet ezért összhangban van;
// a valódi, több résztvevős nyilvántartás a backenddel érkezik majd).

export type GyQuestion = { id: string; text: string }
export type GyVideo = { id: string; title: string; url: string; questions: GyQuestion[] }
export type GyGift = { enabled: boolean; title: string; description: string; downloadUrl: string }
export type GyConfig = { videos: GyVideo[]; deadlineHours: number; gift: GyGift }

export type GyAnswer = { questionId: string; question: string; text: string }
export type GyProgress = {
  email: string
  registeredAt: number
  /** a végignézettnek jelölt videók azonosítói (a tudáscheck előfeltétele) */
  watched: string[]
  /** videó-azonosító → a beküldött tudáscheck-válaszok (kommentek) */
  completed: Record<string, { answers: GyAnswer[]; at: number }>
  finishedAt: number | null
  giftEarned: boolean
}

const CONFIG_KEY = 'fyb-gyorsitosav-config'
const PROGRESS_KEY = 'fyb-gyorsitosav-progress'

function defaultQuestions(): GyQuestion[] {
  return [
    { id: 'q1', text: 'Mi volt számodra a videó legfontosabb tanulsága?' },
    { id: 'q2', text: 'Mi az, ami a te helyzetedre különösen igaz volt?' },
  ]
}

export const DEFAULT_CONFIG: GyConfig = {
  deadlineHours: 72,
  gift: { enabled: true, title: 'ingyenes letölthető anyag', description: '', downloadUrl: '' },
  videos: [
    { id: 'v1', title: '1. miért fáj a derekad — a valódi ok', url: '', questions: defaultQuestions() },
    { id: 'v2', title: '2. a 3 mozdulat, amit naponta rosszul csinálsz', url: '', questions: defaultQuestions() },
    { id: 'v3', title: '3. a HÁTrendben módszer logikája', url: '', questions: defaultQuestions() },
    { id: 'v4', title: '4. mi történik, ha elkezded — és mi, ha nem', url: '', questions: defaultQuestions() },
  ],
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // privát mód / tele a tároló — a munkamenet memóriában tovább működik
  }
}

type GyorsitosavContextValue = {
  config: GyConfig
  updateConfig: (updater: (prev: GyConfig) => GyConfig) => void
  resetConfig: () => void
  progress: GyProgress | null
  register: (email: string) => void
  markWatched: (videoId: string) => void
  submitAnswers: (video: GyVideo, answers: GyAnswer[]) => void
  resetProgress: () => void
  /** az első még nem teljesített videó indexe; `config.videos.length`, ha mind kész */
  currentIndex: number
  finished: boolean
}

const GyorsitosavContext = createContext<GyorsitosavContextValue | null>(null)

export function useGyorsitosav() {
  const ctx = useContext(GyorsitosavContext)
  if (!ctx) throw new Error('useGyorsitosav csak GyorsitosavProvideren belül használható')
  return ctx
}

export function GyorsitosavProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<GyConfig>(() => load(CONFIG_KEY, DEFAULT_CONFIG))
  const [progress, setProgress] = useState<GyProgress | null>(() => load<GyProgress | null>(PROGRESS_KEY, null))

  useEffect(() => save(CONFIG_KEY, config), [config])
  useEffect(() => save(PROGRESS_KEY, progress), [progress])

  // másik böngészőfülön (pl. az admin szerkesztőben) végzett módosítás átvétele
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === CONFIG_KEY) setConfig(load(CONFIG_KEY, DEFAULT_CONFIG))
      if (e.key === PROGRESS_KEY) setProgress(load<GyProgress | null>(PROGRESS_KEY, null))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const updateConfig = useCallback((updater: (prev: GyConfig) => GyConfig) => setConfig(updater), [])
  const resetConfig = useCallback(() => setConfig(DEFAULT_CONFIG), [])

  const register = useCallback((email: string) => {
    setProgress({ email, registeredAt: Date.now(), watched: [], completed: {}, finishedAt: null, giftEarned: false })
  }, [])

  const markWatched = useCallback((videoId: string) => {
    setProgress((p) => (p && !p.watched.includes(videoId) ? { ...p, watched: [...p.watched, videoId] } : p))
  }, [])

  const submitAnswers = useCallback(
    (video: GyVideo, answers: GyAnswer[]) => {
      setProgress((p) => {
        if (!p) return p
        const completed = { ...p.completed, [video.id]: { answers, at: Date.now() } }
        const allDone = config.videos.every((v) => completed[v.id])
        if (!allDone) return { ...p, completed }
        const now = Date.now()
        const inTime = now - p.registeredAt <= config.deadlineHours * 3600 * 1000
        return { ...p, completed, finishedAt: now, giftEarned: config.gift.enabled && inTime }
      })
    },
    [config],
  )

  const resetProgress = useCallback(() => setProgress(null), [])

  const currentIndex = progress ? config.videos.findIndex((v) => !progress.completed[v.id]) : 0
  const finished = !!progress && progress.finishedAt !== null

  return (
    <GyorsitosavContext.Provider
      value={{
        config,
        updateConfig,
        resetConfig,
        progress,
        register,
        markWatched,
        submitAnswers,
        resetProgress,
        currentIndex: currentIndex === -1 ? config.videos.length : currentIndex,
        finished,
      }}
    >
      {children}
    </GyorsitosavContext.Provider>
  )
}

/** másodpercenként frissülő időbélyeg a visszaszámlálóhoz */
export function useNow(active = true): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [active])
  return now
}

/** "2 nap 03:14:55" / "03:14:55" */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const d = Math.floor(total / 86400)
  const h = Math.floor((total % 86400) / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const hms = [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
  return d > 0 ? `${d} nap ${hms}` : hms
}

/** a határidő emberi olvasatú formája (órák → "3 nap" / "36 óra") */
export function formatDeadline(hours: number): string {
  if (hours >= 24 && hours % 24 === 0) return `${hours / 24} nap`
  return `${hours} óra`
}

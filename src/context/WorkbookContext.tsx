import { createContext, useContext, useState, type ReactNode } from 'react'

// A "munkafüzet" közös állapota (2026.09.17., Marci kérésére, 3. fázis:
// "oktatóanyag + tudáspróba + munkafüzet létrehozása az üf fiókban és
// munkafüzet hozzáférés a gyt számára"). A Projekt specifikáció szerint a
// munkafüzet azt dolgozza ki, hogy hajolás/csavarás helyett milyen
// mozdulatokat fog csinálni az ÜF — a kérdéseket ez a fájl rögzíti egy
// helyen (WORKBOOK_QUESTIONS), ezt használja mind az ÜF saját (szerkeszthető)
// oldala (Munkafuzet.tsx), mind a GYT (csak olvasható) nézete
// (GytMunkafuzet.tsx). Nincs backend, ezért az állapot munkamenet-szintű —
// ugyanaz a minta, mint az AllapotfelmeroContext/MaterialsContext esetében:
// a GYT nézet a KÖZÖS, session-szintű választ látja (nem ügyfél-specifikus
// adattárolást), ahogy az Eredménylapnál is (ld. GytAllapotfelmerok.tsx).

export type WorkbookQuestion = { id: string; question: string; placeholder: string }

export const WORKBOOK_QUESTIONS: WorkbookQuestion[] = [
  {
    id: 'targyfelvetel',
    question: 'Milyen mozdulattal veszel fel tárgyat a földről hajolás helyett?',
    placeholder: 'pl. guggolás, egyik térd letámasztása...',
  },
  {
    id: 'forgas',
    question: 'Hogyan fordulsz meg csavarás helyett, pl. autóba beszálláskor vagy fiókból kivételkor?',
    placeholder: 'pl. az egész testemmel, a lábfejemmel együtt fordulok...',
  },
  {
    id: 'nehez-helyzet',
    question: 'Melyik napi helyzetedben a legnehezebb elkerülni a hajolást/csavarást, és mit fogsz ott helyette csinálni?',
    placeholder: 'pl. mosogatás közben, cipőt felvéve...',
  },
  {
    id: 'emlekezteto',
    question: 'Milyen emlékeztetőt állítasz be magadnak, hogy a mindennapokban is emlékezz az új mozdulatokra?',
    placeholder: 'pl. post-it a tükrön, telefon-emlékeztető...',
  },
]

type WorkbookContextValue = {
  answers: Record<string, string>
  savedAt: string | null
  saveAnswers: (answers: Record<string, string>) => void
}

const WorkbookContext = createContext<WorkbookContextValue | null>(null)

export function useWorkbook() {
  const ctx = useContext(WorkbookContext)
  if (!ctx) throw new Error('useWorkbook csak WorkbookProvideren belül használható')
  return ctx
}

export function WorkbookProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [savedAt, setSavedAt] = useState<string | null>(null)

  function saveAnswers(next: Record<string, string>) {
    setAnswers(next)
    setSavedAt(new Date().toLocaleString('hu-HU'))
  }

  return (
    <WorkbookContext.Provider value={{ answers, savedAt, saveAnswers }}>
      {children}
    </WorkbookContext.Provider>
  )
}

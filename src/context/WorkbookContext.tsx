import { createContext, useContext, useState, type ReactNode } from 'react'

// A "munkafüzet" közös állapota (2026.09.18., Marci kérésére, 3. fázis —
// újraegyeztetett terv). A tartalom a Marci által megosztott
// `Munkafüzet.odt` mintát követi szó szerint: 2 feladat, mindkettő egy
// szabadon bővíthető, 2 oszlopos táblázattal (a régi/kiváltandó szokás ↔
// az új, gerincbarát mozdulat). Nincs backend, ezért az állapot
// munkamenet-szintű — ugyanaz a minta, mint az AllapotfelmeroContext/
// MaterialsContext esetében: a GYT nézet a KÖZÖS, session-szintű adatot
// látja, csak olvasható formában.

export type WorkbookRow = { left: string; right: string }

export type WorkbookFeladatId = 'flexio' | 'rotacio'

export const WORKBOOK_FELADATOK: {
  id: WorkbookFeladatId
  cim: string
  leiras: string
  oszlopBal: string
  oszlopJobb: string
}[] = [
  {
    id: 'flexio',
    cim: '1. feladat — törzsflexió (gerinc előrehajlás) kiiktatása fél évre',
    leiras:
      'Írd le, hogy melyek azok a testhelyzetek vagy mozdulatok a mindennapjaidban, amik közben a gerincedet előre hajlítod. Nem kell maximális előrehajlásra gondolni, elég, ha már egy kicsit görbíted a hátad/derekad. A zöld oszlopba az oktatóanyagban tanultak alapján dolgozd ki, mire fogod lecserélni az adott mozdulatot úgy, hogy ne legyen benne gerinchajlítás.',
    oszlopBal: 'testhelyzet/tevékenység gerinchajlítással',
    oszlopJobb: 'új testhelyzet/mozdulat gerinchajlítás nélkül',
  },
  {
    id: 'rotacio',
    cim: '2. feladat — törzsrotáció (a gerinc csavarása) kiiktatása fél évre',
    leiras:
      'Írd le azokat a tevékenységeket/testhelyzeteket, amik közben csavarásnak van kitéve a gerinced — vagyis amikor a medenceöved és a vállöved nem egy síkban vannak. A minimális, járás közbeni természetes csavarodást nem kell figyelembe venni, csak az ennél nagyobbakat. A zöld oszlopba az oktatóanyagban tanultak alapján dolgozd ki, mire fogod lecserélni az adott mozdulatot úgy, hogy ne legyen benne csavarás.',
    oszlopBal: 'testhelyzet/tevékenység csavarással',
    oszlopJobb: 'új testhelyzet/mozdulat csavarás nélkül',
  },
]

const EMPTY_ROW: WorkbookRow = { left: '', right: '' }
const INITIAL_ROWS_PER_FELADAT = 3

function emptyAnswers(): Record<WorkbookFeladatId, WorkbookRow[]> {
  return {
    flexio: Array.from({ length: INITIAL_ROWS_PER_FELADAT }, () => ({ ...EMPTY_ROW })),
    rotacio: Array.from({ length: INITIAL_ROWS_PER_FELADAT }, () => ({ ...EMPTY_ROW })),
  }
}

type WorkbookContextValue = {
  answers: Record<WorkbookFeladatId, WorkbookRow[]>
  savedAt: string | null
  saveAnswers: (answers: Record<WorkbookFeladatId, WorkbookRow[]>) => void
}

const WorkbookContext = createContext<WorkbookContextValue | null>(null)

export function useWorkbook() {
  const ctx = useContext(WorkbookContext)
  if (!ctx) throw new Error('useWorkbook csak WorkbookProvideren belül használható')
  return ctx
}

export function WorkbookProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<Record<WorkbookFeladatId, WorkbookRow[]>>(emptyAnswers)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  function saveAnswers(next: Record<WorkbookFeladatId, WorkbookRow[]>) {
    setAnswers(next)
    setSavedAt(new Date().toLocaleString('hu-HU'))
  }

  return (
    <WorkbookContext.Provider value={{ answers, savedAt, saveAnswers }}>
      {children}
    </WorkbookContext.Provider>
  )
}

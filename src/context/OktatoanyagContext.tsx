import { createContext, useContext, useState, type ReactNode } from 'react'

// Az "oktatóanyag" leckéinek közös állapota (2026.09.18., Marci kérésére,
// 3. fázis — a 2026.09.17-i, kérdés nélkül épített első verzió visszavonva,
// ez az újraegyeztetett, pontosított terv). Marci kérése szerint az admin
// hozza létre a leckéket és a bennük lévő fejezeteket (a valódi videók
// később kerülnek fel, "most csak egy placeholder UI kell, ahol látszódik,
// mintha ott videók lennének") — ezért ez NEM statikus, kódba írt lista,
// hanem az AdminAnyagok.tsx-ről szerkeszthető, session-szintű Context, a
// MaterialsContext mintáját követve.
//
// A 2 induló lecke ("A gerinc biomechanikája", "Gerinchasználat a
// gyakorlatban") Marci által megadott, végleges cím — ezeket kezdő
// adatként rögzítjük, néhány placeholder fejezettel, hogy a demó ne
// üresen induljon; az admin ide tud továbbiakat felvenni (cél: leckénként
// kb. 8-10 fejezet).
//
// Tudáscheck: Marci kérése szerint minden lecke végén egy záró teszt áll,
// aminek teljesítése után nyílik meg a munkafüzet (ld. WorkbookContext).
// Mivel a valódi kérdések még nem érkeztek meg, ebben a körben egy
// IDEIGLENES "teljesítve" gomb helyettesíti a tényleges tudáscheck-et —
// ez a gomb és a hozzá tartozó `completedLeckeIds` állapot azért épült meg
// MÁR MOST, hogy a munkafüzet-feloldás mechanizmusa tesztelhető legyen; a
// gombot a valódi kérdések megérkezésekor kell majd egy tényleges
// kérdéssorra cserélni.

export type Fejezet = { id: string; title: string }
export type Lecke = { id: string; title: string; fejezetek: Fejezet[] }

const INITIAL_LECKEK: Lecke[] = [
  {
    id: 'lecke-biomechanika',
    title: 'A gerinc biomechanikája',
    fejezetek: [
      { id: 'biomechanika-1', title: '1. fejezet' },
      { id: 'biomechanika-2', title: '2. fejezet' },
      { id: 'biomechanika-3', title: '3. fejezet' },
    ],
  },
  {
    id: 'lecke-gyakorlat',
    title: 'Gerinchasználat a gyakorlatban',
    fejezetek: [
      { id: 'gyakorlat-1', title: '1. fejezet' },
      { id: 'gyakorlat-2', title: '2. fejezet' },
      { id: 'gyakorlat-3', title: '3. fejezet' },
    ],
  },
]

type OktatoanyagContextValue = {
  leckek: Lecke[]
  addLecke: (title: string) => void
  removeLecke: (leckeId: string) => void
  addFejezet: (leckeId: string, title: string) => void
  removeFejezet: (leckeId: string, fejezetId: string) => void
  completedLeckeIds: Set<string>
  markLeckeCompleted: (leckeId: string) => void
  /** a munkafüzet ekkor nyílik meg: van legalább 1 lecke, ÉS mindegyiknek
   * teljesítve a tudáscheck-je — így egy admin által KÉSŐBB felvett új
   * lecke is automatikusan a feltételek közé kerül, nem kell külön kezelni. */
  allChecksCompleted: boolean
}

const OktatoanyagContext = createContext<OktatoanyagContextValue | null>(null)

export function useOktatoanyag() {
  const ctx = useContext(OktatoanyagContext)
  if (!ctx) throw new Error('useOktatoanyag csak OktatoanyagProvideren belül használható')
  return ctx
}

export function OktatoanyagProvider({ children }: { children: ReactNode }) {
  const [leckek, setLeckek] = useState<Lecke[]>(INITIAL_LECKEK)
  const [completedLeckeIds, setCompletedLeckeIds] = useState<Set<string>>(new Set())

  function addLecke(title: string) {
    setLeckek((prev) => [...prev, { id: `lecke-${Date.now()}`, title, fejezetek: [] }])
  }

  function removeLecke(leckeId: string) {
    setLeckek((prev) => prev.filter((l) => l.id !== leckeId))
    setCompletedLeckeIds((prev) => {
      const next = new Set(prev)
      next.delete(leckeId)
      return next
    })
  }

  function addFejezet(leckeId: string, title: string) {
    setLeckek((prev) =>
      prev.map((l) => (l.id === leckeId ? { ...l, fejezetek: [...l.fejezetek, { id: `fejezet-${Date.now()}`, title }] } : l))
    )
  }

  function removeFejezet(leckeId: string, fejezetId: string) {
    setLeckek((prev) =>
      prev.map((l) => (l.id === leckeId ? { ...l, fejezetek: l.fejezetek.filter((f) => f.id !== fejezetId) } : l))
    )
  }

  function markLeckeCompleted(leckeId: string) {
    setCompletedLeckeIds((prev) => new Set(prev).add(leckeId))
  }

  const allChecksCompleted = leckek.length > 0 && leckek.every((l) => completedLeckeIds.has(l.id))

  return (
    <OktatoanyagContext.Provider
      value={{ leckek, addLecke, removeLecke, addFejezet, removeFejezet, completedLeckeIds, markLeckeCompleted, allChecksCompleted }}
    >
      {children}
    </OktatoanyagContext.Provider>
  )
}

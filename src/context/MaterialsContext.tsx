import { createContext, useContext, useState, type ReactNode } from 'react'
import { EXERCISES, type ExerciseCode } from '../data/tornaSzintek'

// "anyagok kezelése" — az admin itt tölthet fel videót egy MEGLÉVŐ
// videókiosztás-kódhoz (S01…S13, A01…A07 — ld. tornaSzintek.ts EXERCISES),
// ill. hozhat létre TELJESEN ÚJ, egyedi kódú/című videót (2026.09.17.,
// Marci kérésére). A feltöltött videó azonnal megjelenik a GYT
// videókiosztás oldalán (legördülőben ÉS a kiosztott szint előnézeteként)
// és az ÜF "szintjeid" oldalán is, mert mindhárom UGYANEZT a Context-et
// olvassa — ugyanaz a "közös forrás" minta, mint a BlogContext-nél.
//
// FONTOS, dokumentált korlátozás: nincs backend, ezért a "feltöltés" nem ír
// fájlt sehova — a böngésző saját, munkamenet-szintű `URL.createObjectURL`-jét
// használjuk (ld. `upsertMaterial` lent). Ez azt jelenti, hogy a feltöltött
// videó CSAK EBBEN a böngésző-lapban, EBBEN a munkamenetben látszik/játszható
// le — oldal-frissítéskor (mint minden más Context-adat ebben a projektben)
// elvész. Ez az EGYETLEN hely a teljes projektben, ahol ténylegesen le is
// játszható videó jelenik meg (a többi "videó" mindenhol csak egy statikus
// "▶" jelzésű helykitöltő doboz, ld. .video-thumb/.play-btn) — Marci
// kifejezett kérésére ("a videó hozzárendeléseknél ezeket a videókat fogja
// látni a gyt és üf is"), enélkül ez az ígéret nem lenne betartható.
export type Material = {
  id: string
  /** vagy egy MEGLÉVŐ `ExerciseCode` (S01…A07), vagy egy admin által kitalált,
   * SZABAD szöveges kód — a 2 halmaz szándékosan KÜLÖNBÖZŐ típusú (ld. lent
   * `isBuiltInCode`), hogy egy egyedi kód SOSEM kerülhessen be véletlenül a
   * `tornaSzintek.ts` `SEQUENCES`-ébe (ami kizárólag `ExerciseCode`-okat
   * fogad el) — ez garantálja Marci másik kérését is: "ez nem kerül be az
   * automata videókiosztás ajánlásba". */
  code: string
  /** meglévő kódnál MINDIG a tornaSzintek.ts saját neve (nem admin-szerkeszthető,
   * hogy ne térhessen el a checklist-oldal saját címétől) — egyedi kódnál
   * szabadon megadott cím. */
  title: string
  /** a feltöltött fájl neve, csak megjelenítésre (pl. "S01.mp4"). */
  videoName: string
  /** `URL.createObjectURL(file)` — munkamenet-szintű, oldal-frissítésig él. */
  videoUrl: string
}

export function isBuiltInCode(code: string): code is ExerciseCode {
  return Object.prototype.hasOwnProperty.call(EXERCISES, code)
}

type MaterialsContextValue = {
  materials: Material[]
  /** felvesz VAGY (ha a kódhoz már van feltöltött anyag) lecserél egy anyagot —
   * meglévő kódnál a cím mindig `EXERCISES[code].name`, egyedi kódnál az admin
   * által megadott cím. */
  upsertMaterial: (code: string, title: string, file: File) => void
  removeMaterial: (id: string) => void
  /** egy kódhoz tartozó feltöltött anyag (ha van) — a GYT/ÜF oldal ezzel dönti
   * el, hogy a statikus "▶" helykitöltő helyett a TÉNYLEGES videót mutassa. */
  getMaterialByCode: (code: string) => Material | undefined
}

const MaterialsContext = createContext<MaterialsContextValue | null>(null)

export function useMaterials() {
  const ctx = useContext(MaterialsContext)
  if (!ctx) throw new Error('useMaterials csak MaterialsProvideren belül használható')
  return ctx
}

export function MaterialsProvider({ children }: { children: ReactNode }) {
  const [materials, setMaterials] = useState<Material[]>([])

  function upsertMaterial(code: string, title: string, file: File) {
    const trimmedCode = code.trim()
    const url = URL.createObjectURL(file)
    setMaterials((prev) => {
      const existing = prev.find((m) => m.code === trimmedCode)
      if (existing) {
        // a régi object URL felszabadítása, hogy ne halmozódjon memória-szemét
        // egymást követő cseréknél (2026.09.17.).
        URL.revokeObjectURL(existing.videoUrl)
        return prev.map((m) => (m.code === trimmedCode ? { ...m, title, videoName: file.name, videoUrl: url } : m))
      }
      return [...prev, { id: `material-${Date.now()}`, code: trimmedCode, title, videoName: file.name, videoUrl: url }]
    })
  }

  function removeMaterial(id: string) {
    setMaterials((prev) => {
      const target = prev.find((m) => m.id === id)
      if (target) URL.revokeObjectURL(target.videoUrl)
      return prev.filter((m) => m.id !== id)
    })
  }

  function getMaterialByCode(code: string) {
    return materials.find((m) => m.code === code)
  }

  return (
    <MaterialsContext.Provider value={{ materials, upsertMaterial, removeMaterial, getMaterialByCode }}>
      {children}
    </MaterialsContext.Provider>
  )
}

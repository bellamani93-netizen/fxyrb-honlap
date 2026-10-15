import { useAllapotfelmero } from '../context/AllapotfelmeroContext'
import { useOktatoanyag } from '../context/OktatoanyagContext'
import { useWorkbook } from '../context/WorkbookContext'

export type NextStep = { to: string; label: string; title: string; text: string; button: string }

// Az ÜF "következő lépése" a kezdő útvonalon: állapotfelmérő (kész) →
// oktatóanyag (mindkét lecke tudáscheckje) → munkafüzet (legalább egyszer
// elmentve). Amíg az adott lépés nincs kész, a menüben sárga "következő"
// jelölést és az eredménylapon egy sárga sávot kap; ha mind kész, `null`, és
// minden jelzés eltűnik — onnantól szabad a használat.
export function useNextStep(): NextStep | null {
  const { completed } = useAllapotfelmero()
  const { allChecksCompleted } = useOktatoanyag()
  const { savedAt } = useWorkbook()

  if (!completed) return null
  if (!allChecksCompleted) {
    return {
      to: '/oktatoanyag',
      label: 'oktatóanyag',
      title: 'Következő lépés: az oktatóanyag',
      text: 'Nézd végig mindkét lecke fejezeteit, és teljesítsd a tudáscheck-eket — ezután megnyílik a munkafüzet.',
      button: 'tovább az oktatóanyagra',
    }
  }
  if (!savedAt) {
    return {
      to: '/munkafuzet',
      label: 'munkafüzet',
      title: 'Következő lépés: a munkafüzet',
      text: 'Töltsd ki a munkafüzet feladatait, és mentsd el — ezután minden menüpontot szabadon használhatsz.',
      button: 'tovább a munkafüzetre',
    }
  }
  return null
}

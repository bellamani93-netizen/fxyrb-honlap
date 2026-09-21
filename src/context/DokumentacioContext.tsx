import { createContext, useContext, useState, type ReactNode } from 'react'

// GYT-oldali "dokumentáció" (2026.09.21., Marci kérésére, 4. fázis — a
// Projekt specifikáció "Dokumentáció" építőeleme alapján, egyeztetés után):
// "gyt fiókban dolgozunk. üf-hez rendelt funkció. konzultációs időponthoz
// rendelt funkció. Szöveges beviteli mező. Előre választható tipikus
// helyzetek/ismétlődő dokumentálható dolgokra létrehozható gyorsgombokkal."
//
// Egyeztetés eredménye (AskUserQuestion, kódírás előtt):
// - az "alkalom" egy FÜGGETLEN, mindig elérhető 1-6-os lista ügyfelenként —
//   NEM a naptárban ténylegesen rögzített konzultációkhoz kötött, hogy a
//   funkció a naptár-állapottól függetlenül mindig kipróbálható legyen;
// - a gyorsgombokat a GYT saját maga veszi fel/törli, KÖZÖS (nem
//   ügyfelenkénti) listaként — tipikus, ismétlődő megfogalmazások, nem
//   ügyfél-specifikus adat;
// - egy gyorsgombra kattintva a szövege a mezőhöz FŰZŐDIK (nem külön
//   kipipálható címke) — a kurzorpozíció nem követett, mindig a mező
//   VÉGÉHEZ kerül, ez a session-szintű prototípusban elegendő egyszerűsítés;
// - a spec teljesebb munkafolyamata is megépül: 1 alkalom mentés
//   ("Rögzítés") után X (itt: 3) hétig még szerkeszthető, utána READONLY;
//   a 6. (záró) alkalom rögzítése az ÖSSZES alkalmat véglegesen lezárja
//   (archívum állapot) — ekkortól semmi nem szerkeszthető, függetlenül a
//   3 hetes ablaktól;
// - a checklist (2-6. alkalom heti eredményei) és a félidei állapotfelmérő
//   (10. hét) MÉG NEM LÉTEZŐ funkciók a projektben — ezekben a körben
//   KIMARADNAK, csak szöveg+gyorsgombok épül minden alkalomhoz (az 1.-nél
//   plusz a már meglévő Állapotfelmérő eredménylap, ld. GytDokumentacio.tsx);
// - a "PDF-export" a már bevált böngésző-nyomtatás mintáját követi
//   (window.print(), ld. Eredmenyeim.tsx "nyomtatás" gombja), nem egy új
//   PDF-generáló könyvtárral.
//
// Nincs backend, ezért session-szintű állapot — ugyanaz a minta, mint a
// WorkbookContext/OktatoanyagContext esetében.

export const ALKALOM_COUNT = 6
/** X hét, ameddig egy alkalom a mentése UTÁN még szerkeszthető marad
 * (ld. Projekt specifikáció "Dokumentáció" pontja: "szerkeszthető X ideig,
 * pl. 3 hét, utána nem"). */
export const EDIT_WINDOW_WEEKS = 3

// Az 1. alkalom állapotfelmérés-folytatás mezői (2026.09.21., Marci
// kérésére, egyeztetés után): "az első alkalom dokumentációja eltér a
// többitől, itt az állapotfelmérés folytatódik" — előre megadott CÍMKÉjű,
// de kezdetben ÜRES mezők (nincs sablon-szöveg), amiket a GYT tölt ki. Ezek
// az általános szöveges mező MELLÉ (nem helyette) kerülnek, és azzal EGYÜTT,
// egyetlen "Rögzítés" gombbal kerülnek mentésre/zárolásra.
export type AssessmentFieldId =
  | 'tortenet'
  | 'tunetek'
  | 'riziko'
  | 'inspekcioGerincGorbuletek'
  | 'inspekcioFejHelyzet'
  | 'mozgasFejEmeles'
  | 'mozgasFejLehajtas'
  | 'mozgasKarElevacio'
  | 'mozgasGerincFlexio'
  | 'mozgasGerincExtenzio'
  | 'tesztSarokemeles'

export type AssessmentFields = Record<AssessmentFieldId, string>

export const ASSESSMENT_SECTIONS: { title: string; fields: { id: AssessmentFieldId; label: string }[] }[] = [
  { title: 'Történet', fields: [{ id: 'tortenet', label: 'Történet' }] },
  { title: 'Tünetek', fields: [{ id: 'tunetek', label: 'Tünetek' }] },
  { title: 'Rizikó', fields: [{ id: 'riziko', label: 'Rizikó' }] },
  {
    title: 'Inspekció',
    fields: [
      { id: 'inspekcioGerincGorbuletek', label: 'gerinc görbületek' },
      { id: 'inspekcioFejHelyzet', label: 'fej helyzet' },
    ],
  },
  {
    title: 'Mozgásvizsgálat',
    fields: [
      { id: 'mozgasFejEmeles', label: 'fej emelés' },
      { id: 'mozgasFejLehajtas', label: 'fej lehajtás' },
      { id: 'mozgasKarElevacio', label: 'kar eleváció' },
      { id: 'mozgasGerincFlexio', label: 'gerinc flexió' },
      { id: 'mozgasGerincExtenzio', label: 'gerinc extenzió' },
    ],
  },
  { title: 'Tesztek', fields: [{ id: 'tesztSarokemeles', label: 'sarokemelés jobb-bal' }] },
]

export function emptyAssessment(): AssessmentFields {
  const result = {} as AssessmentFields
  for (const section of ASSESSMENT_SECTIONS) {
    for (const field of section.fields) result[field.id] = ''
  }
  return result
}

export type DokumentacioEntry = {
  alkalom: number
  text: string
  savedAt: string | null
  /** csak az 1. alkalomnál van kitöltve, a többinél null. */
  assessment: AssessmentFields | null
}

export type QuickButton = { id: string; text: string }

function emptyEntries(): DokumentacioEntry[] {
  return Array.from({ length: ALKALOM_COUNT }, (_, i) => {
    const alkalom = i + 1
    return { alkalom, text: '', savedAt: null, assessment: alkalom === 1 ? emptyAssessment() : null }
  })
}

type DokumentacioContextValue = {
  quickButtons: QuickButton[]
  addQuickButton: (text: string) => void
  removeQuickButton: (id: string) => void
  getEntries: (clientId: string) => DokumentacioEntry[]
  saveEntry: (clientId: string, alkalom: number, text: string, assessment: AssessmentFields | null) => void
  /** true, ha az ügyfél 6. (záró) alkalma már rögzítve van — ekkortól az
   * összes alkalom véglegesen zárolt, függetlenül a 3 hetes ablaktól. */
  isArchived: (clientId: string) => boolean
  /** true, ha EZ a konkrét alkalom jelenleg szerkeszthető (nincs még
   * elmentve, VAGY el van mentve, de a 3 hetes ablakon belül vagyunk),
   * ÉS az ügyfél még nincs archiválva. */
  isEntryEditable: (clientId: string, entry: DokumentacioEntry) => boolean
}

const DokumentacioContext = createContext<DokumentacioContextValue | null>(null)

export function useDokumentacio() {
  const ctx = useContext(DokumentacioContext)
  if (!ctx) throw new Error('useDokumentacio csak DokumentacioProvideren belül használható')
  return ctx
}

export function DokumentacioProvider({ children }: { children: ReactNode }) {
  const [entriesByClient, setEntriesByClient] = useState<Record<string, DokumentacioEntry[]>>({})
  const [quickButtons, setQuickButtons] = useState<QuickButton[]>([])

  function getEntries(clientId: string): DokumentacioEntry[] {
    return entriesByClient[clientId] ?? emptyEntries()
  }

  function saveEntry(clientId: string, alkalom: number, text: string, assessment: AssessmentFields | null) {
    setEntriesByClient((prev) => {
      const current = prev[clientId] ?? emptyEntries()
      // a `savedAt` csak az ELSŐ rögzítéskor kerül be — egy későbbi
      // szerkesztés (a 3 hetes ablakon belül) nem tolja ki a határidőt,
      // ugyanattól a rögzítés-időponttól számít (ld. Projekt specifikáció:
      // "szerkeszthető X ideig, utána nem" — abszolút, nem gördülő határidő).
      // Az állapotfelmérés-folytatás mezők (csak az 1. alkalomnál) az
      // általános szöveggel EGYÜTT, egyetlen rögzítéssel mentődnek.
      return {
        ...prev,
        [clientId]: current.map((e) =>
          e.alkalom === alkalom ? { ...e, text, assessment, savedAt: e.savedAt ?? new Date().toISOString() } : e
        ),
      }
    })
  }

  function isArchived(clientId: string): boolean {
    const closing = getEntries(clientId).find((e) => e.alkalom === ALKALOM_COUNT)
    return !!closing?.savedAt
  }

  function isEntryEditable(clientId: string, entry: DokumentacioEntry): boolean {
    if (isArchived(clientId)) return false
    if (!entry.savedAt) return true
    const deadline = new Date(entry.savedAt)
    deadline.setDate(deadline.getDate() + EDIT_WINDOW_WEEKS * 7)
    return new Date() < deadline
  }

  function addQuickButton(text: string) {
    setQuickButtons((prev) => [...prev, { id: `gyorsgomb-${Date.now()}`, text }])
  }

  function removeQuickButton(id: string) {
    setQuickButtons((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <DokumentacioContext.Provider
      value={{ quickButtons, addQuickButton, removeQuickButton, getEntries, saveEntry, isArchived, isEntryEditable }}
    >
      {children}
    </DokumentacioContext.Provider>
  )
}

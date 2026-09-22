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

// Az 1. alkalom "állapotfelmérés folytatása" mezői SZERKESZTHETŐ SABLONNÁ
// alakítva (2026.09.21., Marci kérésére, egyeztetés után): "jó lenne, ha a
// gyt tudná személyre szabni, és ő tudna hozzáadni beviteli mezőket" — egy
// KÖZÖS (nem ügyfelenkénti), beállítás-oldalon szerkeszthető sablon
// (`assessmentTemplate`), amit minden ÚJ, még nem rögzített alkalom-1
// dokumentáció a legfrissebb állapotában használ. Fontos, a Marci által
// kifejezetten kért szabály: A MÓDOSÍTÁSOK NEM ÉRVÉNYESEK VISSZAMENŐLEG —
// ha egy ügyfélnél az 1. alkalom dokumentációja már EGYSZER rögzítve lett,
// az ELSŐ rögzítéskor "lefényképezett" szakasz/mező-szerkezetet (ld.
// `DokumentacioEntry.assessmentSnapshot`) őrzi meg attól kezdve VÉGLEG,
// akkor is, ha a sablont a GYT később átnevezi/bővíti/mezőt töröl belőle.
export type AssessmentFieldDef = { id: string; label: string }
export type AssessmentSectionDef = { id: string; title: string; fields: AssessmentFieldDef[] }

/** a sablon kezdő állapota — a korábbi kör (157. pont) fix mezői, mostantól
 * a GYT-oldali beállítás-oldalon (`GytDokumentacioBeallitasok.tsx`)
 * szabadon szerkeszthető kiindulópontként. */
export const DEFAULT_ASSESSMENT_TEMPLATE: AssessmentSectionDef[] = [
  { id: 'szakasz-tortenet', title: 'Történet', fields: [{ id: 'mezo-tortenet', label: 'Történet' }] },
  { id: 'szakasz-tunetek', title: 'Tünetek', fields: [{ id: 'mezo-tunetek', label: 'Tünetek' }] },
  { id: 'szakasz-riziko', title: 'Rizikó', fields: [{ id: 'mezo-riziko', label: 'Rizikó' }] },
  {
    id: 'szakasz-inspekcio',
    title: 'Inspekció',
    fields: [
      { id: 'mezo-inspekcio-gerincgorbuletek', label: 'gerinc görbületek' },
      { id: 'mezo-inspekcio-fejhelyzet', label: 'fej helyzet' },
    ],
  },
  {
    id: 'szakasz-mozgasvizsgalat',
    title: 'Mozgásvizsgálat',
    fields: [
      { id: 'mezo-mozgas-fejemeles', label: 'fej emelés' },
      { id: 'mezo-mozgas-fejlehajtas', label: 'fej lehajtás' },
      { id: 'mezo-mozgas-karelevacio', label: 'kar eleváció' },
      { id: 'mezo-mozgas-gerincflexio', label: 'gerinc flexió' },
      { id: 'mezo-mozgas-gerincextenzio', label: 'gerinc extenzió' },
    ],
  },
  { id: 'szakasz-tesztek', title: 'Tesztek', fields: [{ id: 'mezo-tesztek-sarokemeles', label: 'sarokemelés jobb-bal' }] },
]

/** egy már (legalább egyszer) rögzített alkalom-1 dokumentáció saját,
 * lefagyasztott szakasz/mező-szerkezete + a hozzá tartozó értékek. */
export type AssessmentFieldValue = { id: string; label: string; value: string }
export type AssessmentSectionSnapshot = { id: string; title: string; fields: AssessmentFieldValue[] }

export function buildAssessmentDraft(template: AssessmentSectionDef[]): AssessmentSectionSnapshot[] {
  return template.map((section) => ({
    id: section.id,
    title: section.title,
    fields: section.fields.map((field) => ({ id: field.id, label: field.label, value: '' })),
  }))
}

export function hasAssessmentContent(snapshot: AssessmentSectionSnapshot[] | null): boolean {
  return !!snapshot?.some((section) => section.fields.some((field) => field.value.trim()))
}

export type DokumentacioEntry = {
  alkalom: number
  text: string
  savedAt: string | null
  /** csak az 1. alkalomnál kerül be, és csak az ELSŐ rögzítés UTÁN — attól
   * kezdve a szerkezete fix, a sablon későbbi módosításai nem hatnak rá. */
  assessmentSnapshot: AssessmentSectionSnapshot[] | null
}

export type QuickButton = { id: string; text: string }

/** egy "további jegyzetek" bejegyzés — mentés után véglegesen zárolt. */
export type AdditionalNote = { id: string; text: string; savedAt: string }

function emptyEntries(): DokumentacioEntry[] {
  return Array.from({ length: ALKALOM_COUNT }, (_, i) => ({ alkalom: i + 1, text: '', savedAt: null, assessmentSnapshot: null }))
}

type DokumentacioContextValue = {
  quickButtons: QuickButton[]
  addQuickButton: (text: string) => void
  removeQuickButton: (id: string) => void
  getEntries: (clientId: string) => DokumentacioEntry[]
  saveEntry: (clientId: string, alkalom: number, text: string, assessmentSnapshot: AssessmentSectionSnapshot[] | null) => void
  /** true, ha az ügyfél 6. (záró) alkalma már rögzítve van — ekkortól az
   * összes alkalom véglegesen zárolt, függetlenül a 3 hetes ablaktól. */
  isArchived: (clientId: string) => boolean
  /** true, ha EZ a konkrét alkalom jelenleg szerkeszthető (nincs még
   * elmentve, VAGY el van mentve, de a 3 hetes ablakon belül vagyunk),
   * ÉS az ügyfél még nincs archiválva. */
  isEntryEditable: (clientId: string, entry: DokumentacioEntry) => boolean
  /** az 1. alkalom "állapotfelmérés folytatása" KÖZÖS, GYT által
   * szerkeszthető sablonja — ld. GytDokumentacioBeallitasok.tsx. */
  assessmentTemplate: AssessmentSectionDef[]
  /** a beállítás-oldal SAJÁT piszkozat-állapotban szerkeszt (átnevezés,
   * hozzáadás, törlés is), és csak a "módosítások mentése" gombra cseréli
   * le EGYBEN a közös sablont erre — ld. 162. pont, Marci kérésére. */
  replaceAssessmentTemplate: (template: AssessmentSectionDef[]) => void
  /** a 6. (záró) alkalom rögzítése (archiválás) UTÁN elérhető "további
   * jegyzetek" — Marci kérésére (2026.09.22., 165. pont): "mentés után
   * rögzül. Kibővíthető, de a korábban rögzített rész nem szerkeszthető
   * legyen" — ezért ÜGYFELENKÉNT egy LISTA, minden "mentés" egy ÚJ, attól
   * kezdve VÉGLEGESEN zárolt bejegyzést hoz létre (nincs időkorlát/
   * szerkesztés, mint a 6 alkalomnál — ez egyszerűbb: örökre zárolt). */
  getAdditionalNotes: (clientId: string) => AdditionalNote[]
  addAdditionalNote: (clientId: string, text: string) => void
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
  const [assessmentTemplate, setAssessmentTemplate] = useState<AssessmentSectionDef[]>(DEFAULT_ASSESSMENT_TEMPLATE)
  const [additionalNotesByClient, setAdditionalNotesByClient] = useState<Record<string, AdditionalNote[]>>({})

  function getEntries(clientId: string): DokumentacioEntry[] {
    return entriesByClient[clientId] ?? emptyEntries()
  }

  function saveEntry(clientId: string, alkalom: number, text: string, assessmentSnapshot: AssessmentSectionSnapshot[] | null) {
    setEntriesByClient((prev) => {
      const current = prev[clientId] ?? emptyEntries()
      // a `savedAt` csak az ELSŐ rögzítéskor kerül be — egy későbbi
      // szerkesztés (a 3 hetes ablakon belül) nem tolja ki a határidőt,
      // ugyanattól a rögzítés-időponttól számít (ld. Projekt specifikáció:
      // "szerkeszthető X ideig, utána nem" — abszolút, nem gördülő határidő).
      // Az `assessmentSnapshot`-ot a hívó (GytDokumentacio.tsx EntryEditor)
      // már a megfelelő szerkezettel adja át: első rögzítéskor a sablon
      // ÉPPEN AKTUÁLIS másolatával, utána a MÁR MEGLÉVŐ, fagyasztott
      // szerkezetével (csak az értékek frissülnek) — itt nincs több teendő.
      return {
        ...prev,
        [clientId]: current.map((e) =>
          e.alkalom === alkalom ? { ...e, text, assessmentSnapshot, savedAt: e.savedAt ?? new Date().toISOString() } : e
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

  function replaceAssessmentTemplate(template: AssessmentSectionDef[]) {
    setAssessmentTemplate(template)
  }

  function getAdditionalNotes(clientId: string): AdditionalNote[] {
    return additionalNotesByClient[clientId] ?? []
  }

  function addAdditionalNote(clientId: string, text: string) {
    setAdditionalNotesByClient((prev) => ({
      ...prev,
      [clientId]: [...(prev[clientId] ?? []), { id: `jegyzet-${Date.now()}`, text, savedAt: new Date().toISOString() }],
    }))
  }

  return (
    <DokumentacioContext.Provider
      value={{
        quickButtons,
        addQuickButton,
        removeQuickButton,
        getEntries,
        saveEntry,
        isArchived,
        isEntryEditable,
        assessmentTemplate,
        replaceAssessmentTemplate,
        getAdditionalNotes,
        addAdditionalNote,
      }}
    >
      {children}
    </DokumentacioContext.Provider>
  )
}

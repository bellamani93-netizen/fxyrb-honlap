import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useClients } from '../context/ClientsContext'
import { getSelectedClientId } from '../data/initialClients'
import {
  useDokumentacio,
  ALKALOM_COUNT,
  EDIT_WINDOW_WEEKS,
  buildAssessmentDraft,
  hasAssessmentContent,
  type AssessmentSectionSnapshot,
  type DokumentacioEntry,
} from '../context/DokumentacioContext'
import Eredmenyeim from './Eredmenyeim'
import Icon from '../components/Icon'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('hu-HU')
}

function editableUntil(savedAtISO: string) {
  const d = new Date(savedAtISO)
  d.setDate(d.getDate() + EDIT_WINDOW_WEEKS * 7)
  return d
}

// az 1. alkalom "állapotfelmérés folytatása" mezői (2026.09.21., Marci
// kérésére) — a GYT saját, "dokumentáció beállításai" oldalon szerkeszthető
// KÖZÖS sablonból (ld. DokumentacioContext.tsx `assessmentTemplate`)
// származnak, de egy adott ügyfél MÁR RÖGZÍTETT alkalma a saját,
// lefagyasztott szerkezetét (`assessmentSnapshot`) jeleníti meg — a sablon
// későbbi módosítása nem hat visszamenőleg a már rögzített dokumentációra.
// Szerkeszthető és csak-olvasható (zárolt/nyomtatási) nézetben is ugyanaz a
// komponens.
export function AssessmentSection({
  sections,
  editable,
  onChange,
}: {
  sections: AssessmentSectionSnapshot[]
  editable: boolean
  onChange?: (sectionId: string, fieldId: string, value: string) => void
}) {
  return (
    <div className="mb-4">
      <h3 className="h6 mb-3">állapotfelmérés folytatása</h3>
      {sections.map((section) => {
        // ha a szakasznak egyetlen, a cím-mel megegyező nevű mezője van
        // (Történet, Tünetek, Rizikó), a mező-címke felesleges duplikáció
        // lenne — ilyenkor csak a szakasz-cím jelenik meg.
        const singleTrivialField = section.fields.length === 1 && section.fields[0].label === section.title
        return (
          <div className="mb-3" key={section.id}>
            {!singleTrivialField && (
              <span className="small fw-bold d-block mb-2" style={{ color: 'var(--color-primary)' }}>
                {section.title}
              </span>
            )}
            {section.fields.map((field) => (
              <div className="mb-2" key={field.id}>
                <label
                  className="small fw-bold d-block mb-1"
                  style={singleTrivialField ? { color: 'var(--color-primary)' } : undefined}
                >
                  {singleTrivialField ? section.title : field.label}
                </label>
                {editable ? (
                  <textarea
                    className="form-control"
                    rows={2}
                    value={field.value}
                    onChange={(e) => onChange?.(section.id, field.id, e.target.value)}
                  />
                ) : (
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                    {field.value || <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                  </p>
                )}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

// gyorsgombok kezelése + beszúrása (2026.09.21., Marci kérésére) — a GYT
// saját, KÖZÖS (nem ügyfelenkénti) listája tipikus/ismétlődő
// megfogalmazásokhoz. Kattintásra a szöveg a mező VÉGÉHEZ fűződik (nem a
// kurzorpozícióhoz — session-szintű prototípusban elegendő egyszerűsítés).
function QuickButtons({ onInsert }: { onInsert: (text: string) => void }) {
  const { quickButtons, addQuickButton, removeQuickButton } = useDokumentacio()
  const [newText, setNewText] = useState('')

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newText.trim()
    if (!trimmed) return
    addQuickButton(trimmed)
    setNewText('')
  }

  return (
    <div className="mb-3">
      <span className="small fw-bold d-block mb-2">gyorsgombok</span>
      {quickButtons.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-2">
          {quickButtons.map((b) => (
            <span key={b.id} className="d-inline-flex align-items-center gap-1">
              <button
                type="button"
                className="btn-fyb btn-fyb-outline btn-fyb-sm"
                onClick={() => onInsert(b.text)}
              >
                {b.text}
              </button>
              <button
                type="button"
                onClick={() => removeQuickButton(b.id)}
                aria-label="gyorsgomb törlése"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
              >
                <Icon src="/icons/ikon_kuka.svg" style={{ width: '1rem', height: '1rem' }} />
              </button>
            </span>
          ))}
        </div>
      )}
      <form onSubmit={handleAdd} className="d-flex gap-2 flex-wrap">
        <input
          type="text"
          className="form-control form-control-sm"
          style={{ maxWidth: 260 }}
          placeholder="új gyorsgomb szövege"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
        />
        <button type="submit" className="btn-fyb btn-fyb-outline btn-fyb-sm" disabled={!newText.trim()}>+ gyorsgomb</button>
      </form>
    </div>
  )
}

// egy alkalom dokumentációs blokkja — a munkafüzet mentés/readOnly/
// szerkesztés mintáját követi (ld. Munkafuzet.tsx), kiegészítve az
// időkorlátos szerkeszthetőséggel (ld. DokumentacioContext.tsx).
function EntryEditor({ clientId, entry }: { clientId: string; entry: DokumentacioEntry }) {
  const { saveEntry, isEntryEditable, isArchived, assessmentTemplate } = useDokumentacio()
  const editableNow = isEntryEditable(clientId, entry)
  const [draft, setDraft] = useState(entry.text)
  // az 1. alkalomnál: ha már van saját, lefagyasztott szerkezet (legalább
  // egyszer rögzítve volt), AZT szerkesztjük tovább — egyébként a sablon
  // ÉPPEN AKTUÁLIS másolatát, üres értékekkel (ld. modul-tető komment).
  const [assessmentDraft, setAssessmentDraft] = useState<AssessmentSectionSnapshot[] | null>(
    entry.alkalom === 1 ? (entry.assessmentSnapshot ?? buildAssessmentDraft(assessmentTemplate)) : null
  )
  const [editing, setEditing] = useState(!entry.savedAt)

  useEffect(() => {
    setDraft(entry.text)
    setAssessmentDraft(entry.alkalom === 1 ? (entry.assessmentSnapshot ?? buildAssessmentDraft(assessmentTemplate)) : null)
    setEditing(!entry.savedAt)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.alkalom, entry.text, entry.assessmentSnapshot, entry.savedAt])

  function handleInsert(text: string) {
    setDraft((d) => (d.trim() ? `${d}\n${text}` : text))
  }

  function handleAssessmentChange(sectionId: string, fieldId: string, value: string) {
    setAssessmentDraft((prev) =>
      prev
        ? prev.map((s) =>
            s.id === sectionId ? { ...s, fields: s.fields.map((f) => (f.id === fieldId ? { ...f, value } : f)) } : s
          )
        : prev
    )
  }

  function handleSave() {
    saveEntry(clientId, entry.alkalom, draft, assessmentDraft)
    setEditing(false)
  }

  const showEditor = editing && editableNow
  const hasAnyContent = draft.trim() || hasAssessmentContent(assessmentDraft)

  return (
    <div>
      {assessmentDraft && (
        <AssessmentSection
          sections={assessmentDraft}
          editable={showEditor}
          onChange={handleAssessmentChange}
        />
      )}

      {showEditor ? (
        <>
          <textarea
            className="form-control mb-3"
            rows={6}
            placeholder="dokumentáció szövege…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <QuickButtons onInsert={handleInsert} />
        </>
      ) : (
        <p className="mb-3" style={{ whiteSpace: 'pre-wrap' }}>
          {entry.text || <span style={{ color: 'var(--color-text-muted)' }}>még nincs dokumentáció rögzítve.</span>}
        </p>
      )}

      <div className="d-flex align-items-center flex-wrap gap-3 no-print">
        {showEditor ? (
          <button type="button" className="btn-fyb btn-fyb-primary" onClick={handleSave} disabled={!hasAnyContent}>
            Rögzítés
          </button>
        ) : entry.savedAt ? (
          <>
            <span className="badge-fyb">✓ rögzítve</span>
            {editableNow ? (
              <button type="button" className="btn-fyb btn-fyb-outline btn-fyb-sm" onClick={() => setEditing(true)}>
                szerkesztés
              </button>
            ) : (
              <span className="small" style={{ color: 'var(--color-text-muted)' }}>
                {isArchived(clientId) ? 'az együttműködés lezárva — nem szerkeszthető' : 'a szerkesztési határidő lejárt'}
              </span>
            )}
          </>
        ) : null}
        {entry.savedAt && (
          <span className="small" style={{ color: 'var(--color-text-muted)' }}>
            rögzítve: {formatDate(entry.savedAt)}
            {editableNow && ` — szerkeszthető: ${formatDate(editableUntil(entry.savedAt).toISOString())}-ig`}
          </span>
        )}
      </div>
    </div>
  )
}

// "további jegyzetek" (2026.09.22., Marci kérésére) — a 6. (záró) alkalom
// rögzítése (archiválás) UTÁN elérhető, kiegészíthető jegyzet-terület.
// Marci pontosítása (2026.09.22., 165. pont): "a cél: a további jegyzetek
// mentés után rögzül. Kibővíthető, de a korábban rögzített rész nem
// szerkeszthető legyen" — ezért NEM egyetlen, folyamatosan felülírható
// mező, hanem bejegyzések LISTÁJA: minden "mentés" egy ÚJ, attól kezdve
// véglegesen zárolt (csak-olvasható, dátumozott) bejegyzést hoz létre, alul
// pedig mindig ott az ÜRES, szerkeszthető mező a KÖVETKEZŐ bejegyzéshez.
function AdditionalNotesEditor({ clientId }: { clientId: string }) {
  const { getAdditionalNotes, addAdditionalNote } = useDokumentacio()
  const notes = getAdditionalNotes(clientId)
  const [draft, setDraft] = useState('')

  function handleSave() {
    if (!draft.trim()) return
    addAdditionalNote(clientId, draft)
    setDraft('')
  }

  return (
    <div>
      {notes.length > 0 && (
        <div className="mb-4 d-flex flex-column gap-3">
          {notes.map((note) => (
            <div key={note.id}>
              <p className="mb-1" style={{ whiteSpace: 'pre-wrap' }}>
                {note.text}
              </p>
              <span className="small" style={{ color: 'var(--color-text-muted)' }}>
                rögzítve: {formatDate(note.savedAt)}
              </span>
            </div>
          ))}
        </div>
      )}

      <textarea
        className="form-control mb-2"
        rows={5}
        placeholder="új jegyzet…"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <button type="button" className="btn-fyb btn-fyb-primary" onClick={handleSave} disabled={!draft.trim()}>
        mentés
      </button>
    </div>
  )
}

type Selection = number | 'jegyzetek'

export default function GytDokumentacio() {
  const { clients } = useClients()
  const client = clients.find((c) => c.id === getSelectedClientId())!
  const { getEntries, isArchived, getAdditionalNotes } = useDokumentacio()
  const [selected, setSelected] = useState<Selection>(1)
  const entries = getEntries(client.id)
  const activeEntry = typeof selected === 'number' ? entries.find((e) => e.alkalom === selected)! : null
  const archived = isArchived(client.id)
  const additionalNotes = getAdditionalNotes(client.id)

  // Marci kérésére (2026.09.22.): "a kapcsolók háttere váltson át
  // szögletesebb módra, ha több sorba rendeződnek az alkalmak
  // dokumentációi" — a pirula-sor TÉNYLEGES (nem csak viewport-szélesség
  // szerint becsült) tördelését méri: ha bármelyik gomb `offsetTop`-ja
  // eltér az elsőétől, a sor több sorba tördelődött. Így a "további
  // jegyzetek" pirula archiválás utáni megjelenése is helyesen frissíti.
  const tabsRef = useRef<HTMLDivElement>(null)
  const [tabsWrapped, setTabsWrapped] = useState(false)

  useEffect(() => {
    const el = tabsRef.current
    if (!el) return
    function checkWrap() {
      const children = Array.from(el!.children) as HTMLElement[]
      const tops = new Set(children.map((c) => c.offsetTop))
      setTabsWrapped(tops.size > 1)
    }
    checkWrap()
    const observer = new ResizeObserver(checkWrap)
    observer.observe(el)
    return () => observer.disconnect()
  }, [entries.length, archived])

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 900 }}>
        <div className="app-page-header mb-3 mobile-sticky-header">
          <h1 className="app-page-title mb-0">dokumentáció — {client.name}</h1>
        </div>

        {archived && (
          <div className="select-client-notice mb-3 no-print">
            <Icon src="/icons/ikon_lakat.svg" style={{ width: '1.4rem', height: '1.4rem', flexShrink: 0 }} />
            <span>az együttműködés lezárva — a dokumentáció archívumba került, nem szerkeszthető.</span>
          </div>
        )}

        <div
          ref={tabsRef}
          className={`auth-tabs dokumentacio-alkalom-tabs mb-3 no-print ${tabsWrapped ? 'auth-tabs--wrapped' : ''}`}
          style={{ flexWrap: 'wrap', height: 'auto' }}
        >
          {entries.map((e) => (
            <button
              key={e.alkalom}
              type="button"
              className={`auth-tab ${selected === e.alkalom ? 'active' : ''}`}
              onClick={() => setSelected(e.alkalom)}
            >
              {e.alkalom}. alkalom{e.alkalom === ALKALOM_COUNT ? ' (záró)' : ''}
            </button>
          ))}
          {archived && (
            <button
              type="button"
              className={`auth-tab ${selected === 'jegyzetek' ? 'active' : ''}`}
              onClick={() => setSelected('jegyzetek')}
            >
              további jegyzetek
            </button>
          )}
        </div>

        <div className="card-fyb mb-4 no-print">
          {selected === 'jegyzetek' ? (
            <>
              <h2 className="h6 mb-3">további jegyzetek</h2>
              <AdditionalNotesEditor clientId={client.id} />
            </>
          ) : (
            <>
              {selected === 1 && (
                <div className="mb-4">
                  <Eredmenyeim displayName={client.name} embedded />
                </div>
              )}
              <h2 className="h6 mb-3">{selected}. alkalom dokumentációja</h2>
              <EntryEditor clientId={client.id} entry={activeEntry!} />
            </>
          )}
        </div>

        {/* "beállítások"/"nyomtatás" a lap ALJÁN, a mentés/rögzítés rész
           ALATT (2026.09.23., Marci kérésére — korábban a fejlécben
           voltak) */}
        <div className="d-flex align-items-center gap-2 mb-4 no-print">
          <Link to="/gyt/dokumentacio-beallitasok" className="btn-fyb btn-fyb-outline btn-fyb-sm">
            beállítások
          </Link>
          <button type="button" className="btn-fyb btn-fyb-outline btn-fyb-sm" onClick={() => window.print()}>
            nyomtatás / PDF
          </button>
        </div>

        {/* nyomtatáskor (PDF-export) az ÖSSZES alkalom egyben, egymás után
           jelenik meg — ld. Projekt specifikáció: "Egyben PDF generálható:
           1. oldal Állapotfelmérő eredménylap, 2. oldal 1. konzultáció
           dok., stb." A JSX mindig rendereli, a láthatóságot a
           `.dokumentacio-print-only` CSS-szabály dönti el (components.css),
           ugyanaz a minta, mint az Eredmenyeim.tsx `eredmeny-print-only`-ja. */}
        <div className="dokumentacio-print-only">
          <Eredmenyeim displayName={client.name} />
          {entries.map((e) => (
            <div className="card-fyb mb-4" key={e.alkalom}>
              <h2 className="h6 mb-3">{e.alkalom}. alkalom dokumentációja</h2>
              {e.assessmentSnapshot && <AssessmentSection sections={e.assessmentSnapshot} editable={false} />}
              <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                {e.text || 'még nincs dokumentáció rögzítve.'}
              </p>
            </div>
          ))}
          {archived && (
            <div className="card-fyb mb-4">
              <h2 className="h6 mb-3">további jegyzetek</h2>
              {additionalNotes.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {additionalNotes.map((note) => (
                    <div key={note.id}>
                      <p className="mb-1" style={{ whiteSpace: 'pre-wrap' }}>
                        {note.text}
                      </p>
                      <span className="small" style={{ color: 'var(--color-text-muted)' }}>
                        rögzítve: {formatDate(note.savedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                  nincs további jegyzet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

import { useEffect, useState } from 'react'
import Icon from '../components/Icon'
import {
  useDokumentacio,
  buildAssessmentDraft,
  type AssessmentSectionDef,
  type AssessmentSectionSnapshot,
} from '../context/DokumentacioContext'
import { AssessmentSection } from './GytDokumentacio'

// GYT-oldali "dokumentáció beállításai" (2026.09.21., Marci kérésére): "jó
// lenne, ha a gyt tudná személyre szabni, és ő tudna hozzáadni beviteli
// mezőket... legyen egy beállítós rész, ahol egyszer be tudja
// állítani/módosítani, és onnantól minden új ügyfélnél az lesz az
// alapértelmezett egészen a következő módosításig" — egy KÖZÖS (nem
// ügyfelenkénti) sablon, ami az 1. alkalom "állapotfelmérés folytatása"
// szakaszait/mezőit vezérli (ld. DokumentacioContext.tsx
// `assessmentTemplate`). A már rögzített dokumentációkra a módosítás NEM
// hat visszamenőleg — ez Marci kifejezett kérése: "a módosítások nem
// érvényesek visszamenőleg... a korábbi kitöltésen szerepelni fog az a
// mező, amit közben már megszüntetett".
//
// "módosítások mentése"/"mégse" munkafolyamat (2026.09.22., Marci
// kérésére, egyeztetés után): az EGÉSZ oldal EGY közös piszkozatot
// szerkeszt (`draft` — átnevezés, hozzáadás, törlés is csak ide kerül),
// ami csak a "módosítások mentése" gombra válik véglegessé (ld.
// `replaceAssessmentTemplate`); "mégse" eldobja a piszkozatot és
// visszaáll a közös sablon utoljára mentett állapotára. Mentés után a
// gombok "✓ mentve" jelvényre és "szerkesztés" gombra váltanak — ugyanaz
// a minta, mint a munkafüzet/dokumentáció "Rögzítés" → "✓ rögzítve" +
// "szerkesztés" ciklusa.

const trashBtnStyle: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }

function SectionCard({
  section,
  editing,
  onRenameSection,
  onRemoveSection,
  onAddField,
  onRenameField,
  onRemoveField,
}: {
  section: AssessmentSectionDef
  editing: boolean
  onRenameSection: (title: string) => void
  onRemoveSection: () => void
  onAddField: (label: string) => void
  onRenameField: (fieldId: string, label: string) => void
  onRemoveField: (fieldId: string) => void
}) {
  const [newFieldLabel, setNewFieldLabel] = useState('')

  function handleAddField(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newFieldLabel.trim()
    if (!trimmed) return
    onAddField(trimmed)
    setNewFieldLabel('')
  }

  if (!editing) {
    return (
      <div className="card-fyb mb-3">
        <h3 className="h6 mb-2">{section.title}</h3>
        {section.fields.length > 0 ? (
          <ul className="mb-0 ps-3">
            {section.fields.map((field) => (
              <li key={field.id} className="small">
                {field.label}
              </li>
            ))}
          </ul>
        ) : (
          <p className="small mb-0" style={{ color: 'var(--color-text-muted)' }}>
            nincs mező ebben a szakaszban.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="card-fyb mb-3">
      <div className="d-flex align-items-center gap-2 mb-3">
        <input
          type="text"
          className="form-control fw-bold"
          style={{ maxWidth: 360 }}
          value={section.title}
          onChange={(e) => onRenameSection(e.target.value)}
          aria-label="szakasz neve"
        />
        <button type="button" onClick={onRemoveSection} aria-label="szakasz törlése" style={trashBtnStyle}>
          <Icon src="/icons/ikon_kuka.svg" style={{ width: '1.3rem', height: '1.3rem' }} />
        </button>
      </div>

      {section.fields.length > 0 && (
        <div className="mb-3 d-flex flex-column gap-2">
          {section.fields.map((field) => (
            <div className="d-flex align-items-center gap-2" key={field.id}>
              <input
                type="text"
                className="form-control form-control-sm"
                style={{ maxWidth: 320 }}
                value={field.label}
                onChange={(e) => onRenameField(field.id, e.target.value)}
                aria-label="mező neve"
              />
              <button
                type="button"
                onClick={() => onRemoveField(field.id)}
                aria-label="mező törlése"
                style={trashBtnStyle}
              >
                <Icon src="/icons/ikon_kuka.svg" style={{ width: '1rem', height: '1rem' }} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAddField} className="d-flex gap-2 flex-wrap">
        <input
          type="text"
          className="form-control form-control-sm"
          style={{ maxWidth: 260 }}
          placeholder="új mező neve"
          value={newFieldLabel}
          onChange={(e) => setNewFieldLabel(e.target.value)}
        />
        <button type="submit" className="btn-fyb btn-fyb-outline btn-fyb-sm" disabled={!newFieldLabel.trim()}>
          + mező
        </button>
      </form>
    </div>
  )
}

// élő előnézet (2026.09.22., Marci kérésére: "legyen egy előnézet, ahol
// látja, hogy hogy néz ki a valóságban, amit összeállít") — a valós
// dokumentáció-oldallal MEGEGYEZŐ `AssessmentSection` komponenst
// használja, éles, kipróbálható mezőkkel (a beírt szöveg csak ide,
// átmenetileg kerül, sehova nem mentődik). A MOST SZERKESZTETT, még nem
// mentett piszkozatot (`draft`) tükrözi folyamatosan, nem csak a már
// mentett sablont. A struktúra változásakor (mező átnevezve/törölve/
// hozzáadva) frissül, de a MÁR MEGLÉVŐ mezőkbe beírt kipróbálás-szöveg —
// id szerint — megmarad.
function TemplatePreview({ template }: { template: AssessmentSectionDef[] }) {
  const [preview, setPreview] = useState<AssessmentSectionSnapshot[]>(() => buildAssessmentDraft(template))

  useEffect(() => {
    setPreview((prev) => {
      const valueByFieldId = new Map(prev.flatMap((s) => s.fields.map((f) => [f.id, f.value] as const)))
      return template.map((section) => ({
        id: section.id,
        title: section.title,
        fields: section.fields.map((field) => ({ id: field.id, label: field.label, value: valueByFieldId.get(field.id) ?? '' })),
      }))
    })
  }, [template])

  function handleChange(sectionId: string, fieldId: string, value: string) {
    setPreview((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, fields: s.fields.map((f) => (f.id === fieldId ? { ...f, value } : f)) } : s))
    )
  }

  return (
    <div className="card-fyb mb-4">
      <h2 className="h6 mb-1">előnézet</h2>
      <p className="small mb-3" style={{ color: 'var(--color-text-muted)' }}>
        Így fog kinézni az 1. alkalom dokumentációjánál — nyugodtan írj bele, kipróbálásképp, ez nem kerül elmentésre.
      </p>
      {preview.length > 0 ? (
        <AssessmentSection sections={preview} editable onChange={handleChange} />
      ) : (
        <p className="small mb-0" style={{ color: 'var(--color-text-muted)' }}>
          még nincs egyetlen szakasz sem — vegyél fel legalább egyet lent.
        </p>
      )}
    </div>
  )
}

export default function GytDokumentacioBeallitasok() {
  const { assessmentTemplate, replaceAssessmentTemplate } = useDokumentacio()
  const [mode, setMode] = useState<'editing' | 'saved'>('editing')
  const [draft, setDraft] = useState<AssessmentSectionDef[]>(assessmentTemplate)
  const [newSectionTitle, setNewSectionTitle] = useState('')

  function renameSection(sectionId: string, title: string) {
    setDraft((prev) => prev.map((s) => (s.id === sectionId ? { ...s, title } : s)))
  }

  function removeSection(sectionId: string) {
    setDraft((prev) => prev.filter((s) => s.id !== sectionId))
  }

  function addField(sectionId: string, label: string) {
    setDraft((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, fields: [...s.fields, { id: `mezo-${Date.now()}`, label }] } : s))
    )
  }

  function renameField(sectionId: string, fieldId: string, label: string) {
    setDraft((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, fields: s.fields.map((f) => (f.id === fieldId ? { ...f, label } : f)) } : s
      )
    )
  }

  function removeField(sectionId: string, fieldId: string) {
    setDraft((prev) => prev.map((s) => (s.id === sectionId ? { ...s, fields: s.fields.filter((f) => f.id !== fieldId) } : s)))
  }

  function handleAddSection(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newSectionTitle.trim()
    if (!trimmed) return
    setDraft((prev) => [...prev, { id: `szakasz-${Date.now()}`, title: trimmed, fields: [] }])
    setNewSectionTitle('')
  }

  function handleSaveChanges() {
    replaceAssessmentTemplate(draft)
    setMode('saved')
  }

  function handleCancel() {
    setDraft(assessmentTemplate)
    setMode('saved')
  }

  function handleEdit() {
    setDraft(assessmentTemplate)
    setMode('editing')
  }

  const editing = mode === 'editing'

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 900 }}>
        <div className="app-page-header mb-3 mobile-sticky-header">
          <h1 className="app-page-title mb-0">dokumentáció beállításai</h1>
        </div>

        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Itt szerkesztheted az 1. alkalom "állapotfelmérés folytatása" szakaszait és mezőit. A módosítás minden ÚJ, még nem
          rögzített ügyfél-dokumentációnál lesz az alapértelmezett — a már korábban rögzített dokumentációkra nem hat
          visszamenőleg.
        </p>

        {draft.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            editing={editing}
            onRenameSection={(title) => renameSection(section.id, title)}
            onRemoveSection={() => removeSection(section.id)}
            onAddField={(label) => addField(section.id, label)}
            onRenameField={(fieldId, label) => renameField(section.id, fieldId, label)}
            onRemoveField={(fieldId) => removeField(section.id, fieldId)}
          />
        ))}

        {editing && (
          <div className="card-fyb mb-4">
            <h2 className="h6 mb-3">+ új szakasz</h2>
            <form onSubmit={handleAddSection} className="d-flex gap-2 flex-wrap">
              <input
                type="text"
                className="form-control form-control-sm"
                style={{ maxWidth: 260 }}
                placeholder="szakasz neve"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
              />
              <button type="submit" className="btn-fyb btn-fyb-outline btn-fyb-sm" disabled={!newSectionTitle.trim()}>
                + szakasz
              </button>
            </form>
          </div>
        )}

        <div className="d-flex align-items-center gap-3 mb-4">
          {editing ? (
            <>
              <button type="button" className="btn-fyb btn-fyb-primary" onClick={handleSaveChanges}>
                módosítások mentése
              </button>
              <button type="button" className="btn-fyb btn-fyb-outline" onClick={handleCancel}>
                mégse
              </button>
            </>
          ) : (
            <>
              <span className="badge-fyb">✓ mentve</span>
              <button type="button" className="btn-fyb btn-fyb-outline btn-fyb-sm" onClick={handleEdit}>
                szerkesztés
              </button>
            </>
          )}
        </div>

        <TemplatePreview template={draft} />
      </div>
    </section>
  )
}

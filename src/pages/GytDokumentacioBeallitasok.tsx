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

const trashBtnStyle: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }

function SectionCard({ section }: { section: AssessmentSectionDef }) {
  const { renameAssessmentSection, removeAssessmentSection, addAssessmentField, renameAssessmentField, removeAssessmentField } =
    useDokumentacio()
  const [newFieldLabel, setNewFieldLabel] = useState('')

  function handleAddField(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newFieldLabel.trim()
    if (!trimmed) return
    addAssessmentField(section.id, trimmed)
    setNewFieldLabel('')
  }

  return (
    <div className="card-fyb mb-3">
      <div className="d-flex align-items-center gap-2 mb-3">
        <input
          type="text"
          className="form-control fw-bold"
          style={{ maxWidth: 360 }}
          value={section.title}
          onChange={(e) => renameAssessmentSection(section.id, e.target.value)}
          aria-label="szakasz neve"
        />
        <button
          type="button"
          onClick={() => removeAssessmentSection(section.id)}
          aria-label="szakasz törlése"
          style={trashBtnStyle}
        >
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
                onChange={(e) => renameAssessmentField(section.id, field.id, e.target.value)}
                aria-label="mező neve"
              />
              <button
                type="button"
                onClick={() => removeAssessmentField(section.id, field.id)}
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
// átmenetileg kerül, sehova nem mentődik). A sablon módosításakor (mező
// átnevezve/törölve/hozzáadva) a struktúra frissül, de a MÁR MEGLÉVŐ
// mezőkbe beírt kipróbálás-szöveg — id szerint — megmarad.
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
  const { assessmentTemplate, addAssessmentSection } = useDokumentacio()
  const [newSectionTitle, setNewSectionTitle] = useState('')

  function handleAddSection(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newSectionTitle.trim()
    if (!trimmed) return
    addAssessmentSection(trimmed)
    setNewSectionTitle('')
  }

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

        {assessmentTemplate.map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}

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

        <TemplatePreview template={assessmentTemplate} />
      </div>
    </section>
  )
}

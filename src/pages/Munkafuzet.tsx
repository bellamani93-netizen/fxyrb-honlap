import { useState } from 'react'
import { useWorkbook, WORKBOOK_QUESTIONS } from '../context/WorkbookContext'

export default function Munkafuzet() {
  const { answers, savedAt, saveAnswers } = useWorkbook()
  const [draft, setDraft] = useState<Record<string, string>>(() => ({ ...answers }))
  const [justSaved, setJustSaved] = useState(false)

  function handleChange(id: string, value: string) {
    setDraft((d) => ({ ...d, [id]: value }))
    setJustSaved(false)
  }

  function handleSave() {
    saveAnswers(draft)
    setJustSaved(true)
  }

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 780 }}>
        <div className="app-page-header mb-3 mobile-sticky-header">
          <h1 className="app-page-title mb-0">munkafüzet</h1>
        </div>

        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          gondold végig, milyen mozdulatokat fogsz a mindennapokban a hajolás/csavarás helyett használni — a válaszaidat a gyógytornászod is látja.
        </p>

        <div className="card-fyb">
          {WORKBOOK_QUESTIONS.map((q, i) => (
            <div className={i > 0 ? 'mt-4' : ''} key={q.id}>
              <label className="form-label fw-bold">{q.question}</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder={q.placeholder}
                value={draft[q.id] ?? ''}
                onChange={(e) => handleChange(q.id, e.target.value)}
              />
            </div>
          ))}

          <div className="d-flex align-items-center flex-wrap gap-3 mt-4">
            <button type="button" className="btn-fyb btn-fyb-primary" onClick={handleSave}>
              mentés
            </button>
            {justSaved && <span className="badge-fyb">✓ mentve</span>}
            {!justSaved && savedAt && (
              <span className="small" style={{ color: 'var(--color-text-muted)' }}>utoljára mentve: {savedAt}</span>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

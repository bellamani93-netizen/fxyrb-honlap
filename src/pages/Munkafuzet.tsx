import { useState } from 'react'
import { useWorkbook, WORKBOOK_FELADATOK, type WorkbookFeladatId, type WorkbookRow } from '../context/WorkbookContext'

function FeladatTable({
  feladat,
  rows,
  onRowChange,
  onAddRow,
}: {
  feladat: (typeof WORKBOOK_FELADATOK)[number]
  rows: WorkbookRow[]
  onRowChange: (index: number, field: 'left' | 'right', value: string) => void
  onAddRow: () => void
}) {
  return (
    <div className="card-fyb mb-4">
      <h2 className="h6 mb-2">{feladat.cim}</h2>
      <p className="small mb-3" style={{ color: 'var(--color-text-muted)' }}>{feladat.leiras}</p>

      <div style={{ overflowX: 'auto' }}>
        <table className="table workbook-table mb-2">
          <thead>
            <tr>
              <th>{feladat.oszlopBal}</th>
              <th>{feladat.oszlopJobb}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={row.left}
                    onChange={(e) => onRowChange(i, 'left', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={row.right}
                    onChange={(e) => onRowChange(i, 'right', e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" className="btn-fyb btn-fyb-outline btn-fyb-sm" onClick={onAddRow}>
        + új sor
      </button>
    </div>
  )
}

export default function Munkafuzet() {
  const { answers, savedAt, saveAnswers } = useWorkbook()
  const [draft, setDraft] = useState(answers)
  const [justSaved, setJustSaved] = useState(false)

  function handleRowChange(feladatId: WorkbookFeladatId, index: number, field: 'left' | 'right', value: string) {
    setDraft((d) => ({
      ...d,
      [feladatId]: d[feladatId].map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    }))
    setJustSaved(false)
  }

  function handleAddRow(feladatId: WorkbookFeladatId) {
    setDraft((d) => ({ ...d, [feladatId]: [...d[feladatId], { left: '', right: '' }] }))
    setJustSaved(false)
  }

  function handleSave() {
    saveAnswers(draft)
    setJustSaved(true)
  }

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 860 }}>
        <div className="app-page-header mb-3 mobile-sticky-header">
          <h1 className="app-page-title mb-0">munkafüzet</h1>
        </div>

        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          gondold végig, milyen testhelyzeteket/mozdulatokat fogsz a mindennapokban kiváltani — a válaszaidat a gyógytornászod is látja.
        </p>

        {WORKBOOK_FELADATOK.map((feladat) => (
          <FeladatTable
            key={feladat.id}
            feladat={feladat}
            rows={draft[feladat.id]}
            onRowChange={(i, field, value) => handleRowChange(feladat.id, i, field, value)}
            onAddRow={() => handleAddRow(feladat.id)}
          />
        ))}

        <div className="d-flex align-items-center flex-wrap gap-3">
          <button type="button" className="btn-fyb btn-fyb-primary" onClick={handleSave}>
            mentés
          </button>
          {justSaved && <span className="badge-fyb">✓ mentve</span>}
          {!justSaved && savedAt && (
            <span className="small" style={{ color: 'var(--color-text-muted)' }}>utoljára mentve: {savedAt}</span>
          )}
        </div>
      </div>
    </section>
  )
}

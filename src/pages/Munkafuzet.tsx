import { useState } from 'react'
import { useWorkbook, WORKBOOK_FELADATOK, type WorkbookFeladatId, type WorkbookRow } from '../context/WorkbookContext'

// A piros ("eddigi, rossz") / zöld ("helyette, jó") jelzés és a mobil
// pár-kártyás elrendezés Marci kérésére (2026.09.19.): "a gerinchajlítós
// oszlop legyen pirossal, az hajlítás nélküli zölddel... telefonos
// nézetben... a jó-rossz párokat egymás alá lehetne megadni". Asztalon a
// jobb oszlop fejléce a rövid "→ helyette" (a hosszú `oszlopJobb` szöveg
// helyett), mobilon ugyanez a nyíl+felirat a piros és zöld mező KÖZÖTT áll,
// pár-kártyánként. A táblázat ÉS a pár-kártyás nézet is MINDIG renderelődik
// (ld. `.workbook-desktop-only`/`.workbook-mobile-only`, components.css) —
// a láthatóságot kizárólag CSS dönti el, ugyanaz a minta, mint az
// Eredmenyeim.tsx desktop/mobile-only párjánál.
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

      <div className="workbook-desktop-only" style={{ overflowX: 'auto' }}>
        <table className="table workbook-table mb-2">
          <thead>
            <tr>
              <th className="workbook-th-bad">{feladat.oszlopBal}</th>
              <th className="workbook-th-good">→ helyette</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="workbook-td-bad">
                  <input
                    type="text"
                    className="form-control form-control-sm workbook-input-bad"
                    value={row.left}
                    onChange={(e) => onRowChange(i, 'left', e.target.value)}
                  />
                </td>
                <td className="workbook-td-good">
                  <input
                    type="text"
                    className="form-control form-control-sm workbook-input-good"
                    value={row.right}
                    onChange={(e) => onRowChange(i, 'right', e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="workbook-mobile-only">
        {rows.map((row, i) => (
          <div className="workbook-pair-card" key={i}>
            <input
              type="text"
              className="form-control form-control-sm workbook-input-bad"
              placeholder={feladat.oszlopBal}
              value={row.left}
              onChange={(e) => onRowChange(i, 'left', e.target.value)}
            />
            <div className="workbook-pair-arrow">↓ helyette</div>
            <input
              type="text"
              className="form-control form-control-sm workbook-input-good"
              placeholder="új mozdulat"
              value={row.right}
              onChange={(e) => onRowChange(i, 'right', e.target.value)}
            />
          </div>
        ))}
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

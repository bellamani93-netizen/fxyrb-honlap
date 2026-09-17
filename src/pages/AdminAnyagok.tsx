import { useState } from 'react'
import Icon from '../components/Icon'
import { EXERCISES, type ExerciseCode } from '../data/tornaSzintek'
import { useMaterials, isBuiltInCode } from '../context/MaterialsContext'

const BUILT_IN_CODES = Object.keys(EXERCISES) as ExerciseCode[]

// egy fájl-feltöltő gomb — natív <input type="file"> vizuálisan elrejtve,
// egy stílusozott <label> nyitja meg a fájl-választót (ez az egyetlen
// megbízható módja egy natív file-inputnak a projekt saját gomb-stílusával
// való megjelenítésére, ld. pl. MDN "styling a file input" ajánlása).
function UploadButton({ label, onSelect }: { label: string; onSelect: (file: File) => void }) {
  return (
    <label className="btn-fyb btn-fyb-outline mb-0" style={{ padding: '0.35rem 0.9rem', fontSize: '0.85rem', cursor: 'pointer' }}>
      {label}
      <input
        type="file"
        accept="video/*"
        style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onSelect(file)
          e.target.value = '' // ugyanaz a fájl ismételt kiválasztása is mindig `onChange`-et vált ki
        }}
      />
    </label>
  )
}

// a projekt egyetlen helye, ahol egy TÉNYLEGESEN lejátszható videó jelenik
// meg (ld. MaterialsContext.tsx jegyzete) — a feltöltés utáni önellenőrzéshez.
function VideoPreview({ videoUrl, videoName }: { videoUrl: string; videoName: string }) {
  return (
    <div className="mt-2" style={{ maxWidth: 320 }}>
      <video src={videoUrl} controls style={{ width: '100%', borderRadius: 'var(--radius-sm)', display: 'block' }} />
      <p className="small mb-0 mt-1" style={{ color: 'var(--color-text-muted)' }}>{videoName}</p>
    </div>
  )
}

// "anyagok kezelése" (2026.09.17., Marci kérésére) — 2 különálló szekció:
// (1) a MEGLÉVŐ, tornaSzintek.ts-ben már definiált 20 videókiosztás-kód
//     mindegyikéhez itt lehet videót feltölteni/cserélni — a cím és a
//     sorszám ADOTT (nem admin-szerkeszthető), csak a videófájl kerül hozzá;
// (2) egy TELJESEN ÚJ videó felvétele SZABADON választott kóddal+címmel —
//     ez a videó SOSEM kerül be az automata videókiosztás-ajánlásba (ld.
//     MaterialsContext.tsx `isBuiltInCode` jegyzete — a `tornaSzintek.ts`
//     `SEQUENCES`-e kizárólag a zárt `ExerciseCode` uniót fogadja el), csak
//     a GYT "más videó" legördülőjében jelenik meg választható opcióként.
export default function AdminAnyagok() {
  const { materials, upsertMaterial, removeMaterial, getMaterialByCode } = useMaterials()
  const [newCode, setNewCode] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newFile, setNewFile] = useState<File | null>(null)

  const customMaterials = materials.filter((m) => !isBuiltInCode(m.code))

  const trimmedNewCode = newCode.trim()
  // a kódnak EGYEDINEK kell lennie — sem egy meglévő videókiosztás-kóddal
  // (S01 stb.), sem egy már korábban létrehozott egyedi kóddal nem
  // ütközhet, különben a GYT legördülőjében 2 azonos feliratú opció
  // jelenne meg, és a `splitLabel` (GytVideokiosztas.tsx) sem tudná
  // egyértelműen eldönteni, melyik anyaghoz tartozik a kiosztás.
  const codeTaken = trimmedNewCode !== '' && (isBuiltInCode(trimmedNewCode) || materials.some((m) => m.code === trimmedNewCode))
  const newFormValid = Boolean(trimmedNewCode && newTitle.trim() && newFile && !codeTaken)

  function handleCreateNew(e: React.FormEvent) {
    e.preventDefault()
    if (!newFormValid || !newFile) return
    upsertMaterial(trimmedNewCode, newTitle.trim(), newFile)
    setNewCode('')
    setNewTitle('')
    setNewFile(null)
  }

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 900 }}>
        <div className="app-page-header mb-3 mobile-sticky-header">
          <h1 className="app-page-title mb-0">anyagok kezelése</h1>
        </div>

        <p className="mb-3" style={{ color: 'var(--color-text-muted)' }}>
          itt tölthetsz fel videót a videókiosztás meglévő kódjaihoz, illetve hozhatsz létre teljesen új, egyedi videót — a videó a feltöltés után azonnal megjelenik a GYT videókiosztás oldalán és az ÜF "szintjeid" oldalán is.
        </p>

        <div className="card-fyb card-fyb-accent mb-4">
          <h2 className="h5 mb-3">meglévő videókiosztás-kódok</h2>
          <div className="d-flex flex-column">
            {BUILT_IN_CODES.map((code) => {
              const material = getMaterialByCode(code)
              return (
                <div key={code} className="py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <span>
                      <span className="fw-bold">{code}</span>{' '}
                      <span style={{ color: 'var(--color-text-muted)' }}>{EXERCISES[code].name}</span>
                    </span>
                    <div className="d-flex align-items-center gap-2">
                      <span className="small" style={{ color: material ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                        {material ? 'feltöltve' : 'nincs feltöltve'}
                      </span>
                      <UploadButton
                        label={material ? 'csere' : 'feltöltés'}
                        onSelect={(file) => upsertMaterial(code, EXERCISES[code].name, file)}
                      />
                      {material && (
                        <button
                          type="button"
                          onClick={() => removeMaterial(material.id)}
                          aria-label="feltöltött videó törlése"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                        >
                          <Icon src="/icons/ikon_kuka.svg" style={{ width: '1.3rem', height: '1.3rem' }} />
                        </button>
                      )}
                    </div>
                  </div>
                  {material && <VideoPreview videoUrl={material.videoUrl} videoName={material.videoName} />}
                </div>
              )
            })}
          </div>
        </div>

        <div className="card-fyb mb-4">
          <h2 className="h5 mb-3">új videó létrehozása</h2>
          <p className="small mb-3" style={{ color: 'var(--color-text-muted)' }}>
            ez a videó SEM a videókiosztás automata ajánlásába nem kerül be, kizárólag a GYT "más videó" legördülőjében jelenik meg választható opcióként.
          </p>
          <form onSubmit={handleCreateNew}>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold" htmlFor="material-code">kód</label>
                <input
                  id="material-code"
                  type="text"
                  className="form-control"
                  placeholder="pl. X01"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                />
                {codeTaken && (
                  <p className="small mb-0 mt-1" style={{ color: 'var(--color-danger)' }}>ez a kód már foglalt.</p>
                )}
              </div>
              <div className="col-12 col-md-8">
                <label className="form-label small fw-bold" htmlFor="material-title">cím</label>
                <input
                  id="material-title"
                  type="text"
                  className="form-control"
                  placeholder="pl. Oldalfekvés, nyújtás"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div className="col-12">
                <span className="form-label small fw-bold d-block">videó</span>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <UploadButton label={newFile ? 'másik fájl választása' : 'fájl kiválasztása'} onSelect={setNewFile} />
                  {newFile && <span className="small" style={{ color: 'var(--color-text-muted)' }}>{newFile.name}</span>}
                </div>
              </div>
            </div>

            <button type="submit" className="btn-fyb btn-fyb-primary mt-3" disabled={!newFormValid}>létrehozás</button>
          </form>
        </div>

        {customMaterials.length > 0 && (
          <div className="card-fyb">
            <h2 className="h6 mb-3">eddig létrehozott egyedi videók ({customMaterials.length})</h2>
            <div className="d-flex flex-column">
              {customMaterials.map((m) => (
                <div key={m.id} className="py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <span>
                      <span className="fw-bold">{m.code}</span>{' '}
                      <span style={{ color: 'var(--color-text-muted)' }}>{m.title}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeMaterial(m.id)}
                      aria-label="egyedi videó törlése"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                    >
                      <Icon src="/icons/ikon_kuka.svg" style={{ width: '1.3rem', height: '1.3rem' }} />
                    </button>
                  </div>
                  <VideoPreview videoUrl={m.videoUrl} videoName={m.videoName} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

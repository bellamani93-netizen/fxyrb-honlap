import { useEffect, useState } from 'react'
import { deleteVideo, getVideoUrl, saveVideo } from '../lib/videoStore'
import { withBase } from '../lib/assetUrl'
import {
  formatDeadline,
  useGyorsitosav,
  type GyConfig,
  type GyQuestion,
  type GyVideo,
} from '../context/GyorsitosavContext'

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

function formatSize(bytes: number): string {
  return bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/** fájl-feltöltő gomb: natív <input type="file"> vizuálisan elrejtve, egy
 * stílusozott <label> nyitja meg (ugyanaz a minta, mint az AdminAnyagok.tsx-ben) */
function UploadButton({ label, onSelect, disabled }: { label: string; onSelect: (file: File) => void; disabled?: boolean }) {
  return (
    <label className="btn-fyb btn-fyb-outline mb-0" style={{ padding: '0.35rem 0.9rem', fontSize: '0.85rem', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.6 : 1 }}>
      {label}
      <input
        type="file"
        accept="video/*"
        disabled={disabled}
        style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onSelect(file)
          e.target.value = ''
        }}
      />
    </label>
  )
}

/** a feltöltött videó lejátszható előnézete az admin kártyán */
function AdminVideoPreview({ videoId, version }: { videoId: string; version: string }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let u: string | null = null
    let cancelled = false
    getVideoUrl(videoId).then((x) => {
      if (cancelled) {
        if (x) URL.revokeObjectURL(x)
        return
      }
      u = x
      setUrl(x)
    })
    return () => {
      cancelled = true
      if (u) URL.revokeObjectURL(u)
    }
  }, [videoId, version])
  if (!url) return <div className="small mt-2" style={{ color: 'var(--color-text-muted)' }}>az előnézet nem érhető el ezen a böngészőn.</div>
  return (
    <div className="mt-2" style={{ maxWidth: 360 }}>
      <video src={url} controls style={{ width: '100%', borderRadius: 'var(--radius-sm)', display: 'block' }} />
    </div>
  )
}

// admin "gyorsítósáv" szerkesztő: a videók (cím, feltöltött videófájl, tudáscheck-
// kérdések), a visszaszámláló határideje és az ajándék. A módosítások azonnal
// érvényesülnek és mentődnek (nincs külön "mentés" gomb), a nyilvános
// /gyorsitosav oldal ugyanezt a Context-et olvassa.
export default function AdminGyorsitosav() {
  const { config, updateConfig, resetConfig, progress, resetProgress, comments, removeComment, clearComments } = useGyorsitosav()
  const [uploading, setUploading] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [unit, setUnit] = useState<'ora' | 'nap'>(config.deadlineHours % 24 === 0 ? 'nap' : 'ora')
  const deadlineValue = unit === 'nap' ? config.deadlineHours / 24 : config.deadlineHours

  function setDeadline(value: number, u: 'ora' | 'nap') {
    const hours = Math.max(1, Math.round(u === 'nap' ? value * 24 : value))
    updateConfig((c) => ({ ...c, deadlineHours: hours }))
  }

  function patchVideo(id: string, patch: Partial<GyVideo>) {
    updateConfig((c) => ({ ...c, videos: c.videos.map((v) => (v.id === id ? { ...v, ...patch } : v)) }))
  }

  function patchQuestion(videoId: string, qid: string, text: string) {
    updateConfig((c) => ({
      ...c,
      videos: c.videos.map((v) =>
        v.id === videoId ? { ...v, questions: v.questions.map((q) => (q.id === qid ? { ...q, text } : q)) } : v,
      ),
    }))
  }

  function addQuestion(videoId: string) {
    const q: GyQuestion = { id: newId('q'), text: '' }
    updateConfig((c) => ({ ...c, videos: c.videos.map((v) => (v.id === videoId ? { ...v, questions: [...v.questions, q] } : v)) }))
  }

  function removeQuestion(videoId: string, qid: string) {
    updateConfig((c) => ({
      ...c,
      videos: c.videos.map((v) => (v.id === videoId ? { ...v, questions: v.questions.filter((q) => q.id !== qid) } : v)),
    }))
  }

  function addVideo() {
    const v: GyVideo = {
      id: newId('v'),
      title: `${config.videos.length + 1}. új videó`,
      videoName: null,
      videoSize: null,
      questions: [{ id: newId('q'), text: '' }],
    }
    updateConfig((c) => ({ ...c, videos: [...c.videos, v] }))
  }

  async function handleUpload(videoId: string, file: File) {
    setUploading(videoId)
    setUploadError(null)
    try {
      await saveVideo(videoId, file)
      patchVideo(videoId, { videoName: file.name, videoSize: file.size })
    } catch {
      setUploadError('A videó mentése nem sikerült (a böngésző tárhelye megtelt, vagy nem engedélyezett).')
    } finally {
      setUploading(null)
    }
  }

  async function handleRemoveFile(videoId: string) {
    await deleteVideo(videoId).catch(() => undefined)
    patchVideo(videoId, { videoName: null, videoSize: null })
  }

  function removeVideo(id: string) {
    if (!window.confirm('Biztosan törlöd ezt a videót a gyorsítósávból?')) return
    deleteVideo(id).catch(() => undefined)
    clearComments(id)
    updateConfig((c) => ({ ...c, videos: c.videos.filter((v) => v.id !== id) }))
  }

  function moveVideo(id: string, dir: -1 | 1) {
    updateConfig((c) => {
      const i = c.videos.findIndex((v) => v.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= c.videos.length) return c
      const videos = c.videos.slice()
      ;[videos[i], videos[j]] = [videos[j], videos[i]]
      return { ...c, videos } as GyConfig
    })
  }

  function patchGift(patch: Partial<GyConfig['gift']>) {
    updateConfig((c) => ({ ...c, gift: { ...c.gift, ...patch } }))
  }

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 900 }}>
        <div className="app-page-header mb-3 mobile-sticky-header">
          <h1 className="app-page-title mb-0">gyorsítósáv</h1>
        </div>
        <p className="small mb-4" style={{ color: 'var(--color-text-muted)' }}>
          A módosítások azonnal érvényesek és automatikusan mentődnek. A nyilvános oldal: <a href={withBase('/gyorsitosav')} target="_blank" rel="noreferrer">/gyorsitosav</a>.
        </p>

        <div className="card-fyb card-fyb-accent mb-4">
          <h2 className="h5 mb-3">visszaszámláló és ajándék</h2>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold" htmlFor="gy-deadline">határidő a regisztrációtól számítva</label>
              <div className="d-flex gap-2">
                <input
                  id="gy-deadline"
                  type="number"
                  min={1}
                  className="form-control"
                  value={deadlineValue}
                  onChange={(e) => setDeadline(Number(e.target.value) || 1, unit)}
                />
                <select
                  className="form-select"
                  style={{ maxWidth: 110 }}
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as 'ora' | 'nap')}
                  aria-label="időegység"
                >
                  <option value="ora">óra</option>
                  <option value="nap">nap</option>
                </select>
              </div>
              <div className="small mt-1" style={{ color: 'var(--color-text-muted)' }}>
                jelenleg: {formatDeadline(config.deadlineHours)} — ennyi idő alatt kell végigérni az összes videón.
              </div>
            </div>

            <div className="col-12 col-md-6 d-flex align-items-end">
              <div className="form-check">
                <input
                  id="gy-gift-enabled"
                  type="checkbox"
                  className="form-check-input"
                  checked={config.gift.enabled}
                  onChange={(e) => patchGift({ enabled: e.target.checked })}
                />
                <label className="form-check-label" htmlFor="gy-gift-enabled">ajándék a határidőn belül végzőknek</label>
              </div>
            </div>

            {config.gift.enabled && (
              <>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold" htmlFor="gy-gift-title">az ajándék neve</label>
                  <input id="gy-gift-title" type="text" className="form-control" value={config.gift.title} onChange={(e) => patchGift({ title: e.target.value })} />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold" htmlFor="gy-gift-url">letöltési link</label>
                  <input
                    id="gy-gift-url"
                    type="url"
                    className="form-control"
                    placeholder="https://… (pl. PDF, Drive-link)"
                    value={config.gift.downloadUrl}
                    onChange={(e) => patchGift({ downloadUrl: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold" htmlFor="gy-gift-desc">rövid leírás (opcionális)</label>
                  <textarea id="gy-gift-desc" className="form-control" rows={2} value={config.gift.description} onChange={(e) => patchGift({ description: e.target.value })} />
                </div>
              </>
            )}
          </div>
        </div>

        <h2 className="h5 mb-2">videók ({config.videos.length})</h2>
        <p className="small mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Prototípus: a feltöltött videó ezen a böngészőn tárolódik. Élesben külső videószolgáltatóba (pl. Mux) kerül — a tárolás a <code>src/lib/videoStore.ts</code>-ben cserélhető.
        </p>
        {uploadError && <div className="small mb-3" style={{ color: 'var(--bs-danger, #c0392b)' }}>{uploadError}</div>}
        <div className="d-flex flex-column gap-4 mb-4">
          {config.videos.map((v, i) => {
            const videoComments = comments.filter((c) => c.videoId === v.id)
            return (
              <div className="card-fyb" key={v.id}>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span className="gy-step-badge">{i + 1}</span>
                  <span className="fw-bold">videó</span>
                  <div className="ms-auto d-flex gap-1">
                    <button type="button" className="btn-fyb btn-fyb-ghost" style={{ padding: '0.2rem 0.7rem' }} disabled={i === 0} onClick={() => moveVideo(v.id, -1)} aria-label="feljebb">↑</button>
                    <button type="button" className="btn-fyb btn-fyb-ghost" style={{ padding: '0.2rem 0.7rem' }} disabled={i === config.videos.length - 1} onClick={() => moveVideo(v.id, 1)} aria-label="lejjebb">↓</button>
                    <button type="button" className="btn-fyb btn-fyb-ghost" style={{ padding: '0.2rem 0.7rem' }} onClick={() => removeVideo(v.id)} aria-label="videó törlése">törlés</button>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small fw-bold" htmlFor={`gy-title-${v.id}`}>cím</label>
                    <input id={`gy-title-${v.id}`} type="text" className="form-control" value={v.title} onChange={(e) => patchVideo(v.id, { title: e.target.value })} />
                  </div>
                  <div className="col-12">
                    <div className="form-label small fw-bold">videófájl</div>
                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <UploadButton
                        label={v.videoName ? 'videó cseréje' : 'videó feltöltése'}
                        disabled={uploading === v.id}
                        onSelect={(f) => handleUpload(v.id, f)}
                      />
                      {v.videoName && (
                        <button type="button" className="btn-fyb btn-fyb-ghost" style={{ padding: '0.3rem 0.9rem', fontSize: '0.85rem' }} onClick={() => handleRemoveFile(v.id)}>videó törlése</button>
                      )}
                      <span className="small" style={{ color: 'var(--color-text-muted)' }}>
                        {uploading === v.id
                          ? 'feltöltés…'
                          : v.videoName
                            ? `${v.videoName}${v.videoSize ? ` · ${formatSize(v.videoSize)}` : ''}`
                            : 'még nincs videó: a látogató helyőrzőt lát, és kézzel jelölheti megnézettnek.'}
                      </span>
                    </div>
                    {v.videoName && <AdminVideoPreview videoId={v.id} version={`${v.videoName}-${v.videoSize}`} />}
                  </div>

                  <div className="col-12">
                    <div className="form-label small fw-bold">tudáscheck-kérdések ({v.questions.length})</div>
                    <div className="d-flex flex-column gap-2">
                      {v.questions.map((q, qi) => (
                        <div className="d-flex gap-2" key={q.id}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder={`${qi + 1}. kérdés`}
                            aria-label={`${qi + 1}. kérdés`}
                            value={q.text}
                            onChange={(e) => patchQuestion(v.id, q.id, e.target.value)}
                          />
                          <button type="button" className="btn-fyb btn-fyb-ghost text-nowrap" onClick={() => removeQuestion(v.id, q.id)} aria-label="kérdés törlése">törlés</button>
                        </div>
                      ))}
                    </div>
                    <button type="button" className="btn-fyb btn-fyb-outline mt-2" style={{ padding: '0.3rem 0.9rem', fontSize: '0.85rem' }} onClick={() => addQuestion(v.id)}>+ kérdés hozzáadása</button>
                    {v.questions.length === 0 && (
                      <div className="small mt-1" style={{ color: 'var(--color-text-muted)' }}>kérdés nélkül a videó megnézése után azonnal a következő videó nyílik.</div>
                    )}
                  </div>

                  <div className="col-12">
                    <details>
                      <summary className="small fw-bold" style={{ cursor: 'pointer' }}>kommentek ({videoComments.length})</summary>
                      <div className="d-flex flex-column gap-2 mt-2">
                        {videoComments.length === 0 && <span className="small" style={{ color: 'var(--color-text-muted)' }}>még nincs komment.</span>}
                        {videoComments.map((c) => (
                          <div key={c.id} className="d-flex gap-2 align-items-start small">
                            <div className="flex-grow-1">
                              <span className="fw-bold">{c.email}</span> · {c.question}
                              <div>{c.text}</div>
                            </div>
                            <button type="button" className="btn-fyb btn-fyb-ghost text-nowrap" style={{ padding: '0.15rem 0.6rem', fontSize: '0.8rem' }} onClick={() => removeComment(c.id)} aria-label="komment törlése">törlés</button>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <button type="button" className="btn-fyb btn-fyb-primary mb-5" onClick={addVideo}>+ új videó</button>

        <div className="card-fyb">
          <h2 className="h6 mb-3">tesztelés és visszaállítás</h2>
          <p className="small mb-2" style={{ color: 'var(--color-text-muted)' }}>
            {progress
              ? `Ezen a böngészőn regisztrált résztvevő: ${progress.email} — ${Object.keys(progress.completed).length} / ${config.videos.length} videó kész.`
              : 'Ezen a böngészőn nincs regisztrált résztvevő.'}
          </p>
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="btn-fyb btn-fyb-outline" disabled={!progress} onClick={resetProgress}>résztvevő állapotának törlése</button>
            <button
              type="button"
              className="btn-fyb btn-fyb-ghost"
              onClick={() => {
                if (window.confirm('Visszaállítod az alapértelmezett beállításokat? A saját szerkesztéseid elvesznek.')) resetConfig()
              }}
            >
              alapbeállítások visszaállítása
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

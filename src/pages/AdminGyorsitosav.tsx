import { useState } from 'react'
import { youtubeId } from '../data/reviews'
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

// admin "gyorsítósáv" szerkesztő: a videók (cím, YouTube-link, tudáscheck-
// kérdések), a visszaszámláló határideje és az ajándék. A módosítások azonnal
// érvényesülnek és mentődnek (nincs külön "mentés" gomb), a nyilvános
// /gyorsitosav oldal ugyanezt a Context-et olvassa.
export default function AdminGyorsitosav() {
  const { config, updateConfig, resetConfig, progress, resetProgress } = useGyorsitosav()
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
      url: '',
      questions: [{ id: newId('q'), text: '' }],
    }
    updateConfig((c) => ({ ...c, videos: [...c.videos, v] }))
  }

  function removeVideo(id: string) {
    if (!window.confirm('Biztosan törlöd ezt a videót a gyorsítósávból?')) return
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

        <h2 className="h5 mb-3">videók ({config.videos.length})</h2>
        <div className="d-flex flex-column gap-4 mb-4">
          {config.videos.map((v, i) => {
            const id = youtubeId(v.url)
            return (
              <div className="card-fyb" key={v.id}>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span className="gy-step-badge">{i + 1}</span>
                  <span className="fw-bold">videó</span>
                  <div className="ms-auto d-flex gap-1">
                    <button type="button" className="btn-fyb btn-fyb-ghost" style={{ padding: '0.2rem 0.7rem' }} disabled={i === 0} onClick={() => moveVideo(v.id, -1)} aria-label="feljebb">↑</button>
                    <button type="button" className="btn-fyb btn-fyb-ghost" style={{ padding: '0.2rem 0.7rem' }} disabled={i === config.videos.length - 1} onClick={() => moveVideo(v.id, 1)} aria-label="lejjebb">↓</button>
                    <button type="button" className="btn-fyb btn-fyb-ghost" style={{ padding: '0.2rem 0.7rem' }} onClick={() => removeVideo(v.id)}>törlés</button>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small fw-bold" htmlFor={`gy-title-${v.id}`}>cím</label>
                    <input id={`gy-title-${v.id}`} type="text" className="form-control" value={v.title} onChange={(e) => patchVideo(v.id, { title: e.target.value })} />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold" htmlFor={`gy-url-${v.id}`}>YouTube-link</label>
                    <input
                      id={`gy-url-${v.id}`}
                      type="url"
                      className="form-control"
                      placeholder="https://youtu.be/…"
                      value={v.url}
                      onChange={(e) => patchVideo(v.id, { url: e.target.value })}
                    />
                    <div className="small mt-1" style={{ color: v.url && !id ? 'var(--bs-danger, #c0392b)' : 'var(--color-text-muted)' }}>
                      {!v.url && 'amíg nincs link, a látogató helyőrzőt lát és kézzel jelölheti megnézettnek.'}
                      {v.url && !id && 'ez a link nem ismerhető fel YouTube-linkként.'}
                      {id && 'érvényes link.'}
                    </div>
                    {id && (
                      <div className="video-embed-fyb mt-2" style={{ maxWidth: 360 }}>
                        <iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title={`${v.title} — előnézet`} loading="lazy" allowFullScreen />
                      </div>
                    )}
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
                          <button type="button" className="btn-fyb btn-fyb-ghost text-nowrap" onClick={() => removeQuestion(v.id, q.id)}>törlés</button>
                        </div>
                      ))}
                    </div>
                    <button type="button" className="btn-fyb btn-fyb-outline mt-2" style={{ padding: '0.3rem 0.9rem', fontSize: '0.85rem' }} onClick={() => addQuestion(v.id)}>+ kérdés hozzáadása</button>
                    {v.questions.length === 0 && (
                      <div className="small mt-1" style={{ color: 'var(--color-text-muted)' }}>kérdés nélkül a videó megnézése után azonnal a következő videó nyílik.</div>
                    )}
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

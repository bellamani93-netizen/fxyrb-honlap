import { useEffect, useRef, useState } from 'react'
import { useClients } from '../context/ClientsContext'
import { MAX_PENDING_QUESTIONS, countPendingQuestions, formatQuestionTime, useKerdesek } from '../context/KerdesekContext'
import { LOGGED_IN_UF_ID } from '../data/initialClients'

// ÜF "kérdéseim": szabad szöveges kérdés a saját gyógytornásznak, alatta a
// korábbi kérdések és a GYT hozzászólás-válaszai. A még nem látott válaszok
// "új" jelzést kapnak, és az oldal megnyitásakor olvasottnak számítanak (a
// menüpötty ekkor tűnik el).
export default function Kerdeseim() {
  const { kerdesek, askQuestion, markRepliesSeenByUf } = useKerdesek()
  const { clients } = useClients()
  const [text, setText] = useState('')
  const mine = kerdesek.filter((k) => k.clientId === LOGGED_IN_UF_ID)
  const pending = countPendingQuestions(kerdesek, LOGGED_IN_UF_ID)
  const limitReached = pending >= MAX_PENDING_QUESTIONS
  // az utánkövetés megnyílásával (10 hét lezárva) új kérdés már nem tehető fel
  const followUp = clients.find((c) => c.id === LOGGED_IN_UF_ID)?.programPhase === 'utankovetes'
  const hasGyt = !!clients.find((c) => c.id === LOGGED_IN_UF_ID)?.assignedGytId

  // az oldal megnyitásakor még olvasatlan válaszok azonosítói — ezek kapnak
  // "új" jelzést ebben a látogatásban, miközben a pötty már eltűnik
  const freshIds = useRef<Set<string> | null>(null)
  if (freshIds.current === null) {
    freshIds.current = new Set(mine.flatMap((k) => k.replies.filter((r) => !r.seenByUf).map((r) => r.id)))
  }
  const unseenCount = mine.reduce((n, k) => n + k.replies.filter((r) => !r.seenByUf).length, 0)
  useEffect(() => {
    // az oldalon töltött idő alatt érkező válaszok is jelzést kapnak
    mine.forEach((k) => k.replies.forEach((r) => !r.seenByUf && freshIds.current!.add(r.id)))
    if (unseenCount > 0) markRepliesSeenByUf(LOGGED_IN_UF_ID)
  }, [unseenCount, mine, markRepliesSeenByUf])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || limitReached) return
    if (askQuestion(LOGGED_IN_UF_ID, trimmed)) setText('')
  }

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 820 }}>
        <div className="app-page-header mb-3 mobile-sticky-header">
          <h1 className="app-page-title mb-0">kérdéseim</h1>
        </div>

        {followUp ? (
          <div className="card-fyb mb-4">
            <h2 className="h5 mb-2">az együttműködés lezárult</h2>
            <p className="mb-0" style={{ color: 'var(--color-text-muted)' }}>
              Az utánkövetési időszakban új kérdést már nem tehetsz fel itt. A kérdéseidet a heti csoportos mítingen
              (utánkövetés menü) beszélheted meg. A korábbi kérdéseid és a válaszok lent olvashatók maradnak.
            </p>
          </div>
        ) : (
        <div className="card-fyb card-fyb-accent mb-4">
          <h2 className="h5 mb-1">kérdezz a gyógytornászodtól</h2>
          <p className="small mb-3" style={{ color: 'var(--color-text-muted)' }}>
            Írd le szabadon a kérdésedet — a gyógytornászod látja, és hozzászólásban válaszol rá. Egyszerre legfeljebb {MAX_PENDING_QUESTIONS} kérdésed várhat válaszra.
            {!hasGyt && ' (A kérdésed akkor jut el hozzá, amint hozzád rendeltünk egy gyógytornászt.)'}
          </p>
          <form onSubmit={handleSubmit}>
            <label className="visually-hidden" htmlFor="uj-kerdes">kérdésed</label>
            <textarea
              id="uj-kerdes"
              className="form-control"
              rows={4}
              placeholder={limitReached ? 'a gyógytornászod még nem válaszolt az előző kérdéseidre' : 'pl. fájhat a gyakorlat közben a hátam, ha kicsit húz?'}
              value={text}
              disabled={limitReached}
              onChange={(e) => setText(e.target.value)}
            />
            {limitReached && (
              <p className="small mt-2 mb-0" style={{ color: 'var(--color-text-muted)' }}>
                Egyszerre legfeljebb {MAX_PENDING_QUESTIONS} megválaszolatlan kérdésed lehet. Új kérdést akkor tehetsz fel,
                ha a gyógytornászod már válaszolt az addigiakra.
              </p>
            )}
            <button type="submit" className="btn-fyb btn-fyb-highlight mt-3" disabled={!text.trim() || limitReached}>kérdés küldése</button>
          </form>
        </div>
        )}

        <h2 className="h6 mb-3">eddigi kérdéseid ({mine.length})</h2>
        {mine.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)' }}>Még nem tettél fel kérdést.</p>
        )}
        <div className="d-flex flex-column gap-3">
          {mine.map((k) => (
            <div key={k.id} className="card-fyb">
              <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap mb-2">
                <span className="small" style={{ color: 'var(--color-text-muted)' }}>{formatQuestionTime(k.at)}</span>
                <span className={`badge-fyb ${k.replies.length ? '' : 'kerdes-pending'}`}>
                  {k.replies.length ? 'megválaszolva' : 'válaszra vár'}
                </span>
              </div>
              <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{k.text}</p>

              {k.replies.length > 0 && (
                <div className="kerdes-replies">
                  {k.replies.map((r) => (
                    <div key={r.id} className="kerdes-reply">
                      <div className="small d-flex align-items-center gap-2 mb-1">
                        <span className="fw-bold">{r.authorName}</span>
                        <span style={{ color: 'var(--color-text-muted)' }}>{formatQuestionTime(r.at)}</span>
                        {freshIds.current!.has(r.id) && <span className="kerdes-new">új</span>}
                      </div>
                      <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{r.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

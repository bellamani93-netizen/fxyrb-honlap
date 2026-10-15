import { useState } from 'react'
import { sessionName } from '../components/AppLayout'
import { useClients } from '../context/ClientsContext'
import { formatQuestionTime, useKerdesek, type Kerdes } from '../context/KerdesekContext'
import { LOGGED_IN_GYT_ID } from '../data/colleagues'

function QuestionCard({ kerdes, clientName }: { kerdes: Kerdes; clientName: string }) {
  const { replyToQuestion, markSeenByGyt } = useKerdesek()
  const [open, setOpen] = useState(false)
  const [reply, setReply] = useState('')
  const isNew = !kerdes.seenByGyt
  const answered = kerdes.replies.length > 0

  function toggle() {
    setOpen((o) => !o)
    if (!open) markSeenByGyt(kerdes.id)
  }

  function handleReply(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = reply.trim()
    if (!trimmed) return
    replyToQuestion(kerdes.id, trimmed, sessionName('gyt', 'Judit'))
    setReply('')
  }

  return (
    <div className={`card-fyb ${isNew ? 'kerdes-card-new' : ''}`}>
      <button type="button" className="kerdes-head" onClick={toggle} aria-expanded={open}>
        <span className="fw-bold">{clientName}</span>
        <span className="small" style={{ color: 'var(--color-text-muted)' }}>{formatQuestionTime(kerdes.at)}</span>
        {isNew && <span className="kerdes-new">új</span>}
        <span className={`badge-fyb ms-auto ${answered ? '' : 'kerdes-pending'}`}>{answered ? 'megválaszolva' : 'válaszra vár'}</span>
      </button>
      <p className={`mb-0 mt-2 ${open ? '' : 'kerdes-clamp'}`} style={{ whiteSpace: 'pre-wrap' }}>{kerdes.text}</p>

      {open && (
        <>
          {answered && (
            <div className="kerdes-replies">
              {kerdes.replies.map((r) => (
                <div key={r.id} className="kerdes-reply">
                  <div className="small d-flex align-items-center gap-2 mb-1">
                    <span className="fw-bold">{r.authorName}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{formatQuestionTime(r.at)}</span>
                  </div>
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{r.text}</p>
                </div>
              ))}
            </div>
          )}
          <form className="mt-3" onSubmit={handleReply}>
            <label className="visually-hidden" htmlFor={`valasz-${kerdes.id}`}>hozzászólás</label>
            <textarea
              id={`valasz-${kerdes.id}`}
              className="form-control"
              rows={3}
              placeholder="írj hozzászólást a kérdés alá…"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
            />
            <button type="submit" className="btn-fyb btn-fyb-highlight mt-2" disabled={!reply.trim()}>válasz küldése</button>
          </form>
        </>
      )}
    </div>
  )
}

// GYT "kérdések": a saját (hozzá rendelt) ügyfelek kérdései egy közös
// beérkezőben; a még meg nem nyitott kérdés "új" jelzést kap (és a menüpötty
// is ezt számolja), a kérdés alá hozzászólásban lehet válaszolni.
export default function GytKerdesek() {
  const { kerdesek } = useKerdesek()
  const { clients } = useClients()
  const own = new Map(clients.filter((c) => c.assignedGytId === LOGGED_IN_GYT_ID).map((c) => [c.id, c.name]))
  const list = kerdesek
    .filter((k) => own.has(k.clientId))
    .sort((a, b) => Number(a.replies.length > 0) - Number(b.replies.length > 0) || b.at - a.at)

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 820 }}>
        <div className="app-page-header mb-3 mobile-sticky-header">
          <h1 className="app-page-title mb-0">kérdések</h1>
        </div>
        <p className="small mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Az ügyfeleid kérdései — a megválaszolatlanok elöl. Nyisd meg a kérdést, és írj alá hozzászólást.
        </p>
        {list.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>Még nem érkezett kérdés.</p>}
        <div className="d-flex flex-column gap-3">
          {list.map((k) => (
            <QuestionCard key={k.id} kerdes={k} clientName={own.get(k.clientId) ?? ''} />
          ))}
        </div>
      </div>
    </section>
  )
}

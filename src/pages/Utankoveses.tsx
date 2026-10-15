import { useState } from 'react'
import { useClients } from '../context/ClientsContext'
import {
  MAX_SENTENCES,
  MAX_SIGNUP_CHARS,
  countSentences,
  formatMeetingTime,
  isMeetingPast,
  useUtankovetes,
} from '../context/UtankovetesContext'
import { LOGGED_IN_UF_ID } from '../data/initialClients'

// ÜF "utánkövetés": a saját GYT heti csoportos mítingjére jelentkezés. Az
// időpont és a Google Meet link minden utánkövetett ügyfélnek látszik; a
// férőhelyek (alapból 6) jelentkezési sorrendben telnek be, a jelentkezéshez
// legfeljebb 2 mondatban kell leírni a problémát/kérdést, amit mindenki lát.
export default function Utankoveses() {
  const { clients } = useClients()
  const { currentMeeting, signups, signUp, removeSignup } = useUtankovetes()
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const me = clients.find((c) => c.id === LOGGED_IN_UF_ID)
  const meeting = me?.assignedGytId ? currentMeeting(me.assignedGytId) : undefined
  const nameOf = new Map(clients.map((c) => [c.id, c.name]))
  const list = meeting ? signups.filter((s) => s.meetingId === meeting.id) : []
  const mine = list.find((s) => s.clientId === LOGGED_IN_UF_ID)
  const full = !!meeting && list.length >= meeting.capacity
  const past = !!meeting && isMeetingPast(meeting.startsAt)
  const sentences = countSentences(text)
  const textOk = text.trim().length > 0 && sentences <= MAX_SENTENCES && text.trim().length <= MAX_SIGNUP_CHARS

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!meeting || !textOk) return
    const r = signUp(meeting.id, LOGGED_IN_UF_ID, text)
    if (r === 'ok') {
      setText('')
      setError(null)
    } else if (r === 'full') setError('Sajnos időközben betelt a míting, több jelentkezőt nem tudunk fogadni.')
    else if (r === 'duplicate') setError('Már jelentkeztél erre a mítingre.')
    else setError('A leírás legfeljebb 2 mondat lehet.')
  }

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 820 }}>
        <div className="app-page-header mb-3 mobile-sticky-header">
          <h1 className="app-page-title mb-0">utánkövetés</h1>
        </div>

        {!meeting ? (
          <div className="card-fyb">
            <p className="mb-0" style={{ color: 'var(--color-text-muted)' }}>
              A gyógytornászod még nem írta ki a következő heti csoportos mítinget. Amint kiírja, itt látod az időpontot és a linket.
            </p>
          </div>
        ) : (
          <>
            <div className="card-fyb card-fyb-accent mb-4">
              <span className="eyebrow-fyb">heti csoportos míting</span>
              <h2 className="h4 mt-2 mb-3">{formatMeetingTime(meeting.startsAt)}</h2>
              <a className="btn-fyb btn-fyb-highlight" href={meeting.meetLink} target="_blank" rel="noreferrer">csatlakozás a Google Meeten</a>
              <p className="small mt-3 mb-0 text-break" style={{ color: 'var(--color-text-muted)' }}>
                link: <a href={meeting.meetLink} target="_blank" rel="noreferrer">{meeting.meetLink}</a>
              </p>
              <hr />
              <p className="mb-2">
                A csoportos konzultáción <strong>{meeting.capacity} emberrel</strong> tudunk foglalkozni, a helyek
                jelentkezési sorrendben telnek be.
              </p>
              <div className="utk-capacity" aria-label={`${list.length} / ${meeting.capacity} hely betelt`}>
                {Array.from({ length: meeting.capacity }, (_, i) => (
                  <span key={i} className={i < list.length ? 'is-taken' : ''} />
                ))}
              </div>
              <p className="small mt-2 mb-0" style={{ color: 'var(--color-text-muted)' }}>
                {full ? 'betelt — több jelentkező nem tud jönni' : `${list.length}/${meeting.capacity} hely betelt, ${meeting.capacity - list.length} szabad`}
              </p>
            </div>

            <div className="card-fyb mb-4">
              <h2 className="h5 mb-3">jelentkezés</h2>
              {past ? (
                <p className="mb-0" style={{ color: 'var(--color-text-muted)' }}>
                  Ez a míting már lezajlott. A következő heti időpontot a gyógytornászod hamarosan kiírja.
                </p>
              ) : mine ? (
                <>
                  <p className="fw-bold mb-1" style={{ color: 'var(--color-primary)' }}>Jelentkeztél erre a mítingre.</p>
                  <p className="mb-3">„{mine.text}”</p>
                  <button type="button" className="btn-fyb btn-fyb-ghost" onClick={() => removeSignup(mine.id)}>lemondom a jelentkezésem</button>
                </>
              ) : full ? (
                <p className="mb-0" style={{ color: 'var(--color-text-muted)' }}>
                  Erre a mítingre már betelt a létszám, több jelentkező nem tud jönni.
                </p>
              ) : (
                <form onSubmit={handleSubmit}>
                  <label className="form-label small fw-bold" htmlFor="utk-szoveg">
                    mi az, amiről beszélnél? (max. {MAX_SENTENCES} mondat)
                  </label>
                  <textarea
                    id="utk-szoveg"
                    className="form-control"
                    rows={3}
                    maxLength={MAX_SIGNUP_CHARS}
                    placeholder="Írd le röviden a problémádat vagy a kérdésedet."
                    value={text}
                    onChange={(e) => { setText(e.target.value); setError(null) }}
                  />
                  <div className="d-flex justify-content-between small mt-1" style={{ color: sentences > MAX_SENTENCES ? 'var(--bs-danger, #c0392b)' : 'var(--color-text-muted)' }}>
                    <span>{sentences > MAX_SENTENCES ? `legfeljebb ${MAX_SENTENCES} mondat lehet` : `${sentences}/${MAX_SENTENCES} mondat`}</span>
                    <span>{text.length}/{MAX_SIGNUP_CHARS}</span>
                  </div>
                  {error && <div className="small mt-2" style={{ color: 'var(--bs-danger, #c0392b)' }}>{error}</div>}
                  <button type="submit" className="btn-fyb btn-fyb-highlight mt-3" disabled={!textOk}>jelentkezem</button>
                </form>
              )}
            </div>

            <div className="card-fyb">
              <h2 className="h6 mb-3">jelentkezők ({list.length}/{meeting.capacity})</h2>
              {list.length === 0 && <p className="mb-0" style={{ color: 'var(--color-text-muted)' }}>Még nincs jelentkező — légy te az első!</p>}
              <div className="d-flex flex-column gap-2">
                {list.map((s, i) => (
                  <div key={s.id} className="utk-signup">
                    <span className="utk-signup-n">{i + 1}</span>
                    <div>
                      <div className="fw-bold">{nameOf.get(s.clientId) ?? 'résztvevő'}{s.clientId === LOGGED_IN_UF_ID ? ' (te)' : ''}</div>
                      <p className="mb-0">{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

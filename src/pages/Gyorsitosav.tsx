import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Chevron from '../components/Chevron'
import Icon from '../components/Icon'
import YouTubePlayer from '../components/YouTubePlayer'
import { youtubeId } from '../data/reviews'
import {
  formatDeadline,
  formatDuration,
  useGyorsitosav,
  useNow,
  type GyAnswer,
  type GyVideo,
} from '../context/GyorsitosavContext'

const REDIRECT_SECONDS = 8
const MIN_ANSWER_LENGTH = 3

function nameFromEmail(email: string): string {
  return email.split('@')[0] || email
}

function Comment({ name, question, text }: { name: string; question: string; text: string }) {
  return (
    <div className="gy-comment">
      <div className="avatar">{name.charAt(0).toUpperCase()}</div>
      <div>
        <div className="small" style={{ color: 'var(--color-text-muted)' }}>
          <span className="fw-bold" style={{ color: 'var(--color-text)' }}>{name}</span> · {question}
        </div>
        <p className="mb-0">{text}</p>
      </div>
    </div>
  )
}

function RegisterForm() {
  const { register, config } = useGyorsitosav()
  const [email, setEmail] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (trimmed) register(trimmed)
  }

  return (
    <form className="d-flex flex-wrap gap-2" onSubmit={handleSubmit}>
      <input
        type="email"
        className="form-control"
        placeholder="e-mail címed"
        aria-label="e-mail cím"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ minWidth: '14rem', flex: 1 }}
      />
      <button type="submit" className="btn-fyb btn-fyb-highlight btn-fyb-lg text-nowrap">
        regisztrálok, mehet az 1. videó
        <Chevron direction="right" color="var(--navy)" />
      </button>
      <span className="w-100 small" style={{ color: 'var(--color-text-muted)' }}>
        {config.videos.length} videó, mindegyik után rövid tudáscheck. Csak az e-mail címedre van szükségünk.
      </span>
    </form>
  )
}

function Landing() {
  const { config } = useGyorsitosav()
  const n = config.videos.length
  return (
    <>
      <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
        {n} videó, amit a saját tempódban tudsz feldolgozni. Minden videó után van egy rövid tudáscheck: a válaszaidat
        kommentként láthatod a videó alatt, és ezután jön a következő videó. Ha végigértél, egyenesen az ingyenes
        konzultáció időpontfoglalójához jutsz.
      </p>

      {config.gift.enabled && (
        <div className="card-fyb gy-gift-card mb-4">
          <Icon src="/icons/ikon_csillag.svg" />
          <div>
            <div className="fw-bold">ajándék, ha gyorsan végigérsz</div>
            <p className="mb-0 small" style={{ color: 'var(--color-text-muted)' }}>
              Ha a regisztrációtól számított {formatDeadline(config.deadlineHours)} alatt végigmész mind a {n} videón,
              ajándékot kapsz: {config.gift.title}.
            </p>
          </div>
        </div>
      )}

      <div className="card-fyb">
        <h2 className="h5 mb-3">regisztráció</h2>
        <RegisterForm />
      </div>

      <ul className="gy-steps-list list-unstyled mt-4 mb-0">
        {config.videos.map((v) => (
          <li key={v.id} className="mb-1">{v.title}</li>
        ))}
      </ul>
    </>
  )
}

function CountdownBar() {
  const { config, progress, finished } = useGyorsitosav()
  const now = useNow(!finished)
  if (!progress) return null
  const total = config.videos.length
  const done = config.videos.filter((v) => progress.completed[v.id]).length
  const deadlineAt = progress.registeredAt + config.deadlineHours * 3600 * 1000
  const remaining = deadlineAt - now
  const endTime = progress.finishedAt ?? now
  const elapsed = endTime - progress.registeredAt

  let status: React.ReactNode = null
  if (config.gift.enabled) {
    if (finished) {
      status = progress.giftEarned
        ? <span className="fw-bold" style={{ color: 'var(--color-primary)' }}>határidőn belül végeztél: az ajándék a tiéd</span>
        : <span style={{ color: 'var(--color-text-muted)' }}>a határidő lejárta után végeztél, az ajándék már nem jár</span>
    } else if (remaining > 0) {
      status = (
        <>
          <span className="small" style={{ color: 'var(--color-text-muted)' }}>az ajándékig hátralévő idő</span>
          <span className="gy-countdown">{formatDuration(remaining)}</span>
        </>
      )
    } else {
      status = <span style={{ color: 'var(--color-text-muted)' }}>a határidő lejárt, az ajándék már nem jár — a gyorsítósávot ettől még végigviheted</span>
    }
  } else if (finished) {
    status = <span style={{ color: 'var(--color-text-muted)' }}>végigértél, {formatDuration(elapsed)} alatt</span>
  }

  return (
    <div className="card-fyb gy-bar mb-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <div className="fw-bold">Szia, {nameFromEmail(progress.email)}!</div>
          <div className="small" style={{ color: 'var(--color-text-muted)' }}>{done} / {total} videó kész</div>
        </div>
        <div className="d-flex flex-column align-items-end">{status}</div>
      </div>
      <div className="gy-progress mt-3" aria-hidden="true">
        <span style={{ width: `${(done / total) * 100}%` }} />
      </div>
    </div>
  )
}

function VideoStep({ video, index, state }: { video: GyVideo; index: number; state: 'done' | 'current' | 'locked' }) {
  const { progress, markWatched, submitAnswers } = useGyorsitosav()
  const [apiFailed, setApiFailed] = useState(false)
  const [rewatch, setRewatch] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  if (!progress) return null

  const id = youtubeId(video.url)
  const watched = progress.watched.includes(video.id)
  const completed = progress.completed[video.id]
  const name = nameFromEmail(progress.email)
  const canSubmit = video.questions.every((q) => (answers[q.id] ?? '').trim().length >= MIN_ANSWER_LENGTH)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    const list: GyAnswer[] = video.questions.map((q) => ({ questionId: q.id, question: q.text, text: answers[q.id].trim() }))
    submitAnswers(video, list)
  }

  if (state === 'locked') {
    return (
      <div className="card-fyb gy-step gy-step--locked">
        <Icon src="/icons/ikon_lakat.svg" />
        <span className="fw-bold">{video.title}</span>
        <span className="small ms-auto" style={{ color: 'var(--color-text-muted)' }}>az előző videó tudáscheck-je után nyílik</span>
      </div>
    )
  }

  return (
    <div className="card-fyb gy-step-card">
      <div className="d-flex align-items-center gap-2 mb-3">
        <span className="gy-step-badge">{state === 'done' ? '✓' : index + 1}</span>
        <h2 className="h6 mb-0">{video.title}</h2>
        {state === 'done' && id && (
          <button type="button" className="btn-fyb btn-fyb-ghost ms-auto" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setRewatch((r) => !r)}>
            {rewatch ? 'videó elrejtése' : 'újranézem'}
          </button>
        )}
      </div>

      {state === 'current' && (
        <>
          {id ? (
            <YouTubePlayer videoId={id} title={video.title} onEnded={() => markWatched(video.id)} onApiFailed={() => setApiFailed(true)} />
          ) : (
            <div className="gy-video-placeholder">
              <Icon src="/icons/ikon_video.svg" style={{ width: '2.5rem', height: '2.5rem' }} />
              <span>a videó hamarosan felkerül</span>
            </div>
          )}

          {!watched && (!id || apiFailed) && (
            <div className="mt-3">
              <button type="button" className="btn-fyb btn-fyb-outline" onClick={() => markWatched(video.id)}>megnéztem a videót</button>
            </div>
          )}
          {!watched && id && !apiFailed && (
            <p className="small mt-3 mb-0" style={{ color: 'var(--color-text-muted)' }}>
              a videó végigjátszása után jelenik meg a tudáscheck.
            </p>
          )}

          {watched && (
            <form className="mt-4" onSubmit={handleSubmit}>
              <h3 className="h6 mb-3">tudáscheck</h3>
              {video.questions.map((q) => (
                <div key={q.id} className="mb-3">
                  <label className="form-label small fw-bold" htmlFor={`${video.id}-${q.id}`}>{q.text}</label>
                  <textarea
                    id={`${video.id}-${q.id}`}
                    className="form-control"
                    rows={2}
                    value={answers[q.id] ?? ''}
                    onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  />
                </div>
              ))}
              <button type="submit" className="btn-fyb btn-fyb-highlight" disabled={!canSubmit}>
                komment elküldése és tovább
                <Chevron direction="right" color="var(--navy)" />
              </button>
            </form>
          )}
        </>
      )}

      {state === 'done' && rewatch && id && (
        <div className="video-embed-fyb mb-3">
          <iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title={video.title} loading="lazy" allowFullScreen />
        </div>
      )}

      {state === 'done' && completed && (
        <div className="d-flex flex-column gap-3">
          {completed.answers.map((a) => (
            <Comment key={a.questionId} name={name} question={a.question} text={a.text} />
          ))}
        </div>
      )}
    </div>
  )
}

function Completion() {
  const { config, progress } = useGyorsitosav()
  const navigate = useNavigate()
  const [left, setLeft] = useState(REDIRECT_SECONDS)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  // csak közvetlenül a befejezés után irányítunk át automatikusan (nem minden
  // későbbi látogatáskor), hogy az ajándék később is elérhető maradjon
  const justFinished = useMemo(() => !!progress?.finishedAt && Date.now() - progress.finishedAt < 15000, [progress?.finishedAt])

  useEffect(() => {
    if (!justFinished) return
    if (left <= 0) {
      navigate('/idopontfoglalas')
      return
    }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [justFinished, left, navigate])

  if (!progress) return null

  return (
    <div ref={ref} className="card-fyb gy-complete text-center">
      <h2 className="h4 mb-2">végigértél a gyorsítósávon!</h2>
      {progress.giftEarned && (
        <div className="gy-gift-card justify-content-center mb-3">
          <Icon src="/icons/ikon_csillag.svg" />
          <div className="text-start">
            <div className="fw-bold">az ajándékod: {config.gift.title}</div>
            {config.gift.description && <p className="mb-1 small">{config.gift.description}</p>}
            {config.gift.downloadUrl ? (
              <a className="btn-fyb btn-fyb-primary mt-1" href={config.gift.downloadUrl} target="_blank" rel="noreferrer" download>letöltés</a>
            ) : (
              <span className="small" style={{ color: 'var(--color-text-muted)' }}>a letöltési link hamarosan elérhető lesz.</span>
            )}
          </div>
        </div>
      )}
      <p className="mb-3" style={{ color: 'var(--color-text-muted)' }}>
        {justFinished
          ? `${left} másodperc múlva átirányítunk az ingyenes konzultáció időpontfoglalójához.`
          : 'Az ingyenes konzultáció időpontfoglalója is vár rád.'}
      </p>
      <Link to="/idopontfoglalas" className="btn-fyb btn-fyb-highlight btn-fyb-lg">ugrás az időpontfoglalóhoz</Link>
    </div>
  )
}

function Course() {
  const { config, progress, currentIndex, finished } = useGyorsitosav()
  return (
    <>
      <CountdownBar />
      <div className="d-flex flex-column gap-4">
        {config.videos.map((v, i) => {
          const done = !!progress?.completed[v.id]
          const state = done ? 'done' : i === currentIndex ? 'current' : 'locked'
          return <VideoStep key={v.id} video={v} index={i} state={state} />
        })}
        {finished && <Completion />}
      </div>
    </>
  )
}

export default function Gyorsitosav() {
  const { config, progress } = useGyorsitosav()
  return (
    <section className="py-5">
      <div className="container" style={{ maxWidth: 860 }}>
        <span className="eyebrow-fyb">gyorsítósáv <Chevron double /></span>
        <h1 className="mb-3">{config.videos.length} videós gyorsítósáv</h1>
        {progress ? <Course /> : <Landing />}
      </div>
    </section>
  )
}

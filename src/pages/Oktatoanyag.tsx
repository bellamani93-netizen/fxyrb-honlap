import { useState } from 'react'

// "oktatóanyag" (2026.09.17., Marci kérésére, 3. fázis) — a Projekt
// specifikáció szerint "50%-ban azonos a Gyógyító Gerinchasználat kurzus
// első két leckéjével: videók, tudáspróba kérdőív". A videók ugyanazt a
// `.video-thumb`/`.play-btn` helykitöltő mintát követik, mint a nyilvános
// Mini-kurzus oldalon (MiniKurzus.tsx) — ezek a mindennapi gerinchasználatról
// szóló ÁLTALÁNOS oktatóvideók, nem a személyre szabott torna-videók (azok
// az admin "anyagok kezelése"/videókiosztás rendszeréhez tartoznak, ld.
// MaterialsContext.tsx). A tudáspróba önellenőrző, NEM zárolja a további
// tartalmat — a helyes/helytelen válasz csak vizuális visszajelzés,
// eredménye sehol nem kerül mentésre/jelentésre (nincs backend).

type QuizOption = { text: string; correct: boolean }
type QuizQuestion = { question: string; options: QuizOption[] }
type Lesson = { title: string; description: string; quiz: QuizQuestion[] }

const LESSONS: Lesson[] = [
  {
    title: '1. lecke — helyes felkelés az ágyból',
    description: 'oldalra fordulás, majd a kezeddel told fel magad — ne a hasi izomból, egyenesen felülve kelj fel.',
    quiz: [
      {
        question: 'Melyik a derékkímélő felkelés helyes sorrendje?',
        options: [
          { text: 'egyenesen felülök, majd lábra állok', correct: false },
          { text: 'oldalra fordulok, kézzel tolom fel magam, majd lábra állok', correct: true },
          { text: 'a lábamat előbb lelógatom, aztán csavarodva felülök', correct: false },
        ],
      },
    ],
  },
  {
    title: '2. lecke — ülés és állás a mindennapokban',
    description: 'egyenes deréktartás ülve is, gyakori helyzetváltás, a súly egyenletes elosztása mindkét lábon állás közben.',
    quiz: [
      {
        question: 'Hosszú ülőmunka közben mi a legfontosabb szabály?',
        options: [
          { text: 'egyszer beállítom a széket, utána nem mozdulok', correct: false },
          { text: 'rendszeresen váltok testhelyzetet, félóránként felállok', correct: true },
          { text: 'inkább előredőlve ülök, közelebb a monitorhoz', correct: false },
        ],
      },
    ],
  },
  {
    title: '3. lecke — tárgy felvétele hajolás helyett',
    description: 'guggolás vagy féltérdelés, egyenes háttal, a lábakból dolgozva — nem a derék meghajlításával.',
    quiz: [
      {
        question: 'Hogyan vegyél fel egy tárgyat a földről?',
        options: [
          { text: 'egyenes lábbal lehajolok', correct: false },
          { text: 'guggolva, egyenes háttal, a lábaimból emelek', correct: true },
          { text: 'csak a felsőtestemet döntöm előre', correct: false },
        ],
      },
    ],
  },
  {
    title: '4. lecke — fordulás csavarás helyett',
    description: 'irányváltásnál az egész testeddel, a lábfejeddel együtt fordulj — ne csak a derekadból csavarodj.',
    quiz: [
      {
        question: 'Mi a helyes irányváltás módja, pl. autóba beszálláskor?',
        options: [
          { text: 'a derekamból csavarodva fordulok be', correct: false },
          { text: 'a lábfejemmel együtt, egészben fordulok', correct: true },
          { text: 'ülve maradok és csak a vállamat fordítom', correct: false },
        ],
      },
    ],
  },
]

function QuizQuestionBlock({ q }: { q: QuizQuestion }) {
  const [selected, setSelected] = useState<number | null>(null)
  const showResult = selected !== null
  return (
    <div className="mb-2">
      <div className="fw-bold mb-2">{q.question}</div>
      <div className="d-flex flex-column gap-2">
        {q.options.map((opt, i) => {
          const isSelected = selected === i
          const state = !showResult ? 'idle' : opt.correct ? 'correct' : isSelected ? 'incorrect' : 'idle'
          return (
            <button
              key={opt.text}
              type="button"
              className="quiz-option"
              data-state={state}
              onClick={() => setSelected(i)}
            >
              <span>{opt.text}</span>
              {showResult && opt.correct && <span className="quiz-option-mark">✓</span>}
              {showResult && isSelected && !opt.correct && <span className="quiz-option-mark">✕</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function LessonCard({ lesson }: { lesson: Lesson }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card-fyb mb-3">
      <div className="row g-3 align-items-center">
        <div className="col-md-5">
          <div className="video-thumb">
            <span className="play-btn">▶</span>
          </div>
        </div>
        <div className="col-md-7">
          <h2 className="h6 mb-1">{lesson.title}</h2>
          <p className="small mb-0" style={{ color: 'var(--color-text-muted)' }}>{lesson.description}</p>
        </div>
      </div>

      <button
        type="button"
        className="d-flex align-items-center gap-2 w-100 text-start mt-3"
        style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-text)' }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="small">tudáspróba</span>
        <span className="level-select-chevron ms-auto" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>

      {open && (
        <div className="mt-3">
          {lesson.quiz.map((q) => (
            <QuizQuestionBlock key={q.question} q={q} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Oktatoanyag() {
  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 860 }}>
        <div className="app-page-header mb-3 mobile-sticky-header">
          <h1 className="app-page-title mb-0">oktatóanyag</h1>
        </div>

        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          mindennapi gerinchasználat — 4 rövid lecke, mindegyik végén egy gyors, önellenőrző tudáspróbával.
        </p>

        {LESSONS.map((l) => (
          <LessonCard key={l.title} lesson={l} />
        ))}
      </div>
    </section>
  )
}

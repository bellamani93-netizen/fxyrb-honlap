import { Link } from 'react-router-dom'
import Chevron from '../components/Chevron'

// Jogi dokumentumok (ÁSZF, Adatvédelmi tájékoztató, Cookie-tájékoztató)
// helyőrző oldala — a végleges, jogilag jóváhagyott szöveg még nem készült el,
// kitalált jogi szöveget nem teszünk ki.
export default function JogiOldal({ title }: { title: string }) {
  return (
    <section className="py-5">
      <div className="container" style={{ maxWidth: 760 }}>
        <span className="eyebrow-fyb">jogi tájékoztatók <Chevron double /></span>
        <h1 className="mb-3">{title}</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Ez a dokumentum hamarosan elérhető lesz. Addig is kérdéseiddel keress minket az{' '}
          <a href="mailto:info@fixyourback.hu">info@fixyourback.hu</a> címen.
        </p>
        <Link to="/" className="btn-fyb btn-fyb-primary">vissza a főoldalra</Link>
      </div>
    </section>
  )
}

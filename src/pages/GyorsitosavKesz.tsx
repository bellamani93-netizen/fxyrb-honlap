import { Link, Navigate } from 'react-router-dom'
import Chevron from '../components/Chevron'
import Icon from '../components/Icon'
import { formatElapsed, useGyorsitosav } from '../context/GyorsitosavContext'

const CONFETTI_COLORS = ['var(--lime)', 'var(--mint)', '#ffffff', 'var(--teal)']

// a gyorsítósáv befejezése utáni gratuláló oldal: ide vezet az utolsó videó
// utáni "tovább" gomb; itt érhető el az ajándék, és innen lehet továbblépni
// az időpontfoglalóra. Aki még nem ért végig, visszakerül a gyorsítósávra.
export default function GyorsitosavKesz() {
  const { config, progress, finished } = useGyorsitosav()
  if (!progress || !finished) return <Navigate to="/gyorsitosav" replace />

  const total = config.videos.length
  const answerCount = Object.values(progress.completed).reduce((n, c) => n + c.answers.length, 0)
  const elapsed = (progress.finishedAt ?? Date.now()) - progress.registeredAt

  return (
    <section className="gy-celebrate">
      <div className="gy-confetti" aria-hidden="true">
        {Array.from({ length: 28 }, (_, i) => (
          <span
            key={i}
            style={{
              left: `${(i * 37) % 100}%`,
              backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              animationDelay: `${(i % 9) * 0.35}s`,
              animationDuration: `${3.2 + (i % 5) * 0.6}s`,
              transform: `rotate(${(i * 53) % 180}deg)`,
            }}
          />
        ))}
      </div>

      <div className="container position-relative" style={{ maxWidth: 820 }}>
        <div className="text-center">
          <div className="gy-celebrate-badge mx-auto mb-3">
            <Icon src="/icons/ikon_csillag.svg" />
          </div>
          <span className="eyebrow-fyb" style={{ color: 'var(--lime)' }}>gyorsítósáv teljesítve <Chevron double /></span>
          <h1 className="gy-celebrate-title">Gratulálunk!<br />Végigértél a gyorsítósávon!</h1>
          <p className="gy-celebrate-lead">
            Végignézted mind a {total} videót, és válaszoltál a tudásellenőrző kérdésekre. Ezzel már nem tippekre és
            hallomásra építesz, hanem megkaptad az alapokat ahhoz, hogy megértsd a derékfájásod valódi okát — és azt is,
            miért nem működtek eddig a próbálkozásaid.
          </p>
        </div>

        <div className="gy-stats">
          <div className="gy-stat"><strong>{total}/{total}</strong><span>videó megnézve</span></div>
          <div className="gy-stat"><strong>{answerCount}</strong><span>megválaszolt kérdés</span></div>
          <div className="gy-stat"><strong>{formatElapsed(elapsed)}</strong><span>alatt értél végig</span></div>
        </div>

        {config.gift.enabled && (
          <div className="gy-gift-panel">
            {progress.giftEarned ? (
              <>
                <div className="gy-gift-tag">az ajándékod</div>
                <h2 className="h4 mb-2">{config.gift.title}</h2>
                <p className="mb-3">
                  {config.gift.description || 'Határidőn belül végigértél, ezért ez az anyag a tiéd — jó használatot!'}
                </p>
                {config.gift.downloadUrl ? (
                  <a className="btn-fyb btn-fyb-highlight btn-fyb-lg" href={config.gift.downloadUrl} target="_blank" rel="noreferrer" download>
                    ajándék letöltése
                  </a>
                ) : (
                  <span className="small" style={{ opacity: 0.8 }}>a letöltési link hamarosan elérhető lesz ezen az oldalon.</span>
                )}
              </>
            ) : (
              <p className="mb-0">
                A határidő lejárta után értél a végére, ezért az ajándék ezúttal nem jár — de amit megtanultál, az a tiéd marad.
              </p>
            )}
          </div>
        )}

        <div className="text-center gy-next">
          <h2 className="h3 mb-3">mi a következő lépés?</h2>
          <p className="mb-4">
            Foglalj egy ingyenes, 45 perces telefonos konzultációt: átbeszéljük a panaszaidat, a céljaidat, és ha úgy
            látjuk, hogy érdemes együtt dolgozni, dönthetünk a közös munkáról is.
          </p>
          <Link to="/idopontfoglalas" className="btn-fyb btn-fyb-highlight btn-fyb-lg btn-fyb-glow">
            tovább az időpontfoglalóra
            <Chevron direction="right" color="var(--navy)" />
          </Link>
        </div>
      </div>
    </section>
  )
}

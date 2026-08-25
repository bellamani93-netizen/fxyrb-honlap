import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import Chevron from '../components/Chevron'
import Icon from '../components/Icon'

const helpCards = [
  {
    icon: '/icons/ikon_tanulas.svg',
    title: 'ülőmunkát végző férfiaknak',
    text: 'irodai, home office-os, sofőr — ha napi 6+ órát ülsz, ez a program neked szól.',
  },
  {
    icon: '/icons/ikon_villanykorte.svg',
    title: 'elhúzódó derékfájásra, porckorongsérvre',
    text: 'nem tippeket adunk, hanem megmutatjuk az ok-okozati összefüggést: mi történik → miért fáj → mit tegyél.',
  },
  {
    icon: '/icons/ikon_torna.svg',
    title: 'akik szeretnék végre legyőzni',
    text: 'saját tempóban haladó, 10+14 hetes program, ami tényleg beépül a mindennapjaidba.',
  },
]

const processSteps = [
  { title: 'megnézed a 4 videós mini-kurzust', text: 'megérted, mi okozza a fájdalmad, és mit tud ellene tenni a HÁTrendben módszer.', icon: '/icons/ikon_video.svg' },
  { title: 'lefoglalod az ingyenes konzultációt', text: 'egy rövid hívás keretében megnézzük, illik-e hozzád a program.', icon: '/icons/ikon_naptar.svg' },
  { title: 'elindulsz a 10+14 hetes programon', text: 'személyre szabott gyakorlatok, heti dokumentáció, folyamatos visszajelzés.', icon: '/icons/ikon_szintek.svg' },
]

const testimonials = [
  {
    name: 'Tóth Barnabás',
    role: 'Google-értékelés · 5/5',
    quote: 'Hiánypótló! Sokkal több ehhez hasonló kezdeményezésnek kellene lenni. Remélem még sok derékfájósnak tudtok irányt mutatni a gyógyulás felé.',
    initials: 'T',
  },
]

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="pt-5" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
        <div className="container pt-4">
          <div className="row align-items-center gy-4">
            <div className="col-lg-7 pb-5">
              <span className="eyebrow-fyb">ülőmunkát végző férfiaknak <Chevron double /></span>
              <h1 className="display-5 mb-3">szüntesd meg a derékfájásod okát, ne csak a tünetét</h1>
              <p className="lead mb-4" style={{ color: 'var(--color-text-muted)' }}>
                Szia, Bella Márton vagyok, gyógytornász. A HÁTrendben módszerrel megmutatom, miért fáj a derekad,
                és lépésről lépésre megtanítalak, hogyan építsd vissza a gerinced terhelhetőségét — anélkül, hogy órákat
                kellene edzenem gyakorolnod.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/mini-kurzus" className="btn-fyb btn-fyb-highlight btn-fyb-lg btn-fyb-glow">gyorsítósáv</Link>
              </div>
            </div>
            <div className="col-lg-5 align-self-end">
              <div className="hero-photo-wrap">
                <img src="/images/hero.png" alt="Bella Márton, gyógytornász" className="hero-photo" />
                <div className="hero-signature-wrap">
                  <img src="/images/signature-light.png" alt="" className="hero-signature signature-for-light" />
                  <img src="/images/signature-dark.png" alt="" className="hero-signature signature-for-dark" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KINEK SEGÍTÜNK */}
      <section className="py-5">
        <div className="container">
          <span className="eyebrow-fyb">kinek szól <Chevron double /></span>
          <h2 className="mb-4">kinek segítünk</h2>
          <div className="row gy-4">
            {helpCards.map((c) => (
              <div className="col-md-4" key={c.title}>
                <div className="card-fyb card-fyb-hover h-100">
                  <Icon src={c.icon} className="mb-3" style={{ width: '2.5rem', height: '2.5rem' }} />
                  <h3 className="h5">{c.title}</h3>
                  <p className="mb-0" style={{ color: 'var(--color-text-muted)' }}>{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOGYAN SEGÍTÜNK — folyamat */}
      <section className="py-5" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
        <div className="container">
          <span className="eyebrow-fyb">a folyamat <Chevron double /></span>
          <h2 className="mb-5">hogyan segítünk</h2>
          <div className="process-flow process-flow--vertical mx-auto" style={{ maxWidth: 480 }}>
            {processSteps.map((step, i) => (
              <Fragment key={step.title}>
                <div className="process-step">
                  <div className="card-fyb h-100 d-flex align-items-stretch gap-3">
                    <div className="process-step-number">
                      <svg viewBox="0 0 80 100" preserveAspectRatio="none" aria-hidden="true">
                        <text x="40" y="88" textAnchor="middle" fontFamily="var(--font-heading)" fontWeight="700" fontSize="100" fill="currentColor">{i + 1}</text>
                      </svg>
                    </div>
                    <div className="flex-grow-1 text-center">
                      <div className="process-step-icon-badge mx-auto mb-3">
                        <Icon src={step.icon} />
                      </div>
                      <h3 className="h6">{step.title}</h3>
                      <p className="small mb-0" style={{ color: 'var(--color-text-muted)' }}>{step.text}</p>
                    </div>
                  </div>
                </div>
                {i < processSteps.length - 1 && (
                  <div className="process-arrow">
                    <Chevron direction="down" />
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* VISSZAJELZÉSEK */}
      <section className="py-5">
        <div className="container">
          <span className="eyebrow-fyb">visszajelzések <Chevron double /></span>
          <h2 className="mb-4">nem csak mi mondjuk</h2>
          <div className="row gy-4 justify-content-center">
            {testimonials.map((t) => (
              <div className="col-md-7" key={t.name}>
                <div className="card-fyb testimonial-fyb h-100">
                  <div className="stars mb-2">★★★★★</div>
                  <p className="mb-3">„{t.quote}”</p>
                  <div className="d-flex align-items-center gap-3">
                    <div className="avatar">{t.initials}</div>
                    <div>
                      <div className="fw-bold">{t.name}</div>
                      <div className="small" style={{ color: 'var(--color-text-muted)' }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ISMÉTLŐDŐ CTA */}
      <section className="py-5">
        <div className="container text-center" style={{ maxWidth: 560 }}>
          <h2 className="h3 mb-3">készen állsz az első lépésre?</h2>
          <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
            nézd meg a 4 videós gyorsítósávot — pár perc alatt megérted, mi okozza a fájdalmad, és mit tehetsz ellene.
          </p>
          <Link to="/mini-kurzus" className="btn-fyb btn-fyb-highlight btn-fyb-lg btn-fyb-glow">gyorsítósáv</Link>
        </div>
      </section>

      {/* HÍRLEVÉL */}
      <section className="py-5">
        <div className="container">
          <div className="newsletter-fyb">
            <div className="row align-items-center gy-4">
              <div className="col-lg-8">
                <h2 className="h3 mb-3">iratkozz fel a <span className="text-nowrap">Derekas Levelekre</span></h2>
                <p className="mb-4 text-white-50">
                  Nem nyomorít meg, de közben szeretnél legalább egy kis lépést tenni afelé, hogy ne legyen
                  rosszabb? Akkor iratkozz fel a Derekas Levelekre. Ezek emailek általában hetente 1-2 alkalommal,
                  amiben személyesen tanítalak.
                </p>
                <form className="d-flex flex-wrap gap-2" onSubmit={(e) => e.preventDefault()}>
                  <input type="email" className="form-control" placeholder="e-mail címed" aria-label="e-mail cím" />
                  <button type="submit" className="btn-fyb btn-fyb-highlight text-nowrap">feliratkozom</button>
                </form>
              </div>
              <div className="col-lg-4 text-center">
                <div className="newsletter-icon-badge mx-auto">
                  <Icon src="/icons/ikon_munkafuzet.svg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

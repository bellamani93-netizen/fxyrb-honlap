import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import Chevron from '../components/Chevron'

const helpCards = [
  {
    icon: '/icons/ikon_torna.svg',
    title: 'kizárólag ülőmunkát végzőknek',
    text: 'irodai, home office-os, sofőr — ha napi 6+ órát ülsz, ez a program neked szól.',
  },
  {
    icon: '/icons/ikon_kerdoiv.svg',
    title: 'ismétlődő, magyarázat nélküli derékfájásra',
    text: 'nem tippeket adunk, hanem megmutatjuk az ok-okozati összefüggést: mi történik → miért fáj → mit tegyél.',
  },
  {
    icon: '/icons/ikon_szintek.svg',
    title: 'akik szeretnék végre kézben tartani',
    text: 'saját tempóban haladó, 10+14 hetes program, ami tényleg beépül a mindennapjaidba.',
  },
]

const processSteps = [
  { title: 'megnézed a 4 videós mini-kurzust', text: 'megérted, mi okozza a fájdalmad, és mit tud ellene tenni a HÁTrendben módszer.' },
  { title: 'lefoglalod az ingyenes konzultációt', text: 'egy rövid hívás keretében megnézzük, illik-e hozzád a program.' },
  { title: 'elindulsz a 10+14 hetes programon', text: 'személyre szabott gyakorlatok, heti dokumentáció, folyamatos visszajelzés.' },
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
              <span className="eyebrow-fyb">gerincbarát program ülőmunkásoknak <Chevron double /></span>
              <h1 className="display-5 mb-3">szüntesd meg a derékfájásod okát, ne csak a tünetét</h1>
              <p className="lead mb-4" style={{ color: 'var(--color-text-muted)' }}>
                Szia, Bella Márton vagyok, gyógytornász. A HÁTrendben módszerrel megmutatom, miért fáj a derekad,
                és lépésről lépésre megtanítalak, hogyan építsd vissza a gerinced terhelhetőségét — anélkül, hogy órákat
                kellene edzenem gyakorolnod.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/mini-kurzus" className="btn-fyb btn-fyb-primary btn-fyb-lg">indítom a mini-kurzust</Link>
                <Link to="/idopontfoglalas" className="btn-fyb btn-fyb-outline btn-fyb-lg">inkább időpontot foglalok</Link>
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
                  <img src={c.icon} alt="" className="icon-fyb mb-3" style={{ width: '2.5rem', height: '2.5rem' }} />
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
                  <div className="card-fyb h-100">
                    <div className="module-index mx-auto mb-3">{i + 1}</div>
                    <h3 className="h6">{step.title}</h3>
                    <p className="small mb-0" style={{ color: 'var(--color-text-muted)' }}>{step.text}</p>
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

      {/* HÍRLEVÉL */}
      <section className="py-5">
        <div className="container">
          <div className="newsletter-fyb">
            <div className="row align-items-center gy-4">
              <div className="col-lg-7">
                <h2 className="h3 mb-2">iratkozz fel a Derekas Levelekre</h2>
                <p className="mb-0 text-white-50">
                  heti egy e-mail: mit rontunk el nap mint nap a derekunkkal, és mit tegyünk helyette.
                </p>
              </div>
              <div className="col-lg-5">
                <form className="d-flex gap-2" onSubmit={(e) => e.preventDefault()}>
                  <input type="email" className="form-control" placeholder="e-mail címed" aria-label="e-mail cím" />
                  <button type="submit" className="btn-fyb btn-fyb-highlight text-nowrap">feliratkozom</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

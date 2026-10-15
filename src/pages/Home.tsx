import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import Chevron from '../components/Chevron'
import Icon from '../components/Icon'
import { withBase } from '../lib/assetUrl'
import { GoogleReviewsCarousel } from '../components/ReviewCarousels'

const helpCards = [
  {
    icon: '/icons/ikon_tanulas.svg',
    title: 'ülőmunkát végző férfiaknak',
    text: 'mérnök, IT, iroda, HO, sofőr — ha főleg ülőmunkát dolgozol, akkor ez a program neked szól.',
  },
  {
    icon: '/icons/ikon_villanykorte.svg',
    title: 'elhúzódó derékfájásra, porckorongsérvre',
    text: 'nem tippeket adunk, hanem megmutatjuk az ok-okozati összefüggést: mi történik → miért fáj → mit tegyél.',
  },
  {
    icon: '/icons/ikon_torna.svg',
    title: 'akik szeretnék végre legyőzni',
    text: 'benned az eltökéltség, mi adjuk a rendszert. Egyszer végigkísérünk nagyon precízen, onnantól a tiéd — működik, ha működteted.',
  },
]

const processSteps = [
  {
    title: 'végighaladsz a gyorsítósávon',
    text: '4 videó, amit a saját tempódban tudsz feldolgozni. Minden videó után van egy rövid kérdés, hogy valóban megértsd a lényeget. Erre válaszolva tudsz a következő videóra jutni. Ha végigértél, akkor érteni fogod az eddigi kudarcaidat, és azt is, hogy a rendszerünk miben ad többet.',
    icon: '/icons/ikon_video.svg',
  },
  {
    title: 'foglalsz egy ingyenes konzultációt',
    text: 'egy hívás keretében felmérjük a problémádat, a kihívásaidat, céljaidat, és ezek alapján megnézzük, hogy tudunk-e rajtad segíteni. Csak akkor ajánljuk fel a közös munka lehetőségét, ha úgy látjuk, hogy a problémád a módszerünkkel hatékonyan kezelhető.',
    icon: '/icons/ikon_naptar.svg',
  },
  {
    title: 'elindulsz a 10+14 hetes programon',
    text: '10 hetes együttműködés életmód optimalizálással, személyre szabott, a pillanatnyi terhelhetőséghez és tünetekhez igazított mozgásprogrammal, utána 14 hetes utánkövetés, hogy maximálisan elsajátíts mindent, ami a hosszú távú egészséges gerinchez szükséges.',
    icon: '/icons/ikon_szintek.svg',
  },
]

/* kézzel rajzolt, monoline (egyenletes vonalvastagságú) számjegy-vázlatok —
   stroke-alapúak, hogy a nem-egyenletes (csak függőleges irányú) nyújtás
   után is végig azonos maradjon a vonal vastagsága (non-scaling-stroke). */
const stepNumberPaths = [
  'M18 24 L32 8 L32 92',
  'M14 22 C14 12 22 6 32 6 C44 6 50 14 50 24 C50 42 14 58 14 92 L50 92',
  'M14 14 C18 8 26 6 32 6 C43 6 50 13 50 23 C50 32 43 38 34 40 C44 42 51 49 51 62 C51 76 43 92 30 92 C19 92 12 86 12 78',
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
              <h1 className="display-5 mb-3">szüntesd meg a derékfájásod okát, ne csak a tüneteit</h1>
              <p className="lead mb-4" style={{ color: 'var(--color-text-muted)' }}>
                A derékfájás, sőt porckorongsérv is önerőből legyőzhető. Egyetlen feltétellel: ha az önerőd egy
                világos, érthető, logikus rendszert követ. Ha nem akarsz kiszolgáltatott lenni vagy a fájdalomnak,
                vagy valamilyen terapeutának, akkor meg kell értened a gerinced működését, és azt, hogyan tudsz rá a
                legprecízebben hatni. Ebben segítünk.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/gyorsitosav" className="btn-fyb btn-fyb-highlight btn-fyb-lg btn-fyb-glow">gyorsítósáv</Link>
              </div>
            </div>
            <div className="col-lg-5 align-self-end">
              <div className="hero-photo-wrap">
                <img src={withBase("/images/hero.png")} alt="Bella Márton, gyógytornász" className="hero-photo" />
                <div className="hero-signature-wrap">
                  <img src={withBase("/images/signature-light.png")} alt="" className="hero-signature signature-for-light" />
                  <img src={withBase("/images/signature-dark.png")} alt="" className="hero-signature signature-for-dark" />
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
                      <svg viewBox="0 0 64 100" preserveAspectRatio="none" aria-hidden="true">
                        <path
                          d={stepNumberPaths[i]}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          vectorEffect="non-scaling-stroke"
                        />
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
          <h2 className="mb-4">akik már végigcsinálták</h2>
          <GoogleReviewsCarousel />
        </div>
      </section>

      {/* ISMÉTLŐDŐ CTA */}
      <section className="py-5">
        <div className="container text-center" style={{ maxWidth: 560 }}>
          <h2 className="h3 mb-3">készen állsz az első lépésre?</h2>
          <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
            nézd meg a 4 lépéses gyorsítósávot — pár perc alatt megérted, mi okozza a fájdalmad, és mit tehetsz ellene.
          </p>
          <Link to="/gyorsitosav" className="btn-fyb btn-fyb-highlight btn-fyb-lg btn-fyb-glow">gyorsítósáv</Link>
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

import Chevron from '../components/Chevron'
import Icon from '../components/Icon'
import { GoogleReviewsCarousel, VideoReviewsCarousel } from '../components/ReviewCarousels'
import { withBase } from '../lib/assetUrl'
import { videoReviews } from '../data/reviews'

export default function Idopontfoglalas() {
  return (
    <>
      <section className="py-5">
        <div className="container">
          <span className="eyebrow-fyb">időpontfoglalás <Chevron double /></span>
          <h1 className="mb-3">foglalj egy ingyenes konzultációt</h1>
          <div style={{ color: 'var(--color-text-muted)', maxWidth: 760 }}>
            <p>
              Egy 45 perces ingyenes telefonhívás keretében átbeszéljük a panaszaidat, tüneteidet, céljaidat, és ha úgy
              látjuk, hogy érdemes együtt dolgozni a megoldáson, akkor erről is tudunk dönteni.
            </p>
            <p>A konzultáció ingyenes, de nem korlátlan.</p>
            <p className="mb-0">
              Az időpont foglalásakor felteszünk néhány kérdést, és az erre adott válaszaid alapján bíráljuk el, hogy
              vállaljuk-e a hívást.
            </p>
          </div>
        </div>
      </section>

      {/* BEMUTATKOZÁS — a fotó+aláírás a főoldali hero mintájára */}
      <section className="pt-5" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
        <div className="container">
          <div className="row align-items-center gy-4">
            <div className="col-lg-7 pb-5">
              <h2 className="h3 mb-3">bemutatkozás, avagy kivel fogsz beszélni?</h2>
              <p className="lead mb-0" style={{ color: 'var(--color-text-muted)' }}>
                Bella Márton vagyok, derékfájás specialista gyógytornász, cégvezető, gerinctechnikai megmondó- és
                meghallgatóember. Főleg kérdezni fogok, mert érdekel a problémád, és akkor tudok segíteni, ha minél
                pontosabban fel tudom térképezni a helyzetedet.
              </p>
            </div>
            <div className="col-lg-5 align-self-end">
              <div className="hero-photo-wrap">
                <img src={withBase('/images/hero.png')} alt="Bella Márton, gyógytornász" className="hero-photo" />
                <div className="hero-signature-wrap">
                  <img src={withBase('/images/signature-light.png')} alt="" className="hero-signature signature-for-light" />
                  <img src={withBase('/images/signature-dark.png')} alt="" className="hero-signature signature-for-dark" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {videoReviews.length > 0 && (
        <section className="pt-5">
          <div className="container">
            <h2 className="h3 mb-4">így mesélnek róla</h2>
            <VideoReviewsCarousel />
          </div>
        </section>
      )}

      <section className="pt-5">
        <div className="container">
          <span className="eyebrow-fyb">visszajelzések <Chevron double /></span>
          <h2 className="mb-4">akik már végigcsinálták</h2>
          <GoogleReviewsCarousel />
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <h2 className="h3 mb-4">válassz időpontot</h2>
          <div className="card-fyb" style={{ minHeight: 560 }}>
            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center py-5"
                 style={{ color: 'var(--color-text-muted)', minHeight: 500 }}>
              <Icon src="/icons/ikon_naptar.svg" className="mb-3" style={{ width: '3rem', height: '3rem' }} />
              <p className="mb-1 fw-bold" style={{ color: 'var(--color-text)' }}>Calendly-beágyazás helye</p>
              <p className="small mb-0">élesben itt jelenik meg az időpontfoglaló widget</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

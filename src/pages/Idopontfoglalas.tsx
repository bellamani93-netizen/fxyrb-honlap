import Chevron from '../components/Chevron'
import Icon from '../components/Icon'
import { GoogleReviewsCarousel, VideoReviewsCarousel } from '../components/ReviewCarousels'
import { videoReviews } from '../data/reviews'

export default function Idopontfoglalas() {
  return (
    <section className="py-5">
      <div className="container">
        <div className="row gy-5">
          <div className="col-lg-5">
            <span className="eyebrow-fyb">időpontfoglalás <Chevron double /></span>
            <h1 className="mb-3">foglalj egy ingyenes konzultációt</h1>
            <div className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
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

          <div className="col-lg-7">
            <div className="card-fyb" style={{ minHeight: 560 }}>
              <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center py-5"
                   style={{ color: 'var(--color-text-muted)', minHeight: 500 }}>
                <Icon src="/icons/ikon_naptar.svg" className="mb-3" style={{ width: '3rem', height: '3rem' }} />
                <p className="mb-1 fw-bold" style={{ color: 'var(--color-text)' }}>Calendly-beágyazás helye</p>
                <p className="small mb-0">élesben itt jelenik meg az időpontfoglaló widget</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <span className="eyebrow-fyb">visszajelzések <Chevron double /></span>
          <h2 className="mb-4">akik már végigcsinálták</h2>
          <GoogleReviewsCarousel />
        </div>

        {videoReviews.length > 0 && (
          <div className="mt-5">
            <h2 className="h3 mb-4">így mesélnek róla</h2>
            <VideoReviewsCarousel />
          </div>
        )}
      </div>
    </section>
  )
}

import { Link } from 'react-router-dom'
import Chevron from '../components/Chevron'
import Icon from '../components/Icon'

const videos = [
  { title: '1. miért fáj a derekad — a valódi ok', text: 'a leggyakoribb tévhitek és a tényleges háttér.' },
  { title: '2. a 3 mozdulat, amit naponta rosszul csinálsz', text: 'hajolás, csavarás, ülés — apró korrekciók nagy hatással.' },
  { title: '3. a HÁTrendben módszer logikája', text: 'hogyan épül fel a 10+14 hetes program.' },
  { title: '4. mi történik, ha elkezded — és mi, ha nem', text: 'reális várakozások, és a következő lépés.' },
]

export default function MiniKurzus() {
  return (
    <section className="py-5">
      <div className="container" style={{ maxWidth: 860 }}>
        <span className="eyebrow-fyb">mini-kurzus <Chevron double /></span>
        <h1 className="mb-2">4 videós gyorsítósáv</h1>
        <p className="mb-5" style={{ color: 'var(--color-text-muted)' }}>
          nézd meg mind a négy videót — a végén egyenesen a konzultációs időpontfoglalóhoz jutsz.
        </p>

        <div className="d-flex flex-column gap-4 mb-5">
          {videos.map((v) => (
            <div className="row g-3 align-items-center card-fyb" key={v.title}>
              <div className="col-md-5">
                <div className="video-thumb">
                  <span className="play-btn">▶</span>
                </div>
              </div>
              <div className="col-md-7">
                <h2 className="h6 mb-1">{v.title}</h2>
                <p className="small mb-0" style={{ color: 'var(--color-text-muted)' }}>{v.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="locked-card text-center">
          <div className="locked-header justify-content-center">
            <Icon src="/icons/ikon_lakat.svg" />
            konzultációs időpontfoglaló
          </div>
          <p className="mb-3">nézd végig mind a 4 videót, és megnyílik az ingyenes konzultáció foglalása.</p>
          <Link to="/idopontfoglalas" className="btn-fyb btn-fyb-primary">
            ugrás az időpontfoglalóhoz →
          </Link>
        </div>
      </div>
    </section>
  )
}

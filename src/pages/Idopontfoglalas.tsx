import Chevron from '../components/Chevron'
import Icon from '../components/Icon'
import { useMiniKurzusModal } from '../context/MiniKurzusModalContext'

const testimonials = [
  {
    name: 'Tóth Barnabás',
    role: 'Google-értékelés · 5/5',
    quote: 'Hiánypótló! Sokkal több ehhez hasonló kezdeményezésnek kellene lenni. Remélem még sok derékfájósnak tudtok irányt mutatni a gyógyulás felé.',
    initials: 'T',
  },
]

export default function Idopontfoglalas() {
  const { open: openMiniKurzusModal } = useMiniKurzusModal()

  return (
    <section className="py-5">
      <div className="container">
        <div className="locked-page-wrap">
          <div className="locked-page-blur row gy-5">
            <div className="col-lg-5">
              <span className="eyebrow-fyb">időpontfoglalás <Chevron double /></span>
              <h1 className="mb-3">foglalj egy ingyenes konzultációt</h1>
              <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
                egy 20 perces hívás keretében átbeszéljük a panaszod, és megmutatom, hogyan illeszkedne a HÁTrendben
                program a mindennapjaidba. nincs kötelezettség — csak egy őszinte beszélgetés.
              </p>

              <div className="d-flex flex-column gap-4">
                {testimonials.map((t) => (
                  <div className="card-fyb testimonial-fyb" key={t.name}>
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
                ))}
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

          <div className="locked-overlay">
            <div className="locked-overlay-card">
              <Icon src="/icons/ikon_lakat.svg" className="mb-3" style={{ width: '2.5rem', height: '2.5rem' }} />
              <h2 className="h5 mb-3">ez még zárolva van</h2>
              <p className="mb-3">
                Hatékonyságra törekszünk. Csak úgy tudunk a leghatékonyabban segíteni neked a hívásban, ha már
                érted az alap összefüggéseket. Ekkor tudunk a hívásban már konkrétan a te helyzeteddel foglalkozni,
                és összeállítani egy precíz tervet a megoldáshoz.
              </p>
              <p className="mb-4">
                Úgy gondolod, hogy neked nincs szükséged további tanulásra? — Nos, elfogadom, de egy pimasz
                kérdést engedj meg: ha tényleg érted a dolgokat, akkor miért is vagy itt? Ha elég jó lenne a
                modelled, akkor már megoldotta volna a problémát...
              </p>
              <button type="button" className="btn-fyb btn-fyb-highlight" onClick={openMiniKurzusModal}>oké, nézzük miről van szó</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

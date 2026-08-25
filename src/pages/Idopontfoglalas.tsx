const testimonials = [
  { name: 'Anikó, 42', role: 'irodai dolgozó', quote: 'Fél év után első alkalommal nem fájt reggel felkelni.', initials: 'A' },
  { name: 'Gábor, 51', role: 'sofőr', quote: 'Végre megértettem, mit rontok el nap mint nap — nem csak gyakorlatokat kaptam.', initials: 'G' },
  { name: 'Zsófia, 36', role: 'kétgyerekes anyuka', quote: 'A checklist tartott motiváltnak, amikor már nem fájt annyira.', initials: 'Z' },
]

export default function Idopontfoglalas() {
  return (
    <section className="py-5">
      <div className="container">
        <div className="row gy-5">
          <div className="col-lg-5">
            <span className="eyebrow-fyb"><span className="chevron-fyb">«</span> időpontfoglalás</span>
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
                <img src="/icons/ikon_naptar.svg" alt="" className="icon-fyb mb-3" style={{ width: '3rem', height: '3rem' }} />
                <p className="mb-1 fw-bold" style={{ color: 'var(--color-text)' }}>Calendly-beágyazás helye</p>
                <p className="small mb-0">élesben itt jelenik meg az időpontfoglaló widget</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

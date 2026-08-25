import Chevron from '../components/Chevron'

const posts = [
  {
    title: 'miért fáj jobban a derekad ülés közben, mint álláskor?',
    excerpt: 'a porckorongra jutó terhelés ülő helyzetben akár 40%-kal is magasabb lehet, mint álláskor. megmutatjuk, miért, és mit tehetsz ellene.',
    date: '2026.07.28.',
    tag: 'derékfájás',
  },
  {
    title: 'a 3 leggyakoribb hiba, amit hajolás közben elkövetünk',
    excerpt: 'nem a hajolás a probléma, hanem az, ahogyan csináljuk. három apró korrekció, ami rengeteget számít.',
    date: '2026.07.14.',
    tag: 'mozgásminták',
  },
  {
    title: 'a Derekas Levelek olvasói kérdezték: meddig tart, mire elmúlik a fájdalom?',
    excerpt: 'nincs egyetlen jó válasz — de van egy reális idővonal, amit érdemes ismerni, mielőtt elkezded a programot.',
    date: '2026.06.30.',
    tag: 'hírlevél',
  },
]

export default function Blog() {
  return (
    <section className="py-5">
      <div className="container">
        <span className="eyebrow-fyb"><Chevron /> blog</span>
        <h1 className="mb-2">korábbi posztok és hírlevelek</h1>
        <p className="mb-5" style={{ color: 'var(--color-text-muted)' }}>
          válogatás a Facebook-posztjainkból és a Derekas Levelek hírlevél korábbi számaiból.
        </p>

        <div className="row gy-4">
          {posts.map((post) => (
            <div className="col-md-6 col-lg-4" key={post.title}>
              <article className="card-fyb card-fyb-hover h-100 d-flex flex-column">
                <span className="badge-fyb align-self-start mb-3">{post.tag}</span>
                <h2 className="h5">{post.title}</h2>
                <p className="flex-grow-1" style={{ color: 'var(--color-text-muted)' }}>{post.excerpt}</p>
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <span className="small" style={{ color: 'var(--color-text-muted)' }}>{post.date}</span>
                  <a href="#" className="btn-fyb btn-fyb-ghost">tovább olvasom</a>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

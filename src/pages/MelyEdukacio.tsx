import { useState } from 'react'
import { Link } from 'react-router-dom'
import Chevron from '../components/Chevron'
import Icon from '../components/Icon'
import { useBlog } from '../context/BlogContext'

// a korábbi "blog" oldal új neve "mélyedukáció" (2026.09.02., Marci
// kérésére) — a fájdalom-kezelésről/gerincről szóló valódi posztok/
// hírlevelek (ld. src/data/blogPosts.ts) helyettesítik a korábbi, csak
// UI-terv célú kamu posztokat. Új elem: nagyító ikonos kereső, ami a
// cím és a szöveg alapján is szűr.
function excerptOf(content: string, max = 160) {
  const flat = content.replace(/\s+/g, ' ').trim()
  return flat.length > max ? `${flat.slice(0, max).trimEnd()}…` : flat
}

export default function MelyEdukacio() {
  const { posts } = useBlog()
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const filtered = q
    ? posts.filter((p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    : posts

  return (
    <section className="py-5">
      <div className="container">
        <span className="eyebrow-fyb">mélyedukáció <Chevron double /></span>
        <h1 className="mb-2">cikkek és hírlevelek a gerinced egészségéről</h1>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          válogatás a Facebook-posztjainkból és a Derekas Levelek hírlevél korábbi számaiból.
        </p>

        <div className="mely-edu-search mb-5">
          <Icon src="/icons/ikon_nagyito.svg" className="mely-edu-search-icon" />
          <input
            type="search"
            className="form-control"
            placeholder="keresés a cikkek között…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-center" style={{ color: 'var(--color-text-muted)' }}>nincs találat.</p>
        ) : (
          <div className="row gy-4">
            {filtered.map((post) => (
              <div className="col-md-6 col-lg-4" key={post.id}>
                <article className="card-fyb card-fyb-hover h-100 d-flex flex-column">
                  <span className="badge-fyb align-self-start mb-3">{post.category}</span>
                  <h2 className="h5">{post.title}</h2>
                  <p className="flex-grow-1" style={{ color: 'var(--color-text-muted)' }}>{excerptOf(post.content)}</p>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className="small" style={{ color: 'var(--color-text-muted)' }}>{post.date}</span>
                    <Link to={`/melyedukacio/${post.id}`} className="btn-fyb btn-fyb-ghost">tovább olvasom</Link>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

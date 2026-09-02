import { Link, useParams } from 'react-router-dom'
import { useBlog } from '../context/BlogContext'

export default function MelyEdukacioCikk() {
  const { id } = useParams()
  const { posts } = useBlog()
  const post = posts.find((p) => p.id === id)

  if (!post) {
    return (
      <section className="py-5">
        <div className="container" style={{ maxWidth: 720 }}>
          <p className="mb-3" style={{ color: 'var(--color-text-muted)' }}>ez a cikk nem található.</p>
          <Link to="/melyedukacio" className="btn-fyb btn-fyb-ghost">‹ vissza a mélyedukációhoz</Link>
        </div>
      </section>
    )
  }

  const paragraphs = post.content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)

  return (
    <section className="py-5">
      <div className="container" style={{ maxWidth: 720 }}>
        <Link to="/melyedukacio" className="btn-fyb btn-fyb-ghost mb-4">‹ vissza a mélyedukációhoz</Link>

        <span className="badge-fyb mb-3">{post.category}</span>
        <h1 className="mb-2">{post.title}</h1>
        <p className="mb-4 small" style={{ color: 'var(--color-text-muted)' }}>{post.date}</p>

        <div className="card-fyb">
          {paragraphs.map((p, i) => (
            <p key={i} className={i === paragraphs.length - 1 ? 'mb-0' : undefined} style={{ whiteSpace: 'pre-line' }}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

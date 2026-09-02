import { useState } from 'react'
import { useBlog } from '../context/BlogContext'

const NEW_CATEGORY_VALUE = '__uj__'

// admin "blog" szerkesztő — itt hozhat létre az admin új mélyedukáció-
// bejegyzést (cím, kategória, szöveg), és itt vehet fel új kategóriát is
// (2026.09.02., Marci kérésére). A mentett bejegyzés azonnal megjelenik a
// nyilvános "mélyedukáció" oldalon is, mert mindkettő ugyanazt a BlogContext-et
// olvassa/írja.
export default function AdminBlog() {
  const { posts, categories, addPost, addCategory } = useBlog()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(categories[0] ?? '')
  const [newCategory, setNewCategory] = useState('')
  const [content, setContent] = useState('')

  const usingNewCategory = category === NEW_CATEGORY_VALUE
  const effectiveCategory = usingNewCategory ? newCategory.trim() : category
  const formValid = Boolean(title.trim() && effectiveCategory && content.trim())

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formValid) return
    if (usingNewCategory) addCategory(effectiveCategory)
    addPost({ title, category: effectiveCategory, content })
    setTitle('')
    setContent('')
    setNewCategory('')
    setCategory(usingNewCategory ? effectiveCategory : category)
  }

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 900 }}>
        <div className="app-page-header mb-3 mobile-sticky-header">
          <h1 className="app-page-title mb-0">blog</h1>
        </div>

        <div className="card-fyb card-fyb-accent mb-4">
          <h2 className="h5 mb-3">új bejegyzés létrehozása</h2>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label small fw-bold" htmlFor="post-title">cím</label>
                <input
                  id="post-title"
                  type="text"
                  className="form-control"
                  placeholder="pl. miért fáj jobban a derekad ülés közben, mint álláskor?"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold" htmlFor="post-category">kategória</label>
                <select
                  id="post-category"
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value={NEW_CATEGORY_VALUE}>+ új kategória létrehozása</option>
                </select>
              </div>

              {usingNewCategory && (
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold" htmlFor="post-new-category">új kategória neve</label>
                  <input
                    id="post-new-category"
                    type="text"
                    className="form-control"
                    placeholder="pl. étrend és regeneráció"
                    required
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                </div>
              )}

              <div className="col-12">
                <label className="form-label small fw-bold" htmlFor="post-content">szöveg</label>
                <textarea
                  id="post-content"
                  className="form-control"
                  rows={10}
                  placeholder="a bejegyzés teljes szövege — új bekezdéshez hagyj üres sort."
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn-fyb btn-fyb-primary mt-3" disabled={!formValid}>bejegyzés mentése</button>
          </form>
        </div>

        <div className="card-fyb">
          <h2 className="h6 mb-3">eddigi bejegyzések ({posts.length})</h2>
          {posts.map((p) => (
            <div key={p.id} className="py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                <span className="fw-bold">{p.title}</span>
                <span className="small" style={{ color: 'var(--color-text-muted)' }}>{p.date}</span>
              </div>
              <span className="badge-fyb mt-1">{p.category}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

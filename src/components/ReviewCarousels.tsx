import Carousel from './Carousel'
import { googleReviews, videoReviews, youtubeId } from '../data/reviews'

export function GoogleReviewsCarousel() {
  return (
    <Carousel label="Google-értékelések">
      {googleReviews.map((r) => (
        <div className="card-fyb testimonial-fyb h-100 d-flex flex-column" key={r.name}>
          <div className="stars mb-2">{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</div>
          <p className="mb-3">„{r.quote}”</p>
          <div className="d-flex align-items-center gap-3 mt-auto">
            <div className="avatar">{r.name.charAt(0)}</div>
            <div>
              <div className="fw-bold">{r.name}</div>
              <div className="small" style={{ color: 'var(--color-text-muted)' }}>Google-értékelés · {r.stars}/5</div>
            </div>
          </div>
        </div>
      ))}
    </Carousel>
  )
}

/** YouTube-beágyazott videós vélemények; ha nincs egyetlen érvényes link
 * sem, a szakasz nem jelenik meg. */
export function VideoReviewsCarousel() {
  const items = videoReviews.map((v) => ({ ...v, id: youtubeId(v.url) })).filter((v): v is typeof v & { id: string } => v.id !== null)
  if (items.length === 0) return null
  return (
    <Carousel label="videós értékelések">
      {items.map((v, i) => (
        <div className="card-fyb h-100 p-2" key={`${v.id}-${i}`}>
          <div className="video-embed-fyb">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${v.id}`}
              title={v.caption ?? 'videós értékelés'}
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {v.caption && <p className="small text-center mt-2 mb-1" style={{ color: 'var(--color-text-muted)' }}>{v.caption}</p>}
        </div>
      ))}
    </Carousel>
  )
}

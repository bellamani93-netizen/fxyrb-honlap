import { useEffect, useRef, useState } from 'react'
import { getVideoUrl } from '../lib/videoStore'

// A gyorsítósáv saját tárolású videójának lejátszója. A "végignézte" állapotot
// a videó `ended` eseménye adja; a tekerés előre le van tiltva a már
// megnézett pontnál tovább (csak visszatekerni lehet), hogy a tudáscheck-hez
// ténylegesen végig kelljen nézni a videót.
export default function GyVideoPlayer({
  videoId,
  title,
  onEnded,
}: {
  videoId: string
  title: string
  onEnded: () => void
}) {
  const [url, setUrl] = useState<string | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')
  const maxReached = useRef(0)
  const endedRef = useRef(onEnded)
  endedRef.current = onEnded

  useEffect(() => {
    let revoked: string | null = null
    let cancelled = false
    maxReached.current = 0
    setState('loading')
    getVideoUrl(videoId)
      .then((u) => {
        if (cancelled) {
          if (u) URL.revokeObjectURL(u)
          return
        }
        revoked = u
        setUrl(u)
        setState(u ? 'ready' : 'missing')
      })
      .catch(() => !cancelled && setState('missing'))
    return () => {
      cancelled = true
      if (revoked) URL.revokeObjectURL(revoked)
    }
  }, [videoId])

  if (state === 'missing') {
    return <div className="gy-video-placeholder"><span>a videó nem érhető el ezen a böngészőn</span></div>
  }

  return (
    <div className="video-embed-fyb">
      {state === 'ready' && url && (
        <video
          src={url}
          title={title}
          controls
          playsInline
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          onTimeUpdate={(e) => {
            const t = e.currentTarget.currentTime
            if (t > maxReached.current && t - maxReached.current < 2) maxReached.current = t
          }}
          onSeeking={(e) => {
            const v = e.currentTarget
            if (v.currentTime > maxReached.current + 1) v.currentTime = maxReached.current
          }}
          onEnded={() => endedRef.current()}
        />
      )}
      {state === 'loading' && <div className="yt-loading">betöltés…</div>}
    </div>
  )
}

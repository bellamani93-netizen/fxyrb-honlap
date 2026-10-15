import { useEffect, useRef, useState } from 'react'

// YouTube IFrame Player API-val beágyazott videó, amely jelzi, ha a videó
// végigért (ENDED). Ha az API nem tölthető be (tiltott hálózat, blokkoló
// kiegészítő), `onApiFailed` jelez, hogy a hívó egy tartalék "megnéztem"
// gombot kínálhasson.

type YTPlayer = { destroy: () => void }
type YTNamespace = {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string
      playerVars?: Record<string, number>
      events?: { onStateChange?: (e: { data: number }) => void; onError?: () => void }
    },
  ) => YTPlayer
  PlayerState: { ENDED: number }
}
declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiPromise: Promise<YTNamespace> | null = null
function loadYouTubeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (apiPromise) return apiPromise
  apiPromise = new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      if (window.YT) resolve(window.YT)
    }
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    s.async = true
    s.onerror = () => {
      apiPromise = null
      reject(new Error('YouTube API nem tölthető be'))
    }
    document.head.appendChild(s)
    setTimeout(() => {
      if (!window.YT?.Player) {
        apiPromise = null
        reject(new Error('YouTube API időtúllépés'))
      }
    }, 10000)
  })
  return apiPromise
}

export default function YouTubePlayer({
  videoId,
  title,
  onEnded,
  onApiFailed,
}: {
  videoId: string
  title: string
  onEnded: () => void
  onApiFailed?: () => void
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const endedRef = useRef(onEnded)
  const failedRef = useRef(onApiFailed)
  endedRef.current = onEnded
  failedRef.current = onApiFailed
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let player: YTPlayer | null = null
    let cancelled = false
    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !hostRef.current) return
        // a Player a megadott elemet cseréli le iframe-re — React-től függetlenül
        // létrehozott gyerek-elemet kap, hogy a React ne ütközzön vele
        const mount = document.createElement('div')
        hostRef.current.appendChild(mount)
        player = new YT.Player(mount, {
          videoId,
          playerVars: { rel: 0, modestbranding: 1 },
          events: {
            onStateChange: (e) => {
              if (e.data === YT.PlayerState.ENDED) endedRef.current()
            },
          },
        })
        setReady(true)
      })
      .catch(() => {
        if (!cancelled) failedRef.current?.()
      })
    return () => {
      cancelled = true
      try {
        player?.destroy()
      } catch {
        // már lebontott lejátszó
      }
      if (hostRef.current) hostRef.current.innerHTML = ''
    }
  }, [videoId])

  return (
    <div className="video-embed-fyb" aria-label={title}>
      <div ref={hostRef} className="yt-host" />
      {!ready && <div className="yt-loading">betöltés…</div>}
    </div>
  )
}

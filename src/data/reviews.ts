// A nyilvános oldalak (Főoldal, Időpontfoglalás) közös vélemény-adatai.
// Csak VALÓDI, a Google-adatlapon szereplő értékelések kerülhetnek ide —
// kitalált vélemény nem (ld. Fejlesztési napló, "Valós visszajelzések").

export type GoogleReview = {
  name: string
  quote: string
  /** csillagok száma, 1-5 */
  stars: number
}

export const googleReviews: GoogleReview[] = [
  {
    name: 'Tóth Barnabás',
    stars: 5,
    quote: 'Hiánypótló! Sokkal több ehhez hasonló kezdeményezésnek kellene lenni. Remélem még sok derékfájósnak tudtok irányt mutatni a gyógyulás felé.',
  },
  {
    name: 'Peter Csurgay',
    stars: 5,
    quote: 'Ülőmunkával, tenisszel, következetesen nyírtam ki a gerincemet egészen a beszakadt sérvig és műtét kapujáig. Próbáltam mindent, ez a program az első, ami tartós javulást hozott. A cél itt nem a tüneti kezelés, hanem a probléma megértése és megszűntetése.',
  },
]

export type VideoReview = {
  /** YouTube-link (watch / youtu.be / shorts / embed formátum is jó) */
  url: string
  /** opcionális felirat a videó alatt */
  caption?: string
}

export const videoReviews: VideoReview[] = []

/** a YouTube-linkből a videó azonosítója; ismeretlen formátumnál null */
export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1) || null
    if (u.hostname.endsWith('youtube.com') || u.hostname.endsWith('youtube-nocookie.com')) {
      const v = u.searchParams.get('v')
      if (v) return v
      const m = u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/)
      if (m) return m[1]
    }
  } catch {
    // érvénytelen URL
  }
  return null
}

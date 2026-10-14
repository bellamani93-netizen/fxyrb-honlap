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
  {
    name: 'Szilárd Fata',
    stars: 5,
    quote: 'Bella Mártont talán másfél éve találtam meg a Facebook-on. Sokat tanultam tőle, az anyagaiból a gerinc működéséről és úgy döntöttem, részt szeretnék venni a programjában. Egyeztettünk időpontot és elkezdtük a közös munkát. Én már az első héttől úgy éreztem megtaláltam azt a programot amit kerestem. Most egy év elteltével azt tudom mondani, hogy tünetmentes a gerincem. (MRI alapján kiszakadt sérv, kiboltosulás, csigolya elcsúszás, és kisizületi kopás) Eléggé túlterheltem a gerincemet.',
  },
  {
    name: 'Ádám Kovács',
    stars: 5,
    quote: 'Sokáig csak követtem Mártont és tanultam, majd úgy döntöttem részt veszek a programjában és teljesen megérte! Nagyon sokmindent tanultam a gerincről és a működéséről, a tornával pedig úgy érzem elég jól sikerült helyretenni, kiváncsi leszek az egésznek a végén a végeredményre 🙂 bele kell tenni a munkát és oda kell figyelni, de nagyon hatásos! Köszönöm, hogy újra működök 😃',
  },
  {
    name: 'Tibor Halupka',
    stars: 5,
    quote: 'Nekem nagyon bevált. Korrekt, egyenes kommunikáció. Nem tesznek felelőtlen ígéreteket. Ha a program során végig beleteszed a szükséges munkát, ha alkalmazod a megszerzett tudást, akkor garantált a javulás. Az én esetemben ez a gyakorlatilag teljesen fájdalommentes életet jelenti. Ezért vágtam bele, ezt vártam, ezt kaptam.',
  },
  {
    name: 'Tamás Kovács',
    stars: 5,
    quote: 'Szia Márton. Azóta is csinálom a programot 💪 Telljesen a mindennapjaim részévé vált. Hetente legalább 6szor de jellemzőbben 7szer tornázom. Most csinálom harmadjára a programot! Extra jól terhelhető vagyok. Kisebb hullámok mostmár inkább csak akkor jellemzőek amikor valamilyen betegség elkap. Fantasztikus az eredmény!',
  },
]

export type VideoReview = {
  /** YouTube-link (watch / youtu.be / shorts / embed formátum is jó) */
  url: string
  /** opcionális felirat a videó alatt */
  caption?: string
}

export const videoReviews: VideoReview[] = [
  { url: 'https://youtu.be/RQhrppEPMUw' },
  { url: 'https://youtu.be/1sQOeK1YgWI' },
  { url: 'https://youtu.be/o3KqdiRJM64' },
  { url: 'https://youtu.be/HETu7hlhaJA' },
  { url: 'https://youtu.be/BDge_Iu8R4I' },
  { url: 'https://youtu.be/KyIcI44KUdE' },
  { url: 'https://youtu.be/wk8F0dDKZNg' },
  { url: 'https://youtu.be/PVTqGHiOmo0' },
  { url: 'https://youtu.be/iAmtmwO3gtg' },
  { url: 'https://youtu.be/uZ1TQtpvz2M' },
  { url: 'https://youtu.be/atRoWNlRKLU' },
]

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

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// react-router NEM állítja alaphelyzetbe a görgetést navigáláskor — enélkül,
// ha egy hosszú oldalon lejjebb görgetve navigálunk egy másik oldalra, az ÚJ
// oldal is lejjebb görgetve jelenik meg, elrejtve a tetején lévő tartalmat
// (2026.09.02., Marci kérésére: "amikor egy ablak először nyílik meg... a
// tartalom teteje látszódjon"). Asztali nézetben maga a böngésző-ablak sosem
// görget (ld. Design jegyzet 54. pont: `.app-shell` `overflow: hidden`) — ott
// a TÉNYLEGES görgetési konténer a `.app-main`, ezért mindkettőt nullázzuk;
// mobilon (ahol a `.app-shell` sima dokumentum-görgetést használ) csak a
// `window.scrollTo` számít, a `.app-main` lekérdezés ott ártalmatlan no-op.
export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    document.querySelector('.app-main')?.scrollTo(0, 0)
  }, [pathname])
  return null
}

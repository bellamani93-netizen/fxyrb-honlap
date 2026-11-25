import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Chevron from '../components/Chevron'
import LegalMarkdown from '../components/LegalMarkdown'
import { aszfMd, adatkezelesMd, cookieMd, openCookieSettings } from '../lib/legal'

// Jogi dokumentumok oldala (ÁSZF, Adatkezelési tájékoztató, Cookie-tájékoztató).
// A szöveg az `ÁSZF/` mappa Markdown-fájljaiból jön (ld. src/lib/legal.ts).
type Doc = 'aszf' | 'adatvedelem' | 'cookie'

const TITLES: Record<Doc, string> = {
  aszf: 'Általános Szerződési Feltételek',
  adatvedelem: 'Adatkezelési tájékoztató',
  cookie: 'Cookie-tájékoztató',
}

export default function JogiOldal({ doc }: { doc: Doc }) {
  const source = doc === 'aszf' ? aszfMd : doc === 'adatvedelem' ? adatkezelesMd : cookieMd
  const { hash } = useLocation()

  // hivatkozás egy pontra (pl. /aszf#2-a-szolgaltato-adatai-impresszum)
  useEffect(() => {
    if (!hash) return
    const t = window.setTimeout(() => document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView(), 50)
    return () => window.clearTimeout(t)
  }, [hash, doc])

  return (
    <section className="py-5">
      <div className="container" style={{ maxWidth: 860 }}>
        <span className="eyebrow-fyb">jogi tájékoztatók <Chevron double /></span>
        <nav className="d-flex flex-wrap gap-3 small mb-4" aria-label="jogi dokumentumok">
          <Link to="/aszf" aria-current={doc === 'aszf' ? 'page' : undefined}>ÁSZF</Link>
          <Link to="/adatvedelem" aria-current={doc === 'adatvedelem' ? 'page' : undefined}>Adatkezelési tájékoztató</Link>
          <Link to="/cookie" aria-current={doc === 'cookie' ? 'page' : undefined}>Cookie-tájékoztató</Link>
        </nav>

        {doc === 'cookie' && (
          <>
            <h1 className="mb-3">{TITLES.cookie}</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Ez az <Link to="/adatvedelem">Adatkezelési tájékoztató</Link> 5. pontja. Hozzájárulásodat itt bármikor módosíthatod:
            </p>
            <button type="button" className="btn-fyb btn-fyb-primary mb-4" onClick={openCookieSettings}>
              sütibeállítások
            </button>
          </>
        )}

        <LegalMarkdown source={source} />

        <p className="small mt-5" style={{ color: 'var(--color-text-muted)' }}>
          Kérdésed van? Írj nekünk: <a href="mailto:info@fixyourback.hu">info@fixyourback.hu</a>
        </p>
      </div>
    </section>
  )
}

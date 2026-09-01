// A `public/`-ban lévő statikus fájlokra (ikonok, képek) az egész projektben
// gyökér-relatív ("/icons/...", "/images/...") string-ekkel hivatkozunk —
// ezeket Vite build-kor NEM írja át a konfigurált `base` (GitHub Pages
// esetén "/fxyrb-honlap/") útvonalra, mert egyszerű futásidejű JS
// string-ek, nem statikus import/HTML-attribútum, amit a build-eszköz
// elemezne. Ez a segédfüggvény pótolja ezt — mindenhol, ahol egy ilyen
// gyökér-relatív asset-útvonalat `src`/`href`-ként adunk át, ezen keresztül
// kell (2026.09.01., GitHub Pages deploy előkészítése).
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL
  return path.startsWith('/') ? `${base}${path.slice(1)}` : `${base}${path}`
}

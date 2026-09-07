// A bejelentkezett ÜF-fiók valódi neve — SALES viszi fel a naptárba, GYT
// osztja ki, és ő ad hozzáférést az ÜF-nek a honlaphoz (2026.09.07., Marci
// pontosítására) — ez a "Teljes Név", amit az Eredménylap "hogyan
// szólítsunk?" becenévvel egészít ki. Eredetileg az Allapotfelmero.tsx
// welcome-lapjának saját, nem exportált segédfüggvénye volt; mivel az
// Eredmenyeim.tsx (Eredménylap) is szüksége van rá, ide, közös helyre
// került.
export function getSessionName(fallback: string): string {
  try {
    const raw = localStorage.getItem('fyb-session')
    if (!raw) return fallback
    const session = JSON.parse(raw) as { name?: string; role?: string }
    return session.role === 'ugyfel' && session.name ? session.name : fallback
  } catch {
    return fallback
  }
}

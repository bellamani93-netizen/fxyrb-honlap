import { useState } from 'react'

const ADMIN_VIEW_KEY = 'fyb-admin-view'

export type AdminView = { id: string; name: string; role: 'gyt' | 'sales' } | null

export function getAdminView(): AdminView {
  try {
    const raw = localStorage.getItem(ADMIN_VIEW_KEY)
    return raw ? (JSON.parse(raw) as AdminView) : null
  } catch {
    return null
  }
}

export function setAdminView(view: AdminView) {
  if (view) localStorage.setItem(ADMIN_VIEW_KEY, JSON.stringify(view))
  else localStorage.removeItem(ADMIN_VIEW_KEY)
}

// Az admin, amíg egy kolléga nevében néz egy GYT/SALES oldalt, ugyanazt látja és
// szerkesztheti, amit a kolléga is látna/szerkesztene — DE minden módosítás előtt
// megerősítő ablak jelenik meg, és a módosított elem piros "admin által módosítva"
// címkét kap. Sima (nem admin-nézetben lévő) felhasználónál ez a réteg nem aktív,
// minden változatlanul, megerősítés/címke nélkül működik.
export function useAdminEditGuard(role: 'gyt' | 'sales') {
  const [active] = useState(() => getAdminView()?.role === role)
  const [pending, setPending] = useState<{ ids: string[]; action: () => void } | null>(null)
  const [modifiedIds, setModifiedIds] = useState<Set<string>>(new Set())

  function guard(id: string | string[], action: () => void) {
    const ids = Array.isArray(id) ? id : [id]
    if (active) {
      setPending({ ids, action })
    } else {
      action()
    }
  }

  function confirmPending() {
    if (!pending) return
    pending.action()
    setModifiedIds((prev) => {
      const next = new Set(prev)
      pending.ids.forEach((id) => next.add(id))
      return next
    })
    setPending(null)
  }

  function cancelPending() {
    setPending(null)
  }

  function isModified(id: string) {
    return modifiedIds.has(id)
  }

  const modal = pending ? (
    <div className="modal-backdrop-fyb" onClick={cancelPending}>
      <div className="modal-fyb card-fyb" onClick={(e) => e.stopPropagation()}>
        <p className="mb-3">biztosan módosítod?</p>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn-fyb btn-fyb-ghost" onClick={cancelPending}>nem</button>
          <button type="button" className="btn-fyb btn-fyb-danger" onClick={confirmPending}>igen</button>
        </div>
      </div>
    </div>
  ) : null

  return { active, guard, isModified, modal }
}

export function AdminModifiedBadge() {
  return <span className="admin-modified-badge">admin által módosítva</span>
}

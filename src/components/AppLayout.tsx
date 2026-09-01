import { useState } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import Icon from './Icon'
import { getAdminView, setAdminView } from '../hooks/useAdminEditGuard'

export type NavItem = {
  to?: string
  label: string
  icon: string
  locked?: boolean
  /** kis lime pötty a menüponton, benne egy számmal (pl. új ügyfelek száma). */
  badge?: number
}

const ufNavItems: NavItem[] = [
  { to: '/gyakorlatok', label: 'gyakorlatok', icon: '/icons/ikon_torna.svg' },
  { to: '/konzultacioim', label: 'konzultációk', icon: '/icons/ikon_naptar.svg' },
  { label: 'checklist', icon: '/icons/ikon_checklist.svg', locked: true },
  { label: 'munkafüzet', icon: '/icons/ikon_munkafuzet.svg', locked: true },
  { label: 'oktatóanyag', icon: '/icons/ikon_tanulas.svg', locked: true },
  { label: 'eredményeim', icon: '/icons/ikon_csillag.svg', locked: true },
  { label: 'állapotfelmérő', icon: '/icons/ikon_kerdoiv.svg', locked: true },
  { label: 'kérdéseim', icon: '/icons/ikon_csengo.svg', locked: true },
]

type AppLayoutProps = {
  navItems?: NavItem[]
  userName?: string
  role?: 'ugyfel' | 'gyt' | 'sales' | 'admin'
}

function sessionName(role: 'ugyfel' | 'gyt' | 'sales' | 'admin' | undefined, fallback: string): string {
  if (!role) return fallback
  // ha az admin épp egy kolléga nevében néz egy GYT/SALES oldalt, a köszöntés
  // is az Ő nevét mutassa — pontosan azt kell látnia, amit a kolléga is látna
  if (role === 'gyt' || role === 'sales') {
    const view = getAdminView()
    if (view && view.role === role) return view.name
  }
  try {
    const raw = localStorage.getItem('fyb-session')
    if (!raw) return fallback
    const session = JSON.parse(raw) as { name?: string; role?: string }
    return session.role === role && session.name ? session.name : fallback
  } catch {
    return fallback
  }
}

export default function AppLayout({ navItems = ufNavItems, userName = 'Péter', role }: AppLayoutProps) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const displayName = sessionName(role, userName)
  const adminView = (role === 'gyt' || role === 'sales') ? getAdminView() : null
  const isAdminImpersonating = !!adminView && adminView.role === role

  function exitAdminView() {
    setAdminView(null)
    navigate('/admin/munkatarsak')
  }

  return (
    <div className="app-shell">
      <div className="app-topbar d-lg-none">
        <div className="app-topbar-row">
          <div className="brand-logo">
            <img src="/images/logo-light-bg.png" alt="Fix Your Back" className="brand-logo-img logo-for-light" />
            <img src="/images/logo-dark-bg.png" alt="Fix Your Back" className="brand-logo-img logo-for-dark" />
          </div>
          <div className="app-topbar-greeting">Szia, {displayName}!</div>
          <button type="button" className="btn-fyb btn-fyb-ghost" aria-label="menü" onClick={() => setOpen(true)}>
            ☰
          </button>
        </div>
      </div>

      {open && <div className="app-sidebar-backdrop d-lg-none" onClick={() => setOpen(false)} />}

      <aside className={`app-sidebar ${open ? 'open' : ''}`}>
        <div className="app-sidebar-top">
          <div className="brand-logo">
            <img src="/images/logo-light-bg.png" alt="Fix Your Back" className="brand-logo-img logo-for-light" />
            <img src="/images/logo-dark-bg.png" alt="Fix Your Back" className="brand-logo-img logo-for-dark" />
          </div>
          <button type="button" className="app-sidebar-close d-lg-none" aria-label="menü bezárása" onClick={() => setOpen(false)}>
            ✕
          </button>
        </div>

        <div className="app-sidebar-user">
          <div className="app-sidebar-avatar">
            <Icon src="/icons/ikon_fiok.svg" />
          </div>
          <div className="fw-bold">Szia, {displayName}!</div>
        </div>

        <nav className="app-sidebar-nav">
          {navItems.map((item) =>
            item.locked ? (
              <span key={item.label} className="app-sidebar-link is-locked">
                <Icon src={item.icon} />
                <span className="flex-grow-1">{item.label}</span>
                <Icon src="/icons/ikon_lakat.svg" style={{ width: '1em', height: '1em' }} />
              </span>
            ) : (
              <NavLink key={item.label} to={item.to ?? '/'} className="app-sidebar-link" onClick={() => setOpen(false)}>
                <Icon src={item.icon} />
                <span className="flex-grow-1">{item.label}</span>
                {!!item.badge && <span className="nav-badge-dot">{item.badge}</span>}
              </NavLink>
            )
          )}
        </nav>

        <div className="app-sidebar-bottom">
          <Link
            to="/"
            className="app-sidebar-link"
            onClick={() => {
              setOpen(false)
              localStorage.removeItem('fyb-session')
              localStorage.removeItem('fyb-gyt-client')
              setAdminView(null)
            }}
          >
            <Icon src="/icons/ikon_vissza.svg" />
            <span className="flex-grow-1">kijelentkezés</span>
          </Link>
          <div className="d-flex align-items-center justify-content-between px-3 py-2">
            <span className="small" style={{ color: 'var(--color-text-muted)' }}>megjelenés</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <main className="app-main">
        {isAdminImpersonating && (
          <div className="admin-view-banner">
            <span>admin nézet — éppen <strong>{adminView!.name}</strong> felületét látod</span>
            <button type="button" className="btn-fyb btn-fyb-outline" style={{ padding: '0.3rem 0.9rem', fontSize: '0.8rem' }} onClick={exitAdminView}>
              kilépés az admin nézetből
            </button>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  )
}

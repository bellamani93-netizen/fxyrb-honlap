import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import Icon from './Icon'

const navItems = [
  { to: '/gyakorlatok', label: 'gyakorlatok', icon: '/icons/ikon_torna.svg' },
  { label: 'checklist', icon: '/icons/ikon_checklist.svg', locked: true },
  { label: 'munkafüzet', icon: '/icons/ikon_munkafuzet.svg', locked: true },
  { label: 'oktatóanyag', icon: '/icons/ikon_tanulas.svg', locked: true },
  { label: 'eredményeim', icon: '/icons/ikon_csillag.svg', locked: true },
  { label: 'állapotfelmérő', icon: '/icons/ikon_kerdoiv.svg', locked: true },
  { label: 'kérdéseim', icon: '/icons/ikon_csengo.svg', locked: true },
]

export default function AppLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="app-shell">
      <div className="app-topbar d-lg-none">
        <Link to="/" className="brand-logo">
          <img src="/images/logo-light-bg.png" alt="Fix Your Back" className="brand-logo-img logo-for-light" />
          <img src="/images/logo-dark-bg.png" alt="Fix Your Back" className="brand-logo-img logo-for-dark" />
        </Link>
        <button type="button" className="btn-fyb btn-fyb-ghost" aria-label="menü" onClick={() => setOpen(true)}>
          ☰
        </button>
      </div>

      {open && <div className="app-sidebar-backdrop d-lg-none" onClick={() => setOpen(false)} />}

      <aside className={`app-sidebar ${open ? 'open' : ''}`}>
        <div className="app-sidebar-top">
          <Link to="/" className="brand-logo" onClick={() => setOpen(false)}>
            <img src="/images/logo-light-bg.png" alt="Fix Your Back" className="brand-logo-img logo-for-light" />
            <img src="/images/logo-dark-bg.png" alt="Fix Your Back" className="brand-logo-img logo-for-dark" />
          </Link>
          <button type="button" className="app-sidebar-close d-lg-none" aria-label="menü bezárása" onClick={() => setOpen(false)}>
            ✕
          </button>
        </div>

        <div className="app-sidebar-user">
          <div className="app-sidebar-avatar">A</div>
          <div>
            <div className="fw-bold">Szia, Anna!</div>
            <div className="small" style={{ color: 'var(--color-text-muted)' }}>ügyfél</div>
          </div>
        </div>

        <nav className="app-sidebar-nav">
          {navItems.map((item) =>
            item.locked ? (
              <span key={item.label} className="app-sidebar-link is-locked">
                <Icon src={item.icon} />
                <span className="flex-grow-1">{item.label}</span>
                <Icon src="/icons/ikon_lakat.svg" style={{ width: '0.85em', height: '0.85em' }} />
              </span>
            ) : (
              <NavLink key={item.label} to={item.to ?? '/'} className="app-sidebar-link" onClick={() => setOpen(false)}>
                <Icon src={item.icon} />
                <span className="flex-grow-1">{item.label}</span>
              </NavLink>
            )
          )}
        </nav>

        <div className="app-sidebar-bottom">
          <Link to="/" className="app-sidebar-link" onClick={() => setOpen(false)}>
            <Icon src="/icons/ikon_vissza.svg" />
            <span className="flex-grow-1">vissza a főoldalra</span>
          </Link>
          <div className="d-flex align-items-center justify-content-between px-3 py-2">
            <span className="small" style={{ color: 'var(--color-text-muted)' }}>megjelenés</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}

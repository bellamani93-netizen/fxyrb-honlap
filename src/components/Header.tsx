import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import Icon from './Icon'
import { withBase } from '../lib/assetUrl'

const navItems = [
  { to: '/', label: 'főoldal' },
  { to: '/melyedukacio', label: 'mélyedukáció' },
  { to: '/mini-kurzus', label: 'mini-kurzus' },
  { to: '/idopontfoglalas', label: 'időpontfoglalás', locked: true },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="container d-flex flex-wrap align-items-center justify-content-between py-3 gap-3">
        <NavLink to="/" className="brand-logo order-lg-1" onClick={() => setOpen(false)}>
          <img src={withBase("/images/logo-light-bg.png")} alt="Fix Your Back" className="brand-logo-img logo-for-light" />
          <img src={withBase("/images/logo-dark-bg.png")} alt="Fix Your Back" className="brand-logo-img logo-for-dark" />
        </NavLink>

        <div className="d-flex align-items-center gap-2 order-lg-3">
          <ThemeToggle />
          <button
            type="button"
            className="btn-fyb btn-fyb-ghost d-lg-none"
            aria-label="menü"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </button>
        </div>

        <nav
          className={`site-nav ${open ? 'd-flex' : 'd-none'} d-lg-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-1 order-lg-2`}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="nav-link-fyb d-flex align-items-center gap-1"
              onClick={() => setOpen(false)}
            >
              {item.label}
              {item.locked && (
                <Icon src="/icons/ikon_lakat.svg" style={{ width: '0.85em', height: '0.85em', opacity: 0.7 }} label="feltételes hozzáférés" />
              )}
            </NavLink>
          ))}
          <NavLink to="/belepes" className="nav-link-fyb" onClick={() => setOpen(false)}>
            belépés
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

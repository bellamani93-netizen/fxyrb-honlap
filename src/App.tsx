import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import AppLayout, { type NavItem } from './components/AppLayout'
import Home from './pages/Home'
import Blog from './pages/Blog'
import MiniKurzus from './pages/MiniKurzus'
import Idopontfoglalas from './pages/Idopontfoglalas'
import Belepes from './pages/Belepes'
import Gyakorlatok from './pages/Gyakorlatok'
import GytUgyfelek from './pages/GytUgyfelek'
import GytVideokiosztas from './pages/GytVideokiosztas'
import SalesHozzarendeles from './pages/SalesHozzarendeles'
import AdminMunkatarsak from './pages/AdminMunkatarsak'

const gytNavItems: NavItem[] = [
  { to: '/gyt/ugyfelek', label: 'ügyfeleim', icon: '/icons/ikon_kezdolap.svg' },
  { to: '/gyt/videokiosztas', label: 'videókiosztás', icon: '/icons/ikon_video.svg' },
  { label: 'dokumentáció', icon: '/icons/ikon_munkafuzet.svg', locked: true },
  { label: 'munkafüzet', icon: '/icons/ikon_tanulas.svg', locked: true },
  { label: 'checklist', icon: '/icons/ikon_checklist.svg', locked: true },
  { label: 'oktatóanyag', icon: '/icons/ikon_villanykorte.svg', locked: true },
  { label: 'eredmények', icon: '/icons/ikon_csillag.svg', locked: true },
  { label: 'állapotfelmérő', icon: '/icons/ikon_kerdoiv.svg', locked: true },
  { label: 'kérdések', icon: '/icons/ikon_csengo.svg', locked: true },
  { label: 'kapacitás', icon: '/icons/ikon_naptar.svg', locked: true },
]

const salesNavItems: NavItem[] = [
  { to: '/sales/hozzarendeles', label: 'hozzárendelés', icon: '/icons/ikon_plusz.svg' },
]

const adminNavItems: NavItem[] = [
  { to: '/admin/munkatarsak', label: 'munkatársak', icon: '/icons/ikon_kezdolap.svg' },
  { label: 'statisztikák', icon: '/icons/ikon_csillag.svg', locked: true },
]

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/mini-kurzus" element={<MiniKurzus />} />
        <Route path="/idopontfoglalas" element={<Idopontfoglalas />} />
        <Route path="/belepes" element={<Belepes />} />
      </Route>
      <Route element={<AppLayout role="ugyfel" />}>
        <Route path="/gyakorlatok" element={<Gyakorlatok />} />
      </Route>
      <Route element={<AppLayout navItems={gytNavItems} userName="Judit" role="gyt" />}>
        <Route path="/gyt/ugyfelek" element={<GytUgyfelek />} />
        <Route path="/gyt/videokiosztas" element={<GytVideokiosztas />} />
      </Route>
      <Route element={<AppLayout navItems={salesNavItems} userName="Eszter" role="sales" />}>
        <Route path="/sales/hozzarendeles" element={<SalesHozzarendeles />} />
      </Route>
      <Route element={<AppLayout navItems={adminNavItems} userName="Anna" role="admin" />}>
        <Route path="/admin/munkatarsak" element={<AdminMunkatarsak />} />
      </Route>
    </Routes>
  )
}

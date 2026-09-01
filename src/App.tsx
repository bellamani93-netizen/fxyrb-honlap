import { Routes, Route, Outlet } from 'react-router-dom'
import Layout from './components/Layout'
import AppLayout, { type NavItem } from './components/AppLayout'
import Home from './pages/Home'
import Blog from './pages/Blog'
import MiniKurzus from './pages/MiniKurzus'
import Idopontfoglalas from './pages/Idopontfoglalas'
import Belepes from './pages/Belepes'
import Gyakorlatok from './pages/Gyakorlatok'
import UgyfelKonzultaciok from './pages/UgyfelKonzultaciok'
import GytUgyfelek from './pages/GytUgyfelek'
import GytVideokiosztas from './pages/GytVideokiosztas'
import GytNaptar from './pages/GytNaptar'
import SalesHivasaim from './pages/SalesHivasaim'
import SalesHozzarendeles from './pages/SalesHozzarendeles'
import SalesUzenetek from './pages/SalesUzenetek'
import AdminMunkatarsak from './pages/AdminMunkatarsak'
import { SalesDataProvider } from './context/SalesDataContext'
import { CalendarProvider } from './context/CalendarContext'
import { ClientsProvider, useClients } from './context/ClientsContext'
import { LOGGED_IN_GYT_ID } from './data/colleagues'

function buildGytNavItems(newClientsCount: number): NavItem[] {
  return [
    { to: '/gyt/ugyfelek', label: 'ügyfeleim', icon: '/icons/ikon_kezdolap.svg', badge: newClientsCount || undefined },
    { to: '/gyt/videokiosztas', label: 'videókiosztás', icon: '/icons/ikon_video.svg' },
    { to: '/gyt/naptar', label: 'naptár', icon: '/icons/ikon_naptar.svg' },
    { label: 'dokumentáció', icon: '/icons/ikon_munkafuzet.svg', locked: true },
    { label: 'munkafüzet', icon: '/icons/ikon_tanulas.svg', locked: true },
    { label: 'checklist', icon: '/icons/ikon_checklist.svg', locked: true },
    { label: 'oktatóanyag', icon: '/icons/ikon_villanykorte.svg', locked: true },
    { label: 'eredmények', icon: '/icons/ikon_csillag.svg', locked: true },
    { label: 'állapotfelmérő', icon: '/icons/ikon_kerdoiv.svg', locked: true },
    { label: 'kérdések', icon: '/icons/ikon_csengo.svg', locked: true },
  ]
}

const salesNavItems: NavItem[] = [
  { to: '/sales/hivasaim', label: 'hívásaim', icon: '/icons/ikon_naptar.svg' },
  { to: '/sales/hozzarendeles', label: 'hozzárendelések', icon: '/icons/ikon_plusz.svg' },
  { to: '/sales/uzenetek', label: 'üzenetek', icon: '/icons/ikon_csengo.svg' },
]

const adminNavItems: NavItem[] = [
  { to: '/admin/munkatarsak', label: 'munkatársak', icon: '/icons/ikon_kezdolap.svg' },
  { label: 'statisztikák', icon: '/icons/ikon_csillag.svg', locked: true },
]

export default function App() {
  return (
    <ClientsProvider>
      <CalendarProvider>
        <AppRoutes />
      </CalendarProvider>
    </ClientsProvider>
  )
}

// külön komponens, hogy a nav-menü "új ügyfél" pöttye REAKTÍVAN kövesse a
// közös ügyfél-listát (ld. Design jegyzet 49. pont) — a hook csak a
// Provider-en BELÜL hívható, ezért nem lehet magában az App()-ban, ami a
// Providert maga rendereli.
function AppRoutes() {
  const { clients } = useClients()
  const newClientsCount = clients.filter((c) => c.assignedGytId === LOGGED_IN_GYT_ID && c.isNew).length
  const gytNavItems = buildGytNavItems(newClientsCount)

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
        <Route path="/konzultacioim" element={<UgyfelKonzultaciok />} />
      </Route>
      <Route element={<AppLayout navItems={gytNavItems} userName="Judit" role="gyt" />}>
        <Route path="/gyt/ugyfelek" element={<GytUgyfelek />} />
        <Route path="/gyt/videokiosztas" element={<GytVideokiosztas />} />
        <Route path="/gyt/naptar" element={<GytNaptar />} />
      </Route>
      <Route element={<AppLayout navItems={salesNavItems} userName="Eszter" role="sales" />}>
        <Route element={<SalesDataProvider><Outlet /></SalesDataProvider>}>
          <Route path="/sales/hivasaim" element={<SalesHivasaim />} />
          <Route path="/sales/hozzarendeles" element={<SalesHozzarendeles />} />
          <Route path="/sales/uzenetek" element={<SalesUzenetek />} />
        </Route>
      </Route>
      <Route element={<AppLayout navItems={adminNavItems} userName="Anna" role="admin" />}>
        <Route path="/admin/munkatarsak" element={<AdminMunkatarsak />} />
      </Route>
    </Routes>
  )
}

import { Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import AppLayout, { type NavItem } from './components/AppLayout'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import MelyEdukacio from './pages/MelyEdukacio'
import MelyEdukacioCikk from './pages/MelyEdukacioCikk'
import Gyorsitosav from './pages/Gyorsitosav'
import GyorsitosavKesz from './pages/GyorsitosavKesz'
import AdminGyorsitosav from './pages/AdminGyorsitosav'
import Idopontfoglalas from './pages/Idopontfoglalas'
import JogiOldal from './pages/JogiOldal'
import Belepes from './pages/Belepes'
import Allapotfelmero from './pages/Allapotfelmero'
import Gyakorlatok from './pages/Gyakorlatok'
import Checklist from './pages/Checklist'
import GytChecklist from './pages/GytChecklist'
import Munkafuzet from './pages/Munkafuzet'
import Oktatoanyag from './pages/Oktatoanyag'
import Eredmenyeim from './pages/Eredmenyeim'
import UgyfelKonzultaciok from './pages/UgyfelKonzultaciok'
import GytUgyfelek from './pages/GytUgyfelek'
import GytVideokiosztas from './pages/GytVideokiosztas'
import GytNaptar from './pages/GytNaptar'
import GytAllapotfelmerok from './pages/GytAllapotfelmerok'
import GytMunkafuzet from './pages/GytMunkafuzet'
import GytDokumentacio from './pages/GytDokumentacio'
import GytDokumentacioBeallitasok from './pages/GytDokumentacioBeallitasok'
import SalesHivasaim from './pages/SalesHivasaim'
import SalesHozzarendeles from './pages/SalesHozzarendeles'
import SalesUzenetek from './pages/SalesUzenetek'
import AdminMunkatarsak from './pages/AdminMunkatarsak'
import AdminBlog from './pages/AdminBlog'
import AdminAnyagok from './pages/AdminAnyagok'
import { SalesDataProvider, useSalesData } from './context/SalesDataContext'
import { CalendarProvider } from './context/CalendarContext'
import { ClientsProvider, useClients } from './context/ClientsContext'
import { BlogProvider } from './context/BlogContext'
import { MaterialsProvider } from './context/MaterialsContext'
import { GyorsitosavProvider } from './context/GyorsitosavContext'
import { OktatoanyagProvider } from './context/OktatoanyagContext'
import { WorkbookProvider } from './context/WorkbookContext'
import { DokumentacioProvider } from './context/DokumentacioContext'
import { ChecklistProvider } from './context/ChecklistContext'
import { AllapotfelmeroProvider, useAllapotfelmero } from './context/AllapotfelmeroContext'
import { KerdesekProvider, countUnseenQuestions, useKerdesek } from './context/KerdesekContext'
import Kerdeseim from './pages/Kerdeseim'
import GytKerdesek from './pages/GytKerdesek'
import GytOktatoanyag from './pages/GytOktatoanyag'
import GytUtankoveses from './pages/GytUtankoveses'
import Utankoveses from './pages/Utankoveses'
import { UtankovetesProvider } from './context/UtankovetesContext'
import { LOGGED_IN_GYT_ID } from './data/colleagues'
import { getSelectedClientId } from './data/initialClients'

// A GYT menüsor sorrendje (Marci pontos diktálása): ügyfeleim, dokumentáció,
// videókiosztás, munkafüzet, checklist, kérdések, naptár, utánkövetés,
// dokumentáció beállításai, utána a többi (állapotfelmérők, oktatóanyag — az
// összes videó csak olvasható listája —, és a még zárolt eredmények helyőrző).
// - "kérdések": az ügyfelek szabad szöveges kérdései, hozzászólásban
//   megválaszolhatók; a pötty a még meg nem nyitott kérdések száma (közös
//   beérkező, ezért NEM a GytClientGate alá kerül).
// - "munkafüzet", "checklist": CSAK olvasható nézet az ÜF adatairól.
// - "utánkövetés": a 10 hetet végigjárt, 14 hetes utánkövetésben lévő
//   ügyfelek heti csoportos mítingje (idő, Meet link, férőhelyek).
// - "dokumentáció beállításai": közös (nem ügyfelenkénti) sablon, ezért
//   szintén a GytClientGate-en kívül él.
function buildGytNavItems(newClientsCount: number, unseenQuestions: number): NavItem[] {
  return [
    { to: '/gyt/ugyfelek', label: 'ügyfeleim', icon: '/icons/ikon_kezdolap.svg', badge: newClientsCount || undefined },
    { to: '/gyt/dokumentacio', label: 'dokumentáció', icon: '/icons/ikon_munkafuzet.svg' },
    { to: '/gyt/videokiosztas', label: 'videókiosztás', icon: '/icons/ikon_video.svg' },
    { to: '/gyt/munkafuzet', label: 'munkafüzet', icon: '/icons/ikon_tanulas.svg' },
    { to: '/gyt/checklist', label: 'checklist', icon: '/icons/ikon_checklist.svg' },
    { to: '/gyt/kerdesek', label: 'kérdések', icon: '/icons/ikon_csengo.svg', badge: unseenQuestions || undefined },
    { to: '/gyt/naptar', label: 'naptár', icon: '/icons/ikon_naptar.svg' },
    { to: '/gyt/utankovetes', label: 'utánkövetés', icon: '/icons/ikon_szintek.svg' },
    { to: '/gyt/dokumentacio-beallitasok', label: 'dokumentáció beállításai', icon: '/icons/ikon_beallitasok.svg' },
    { to: '/gyt/allapotfelmerok', label: 'állapotfelmérők', icon: '/icons/ikon_kerdoiv.svg' },
    { to: '/gyt/oktatoanyag', label: 'oktatóanyag', icon: '/icons/ikon_villanykorte.svg' },
    { label: 'eredmények', icon: '/icons/ikon_csillag.svg', locked: true },
  ]
}

// a "hívásaim" pötty ugyanúgy egy friss, még el nem bírált Calendly-
// foglalást jelez, mint a GYT "ügyfeleim" pöttye az új ügyfelet
// (2026.09.16., Marci kérésére: "új sales foglalásokat ugyanúgy jelöljük,
// mint a gyt fiók új ügyfél-jelzését").
function buildSalesNavItems(newCallsCount: number): NavItem[] {
  return [
    { to: '/sales/hivasaim', label: 'hívásaim', icon: '/icons/ikon_naptar.svg', badge: newCallsCount || undefined },
    { to: '/sales/hozzarendeles', label: 'hozzárendelések', icon: '/icons/ikon_plusz.svg' },
    { to: '/sales/uzenetek', label: 'üzenetek', icon: '/icons/ikon_csengo.svg' },
  ]
}

const adminNavItems: NavItem[] = [
  { to: '/admin/munkatarsak', label: 'munkatársak', icon: '/icons/ikon_kezdolap.svg' },
  { to: '/admin/blog', label: 'blog', icon: '/icons/ikon_munkafuzet.svg' },
  // "anyagok kezelése" (2026.09.17., Marci kérésére: "legyen egy új
  // oldalsávelem: anyagok kezelése") — videók feltöltése a videókiosztás
  // meglévő kódjaihoz, ill. teljesen új, egyedi kódú/című videó létrehozása.
  { to: '/admin/anyagok', label: 'anyagok kezelése', icon: '/icons/ikon_video.svg' },
  { to: '/admin/gyorsitosav', label: 'gyorsítósáv', icon: '/icons/ikon_szintek.svg' },
  { label: 'statisztikák', icon: '/icons/ikon_csillag.svg', locked: true },
]

export default function App() {
  return (
    <GyorsitosavProvider>
    <KerdesekProvider>
    <UtankovetesProvider>
    <ClientsProvider>
      <CalendarProvider>
        {/* a SalesDataProvider korábban csak a /sales/* útvonalak alatt
           élt (ld. AppRoutes lent) — mostantól ITT, a többi állapot-
           providerrel egy szinten, mert a "hívásaim" oldalsáv-pötty
           (2026.09.16., Marci kérésére, ld. buildSalesNavItems) az
           AppLayout-nak (ami az AppRoutes ÁGA FÖLÖTT, a Route elemek
           SZÜLŐJEKÉNT rendereli a menüsávot) már A ROUTE-VÁLTÁS ELŐTT
           szüksége van a `salesCalls`-ra — ugyanaz a minta, mint a GYT
           "ügyfeleim" pöttyénél a ClientsProvider esetében. */}
        <SalesDataProvider>
          <BlogProvider>
            <MaterialsProvider>
              <OktatoanyagProvider>
                <WorkbookProvider>
                  <DokumentacioProvider>
                    <ChecklistProvider>
                      <AllapotfelmeroProvider>
                        <AppRoutes />
                      </AllapotfelmeroProvider>
                    </ChecklistProvider>
                  </DokumentacioProvider>
                </WorkbookProvider>
              </OktatoanyagProvider>
            </MaterialsProvider>
          </BlogProvider>
        </SalesDataProvider>
      </CalendarProvider>
    </ClientsProvider>
    </UtankovetesProvider>
    </KerdesekProvider>
    </GyorsitosavProvider>
  )
}

// az ÜF fiók állapotfelmérője a fiók LEGELSŐ, kötelező pontja (2026.09.03.,
// Marci kérésére) — amíg nincs kitöltve és elmentve, a többi ÜF-oldali
// útvonal közvetlen megnyitása (URL-be írva, vagy vissza-gombbal) is ide
// irányít, nem csak a menüsáv zárolt megjelenése tiltja (ld. AppLayout.tsx).
function UgyfelGate() {
  const { completed } = useAllapotfelmero()
  if (!completed) return <Navigate to="/allapotfelmero" replace />
  return <Outlet />
}

// GYT-oldali ügyfél-kapu (2026.09.21., Marci kérésére: "ha a gyt belép,
// akkor nincsen alapértelmezetten kiválasztva üf. Ha nem a naptárat
// választja a menüsorból, hanem mást, akkor ugorjon oda az ügyfeleim
// fülre... majd a választás után ugorjon vissza automatikusan a
// kiválasztott menüpontra.") — a "naptár" (nincs ügyfél-specifikus
// tartalma) és maga az "ügyfeleim" (a választó oldal) KÍVÜL marad ezen a
// kapun, minden más GYT-oldal (videókiosztás, állapotfelmérők, munkafüzet)
// ALÁJA kerül a Route-fában. Korábban (150-153. pont) ez a 3 oldal
// egyenként, saját belső "select-client-notice" üzenettel jelezte ugyanezt
// — az a minta most a nav-menü szintjére került, és feleslegessé vált,
// ezért törölve lett az érintett oldalakból. A `state.from` ugyanaz a
// mechanizmus, amit a 153. pontban már bevezettünk — csak eddig kézzel,
// az oldalak saját "ügyfeleim megnyitása" gombjából hívtuk meg, mostantól
// automatikusan, a route-váltáskor.
function GytClientGate() {
  const location = useLocation()
  const clientId = getSelectedClientId()
  if (!clientId) {
    return <Navigate to="/gyt/ugyfelek" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

// külön komponens, hogy a nav-menü "új ügyfél" pöttye REAKTÍVAN kövesse a
// közös ügyfél-listát (ld. Design jegyzet 49. pont) — a hook csak a
// Provider-en BELÜL hívható, ezért nem lehet magában az App()-ban, ami a
// Providert maga rendereli.
function AppRoutes() {
  const { clients } = useClients()
  const newClientsCount = clients.filter((c) => c.assignedGytId === LOGGED_IN_GYT_ID && c.isNew).length
  const { kerdesek } = useKerdesek()
  const ownClientIds = new Set(clients.filter((c) => c.assignedGytId === LOGGED_IN_GYT_ID).map((c) => c.id))
  const gytNavItems = buildGytNavItems(newClientsCount, countUnseenQuestions(kerdesek, ownClientIds))
  const { salesCalls } = useSalesData()
  const newSalesCallsCount = salesCalls.filter((c) => c.isNew).length
  const salesNavItems = buildSalesNavItems(newSalesCallsCount)

  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/melyedukacio" element={<MelyEdukacio />} />
        <Route path="/melyedukacio/:id" element={<MelyEdukacioCikk />} />
        <Route path="/gyorsitosav" element={<Gyorsitosav />} />
        <Route path="/gyorsitosav/kesz" element={<GyorsitosavKesz />} />
        <Route path="/idopontfoglalas" element={<Idopontfoglalas />} />
        <Route path="/belepes" element={<Belepes />} />
        <Route path="/aszf" element={<JogiOldal title="ÁSZF" />} />
        <Route path="/adatvedelem" element={<JogiOldal title="Adatvédelmi tájékoztató" />} />
        <Route path="/cookie" element={<JogiOldal title="Cookie-tájékoztató" />} />
      </Route>
      <Route element={<AppLayout role="ugyfel" />}>
        <Route path="/allapotfelmero" element={<Allapotfelmero />} />
        <Route element={<UgyfelGate />}>
          <Route path="/gyakorlatok" element={<Gyakorlatok />} />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/konzultacioim" element={<UgyfelKonzultaciok />} />
          <Route path="/oktatoanyag" element={<Oktatoanyag />} />
          <Route path="/munkafuzet" element={<Munkafuzet />} />
          <Route path="/eredmenyeim" element={<Eredmenyeim onboarding />} />
          <Route path="/kerdeseim" element={<Kerdeseim />} />
          <Route path="/utankovetes" element={<Utankoveses />} />
        </Route>
      </Route>
      <Route element={<AppLayout navItems={gytNavItems} userName="Judit" role="gyt" />}>
        <Route path="/gyt/ugyfelek" element={<GytUgyfelek />} />
        <Route path="/gyt/naptar" element={<GytNaptar />} />
        <Route path="/gyt/kerdesek" element={<GytKerdesek />} />
        <Route path="/gyt/oktatoanyag" element={<GytOktatoanyag />} />
        <Route path="/gyt/utankovetes" element={<GytUtankoveses />} />
        <Route path="/gyt/dokumentacio-beallitasok" element={<GytDokumentacioBeallitasok />} />
        <Route element={<GytClientGate />}>
          <Route path="/gyt/videokiosztas" element={<GytVideokiosztas />} />
          <Route path="/gyt/allapotfelmerok" element={<GytAllapotfelmerok />} />
          <Route path="/gyt/munkafuzet" element={<GytMunkafuzet />} />
          <Route path="/gyt/dokumentacio" element={<GytDokumentacio />} />
          <Route path="/gyt/checklist" element={<GytChecklist />} />
        </Route>
      </Route>
      <Route element={<AppLayout navItems={salesNavItems} userName="Eszter" role="sales" />}>
        <Route path="/sales/hivasaim" element={<SalesHivasaim />} />
        <Route path="/sales/hozzarendeles" element={<SalesHozzarendeles />} />
        <Route path="/sales/uzenetek" element={<SalesUzenetek />} />
      </Route>
      <Route element={<AppLayout navItems={adminNavItems} userName="Anna" role="admin" />}>
        <Route path="/admin/munkatarsak" element={<AdminMunkatarsak />} />
        <Route path="/admin/blog" element={<AdminBlog />} />
        <Route path="/admin/anyagok" element={<AdminAnyagok />} />
        <Route path="/admin/gyorsitosav" element={<AdminGyorsitosav />} />
      </Route>
      </Routes>
    </>
  )
}

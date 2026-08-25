# Fejlesztési napló

Ez a fájl a projekt fejlesztése során hozott döntéseket és mérföldköveket rögzíti időrendben. Cél: bármikor visszakövethető legyen, mi miért történt.

## 2026.08.25. — projekt alapszabályok, technikai alapok, Főoldal

**Alapszabályok (Marci rögzítette):**
1. Csak akkor kezdünk munkába, ha minden részlet tiszta — nyitott kérdéseknél előbb egyeztetünk.
2. Ez egy UI terv (kattintható wireframe/prototípus), nincs adatbázis vagy backend — a végeredményt egy programozó fogja implementálni.
3. Tech stack: React + TSX + Bootstrap, minimális egyedi CSS-sel kiegészítve. Git verziókezelés, commit minden érdemi változás után. A fejlesztés lépéseit és fontos részleteket .md fájlokban dokumentáljuk. A stílus mindig a rögzített Design jegyzet-et követi.

**Bemeneti dokumentumok rögzítve:** `Projket specifikáció.md` (eredeti követelmény-lista), `Design jegyzet.md` (design rendszer), `Design elemek/` (17 SVG ikon, korábbi látványtervek, PDF-minta).

**Tisztázó kérdések és válaszok:**
- **UI terv sorrendje (fázisok):** 1) Főoldal + aloldalak (blog, mini-kurzus, időpontfoglalás) → 2) Bejelentkezés/Regisztráció → 3) Egyedi videókiosztás + online tananyag → 4) Felvételi kérdőív + eredménylap → 5) Checklist → 6) GYT dokumentáció → 7) Gamification.
- **Body-chart (fájdalom-jelölő testábra):** a `Design elemek/felvételi lap...` képekben lévő kidolgozott elöl-hátul látványterv a végleges referencia (nem újratervezés), a jelenlegi lime/teal/navy palettához igazítva — lásd Design jegyzet 5. és új megjegyzés.
- **Korábbi narancssárga mockupok** (`webalkalmazás phone látvány.png`): csak a szerkezet/folyamat vehető át referenciaként, színben mindig a lezárt paletta követendő — lásd Design jegyzet 8. pont.

**Technikai alapok:**
- Node.js (v26) és Homebrew telepítve a gépre (korábban hiányoztak).
- Vite + React + TypeScript scaffold a projekt gyökerében (`npm create vite -- --template react-ts`), kiegészítve `bootstrap` és `react-router-dom` csomagokkal.
- `src/styles/theme.css`: CSS-változók (színek, tipográfia, radius, árnyék) a Design jegyzet 2–4. pontja alapján, `html[data-theme="dark"]` felülírással.
- `src/styles/components.css`: újrafelhasználható komponens-osztályok (gombok, kártya, badge, eyebrow, folyamat-lépések, modul-lista, lezárt-kártya, testimonial, videó-kártya, hírlevél-panel, fejléc/lábléc) a Design jegyzet 5. pontja alapján.
- Google Fonts betöltve (Poppins 700 címsorokhoz, Montserrat 400/500/700 törzsszöveghez).
- A 17 ikon átmásolva `public/icons/`-ba, fájlnevek ékezet nélkülre alakítva, `stroke`/`fill` `currentColor`-ra cserélve a témaváltás miatt.
- `.claude/launch.json` létrehozva a helyi dev szerver indításához (`npm run dev`, port 5173).

**Elkészült: Főoldal + aloldalak (1. fázis, UI terv szinten)**
- `Header` (logó + chevron márkajel, navigáció, sötét/világos váltó `localStorage`-mentéssel, mobil hamburger-menü), `Footer`, közös `Layout`.
- Oldalak: Főoldal (hero, kinek/miben/hogyan segítünk, folyamat-lépések, visszajelzések, hírlevél-panel), Blog (poszt-kártyák), Mini-kurzus (4 videó + zárolt CTA az időpontfoglalóhoz), Időpontfoglalás (leírás, visszajelzések, Calendly-beágyazás helye).
- Böngészőben tesztelve: világos/sötét mód, asztali és mobil (375px) nézet, navigáció.
- **Javított hiba:** a mobil hamburger-menü kezdetben a fejléc sorába szorult be (Bootstrap `w-100`/`w-lg-auto` utility-ütközés miatt); egyedi `.site-nav` CSS-szabállyal javítva, most teljes szélességű, legördülő menüként jelenik meg.

## 2026.08.25. — Design korrekció: valódi márka-grafikák beépítése

Marci feltöltötte a `Design elemek` mappába a végleges hero-fotót (`kép.png`), az aláírás-grafikát (`signo_blue.png`) és a logót (`original logo.png`), majd korrekciókat kért ezek beépítésére.

**Tisztázó kérdés és válasz:**
- A logó "FIX YOUR BACK" felirata törtfehér színnel készült (pixel-szintű ellenőrzéssel igazolva: pontosan a `#F8F9FA` márkaszín), ezért csak sötét háttéren olvasható — világos módú fejlécben láthatatlan lenne. Marci döntése: **készüljön egy második, navy-színű változat** (a törtfehér és fekete elemek `#1A2634`-re cserélve, a mint elemek változatlanul), és világos módban azt használjuk. A navy változatot Python/Pillow-val generáltam pixel-alapú színcserével (`Design elemek/logo_light_navy.png` → `public/images/logo-light-bg.png`).

**Elvégzett változtatások:**
- Hero szekció: a placeholder kártya helyett a valódi (átlátszó hátterű) portré-fotó, jobb alsó sarkában félig lelógó aláírás-grafikával, enyhe drop-shadow-val. Sötét módban az aláírás `invert(1)` szűrőt kap a láthatóság miatt.
- Logó: két változat (`logo-light-bg.png` navy szöveggel, `logo-dark-bg.png` az eredeti törtfehér szöveggel), CSS-sel automatikusan váltva `data-theme` szerint a fejlécben; a lábléc (mindig navy háttér) csak a sötét-hátterű változatot használja.
- Új `Chevron` komponens (`src/components/Chevron.tsx`): SVG-alapú kettős chevron, magassága mindig `1em` (pontosan a mellette lévő szöveg magasságával egyezik), `direction` prop-pal (left/right/down). Felváltja a korábbi "«" szöveges karaktert minden eyebrow-elemben (Főoldal, Blog, Mini-kurzus, Időpontfoglalás) és a fejléc/lábléc logóiban.
- "Hogyan segítünk" szekció: mindig függőleges elrendezés (`.process-flow--vertical`), a lépések között lefelé mutató chevronnal — korábban ez csak mobilon vált függőlegessé, oldalra mutató nyíllal.
- Lábléc: az eddigi kis "«««" jelzés helyett teljes szélességű, ismétlődő chevron-mintás dísz-csík fut végig az oldal alján (CSS `repeat-x` háttérkép).
- Mód-váltó ikon: emoji (🌙/☀️) helyett egyszerű vonalas (stroke, currentColor) SVG nap/hold-ikon, az ikonkészlet stílusához igazítva.
- A Design jegyzet frissítve az új konvenciókkal (4., 5., 6. pont).

**Javított hiba fejlesztés közben:** a lefelé mutató chevron első nekifutásra felfelé mutatott (rossz forgatási irány, `rotate(90deg)` helyett `rotate(-90deg)` kellett).

**Következő lépés:** Bejelentkezés / Regisztráció felület (2. fázis).

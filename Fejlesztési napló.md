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

## 2026.08.25. — Finomító korrekciók a design-elemekhez

Marci pontosította az előző kört: a logó ikonján belül a fehér elemek is navy-ra váltak (hibásan), a chevron-forma nem a logóéval egyezett, a lábléc-csík helye/formája nem volt jó, és hiányoztak a valódi ügyfél-visszajelzések.

**Elvégzett javítások:**
- **Logó ikon:** a navy-változat generáló szkriptjét pontosítottam — pixel-alapú régió-vizsgálattal (a 100×100 px-es ikon-négyzet határának meghatározásával) igazoltam, hogy az ikonon belül fehér részletek is vannak (pl. a sziluett kézfején, csuklópántján); mostantól **csak az ikonon belüli fekete** cserélődik navy-ra, a fehér marad, a szövegrésznél (ikonon kívül) továbbra is a törtfehér→navy csere történik.
- **Chevron forma:** pixel-pontosan megvizsgáltam a logó "BACK«««" nyilait (oszloponkénti mintavétellel) — kiderült, hogy tömör kitöltésű, éles sarkú, balra mutató nyilak, nem lekerekített vonalas ikonok. A `Chevron` komponenst újraírtam: egyetlen nyíl-egység (`strokeLinecap="butt"`, `strokeLinejoin="miter"`), `double` prop-pal két szorosan egymás mellett álló egységgé bővíthető az eyebrow-khoz; a "hogyan segítünk" nyilai egyetlen (nem dupla) egységet használnak.
- **Chevron pozíció:** minden eyebrow-nál a szöveg került előre, a (dupla) chevron utána — a logó "FIX YOUR BACK ‹‹‹‹" mintáját követve, nem pedig elé.
- **Hero-fotó igazítás:** a hero szekció alsó paddingjét eltávolítottam, a fotó oszlopa `align-self-end`-et kapott — a fotó alja mostantól pixelre pontosan a szín-határhoz illeszkedik, a szöveg oszlop saját `pb-5`-öt kapott a légtérhez.
- **Aláírás:** a drop-shadow helyett egy nagyon enyhe, elmosott radial-gradient "derengés" került alá (`::after` pszeudoelem). Sötét módban `invert(1)` szűrő helyett egy valódi türkiz (`#5FD3BC`) színű PNG-változatot generáltam (`signo_mint.png` → `signature-dark.png`), világos módban az eredeti navy marad (`signature-light.png`) — ugyanaz a data-theme-alapú kép-váltás, mint a logónál.
- **Lábléc-csík:** a nyilas minta a lábléc-blokk aljáról a **tetejére** került (közvetlenül a navy háttér elejére, a tartalom fölé), és az új, logó-hű nyíl-formát használja.
- **Valós visszajelzések:** a Google Térkép "FixYourBack Kft." adatlapján jelenleg **egyetlen valódi értékelés** szerepel (Tóth Barnabás, 5/5, "Hiánypótló!…", 2026.08.23 körül, tulajdonosi válasszal). A korábban kitalált (Anikó/Gábor/Zsófia) placeholder-szövegeket ezzel az egy valós véleménnyel váltottam ki a Főoldalon és az Időpontfoglalás oldalon — nem gyártottam hozzá további kitalált véleményeket, mivel több nem létezik.

## 2026.08.25. — Chevron: kivágott grafika az újrarajzolás helyett

Marci jelezte, hogy az újrarajzolt (stroke-alapú, `strokeLinecap="butt"`) chevron sem egyezik pontosan a logóéval. Mivel már a második hand-crafted SVG-közelítés sem volt elég pontos, a megközelítést megváltoztattam: **nem rajzolom újra a nyilat, hanem magából a logóból vágom ki.**

- Pixel-alapú vizsgálattal megkerestem a chevron-minta egy teljes, tiszta ismétlődési periódusát a logóban (`original logo.png`, x: 303–333, y: 55–102 régió), majd a tartalom alfa-csatornája alapján szorosra vágtam (`Image.getbbox()`) — az eredmény egy 30×41 px-es PNG, ami két példányban egymás mellé rakva varrat nélkül visszaadja a logó eredeti mintáját.
- A `Chevron` komponens mostantól ezt a képet (`public/images/chevron.png`) jeleníti meg `<img>`-ként SVG-rajzolás helyett; irány (`direction="right"`/`"down"`) és dupla mód (`double`) továbbra is CSS-transzformmal és a kép ismétlésével működik.
- A lábléc dísz-csíkja is erre a képre vált (korábban egy kézzel rajzolt SVG-mintát használt háttérképként).
- Ezzel a chevron színe mindig a logó saját mint-színe (nem követi tovább a szöveg `currentColor`-ját) — ez apró eltérés a korábbi tervhez képest, de a forma most garantáltan pixel-pontosan egyezik a logóval, ami Marci kifejezett kérése volt.

**Marci jóváhagyta ezt a nyíl-formát mint véglegeset** ("oké, ez jó nyílforma, mentsd el") — a Design jegyzet 4. pontja LEZÁRVA jelöléssel frissítve, a `public/images/chevron.png` mostantól a hivatalos, minden további fázisban átveendő chevron-grafika.

## 2026.08.25. — Finomítások: aláírás, chevron-magasság, tartalom, kontraszt-hiba

Marci egy hosszabb korrekciós kört küldött: aláírás pozíció/méret/árnyék, chevron-magasság az alcímeknél, lábléc-csík távolsága, a "kinek segítünk" kártyák tartalma, hírlevél-blokk mobil tördelése, és általános sötét módú kontraszt-ellenőrzés.

**A legfontosabb, ezalatt felfedezett hiba: az ikonok feketén jelentek meg sötét módban.**
- Ok: az ikonokat `<img src=".../ikon.svg">`-ként töltöttük be, az SVG-k belseje `fill/stroke: currentColor`-t használt — de egy `<img>`-be töltött SVG **nem** örökli a beágyazó oldal színét (a böngésző elszigetelt erőforrásként kezeli), a `currentColor` a feketére (kezdőérték) esik vissza. Világos módban ez véletlenül majdnem jó volt (navy szöveg ≈ fekete), sötét módban viszont nyilvánvalóan rossz (fekete ikon navy kártyán).
- Pixel-mintavétellel (canvas `getImageData`) igazoltam a hibát, mielőtt javítottam volna.
- **Javítás:** új `src/components/Icon.tsx` komponens — az ikont `mask-image` CSS-tulajdonságként tölti be, a tényleges színt `background-color: currentColor` adja. Ez a technika ténylegesen követi a CSS-kaszkádot. Minden korábbi `<img className="icon-fyb">` használatot lecseréltem erre (Home, Idopontfoglalas, MiniKurzus). A `ThemeToggle` saját, inline `<svg>`-je nem érintett (az sosem `<img>`-ként töltődött be, ott a `currentColor` mindig is helyesen működött).

**Egyéb javítások:**
- **Aláírás:** balrébb (jobbról `1.25rem`, nem `-1rem`) és 10%-kal nagyobb (46,2% / 187px, korábban 42% / 170px). Az elmosott radial-gradient "derengést" lecseréltem valódi `filter: drop-shadow(...)`-ra, ami az aláírás-grafika saját sziluettjéhez tapad — így ténylegesen a kép és az aláírás közé kerül (korábban a derengés lejjebb, a kép szín-határán túl, gyakorlatilag láthatatlanul helyezkedett el). Sötét módban a drop-shadow színe világos (törtfehér, "derengés"), világos módban sötét (navy, hagyományos árnyék).
- **Chevron-magasság:** `1em` → `0.72em` — a teljes sorköz-doboz helyett a tényleges betűmagassággal egyezik az eyebrow-knál.
- **Lábléc-csík távolsága:** a `.site-footer` `padding-top`-ot kapott, hogy a csík ne közvetlenül a szín-határnál kezdődjön.
- **"Kinek segítünk" kártyák:** 1) ikon → `ikon_tanulas`, cím → "ülőmunkát végző férfiaknak"; 2) ikon → `ikon_villanykorte`, cím → "elhúzódó derékfájásra, porckorongsérvre"; 3) ikon → `ikon_torna`, cím → "akik szeretnék végre legyőzni".
- **Hírlevél blokk:** `ikon_munkafuzet` ikon a cím elé, inline (nem flex-wrap) elrendezésben, hogy mobil nézetben az ikon a szöveg mellett maradjon, ne essen külön sorra; a "Derekas Levelekre" `white-space: nowrap`-pal mindig egy sorban marad.
- **Ikonszín, mindenhol:** `.icon-fyb` mostantól mindig `var(--color-primary)` (teal világos / mint sötét módban), nem a szövegszínt örökli — a hírlevél-panel (mindig navy háttér) ikonjai külön szabállyal mindig mint színűek, függetlenül az oldal aktuális témájától.
- **Sötét módú kontraszt-audit:** a `--color-text-muted` (leírások, dátumok, szerepkör-szövegek) a sima `#5E807F` sagegray-jel navy háttéren csak ~3,5:1 kontrasztot adott (WCAG AA alatt). Sötét módra felülírva `#9BB6B5`-re (~6,6:1 kontraszt). Az összes többi szövegszín (fő szöveg, gombok, badge-ek, footer `text-white-50`) átvizsgálva — azok megfelelő kontraszttal rendelkeztek, nem igényeltek módosítást.

## 2026.08.25. — Strukturális változtatások a Főoldalon

Marci strukturális módosításokat kért a Főoldalon: hero-CTA egyszerűsítés, ismétlődő CTA a visszajelzések után, hírlevél-doboz átírása, aláírás kontraszt-javítás.

- **Hero eyebrow:** "gerincbarát program ülőmunkásoknak" → "ülőmunkát végző férfiaknak" (ugyanaz a szöveg, mint a "kinek segítünk" első kártyáján — tudatos ismétlés, nem hiba).
- **Hero CTA:** a két gomb (indítom a mini-kurzust / inkább időpontot foglalok) helyett **egy** gomb: "gyorsítósáv", a mini-kurzusra mutat. Új `.btn-fyb-glow` modifier: hoverre a gomb kicsit megnő (`scale(1.06)`) és lime színű, pulzáló derengést kap (`@keyframes btn-glow-pulse`, `box-shadow` animáció).
- **Új szakasz — ismétlődő CTA:** a visszajelzések rész alá bekerült egy rövid, önálló CTA-blokk ("készen állsz az első lépésre?" + szöveg + "gyorsítósáv" gomb, ugyanazzal a derengő stílussal), ami a mini-kurzusra vezet vissza — a hírlevél-doboz efölé kerül.
- **Hírlevél doboz — új szöveg (Marci megfogalmazása, változtatás nélkül átvéve):** "Nem nyomorít meg, de közben szeretnél legalább egy kis lépést tenni afelé, hogy ne legyen rosszabb? Akkor iratkozz fel a Derekas Levelekre. Ezek emailek általában hetente 1-2 alkalommal, amiben személyesen tanítalak." A korábbi rövid egy-mondatos leírást ez váltja fel.
- **Hírlevél doboz — elrendezés (rám bízott szerkesztői döntés):** az ikont kiemeltem a címsorból, és egy nagy (8rem), mint-árnyalatú körbe ("jelvény") helyeztem a szöveg jobb oldalára, `col-lg-8` (szöveg+form) / `col-lg-4` (ikon-jelvény) elrendezésben — asztali nézetben oldalt-oldalt, kisebb képernyőn a szöveg alá esik.
- **Aláírás kontraszt világos módban:** a lágy `drop-shadow` nem adott elég vizuális súlyt a vékony penna-vonalaknak. Egy szoros, nagy-opacitású "kontúr" drop-shadow-t adtam hozzá a lágy, távolabbi árnyék mellé (`filter: drop-shadow(0 0 0.6px rgba(26,38,52,.85)) drop-shadow(0 3px 5px rgba(26,38,52,.35))`) — ez vizuálisan "megvastagítja" a vékony vonalakat, így jóval határozottabban látszik.

## 2026.08.25. — "Hogyan segítünk" illusztrációk, feltételes időpontfoglaló-hozzáférés

Marci két további strukturális elemet kért: ikon-illusztrációk a folyamat-lépésekhez, és egy zárolt/feltételes állapot bemutatása az Időpontfoglalás oldalon.

- **"Hogyan segítünk" lépés-kártyák új elrendezése:** minden kártya bal oldalán egy nagy, halvány szám (`.process-step-number`, 2,5rem, 45% opacitás), jobb oldalon a tartalom: középre igazított, kör hátterű ikon-jelvény (`.process-step-icon-badge`, 4,5rem, ugyanaz a mint-tint minta, mint a hírlevél-jelvénynél) a cím fölött, alatta a leírás. Ikonok: 1. `ikon_video`, 2. `ikon_naptar`, 3. `ikon_szintek`.
- **Fejléc — feltételes hozzáférés jelzése:** az "időpontfoglalás" nav-elem mellé (asztali és mobil menüben egyaránt) egy kis lakat-ikon került, jelezve, hogy ez az oldal feltételhez kötött (amíg a mini-kurzus nincs végigvéve).
- **Időpontfoglalás oldal — zárolt állapot:** a teljes oldaltartalom (leírás, visszajelzés, Calendly-hely) `filter: blur(6px)`-fel el van homályosítva (`.locked-page-blur`), fölötte egy középre igazított, félig áttetsző, "frosted glass" hatású üzenet-doboz (`.locked-overlay-card`, `backdrop-filter: blur(16px)`) lakat-ikonnal, Marci pontos szövegével (két bekezdés, változtatás nélkül átvéve), és egy "oké, nézzük miről van szó" gombbal, ami a mini-kurzusra vezet tovább — mivel ez egy statikus UI terv (nincs valós felhasználói/befejezettségi állapot), ez a zárolt nézet mindig ez látszik, mint a feltételes állapot illusztrációja (ugyanaz a logika, mint a Mini-kurzus oldal meglévő `.locked-card`-jánál).

## 2026.08.25. — Ikon-jelvények nagyítása, valódi nyújtott számok

Marci két finomítást kért: a kör hátterű ikonok legyenek nagyobbak (kevesebb üres szegély), és a "hogyan segítünk" számok ténylegesen nyúljanak a cím tetejétől a leírás aljáig (ne csak nagy legyen a betűméret).

- **Ikon-jelvények:** `.process-step-icon-badge` ikonmérete 2,25rem → 3rem (a 4,5rem-es körön belül), `.newsletter-icon-badge` ikonmérete 4rem → 5,25rem (a 8rem-es körön belül) — így az ikon a kör nagyobb részét tölti ki, kevesebb üres tér marad körülötte.
- **"Hogyan segítünk" számok — valódi nyújtás:** a korábbi megoldás csak nagy betűméretet használt egy `align-self: stretch` dobozban, ami nem adta vissza a kért, ténylegesen a cím tetejétől a szöveg aljáig nyúló arányt. Új megoldás: a szám **SVG `<text>` elemként** rajzolódik (`viewBox="0 0 40 100" preserveAspectRatio="none"`), a szám doboza pedig már csak a cím+leírás blokk mellett áll (az ikon-jelvény kikerült ebből a sorból, fölé került) — így a szám pontosan a cím tetejétől a leírás aljáig nyúlik, kártyánként automatikusan alkalmazkodva az eltérő szöveghosszhoz (JS-mérés nélkül, mert az SVG `preserveAspectRatio="none"` maga torzítja/nyújtja a glifet a rendelkezésre álló (keskeny, magas) téglalaphoz).

## 2026.08.25. — Szám-vágás javítása, teljes tartalom-magasságra nyújtás, sötét kártya-keret

Marci jelezte: a számok bal-jobb szélei le voltak vágva, és a nyújtásnak nem a szöveg, hanem a teljes doboztartalom (ikon tetejétől a legalsó sor aljáig) magasságáig kellene tartania.

- **Levágás oka és javítása:** a `viewBox="0 0 40 100"` túl keskeny volt a 100-as `fontSize`-hoz — az SVG alapértelmezetten levágja a viewBox-on túlnyúló tartalmat, így a számjegy szélei tényleg lemetszve jelentek meg. `viewBox="0 0 80 100"`-ra szélesítve (a szöveg `x="40"`-re középre igazítva) a teljes glif belefér a levágás előtt, a `preserveAspectRatio="none"` így már csak a kívánt (nem vágó) nyújtást végzi.
- **Nyújtás mértéke — ikon tetejétől a szöveg aljáig:** visszaállítottam a `.process-step-number`-t a kártya teljes tartalmi sorának (`d-flex align-items-stretch`) közvetlen testvérévé — az ikon-jelvény visszakerült a cím+leírás oszlop tetejére (a szám oldalára, nem fölé) —, így a szám ismét a teljes doboz-tartalom (ikon teteje → utolsó szövegsor alja) magasságára nyúlik, nem csak a cím+leíráséra.
- **Sötét módú kártya-keret:** `html[data-theme='dark'] .process-step .card-fyb` — vékony, félig áttetsző türkiz (mint) keret (`rgba(95,211,188,.4)`) és köréje egy enyhe, elmosott derengés (`box-shadow` glow), hogy a kártyák jobban kiváljanak a navy háttérből.

## 2026.08.25. — Számok: egyenletes vonalvastagság kézzel rajzolt stroke-glifekkel

Marci jelezte: a szám magassága és a sötét mód jó, de a vonalvastagság nem egyenletes végig.

- **Ok:** a szám korábban egy kitöltött (fill), félkövér SVG `<text>` volt, amit `preserveAspectRatio="none"` aránytalanul (csak függőlegesen erősen) nyújtott. Egy kitöltött betűforma nem-egyenletes nyújtásakor a vízszintes vonalrészek vastagabbnak, a függőleges részek vékonyabbnak látszanak — ez adta az egyenetlen vonalvastagság-érzetet.
- **Megoldás:** a három számjegyet (1, 2, 3 — csak ennyi kell, hardcode-olva `stepNumberPaths` tömbben) kézzel rajzolt, egyszerű monoline (egyvastagságú vonalú) SVG `<path>`-ként rajzolom `fill="none" stroke="currentColor"`-ral, `vector-effect="non-scaling-stroke"` mellett. A `non-scaling-stroke` biztosítja, hogy a vonal vastagsága a viewBox nem-egyenletes nyújtása (`preserveAspectRatio="none"`) ellenére is állandó pixel-vastagságú maradjon a kirajzolt alak minden pontján — a geometria (a szám alakja) nyúlik, a rávitt "tollvastagság" nem.

## 2026.08.25. — 1. FÁZIS LEZÁRVA: Főoldal + aloldalak jóváhagyva

**Marci jóváhagyása:** "a design rendben, elrendezések rendben, viszonyok rendben, ezeket rögzítsd. Szövegeken még változtatni fogunk később, de ezt a fázist most így menthetjük, léphetünk a következőre."

Ezzel a Főoldal + aloldalak (Blog, Mini-kurzus, Időpontfoglalás) fázisa — design, elrendezés, komponens-arányok, szín/tipográfia-rendszer — **lezártnak minősül.** A fázis során létrejött minden reusable komponens (gombok, kártya, badge, eyebrow+Chevron, folyamat-lépések számmal+ikon-jelvénnyel, testimonial, videó-kártya, hírlevél-panel+ikon-jelvény, lezárt tartalom-előnézet — kártya és teljes oldal szinten is, fejléc/lábléc a logó két változatával és a footer dísz-csíkkal) mostantól a további fázisok kötelező kiindulópontja — új fázisban ugyanezeket kell újrahasznosítani, nem újratervezni.

**Nyitva marad (Marci jelezte, hogy változik):** a jelenlegi szövegek (címek, leírások, mikroszövegek) egy része még nem végleges — ez NEM blokkolja a további fázisok indítását, csak azt jelenti, hogy a Főoldal szövegezésére még visszatérünk.

**Következő lépés:** Bejelentkezés / Regisztráció felület (2. fázis) — a specifikáció "EGYÜTTMŰKÖDÉS OLDAL RÉSZEI" 1. pontja: "Bejelentkezés, Regisztráció (ÜF) / Bejelentkezés (GYT)".

## 2026.08.25. — 2. fázis: Bejelentkezés / Regisztráció felület

A specifikáció ehhez a ponthoz nem ad részleteket (nincs mező-lista, nincs leírva a bejelentkezés utáni folyamat), ezért — az 1. alapszabály szerint — tisztázó kérdéseket tettem fel indulás előtt.

**Tisztázó kérdések és válaszok:**
- **Szerepkörök:** a specifikáció 4 szerepkört említ (ÜF, GYT, Sales, Admin), de csak az ÜF regisztráció+belépés / GYT belépés van priorizálva. Marci döntése: legyen mind a négy szerepkör lefedve — egyetlen, szerepkör-független bejelentkezési form (e-mail+jelszó) szolgálja ki mind a négyet (a szerepkört a backend dönti el), regisztráció csak ÜF-nek van (GYT/Sales/Admin fiókot a rendszergazda hoz létre).
- **Oldalszerkezet:** egy oldal (`/belepes`), fül-váltással a Belépés és Regisztráció nézet között (nem külön URL-ek).
- **Belépés/regisztráció utáni állapot:** mivel a valódi dashboard/checklist később készül el, a form beküldése után egy egyszerű, kártyás placeholder-üdvözlő jelenik meg ("sikeresen bejelentkeztél" / "sikeres regisztráció"), jelezve, hogy ez a felület a következő fázisokban épül tovább.

**Megvalósítás:**
- Új `/belepes` oldal (`src/pages/Belepes.tsx`): eyebrow+cím, pirula-alakú fül-váltó (`.auth-tabs`/`.auth-tab`, új komponens-osztály) Belépés/Regisztráció között, `card-fyb`-be ágyazott form.
- Belépés form: e-mail, jelszó, "elfelejtett jelszó" link, "gyógytornászként, értékesítőként vagy adminisztrátorként is itt jelentkezz be" mikroszöveg (jelezve a szerepkör-független belépést).
- Regisztráció form: teljes név, e-mail, jelszó, kötelező GDPR-elfogadó checkbox (a specifikáció "MIT NEM AKARUNK" szakaszának egészségügyi-adat-védelmi elvárása alapján), "gyógytornászi/értékesítői/adminisztrátori fiókot a rendszergazda hoz létre" mikroszöveg.
- Beküldés után (mindkét form, valós backend nélkül, csak React state-tel) a placeholder-üdvözlő kártya jelenik meg.
- A fejléc "belépés" navigáció-eleme (eddig statikus, "hamarosan" jelvényes, kattinthatatlan span) most valódi, működő link a `/belepes`-re.
- Új CSS: `.auth-tabs`/`.auth-tab` (pirula fül-váltó), illetve a Bootstrap form-elemek (`.form-control`, `.form-check-input`) fókusz/checked állapotai a márka teal/mint színére hangolva (Bootstrap alapértelmezett kék helyett).

## 2026.08.25. — Gyors korrekciók a Bejelentkezés oldalon

- **Ikon-jelvény a cím mellett:** a "belépés" H1 mellé balra bekerült a kör hátterű `ikon_fiok` ikon-jelvény (ugyanaz a `.process-step-icon-badge` osztály, most nem a szöveg fölött, hanem mellette, egy sorban).
- **Gomb alatti mikroszöveg törölve:** mindkét formnál (belépés/regisztráció) eltávolítottam a beküldő gomb alatti kiegészítő mondatot ("gyógytornászként... is itt jelentkezz be" / "...fiókot a rendszergazda hoz létre") — tisztább, egyszerűbb form.
- **Sötét módú kártya-keret:** a form-kártya (és a beküldés utáni placeholder-üdvözlő kártya) új `.card-fyb-accent` osztályt kapott, ami sötét módban ugyanazt a türkiz keretet + enyhe derengést adja, mint a Főoldal folyamat-lépés kártyái — a CSS-szabály közösre lett véve (`.process-step .card-fyb, .card-fyb-accent`), így ez az osztály bármely más kártyán is újrahasznosítható lesz.

## 2026.08.25. — Belépés oldal címének korrekciója

- A cím "belépés" → "fiók" — mivel az oldal a belépést ÉS a regisztrációt is fedi, a "fiók" pontosabb, semlegesebb cím.
- Az "együttműködés «" eyebrow-sor törölve (a Chevron import is eltávolítva a Belepes.tsx-ből, mivel már nem volt rá szükség).

## 2026.08.25. — 2. FÁZIS LEZÁRVA: Bejelentkezés / Regisztráció jóváhagyva

**Marci jóváhagyása:** "oké, mentsük."

Ezzel a Bejelentkezés / Regisztráció felület (`/belepes` — fül-váltós elrendezés, szerepkör-független belépés, ÜF-regisztráció GDPR-elfogadóval, `.card-fyb-accent` sötét módú kiemeléssel, "fiók" cím) **lezártnak minősül.**

## 2026.08.25. — 3. fázis: Egyedi videókiosztás (ÜF "szintek" nézet), új app-elrendezés

Marci "törölheted a memóriád, húzd be a githubról" kérésére frissen újraolvastam a repo teljes dokumentációját (Design jegyzet, Fejlesztési napló, specifikáció) — semmi nem tért el a leírtaktól, tiszta working tree, helyi állapot = origin/main.

**Tisztázó kérdések és válaszok (1. alapszabály szerint, a spec ezen a ponton 3 külön részt ír le):**
- **Fázis köre:** csak az ÜF "szintek" nézetét építjük meg ebben a körben (a GYT-oldali kiosztó felület és az általános oktatóanyag-lista későbbre marad).
- **Elrendezés:** Marci döntése — mostantól **új, dedikált "app" elrendezés** az Együttműködés-oldal felületeinek, elkülönítve a nyilvános marketing-oldal Header/Footer-jétől (nem a korábban megkérdezettek közül a "marad a jelenlegi" opciót választotta).

**Megvalósítás:**
- Új `src/components/AppLayout.tsx`: oldalsávos elrendezés (asztali nézetben mindig látható bal oldalt, mobilon `position:fixed` csúszó fiók, backdroppal). Oldalsáv felül logó, alatta felhasználó-doboz ("Szia, Anna!" + "ügyfél" — a Design jegyzet 1. pontjában rögzített márkahang-mikroszöveg mintát követve), navigáció (gyakorlatok aktív, a spec többi Együttműködés-pontja — checklist, munkafüzet, oktatóanyag, eredményeim, állapotfelmérő, kérdéseim — lakat-ikonnal jelzett, még nem épült fel), alul "vissza a főoldalra" + téma-váltó.
- Új `src/pages/Gyakorlatok.tsx` (`/gyakorlatok`): 12 kör alakú "szint"-fül (lezárt = pipa, aktuális = kitöltött szám, zárolt = lakat), alattuk a kiválasztott szint részletei — lezárt/aktuális szintnél videó-kártya + leírás + időszak + `.locked-card` placeholder a napi checklisthez (4. fázis); zárolt szintnél `.locked-card` a spec pontos feloldási feltételeivel (10 hetes együttműködés alatt: előző szint lezárása; utána: 2 hét + legalább 10 edzésnap).
- A `/belepes` sikeres-állapot szövege frissítve, és egy "a gyakorlataimhoz" gomb köti össze a `/gyakorlatok` oldallal (életszerű, összefüggő demó-folyam).
- Új CSS: `.app-shell`/`.app-sidebar`/`.app-topbar` (app-elrendezés), `.level-tabs`/`.level-tab` (kör alakú szint-fülek, állapot szerint színezve).

**Javított hiba fejlesztés közben:** mobil nézetben az `.app-shell` alapértelmezett `flex-direction: row` miatt a topbar és a fő tartalom egymás MELLETT próbált elférni (összezsúfolva, a bal oldal üresen maradt) — `flex-direction: column` mobilon (és csak `min-width: 992px`-től `row`) javította.

**Következő lépés:** GYT-oldali videó-kiosztó felület, vagy a következő fázis (Felvételi kérdőív + eredménylap), Marci döntése szerint.

## 2026.08.25. — Korrekciók a Gyakorlatok oldalon és az app-elrendezésen

Marci a friss `/gyakorlatok` nézetet lokálisan megnézte, és hét pontos korrekciót adott:

- **Szint-választó: karikák → legördülő menü.** A 12 kör alakú fül helyett egy `.level-select` legördülő lett: a bezárt vezérlőn a kiválasztott szint jelvénye (szám vagy lakat) + "N. szint" felirat + nyíl látszik; kinyitva minden szint listázva — lezártaknál kiírt szám mint-keretben, az aktuálisnál kitöltött háttérrel kiemelve, a zároltaknál lakat-ikon, tompítva. Kattintásra bezárás + kiválasztás; kattintás a menün kívülre szintén bezár (`useEffect` + `mousedown` figyelő).
- **"gyakorlatok" eyebrow törölve** a "szintjeid" cím fölül — Marci szerint felesleges volt.
- **Redundáns "napi checklist" kártya eltávolítva** a szint-részletező kártyából — ez már külön navigációs pontként (lakattal, később épül) szerepel az oldalsávban, kétszer feltüntetni félrevezető volt.
- **Gyakorlat-szerkezet pontosítva:** minden (fel nem zárolt) szintnél egy videó + utána mindig 3–4 db gyakorlat-blokk jelenik meg, mindegyiknek saját kódolt címe ("S01 háton fekve, alsó tartás" mintára) és saját leíró szövege — nem egyetlen összefoglaló cím+leírás páros, ahogy korábban volt.
- **Mobil menü teljes szélesség:** az `.app-sidebar` mobil nézetben (`max-width: 991.98px`) most a teljes képernyőt kitölti nyitott állapotban (`inset: 0; width: 100%`) — korábban `inset: 0 25% 0 0` miatt 25%-nyi rés maradt jobbra, és az explicit `width: 260px` szabály felül is írta volna a rést amúgy is (a `width` explicit értéke erősebb, mint az `inset`-ből számított implicit szélesség — ezért a `width: 100%` felülírás is kellett, nem csak az `inset` módosítása).
- **Oldalsáv ikonok nagyobbak:** `.app-sidebar-link .icon-fyb` 1.25rem → 1.5rem (láthatóbb navigáció).
- **Mobil fejléc frissítve:** a topbar mostantól két sorban jelenik meg — felül logó + hamburger, alatta "Szia, [Név]!" üdvözlés (`.app-topbar-greeting`), hogy a menü kinyitása nélkül is látszódjon. A minta férfi ügyfeleknek készül, ezért a korábbi "Anna" placeholder-név "Péter"-re cserélve (asztali oldalsávban is), és az "ügyfél" alcím-felirat törölve mindkét helyről (topbar, oldalsáv) — Marci szerint felesleges volt.

**CSS-változások:** `.level-tabs`/`.level-tab` (kör-fülek) törölve, helyettük `.level-select`/`.level-select-toggle`/`.level-select-menu`/`.level-select-item`/`.level-select-badge` (legördülő minta); `.app-topbar` két sorossá alakítva (`.app-topbar-row`, `.app-topbar-greeting`); `.app-sidebar-link .icon-fyb` mérete nőtt; mobil `.app-sidebar` `inset`+`width` javítva.

## 2026.08.26. — A legördülő szint-jelvények korrekciója

Marci a legördülőben lévő kör-jelvényeken kért pontosítást:

- **Lezárt szinteknél szám helyett pipa.** A szám amúgy is ott áll mellette szövegként ("N. szint"), így a körben felesleges volt megismételni — helyette egy új, a többi kézzel rajzolt ikonhoz illő vonalrajz-stílusú pipa-ikon került (`public/icons/ikon_pipa.svg`, azonos technikai paraméterekkel, mint pl. az `ikon_lakat.svg`: 21.7×21.7-es viewBox, `stroke="currentColor"`, `stroke-width 0.6`, kerekített végek — így a meglévő `Icon.tsx` mask-technikával színezhető, ugyanúgy, mint a többi ikon).
- **Aktuális szintnél nincs ikon, csak szín.** A kitöltött jelvény immár nem az elsődleges (teal) márkaszínt, hanem a `--lime` sárgát viseli (ugyanaz, mint az "AKTUÁLIS SZINT" pill háttere) — se szám, se pipa nincs benne, önmagában a szín jelzi az aktuális szintet.
- **Zárolt szinteknél a lakat-ikon a kör 80%-át tölti ki** (1.4rem az 1.75rem átmérőjű jelvényen belül) — korábban csak kb. az 50%-át, most jóval hangsúlyosabb.

## 2026.08.26. — Avatar-ikon, egyszerűsített gyakorlat-címek, egysoros fejléc, "egy képernyő" elv

Marci négy pontos korrekciót/elvet adott:

- **Avatar-kör: betű → ikon.** Az oldalsáv felhasználó-avatarjában a "P" betű helyett most `ikon_fiok.svg` látható. **Közben talált és javított hiba:** az ikon eleinte láthatatlan volt — az `.icon-fyb` alaposztály saját `color: var(--color-primary)` (teal) értéket ad minden ikonnak, ami felülírta az avatar-kör örökölt kontraszt-színét (`--color-primary-contrast`, navy), így az ikon ugyanolyan teal lett, mint a teal háttere (teal-a-tealon, láthatatlan). Javítás: `.app-sidebar-avatar .icon-fyb { color: currentColor; }` — ez visszaadja az öröklött navy színt. **Ez egy általános veszély:** bármelyik Icon-nak nem alap háttéren (pl. már színezett körben/gombban) mindig explicit `color: currentColor`-t kell adni a helyi kontextus-osztályon, különben a globális teal szín felülír mindent.
- **Gyakorlat-címek leírás nélkül.** A gyakorlatoknál végül nem lesz külön leíró szöveg — csak a videó száma és címe egy sorban (pl. "S01 Háton fekvés, alsó karpozíciók"). Az `Exercise { code, desc }` típus egyszerű `string[]`-re egyszerűsödött, a leíró bekezdések törölve.
- **A legördülő a cím mellé, jobbra került — telefonon is egy sorban.** Új `.app-page-header` (flex, `justify-content: space-between`, `flex-wrap: nowrap`) fogja össze a "szintjeid" címet és a szint-választót; a cím `.app-page-title` osztályt kapott (mobilon kisebb betűméret + `white-space: nowrap` + ellipsis, hogy garantáltan elférjen a legördülő mellett, ne törjön két sorba).
- **Új, elsődleges elrendezési szempont rögzítve minden Együttműködés-oldali modulra:** a nézet tartalma férjen el egyetlen képernyőn, görgetés nélkül — monitoron, tableten és telefonon is (részletek: Design jegyzet 10. pont). Ennek a Gyakorlatok oldalon való első alkalmazásaként: a legördülő cím mellé kerülése, a leírás-szöveg elhagyása, a mobil topbar paddingjének szűkítése, a kártya-padding és a videó-előnézet képarányának mobil-specifikus csökkentése (`.app-main .card-fyb`, `.app-main .video-thumb`). Ellenőrzés böngészőben: `document.documentElement.scrollHeight <= window.innerHeight` 375×667-es (legkisebb gyakori mobil) nézetben is igaz — a tartalom kényelmesen elfér, még marad is szabad hely.

## 2026.08.26. — Új általános szabály: kör+ikon = 80%

Marci: az avatar-körben az ikon (előzőleg 1.4rem a 2.5rem-es körben, azaz 56%) töltse ki a kör 80%-át — és **ez legyen az általános szabály minden jövőbeli kör+ikon kombinációra.**

- Avatar-ikon (`.app-sidebar-avatar .icon-fyb`) mérete 1.4rem → **2rem** (2.5rem-es kör 80%-a).
- Konzisztencia kedvéért a szint-választó jelvényén (`.level-select-badge .icon-fyb`, 1.75rem-es kör) a lezárt szintek pipa-ikonja is 1rem → **1.4rem**-re nőtt, így most már mind a pipa, mind a (korábban már 80%-osra állított) lakat-ikon egységesen a szabályt követi.
- A szabály rögzítve a Design jegyzet 7. pontjában (Ikonok), azzal a megjegyzéssel, hogy a már korábban jóváhagyott/lezárt Főoldal-elemek (pl. `.process-step-icon-badge`, ~67%) ettől eltérhetnek — új elemnél mindig a 80%-os szabályt kell követni.

## 2026.08.26. — 3. fázis, GYT-oldal: Videókiosztás

Az ÜF-oldali "szintjeid" nézet lezárása után Marci: "nézzük ugyanezt a feladatot a GYT oldaláról". Mivel a spec ezen a ponton 3 tisztázandó kérdést vetett fel (1. alapszabály), `AskUserQuestion`-t indítottam, a kérdés-ablakot Marci elutasította, de azonnal "igen"-t írt chatben — ezt úgy értelmeztem, hogy az összes kérdésnél az ajánlott (első) opcióval mehetek tovább:

1. **Ügyfél-választó legyen** (nem feltételezünk egyetlen "már kiválasztott" klienst).
2. **Ugyanaz az AppLayout-minta**, GYT-specifikus navigációval, ebben a körben csak a "videókiosztás" pont aktív.
3. **Egyszerű lista/legördülő** a ~25 videóból, kategorizálás/szűrés nélkül.

**Megvalósítás:**
- `src/components/AppLayout.tsx` általánosítva: `navItems` és `userName` prop-ok lettek (alapértelmezetten az ÜF-oldali lista + "Péter"), így a komponens az ÜF és a GYT oldalon is újrahasználható séma/topbar/sidebar-vázat ad.
- Új GYT navigáció (App.tsx-ben, `gytNavItems`): videókiosztás (aktív), dokumentáció, munkafüzet, checklist, oktatóanyag, eredmények, állapotfelmérő, kérdések, kapacitás (mind lakattal, a spec "Együttműködés oldal részei" listája alapján) — GYT-persona placeholder név: "Judit".
- Új `src/pages/GytVideokiosztas.tsx` (`/gyt/videokiosztas`): fent az oldal cím mellett jobbra egy ügyfél-választó legördülő (ugyanaz a `.level-select` minta, amit a szint-választóhoz is használunk — újrahasznosítva, nem 3 külön stílust bevezetve).
- **Két mintakliens, hogy mindkét, spec szerinti hozzáférési mód látszódjon:**
  - **"Péter"** (ugyanaz a személy, mint az ÜF-oldali demó-felhasználó, hogy a két oldal története összeérjen): nála a 10 hetes együttműködés lezárult (1-5. szint már kiosztva, ugyanazokkal a videócímekkel, mint az ÜF oldalon látott "gerinc alapok, csípőnyitás..." sor) — most a GYT-nek **egyszerre 7 szintet** (6-12) kell kiosztania, sorrendben, egy "következő 7 szint" panelen, soronként egy videó-választó legördülővel; lent "kiosztás mentése" gomb, ami csak akkor aktív, ha mind a 7 ki van osztva.
  - **"Kovács Gábor"** (új, a 10 hetes együttműködés közepén tartó kliens): nála csak 1-5. szint létezik, ebből 1-2. már kiosztva, a **3. szint most kiosztásra vár** (a legutóbbi konzultáció után), 4-5. még zárolt ("a 3. szint videójának kiosztása és a következő konzultáció után nyílik meg").
- Videó-választó legördülő (`VideoPickerRow`): a szint-választóéval azonos vizuális/interakciós minta (gomb + legördülő lista + kattintás-a-lista-mellé-zár), 25 mintavideóval (`V01`–`V25`, kódolt cím-formátum, ugyanúgy, mint az ÜF-oldali "S01..." gyakorlat-kódok).
- Szint-állapot jelölés (pipa/lakat/lime, 80%-os ikon-kitöltés) újrahasznosítva a már meglévő `.level-select-badge` osztályokból — nincs új CSS state-szín, csak a meglévő minta más kontextusban.

**Fontos, Marcival egyeztetendő eltérés az "egy képernyő, görgetés nélkül" elvtől:** "Péter" (7-szintes tömeges kiosztás) nézete mobilon (375×667) görget (~990px magas tartalom) — ez egy admin/staff-oldali, adat-sűrű feladat, nem egy ÜF-oldali gyors áttekintés, ezért valószínűleg indokolt kivétel, de a Design jegyzet 10. pontja szerint ez nem automatikus, hanem egyeztetendő. "Kovács Gábor" (egy videó kiosztása) nézete változatlanul pontosan elfér görgetés nélkül (667=667px).

**Következő lépés:** Marci visszajelzése a fenti felépítésről és a görgetés-kivételről; utána a checklist vagy a felvételi kérdőív/eredménylap fázis, Marci döntése szerint.

**Marci jóváhagyása (2026.08.26.):** "jóváhagyom" — a 7-szintes tömeges videókiosztás mobil görgetése elfogadott kivétel az "egy képernyő, görgetés nélkül" elv alól (staff-oldali, adat-sűrű feladatként indokolt).

## 2026.08.26. — Valós tartalom: "torna szintek.odt" + személyre szabási javaslat-motor

Marci feltöltötte a `torna szintek.odt` fájlt, ezzel a szavaival "ez a program központja" — a mozgásprogram tényleges szakmai tartalma, ami mostantól minden korábbi kitalált placeholder-tartalmat felvált.

**A dokumentum elolvasása** (`textutil -convert txt -stdout` macOS paranccsal, mert az .odt-t a Read tool nem tudja natívan): 20 megnevezett gyakorlat (S01–S13 "alap" + A01–A07 "alternatív"), mindegyiknél kiinduló helyzet(ek) A/B/C/D(...G) nehézségi változatokban + ismétlésszám + részletes kivitelezési utasítás. A dokumentum végén egy "Szintek sorrendje" táblázat: 3 befolyásoló tényező (fájdalom helye: alsó/felső; hason fekvés kivitelezhető-e; vállmobilitás) alapján 8 elméleti / gyakorlatban 6 egyedi, előre kódolt szint-sorrend (LOO, LON, LNO, LNN, HOO, HON — HNO≡LNO, HNN≡LNN). Egy negyedik tényezőt (térdfájdalom) is említ a dokumentum mint befolyásoló szempontot, de a sorrend-táblázat ezt nem kódolja — ezt jeleztem a Design jegyzetben, nem építettem bele találgatással.

**Megvalósítás:**
- Új `src/data/tornaSzintek.ts`: `EXERCISES` (20 kód → név + rövid leírás, csak kiinduló helyzet + ismétlésszám, a részletes kivitelezés nélkül — pontosan Marci kérése szerint), `SEQUENCES` (a 6 egyedi sorrend), `ClientVariables` típus, `suggestedSequence(variables)` — ez a "javaslat-motor", ami a 3 változóból visszaadja a javasolt, 12 vagy 13 elemű szint-sorrendet.
- **ÜF-oldali "szintjeid" (`Gyakorlatok.tsx`) újraírva:** a korábbi, kitalált "4 gyakorlat/szint" szerkezet helyett most **1 valós, megnevezett gyakorlat/szint**, a LOO sorrend szerint (Péter = alsó lumbális, mindkét mozgás rendben — a dokumentum legegyenesebb, S01→S13 sorrendje). Emiatt a szintek száma 12-ről **13-ra nőtt** — ez pontosabb, mint a korábbi kitalált szám, mert a valós forrás szerint a teljes program 12 VAGY 13 szintből áll, a kliens adottságaitól függően.
- **GYT-oldali videókiosztás (`GytVideokiosztas.tsx`) frissítve:** a videótár a kitalált 25 elemű "V01...V25" lista helyett a valós 20 kódolt gyakorlat; új **"ügyfél jellemzői" panel** (ideiglenes, kattintható pirula-váltókkal a 3 változóhoz); minden kiosztásra váró szintnél megjelenik egy **"javasolt: [kód+cím]" gyorsgomb**, ami egy kattintással beállítja a javaslat-motor által ajánlott gyakorlatot; a tömeges (10 hét utáni) kiosztásnál egy **"javasolt csomag alkalmazása"** gomb az összes hátralévő szintet egyszerre kitölti a javaslat szerint. Mindkét javaslat csak ajánlás, a GYT bármikor felülbírálhatja kézzel.
- **Reaktivitás tesztelve:** Kovács Gábor váll-mobilitás változóját "nem"-ről "igen"-re állítva a 3. szint javaslata azonnal S05-re változott (HON→HOO sorrend-váltás), miközben az 1-2. szint már rögzített (történeti) adata nem változott — helyesen, csak a JÖVŐBELI javaslat reagál a változóváltásra.

**Javított hiba fejlesztés közben:** a "javasolt: A02 Négykézláb A" gyorsgomb a `.btn-fyb` osztály örökölt `text-transform: lowercase` szabálya miatt "javasolt: a02 négykézláb a"-ként jelent meg — a gyakorlat-kódok (pl. "A02") kisbetűsítése félrevezető/olvashatatlan. Javítva explicit `text-transform: none` felülírással ezen a gombon.

**FONTOS, later törlendő ideiglenes megoldás (Marci kifejezett kérése):** a GYT-oldali "ügyfél jellemzői" panel egy ideiglenes helyettesítője a jövőbeli felvételi kérdőívnek. Amint a felvételi kérdőív fázisa elkészül és a 3 (esetleg 4, ld. térdfájdalom) változót onnan tudjuk beolvasni, ezt a kézi beállító panelt törölni kell.

**Nyitott kérdés a checklist-fázishoz:** a checklist spec-szövege "12 szint"-et ír, de a valós torna-szintek forrás szerint 12 VAGY 13 lehet a program hossza — ezt a checklist-fázis tervezésekor Marcival tisztázni kell.

**Következő lépés:** Marci visszajelzése a fenti tartalmi frissítésről és a javaslat-motorról.

## 2026.08.27. — Térdfájdalom és magas vérnyomás faktor

Marci két új befolyásoló tényezőt adott a "torna szintek" logikához:

- **Térdfájdalom:** "ha térdfájdalom van, akkor a 4kézláb gyakorlatokat nem csináljuk." Megvalósítás: a `suggestedSequence()` (`src/data/tornaSzintek.ts`) most kiszűri A02-t (Négykézláb A) és A03-at (Négykézláb B), ha `kneePain: true`. A forrásdokumentum nem ad helyettesítő gyakorlatot ezekre, ezért a legegyszerűbb, feltételezés nélküli megoldást választottam: a szűrt gyakorlatok egyszerűen kimaradnak, a sorrend ennyivel rövidebb. Ezt a Design jegyzetben jeleztem mint saját egyszerűsítést, nem a dokumentum explicit szabályát — ha Marci helyettesítő gyakorlatot szán ide, azt pontosítani kell.
- **Magas vérnyomás:** nem a szint-sorrendet, hanem a jövőbeli checklist "megtartás" (statikus tartás, mp) paraméterét korlátozza — ez valójában már a Projekt specifikáció "Mért paraméterek" pontjában is szerepelt ("3 mp-ről indul, kétnaponta +1 mp, max 10 mp; magas vérnyomás esetén max 4 mp"), Marci most csak megerősítette és összekötötte a kliens-változó modellel. Elmentve kódba is: `HOLD_START_SECONDS`, `HOLD_STEP_SECONDS`, `HOLD_STEP_DAYS`, `maxHoldSeconds()` (`src/data/tornaSzintek.ts`) — a checklist-fázisban készen áll a felhasználásra, most nincs UI-hatása azon túl, hogy a GYT-oldali panelen egy emlékeztető szöveg jelenik meg, ha be van kapcsolva.

**Megvalósítás:** `ClientVariables` bővült `kneePain` és `highBloodPressure` mezőkkel; a GYT-oldali "ügyfél jellemzői" panel 2 új pirula-váltóval bővült (5 tényező összesen).

**Javított/megelőzött hiba fejlesztés közben:** mivel a térdfájdalom-szűrés miatt a javasolt sorrend rövidebb is lehet a névleges 12/13-nál, a pozíció-alapú indexelés (`suggested[szintszám - 1]`) `undefined`-et adhat vissza egy hosszabb tömeges kiosztásnál (pl. 13 szintes panel egy 10 elemre szűrt sorrenddel). Ez leellenőrizve, védve: a "javasolt csomag alkalmazása" gomb csak azokat a szint-slotokat tölti ki, amikhez ténylegesen van javaslat, a többit érintetlenül hagyja — böngészőben tesztelve (Péter hason-fekvés=nem + térdfájdalom=igen kombinációval, ami LNN sorrendre vált és 2 szintet szűr ki), nincs hiba, a "6/8 kiosztva" állapot helyesen jelenik meg, a 2 fennmaradó slot üresen marad kézi kiválasztásra várva.

**Nyitott kérdés (megismételve, még mindig nyitott):** a checklist spec-szövege "12 szint"-et ír, a valós forrás szerint 12 VAGY 13 (most akár még kevesebb is, térdfájdalom-szűrés esetén) — ezt a checklist-fázis tervezésekor Marcival tisztázni kell.

## 2026.08.27. — Videó-lábjegyzet (részleges szint-kiosztás jelzésére)

Marci válaszul a térdfájdalom-szűrés nyitott kérdésére ("nincs helyettesítő gyakorlat"): "ez csak javaslat. lehetséges, hogy egy szintet (ami kb. átlagosan 4 gyakorlatból áll) azt 2 felé osztva adunk oda az ÜF-nek. Ilyenkor lábjegyzetet írunk a videóhoz: pl. 'csak az első 2 gyakorlat ebből a szintből'."

**Megvalósítás:** minden GYT-oldali videó-kiosztáshoz (`VideoPickerRow`) opcionálisan hozzáadható egy szabad szöveges lábjegyzet. Alapból egy kompakt "+ lábjegyzet hozzáadása" link jelenik meg egy kiosztott sor alatt, ami kattintásra egy kis szövegmezővé nyílik — ezzel a lábjegyzet nélküli (a többség) sorok kompaktak maradnak. A lábjegyzet megjelenik: (1) a GYT-oldali visszanézhető szint-listában a videó címe alatt dőlt betűvel, (2) az ÜF-oldali szint-kártyán ("Megjegyzés a gyógytornászodtól: ..."). Demó-adatként Kovács Gábor 1. szintjéhez és Péter aktuális (5.) szintjéhez is került egy-egy lábjegyzet ("csak az első 2 gyakorlat ebből a szintből"), hogy a koncepció mindkét oldalon látható legyen.

**Fontos korlát, amit a Design jegyzetben is rögzítettem:** ez egy szabad szöveges jelölő, NEM automatizált részleges-kiosztás logika — a rendszer nem tudja, hogy egy adott videón belül ténylegesen mely gyakorlatok tartoznak az "első 2"-be, mert az adatmodell (`EXERCISES`) egy videót egyetlen kóddal + egy összefoglaló leírással kezel, nem gyakorlat-szintű bontásban (A/B/C/D-variánsok). A GYT szabadon ír bele bármit, a rendszer csak megjeleníti.

**Következő lépés:** Marci visszajelzése; utána checklist vagy felvételi kérdőív fázis.

## 2026.08.27. — Új demó-kliens: az együttműködés legeleje

Marci meg akarta nézni a GYT-oldali videókiosztást az együttműködés legelejéről, ahol még az 1. szint sincs kiosztva. A meglévő 2 mintakliens egyike sem mutatta ezt: Kovács Gábor már a 3. szintnél tart, Péter már túl van az egész 10 hetes szakaszon.

**Megvalósítás:** új harmadik mintakliens, **"Varga Dániel"** — "kozben" módban, mind az 5 szintje: az 1. szint "kiosztásra vár" (semmi nincs még kiválasztva), a 2-5. szint zárolt ("az 1. szint videójának kiosztása és a következő konzultáció után nyílik meg").

**Refaktor útközben:** a `levels` állapot korábban egyetlen, statikusan Kovács Gábor adataival feltöltött `useState` volt — ez csak addig működött hibátlanul, amíg egyetlen "kozben" módú kliens volt. A második "kozben" kliens (Dániel) hozzáadásával ez ütközött volna (mindkét klienshez ugyanaz az egy állapot tartozott volna). Javítva: `levelsByClient` egy kliens-azonosító szerint kulcsolt map lett, minden klienshez saját, egymástól független állapottal — böngészőben tesztelve, hogy Dániel és Gábor közötti váltás valóban nem keveri össze a két kliens adatait.

## 2026.08.27. — "Ügyfél jellemzői" panel rendezése, kiosztott/nem kiosztható szintek megkülönböztetése

Marci három pontos korrekciót adott a GYT-oldali videókiosztásra:

- **"Ügyfél jellemzői" panel rendezettebbé tétele.** A korábbi `d-flex flex-wrap gap-4` blokk-rács (5 különálló, egyenetlenül tördelődő doboz, mindegyikben címke fent + pirula-váltó alatta) helyett minden tényező egy önálló sor lett (`TraitRow` komponens): címke balra, pirula-váltó jobbra, vékony elválasztóvonallal a sorok között — konzisztens, olvasható elrendezés minden képernyőméreten (mobilon a sor két elemre törhet, de rendezett marad).
- **Térdfájdalom és magas vérnyomás válaszai "igen"/"nem" helyett "van"/"nincs".** Ez a 2 tényező tünet meglétére/hiányára kérdez rá (nem képességre, mint a másik 3), a "van/nincs" természetesebb magyar megfogalmazás erre.
- **Kiosztott vs. még nem kiosztható szintek grafikus megkülönböztetése.** Új `AssignmentDot` segédkomponens a `VideoPickerRow`-ban: kiosztott sornál kitöltött, pipa-ikonos, teal jelvény; nem kiosztott sornál üres, tompított szürke jelvény (`.level-select-badge` alapokon, mint a szint-választó legördülőknél). A "kozben" mód visszanézhető listájában a meglévő `LevelDot`-ot használtuk ugyanerre. **A zárolt szintek szövege egyszerűsítve:** a korábbi, konzultáció-idejét is részletező mondat helyett most csak "még nem kiosztható" — a részletes indoklás (2 hét + 10 edzésnap) az ÜF-oldalon marad, ahol tényleg releváns a magyarázat, a GYT-nek elég a rövid infó. Emiatt a `lockReason` mező is törölve lett a GYT-oldali adatmodellből (holt adat volt, sehol nem jelent volna meg többé).

Böngészőben tesztelve (asztali és mobil nézet is): a panel minden sora egyenletesen rendezett, a "van/nincs" feliratok helyesen jelennek meg, a kiosztott/nem kiosztott jelvények vizuálisan jól elkülönülnek (teal+pipa vs. szürke+üres, 45%-os opacitással), nincs konzol-hiba.

## 2026.08.27. — "Ügyfél jellemzői" panel alapból csukva

Marci: "kerüljük a véletlen átállítást menet közben. Egyszer kell rögzíteni az együttműködés elején, utána már nem módosítjuk."

**Megvalósítás:** a `VariablesPanel` fejléce (fogaskerék + "ügyfél jellemzői" + leírás + nyíl-ikon) most egy kattintható gomb, ami nyitja/csukja a panelt (`expanded` state, alapból `false`). Csukott állapotban csak a fejléc látszik, a pirula-váltók (5 tényező) nem — így nem lehet véletlenül hozzáérni menet közbeni böngészéskor. Nyitáshoz a fejléc bármely részére (szöveg vagy ikon) rá lehet kattintani, nem kell pontosan a fogaskerekét eltalálni.

**Mellékes találat fejlesztés közben:** a böngésző konzolján egy `[vite] Failed to reload ... 500` hibaüzenet jelent meg egy korábbi, menet közbeni (még be nem fejezett) JSX-fragment miatt — ez azonban a szerkesztés befejezése után NEM reprodukálódott friss lapon/újraindított dev szerveren (`npm run build` is hibátlanul lefutott közben), tehát csak egy elavult, a böngésző-fül konzol-pufferében megragadt üzenet volt, nem valós hiba. Tanulság: ha HMR-hiba jelenik meg tesztelés közben, mindig friss fülön/újratöltéssel kell megerősíteni, mielőtt valós hibaként kezelnénk.

**Ellenőrizve:** böngészőben (asztali + mobil), a panel alapból csukva nyílik meg minden oldalbetöltéskor, kattintásra helyesen nyílik/csukódik, a nyíl-ikon elfordul, nincs konzol-hiba egy friss lapon.

## 2026.08.27. — "Kozben" mód szint-listája: egységes sorrendi lista, állapot-jelvények

Marci egy részletes átalakítási ötletet írt le a szint-listához, és kifejezetten kérte, hogy előbb értékeljem/értelmezzem, mielőtt megcsinálom. Visszajelzésem: logikus és jó UX — a pozíció-alapú kiemelés (külön kártya fent) helyett a szín-kódolás viszi a hangsúlyt, ami egy 5 elemű listánál átláthatóbb; a "zöld"-öt a már bevezetett `--lime` márkaszínként értelmeztem (konzisztens az "aktuális szint" jelöléssel); a két "szürkét" két külön, meglévő tokenre (`--color-bg-alt`, `--color-border`) osztottam, hogy világos módban is elkülönüljenek; jeleztem, hogy ez csak a "kozben" módú klienseket (Gábor, Dániel) érinti, a "utana" tömeges kiosztás (Péter) más logikájú, azt nem bántottam; és hogy az eddigi apró áttekintő kör-sor feleslegessé válik, azt töröltem.

**Megvalósítás:**
- Új `LevelRow` komponens: minden szint egy sor, sorrendben, egymás alatt. Asztali/tablet: szint + kód+cím (vagy "javasolt: ..." + "válassz videót" legördülő a kiosztásra várónál, vagy "—" a zároltnál) + jobbra igazított `.status-chip` (KIOSZTVA/KIOSZTÁSRA VÁR/MÉG NEM KIOSZTHATÓ, 3 különböző háttérszínnel). Mobil: összecsukva csak szint + kód (vagy "javasolt [kód]") + kör alakú állapot-ikon; sorra kattintva lenyílik a teljes részlet.
- Új `.status-chip`/`--done`/`--pending`/`--locked` CSS osztályok (`.badge-fyb`-vel azonos pirula-forma, 3 szín-variáns).
- A régi, kiemelt "nyitott szint" kártya és a fölötte lévő apró áttekintő kör-sor törölve.

**Valós hiba, amit tesztelés közben találtam és javítottam:** a videó-választó legördülőt először ugyanabban a JS-értékben próbáltam megjeleníteni az asztali ÉS a mobil-kinyitott nézetben is — mivel a Bootstrap `d-none`/`d-lg-flex` osztályok csak CSS-szinten rejtik el (nem veszik ki a DOM-ból), ez azt eredményezte, hogy a legördülő ténylegesen kétszer volt jelen a DOM-ban, egy közösen megosztott state-tel/reffel — mobilon kinyitva és a legördülőt megnyitva a szöveg és a jelvény egymásra csúszott, összement (`KIOSZTÁSRA VÁR` a cím szövegére lógott rá). Javítás: a legördülőt önálló `VideoPickerInline` komponensbe emeltem, saját belső state-tel — ez biztonságosan újrahasználható több helyen is, mert minden előfordulása független React-példány. Böngészőben újratesztelve (mobil 375px): a kinyitott sor most helyesen, egymás alatt, olvashatóan jeleníti meg a javaslatot, a legördülőt és az állapot-jelvényt.

**Tesztelve:** asztali (1280px) és mobil (375px), világos és sötét mód is — a 3 jelvényszín helyesen, megkülönböztethetően jelenik meg mindkét módban (világos módban ellenőrizve pixel-szinten: kiosztva `#EFF2F3`, kiosztásra vár `#D7E834`, még nem kiosztható `#E1E5E7`); a videó-kiválasztás asztalin és mobilon (kinyitva) egyaránt működik; a "utana" tömeges kiosztás (Péter) változatlan, nem érintett.

**Nyitott pont, amit jeleztem Marcinak:** a "kozben" mód "javasolt: ..." szövege most csak tájékoztató, NEM kattintható gyorsgomb (ellentétben a "utana" tömeges nézet gombjával) — mert a leírt sor-tartalom két külön elemként ("javasolt: ..., válassz videót") sorolta fel őket. Ha ez kényelmetlen, könnyen visszaállítható egy kattintható változatra.

## 2026.08.27. — Javaslat-gomb kattinthatóvá téve, egyenletes térköz, "más videó"

Marci válasza az előző kör nyitott pontjára: igen, legyen kattintható a javaslat is, MINDENHOL (mindkét nézetben) legyen halvány lime háttere, hogy gombnak látsszon. Emellett két további finomítást kért: a sorokon belüli elemek legyenek egyenletesebben elosztva (azonos térköz mindenhol, nem egy nagy rés a jelvény előtt), és a "kozben" mód legördülőjének szövege "válassz videót" helyett "más videó" legyen (mivel már van egy elsődleges javaslat-gomb, a legördülő a másodlagos "vagy válassz mást" szerepet tölti be).

**Megvalósítás:**
- Új `.btn-fyb-suggested` CSS osztály: halvány, áttetsző lime háttér (`rgba(215, 232, 52, 0.18)`, hoverre erősebb) — alkalmazva mind a "kozben" mód `VideoPickerInline` javaslat-gombjára, mind a "utana" tömeges kiosztás már meglévő javaslat-gombjára (ami eddig `.btn-fyb-ghost`-ot használt, most egységesen ez).
- `VideoPickerInline` javaslat-szövege `<span>`-ből kattintható `<button>`-né alakítva, `onAssign` hívással.
- A legördülő placeholder-szövege "kozben" módban "válassz videót" → "más videó".
- A sor-elrendezés egyszerűsítve: a korábbi "tartalom balra tömörítve (kis résekkel) + jelvény jobbra tolva (egy nagy réssel)" helyett most szint száma, kód/cím (vagy javaslat-gomb+legördülő), és a jelvény mind ugyanabban az egy szintű flex-sorban vannak, egységes `gap-3` térközzel — mivel a `detailContent` React-fragmentként (nem külön wrapper divként) ereszkedik bele a szülő flex-sorba, a benne lévő elemek (kód, cím, lábjegyzet, vagy javaslat-gomb+legördülő) automatikusan ugyanazt az egységes térközt kapják, mint a szint száma és a jelvény.

**Tesztelve:** böngészőben (asztali 1280px, mobil 375px, világos + sötét mód) — a javaslat-gomb kattintásra azonnal alkalmazza magát mindkét nézetben, a halvány lime háttér látszik, a térközök egyenletesek, "más videó" felirat helyesen jelenik meg, a teljes javaslat-cím kifér asztalin/tableten, mobilon csak lenyitás után látszik a teljes szöveg (összecsukva csak "javasolt [kód]"). Nincs konzol-hiba egy friss lapon.

## 2026.08.27. — Valódi rács-igazítás, utólagos javítás gomb, "limitációk"

Marci visszajelzése az előző körre: az egyenletes térköz (flex + gap) még mindig nem elég, "most balra zárt az egész" — valódi táblázat-szerű, OSZLOPONKÉNTI igazítást kért: a szintek egymás alatt, a számkódok egymás alatt, a címek kezdetei egymás alatt, az állapot-gombok bal széle is egymás alatt. Emellett két új funkciót kért: (1) egy már kiosztott videó utólagos javítási lehetősége, de csak a 2 legutóbb kiosztott szintre visszamenőleg (piros "javítás" gombbal), a korábbiak véletlen átírásának elkerülésére; (2) az "ügyfél jellemzői" cím átnevezése "limitációk"-ra.

**Megvalósítás:**
- `.level-row-grid`: valódi CSS Grid, 4 fix oszloppal (`5.5rem 4.5rem 1fr auto`, `column-gap: 1.5rem`) a korábbi flex+gap megoldás helyett. Lezárt szintnél a kód és a cím külön (2., ill. 3.) oszlopba kerül; kiosztásra várónál/zároltnál a 2-3. oszlop összevonva, mert azok tartalma (javaslat-gomb+legördülő, ill. "—") nem bontható kód/cím párra. A jelvény mindig a 4. oszlopban — így minden sorban azonos x-pozícióban kezdődik, függetlenül attól, hogy a jelvény szövege ("KIOSZTVA" vs. "KIOSZTÁSRA VÁR" vs. "MÉG NEM KIOSZTHATÓ") milyen hosszú.
- **Utólagos javítás:** a szülő komponens minden "kozben" módú kliensnél kiszámolja az utolsó 2 lezárt szint sorszámát (`levels.filter(lezart).slice(-2)`), és csak ezekhez ad `onAssign`-t és `editable`-t a `LevelRow`-nak. Az érintett soroknál egy piros `.btn-fyb-danger` "javítás" gomb jelenik meg a jelvény mellett; kattintásra a kód+cím helyén megjelenik a "más videó" legördülő (a `VideoPickerInline` újrahasznosításával, javaslat nélkül), amivel felülírható a korábbi választás. Az "ablak" mindig a legutóbbi 2-höz kötött — új kiosztással a legrégebbi kikerül a javítható körből.
- Új `.btn-fyb-danger` CSS osztály (a már meglévő `--color-danger` — "semleges piros/korall" — tokent használva, ami eddig sehol nem volt bevezetve a komponensekben).
- "ügyfél jellemzői" → "limitációk" a panel címében.

**Tesztelve:** böngészőben (asztali 1280px, mobil 375px, világos + sötét mód) — az oszlopok pontosan igazodnak minden sorban; a "javítás" gomb csak a 2 legutóbbi lezárt szinten jelenik meg, egy 3. kiosztás után az 1. szintről el is tűnik (élesben kipróbálva: Gábornál 1-2. szint kiosztva → mindkettőn javítás; 3. szint is kiosztva → csak 2-3. szinten javítás, az 1.-en már nem); a javítás gombra kattintva a legördülőből választott új videó azonnal frissíti a sort, a lábjegyzet megmarad; mobilon lenyitva ugyanez működik. Nincs konzol-hiba egy friss lapon.

## 2026.08.27. — Mobil finomítások: legördülő túlnyúlás, indokolatlan térköz

Marci két mobil-specifikus hibát jelzett: (1) a "más videó" legördülő menü kilóg balra a kártyából (nem fér bele a keretbe); (2) az összecsukott sorban az "1. szint" + kód szorosan egymás mellett van, utána egy indokolatlan méretű üres térköz, majd jobb szélen a pipa-ikon.

**Ok és javítás — legördülő túlnyúlás:** a `.level-select-menu` alapból jobbról-kinőve nyílik (`right:0; left:auto`), ami a lap-fejléces dropdownoknál (ügyfél-választó a jobb felső sarokban) helyes, mert azok jellemzően a sor jobb szélén ülnek. A `VideoPickerInline` viszont a szint-sorok BAL oldalán jelenik meg — jobbról-kinövő menüvel ez keskeny mobil-kártyán balra túlnyúlik. Javítva egy mobil-specifikus felülírással: `@media (max-width: 991.98px) { .level-row .level-select-menu { left: 0; right: auto; } }` — csak a szint-sorokba ágyazott legördülőket érinti, a lap-fejléces dropdownokat nem.

**Ok és javítás — indokolatlan térköz:** az összecsukott mobil sor korábban `justify-content: space-between`-t használt egy bal oldali szöveg-csoport és egy jobbra tolt `LevelDot` között — ez pont azt a fajta "nagy rés a jelvény előtt" hibát reprodukálta, amit az asztali nézetnél már egyszer kijavítottunk, csak itt a mobil összecsukott fejlécben maradt bent. Javítva: a `justify-content: space-between` eltávolítva, a szint száma, a kód/javaslat és az ikon most egy közös, egységes `gap-2` térközű sorban vannak.

**Tesztelve:** mobil (375px), Kovács Gábor kliensnél — a "3. szint" kinyitva, "más videó" legördülő megnyitva: a menü teljes egészében a kártyán belül marad (`left: 32px, right: 288px` egy 375px széles nézetben). Az "1. szint" javítás-legördülője is ugyanígy ellenőrizve. Az összecsukott sorok most szorosan, egyenletes térközzel jelenítik meg a szint számát, kódját és az ikont, nincs több üres rés középen. Nincs konzol-hiba egy friss lapon.

## 2026.08.27. — Állapot-gombok egyenlő szélessége, mobil "sorkizárás" pontosítva

Marci: az asztali nézet elrendezése rendben van, egy kis módosítást kér — az állapot-gombok/jelvények szélessége mind igazodjon a leghosszabb felirathoz ("még nem kiosztható"), pixelpontosan. A mobil nézetnél viszont visszajelezte, hogy az előző körben adott javítás túllőtt a célon: nem azt szerette volna, hogy minden elem balra tömörödjön, hanem "sorkizárt" elrendezést — elem a sor elején, elem a végén, a köztes elem(ek) arányosan elosztva köztük.

**Ok — állapot-gombok eltérő szélessége:** minden `LevelRow` a saját, független CSS Grid kontextusát rendereli (`.level-row-grid`), így a 4. (állapot) oszlop korábbi `auto` szélessége SORONKÉNT külön számolódott a sor saját tartalmához — ezért lett a "kiosztva + javítás" ≈166px, a "kiosztásra vár" ≈140px, a "még nem kiosztható" ≈176px, mindhárom eltérő.

**Javítás:** a 4. oszlop fix `11rem`-re állítva (a mért ~176px-es "még nem kiosztható" szélességhez igazítva). A "kiosztva + javítás" kombináció `justify-content: space-between`-nel tölti ki ezt a fix szélességet (jelvény balra, gomb jobbra); az önmagában álló jelvények `flex:1; text-align:center`-rel nyúlnak a teljes szélességre. Ellenőrizve JS-mérésekkel: mind az 5 sor állapot-oszlopa pontosan 176px széles.

**Ok — mobil "balra tömörítés":** az előző körben a "nagy rés" panaszra válaszul teljesen töröltem a `justify-content: space-between`-t a mobil összecsukott sorból, ehelyett mindent egy egységes `gap-2`-vel balra tömörítettem. Ez túllépte a kért javítást — Marci valójában a "sorkizárt" elvet akarta megtartani (elem a sor elején ÉS végén), csak a köztes elosztást akarta arányosabbá tenni, nem az egész elvet megszüntetni.

**Javítás:** a mobil sor `justify-content: space-between` visszaállítva, DE a szint száma, a kód/javaslat-szöveg és az ikon most 3 KÜLÖN, azonos szintű flex-gyermek (nem egy összevont "szöveg + ikon" 2-elemes csoportosítás, mint korábban) — így a rendelkezésre álló hely 2 (közel) egyenlő résre oszlik a 3 elem között, nem egyetlen nagy résre 2 csoport között. JS-méréssel ellenőrizve: "1. szint" a sor bal szélén (x=0), az ikon a jobb szélén (x=rowWidth), a kód köztük, arányosan.

**Tesztelve:** asztali (1280px) és mobil (375px), világos + sötét mód — mind az 5 sor állapot-oszlopa azonos szélességű asztalin; a "javítás" mód alatt (amikor nincs gomb) az önmagában álló jelvény is helyesen kitölti a teljes oszlopszélességet; mobilon a sorkizárt elrendezés JS-méréssel megerősítve. Nincs konzol-hiba egy friss lapon.

## 2026.08.27. — Kiosztások lezárva, "limitációk" mentés/módosítás, sötét mód kontraszt-átvizsgálás

Marci visszajelzése: a GYT-videókiosztás oldal kiosztásai/elrendezései minden nézetben tökéletesek, ez **lezárva**. Emellett három új kérés: (1) a "limitációk" dobozhoz egy "mentés" gomb, ami zárolja a kapcsolókat és "módosítás"-ra vált, a doboz becsukásakor pedig automatikusan mentsen; (2) sötét módban több dobozhatár/gombhatár nem látszik — ezt Marci a világos/sötét mód közti eltérő érzékelhetőségi küszöbbel indokolta ("világos módban egy kis árnyalat-különbség is látszik, sötétben nagyobb kell"); (3) az egész oldal sötét módjának teljes átvizsgálása (minden gomb, dobozhatár, felirat), esztétikus javítással.

**Megvalósítás — mentés/módosítás zárolás:**
- `VariablesPanel` új `locked`/`onLockedChange` propokat kapott; a szülő (`GytVideokiosztas`) kliensenként külön tárolja a zárolás-állapotot (`variablesLockedByClient`, alapból mindenkinél `true` — a panel mindig zárolva nyílik).
- Minden `TraitRow` pirula-kapcsoló gombja `disabled={locked}`; a panel alján egy gomb: zárolt állapotban "módosítás" (outline stílus), feloldva "mentés" (primary stílus) — kattintásra `onLockedChange(!locked)`.
- A panel fejlécére kattintva nyit/csuk; **becsukáskor, ha épp fel volt oldva (nincs elmentve), automatikusan zárol** (`onLockedChange(true)`), hogy ne maradjon szerkeszthető állapot a panel elrejtése után.
- **Hiba, amit menet közben találtam és javítottam:** a becsukás-logikát először a `setExpanded` funkcionális updaterébe ágyaztam (`setExpanded((e) => { ...; onLockedChange(true); return next })`) — ez a React "Cannot update a component while rendering a different component" hibáját/figyelmeztetését váltotta ki, mert a szülő state-jét frissítő hívás a gyermek renderelése KÖZBEN, egy setState-updateren belülről futott. Javítás: a `expanded` értéket a closure-ből olvasva, külön, egymás utáni utasításként hívtam a helyi `setExpanded(next)`-et, majd feltétellel a szülő `onLockedChange(true)`-t — friss lapon ellenőrizve, a hiba megszűnt.
- Új `.auth-tab:disabled` CSS szabály (`opacity: 0.55; cursor: not-allowed;`) — a zárolt panel pirula-kapcsolóit vizuálisan is egyértelműen inaktívvá teszi.

**Sötét mód kontraszt-átvizsgálás — gyökér-ok:** a `theme.css` sötét-mód blokkjában `--color-bg-alt` és `--color-surface` színe véletlenül azonos volt (`#212F3F`), ezért minden erre épülő, kártyán belüli elem (jelvény-háttér, pirula-sáv) színben megegyezett a kártya hátterével, tehát láthatatlan volt. Ezt JS-ben `getComputedStyle`-lal mért, egyező RGB-értékekkel erősítettem meg, nem csak vizuálisan. **Mivel ez egy megosztott design-token, nem oldal-specifikus CSS, a javítás is token-szinten történt** (`theme.css`), ami minden oldalra kihat, nem csak a GYT-videókiosztásra.

**Megvalósítás — token-javítás:**
- `--color-bg-alt: #212F3F` → `#2C3E52`, `--color-border: #2E3D4F` → `#44586F` — mostantól szigorúan lépcsőzetes: `--color-bg` \< `--color-surface` \< `--color-bg-alt` \< `--color-border`, minden szomszédos pár jól megkülönböztethető.
- Új szabály: `html[data-theme='dark'] .card-fyb { border: 1px solid var(--color-border); }` — sötét módban a sima kártyák `box-shadow`-ja önmagában nem ad látható elhatárolást egy már sötét oldalháttéren, ezért explicit szegélyt kaptak.

**Tesztelve (regressziós ellenőrzéssel, mivel a token-javítás globális):** böngészőben, friss lapokon, sötét módban (`localStorage.setItem('fyb-theme','dark')` + navigálás, mert a közvetlen `data-theme` attribútum-állítás felülíródik az induló szkript által) — a GYT-videókiosztás oldal minden státusz-jelvénye, gombja, doboz-határa és az "auth-tab" pirula-váltói most jól láthatóak mindkét ("kozben" és "utana") módban, asztali és mobil nézetben egyaránt. Regressziós spot-check a Főoldalon (hero, "kinek segítünk" kártyák, folyamat-lépések, "nem csak mi mondjuk" idézet-kártya, CTA-gomb) és a Bejelentkezés oldalon (form-kártya, mezők, fül-váltó) — mindkettő rendben, nincs vizuális törés a token-változástól. `npm run build` hibamentes.

## 2026.08.27. — Valódi teszt-belépési lehetőség (ÜF + GYT)

Marci kérte, hogy legyen két konkrét, kipróbálható teszt-fiók a Belépés oldalon: **Példa Béla** (`peldabela@peldabela.hu`) mint teszt-ügyfél, és **Kollé Gábor** (`kollega@kollega.hu`) mint teszt-gyógytornász — mindkettő úgy, hogy a megfelelő szerepkör felületére navigáljon be.

**Ok, hogy eddig ez nem működött:** a Belépés (`Belepes.tsx`) form eddig tisztán UI-vázlat volt — bármilyen e-mail/jelszó megadásával "sikeresen bejelentkeztél" üzenetet mutatott, és mindig ugyanoda (`/gyakorlatok`) irányított; a beviteli mezők nem is voltak kontrollált React state-hez kötve. Mivel a projektnek nincs adatbázisa/valódi hitelesítése (UI-terv, nem működő rendszer), két konkrét, kódba égetett teszt-fiókkal old­ottuk meg a szerepkör-alapú útvonalválasztást.

**Megvalósítás:**
- `Belepes.tsx`: `TEST_ACCOUNTS` map (e-mail → `{name, role}`) a két megadott fiókkal. Bejelentkezéskor a beírt e-mail (kisbetűsítve, space nélkül) ezekhez van illesztve; egyezés esetén a session (`{name, role}`) `localStorage`-be kerül (`fyb-session` kulcs, ugyanaz a minta, mint a `fyb-theme`-nél), és a sikeres-képernyő a szerepkörnek megfelelő szöveggel/linkkel jelenik meg (ÜF → "a gyakorlataimhoz" / `/gyakorlatok`, GYT → "a videókiosztáshoz" / `/gyt/videokiosztas`). Nem egyező e-mailnél piros hibaszöveg jelenik meg, és a form a helyén marad. A form alján egy tájékoztató sor mutatja mindkét teszt-fiók e-mail címét (a jelszó bármi lehet, nincs valódi ellenőrzés).
- Regisztrációnál (mivel csak ÜF regisztrálhat, GYT-fiókot nem itt hoznak létre) a megadott név kerül a session-be, `role: 'ugyfel'`-lel.
- `AppLayout.tsx`: új `role` prop (`'ugyfel' | 'gyt'`); mountoláskor beolvassa a `fyb-session`-t, és ha a session szerepköre egyezik a layout szerepkörével, a session nevét mutatja a topbar/sidebar köszöntésben ("Szia, ...!") — egyébként a korábbi statikus alapértelmezés (`Péter`/`Judit`) marad, hogy a bejelentkezés kihagyásával (közvetlen URL-lel) történő böngészés is működjön, ahogy eddig.
- `App.tsx`: a két `AppLayout`-routecsoport (ÜF, GYT) mostantól `role="ugyfel"`, ill. `role="gyt"` propot is kap.

**Tesztelve böngészőben:** `peldabela@peldabela.hu` → "sikeresen bejelentkeztél, Példa Béla" → gyakorlatok oldal, sidebar "Szia, Példa Béla!"; `kollega@kollega.hu` → "sikeresen bejelentkeztél, Kollé Gábor" → videókiosztás oldal, sidebar "Szia, Kollé Gábor!"; ismeretlen e-mail → piros hibaüzenet, marad a form. `npm run build` hibamentes.

## 2026.08.27. — Belépés után egyenesen a felület, sötét mód második korrekciós kör

Marci két dolgot kért: (1) a bejelentkezés/regisztráció utáni köztes "sikeresen bejelentkeztél" doboz (gombbal) felesleges — a belépés egyenesen a webapp-felületet nyissa meg; (2) sötét módban a "limitációk" felirat legyen fehér, és további kontraszt-korrekció kell: vastagabb dobozhatár-vonalak, erősebb derengés a kiemelt (accent) kártyák mögött, és a sötétkék hátterű gombok/dobozok (pl. legördülők) jobban váljanak el az alap háttértől.

**Megvalósítás — köztes doboz eltávolítása:** `Belepes.tsx`-ben a `session`/sikeres-képernyő state és JSX törölve; `handleLogin`/`handleRegister` most `useNavigate()`-tel közvetlenül a szerepkörnek megfelelő útvonalra navigál (`/gyakorlatok` ill. `/gyt/videokiosztas`), a `fyb-session` mentése után. A `ROLE_TARGET` szöveges objektum egyszerű `ROLE_PATH` útvonal-térképre cserélve, mivel a köztes szöveg/gomb-címke már nem kell.

**Megvalósítás — "limitációk" fehér szöveg:** a hiba oka: a panel fejléce egy natív `<button>`, aminek nincs explicit `color`-a — a böngésző alapértelmezett UA-stílusa (fekete) érvényesült a rajta belüli `<strong>`-re és ikonra is, mert a `<button>` elem NEM örökli automatikusan a szülő szövegszínét (ellentétben a legtöbb más elemmel), ha nincs `.btn`/`.btn-fyb` osztálya, ami ezt expliciten beállítaná. JS-sel (`getComputedStyle`) megerősítve: a felirat tényleges színe `rgb(0,0,0)` volt, világos módban ez véletlenül belesimult, sötét módban viszont láthatatlanná vált a navy háttéren. Javítás: a fejléc-gombra explicit `color: 'var(--color-text)'` inline stílus — a `<strong>` és az ikon (currentColor-alapú maszk) is ebből örököl. Átvizsgálva a többi natív, osztály nélküli `<button>`-t is (`background:'none'; border:'none'` minta) — ez volt az egyetlen ilyen előfordulás a kódbázisban.

**Megvalósítás — sötét mód, második kontraszt-kör:**
- `theme.css`: `--color-surface` (`#212F3F` → `#263A50`), `--color-bg-alt` (`#2C3E52` → `#33475F`), `--color-border` (`#44586F` → `#5A7592`) — a lépcsőzetes skála (bg < surface < bg-alt < border) lépésközei nagyobbra nyitva, hogy a felületi (surface) hátterű elemek (pl. legördülők) jobban elváljanak az alap navy háttértől.
- `.card-fyb` sötét módú szegélye 1px → 2px.
- `.card-fyb-accent` / `.process-step .card-fyb` sötét módú szegélye 1px → 2px, a derengő `box-shadow` blur/opacitása 28px/0.14 → 40px/0.24-re erősítve.
- Új sötét-mód szabályok: `.level-select-toggle`/`.level-select-menu` szegélye 2px, `.locked-card` szaggatott szegélye 3px, `.app-sidebar` jobb szegélye és `.app-topbar` alsó szegélye 2px.

**Tesztelve böngészőben:** mindkét teszt-fiókkal bejelentkezve a form közvetlenül a megfelelő app-felületre navigál, köztes doboz nélkül. Sötét módban a "limitációk" felirat számítva `rgb(248, 249, 250)` (offwhite) — JS-mérésekkel megerősítve. A kártyák, legördülők, oldalsáv és felső sáv szegélyei vizuálisan és JS-méréssel is vastagabbak/láthatóbbak; a `.card-fyb-accent` derengés JS-mérve `40px 8px rgba(95,211,188,0.24)`. `npm run build` hibamentes.

## 2026.08.27. — GYT-oldal: ügyfél-választás első lépésként, minden almenü ehhez igazodik

Marci kérése: a GYT felületén az ELSŐ lépés legyen az ügyfél kiválasztása, és minden további almenü (videókiosztás, dokumentáció stb.) már a kiválasztott ügyféllel foglalkozzon — ne a videókiosztás oldal saját, beágyazott legördülőjével lehessen csak ügyfelet váltani.

**Egyeztetés Marcival (AskUserQuestion):** (1) az ügyfél-választó önálló menüpont + kezdőlap legyen, a sidebar-ból bármikor elérhető maradjon (nem egyszeri, bejelentkezés utáni kapu) — így napközben, kijelentkezés nélkül lehet ügyfelet váltani; (2) a választó-listán soronként csak a név szerepeljen, állapot-összegzés nélkül.

**Megvalósítás:**
- **Adat-kiszervezés:** a korábban a `GytVideokiosztas.tsx`-be zárt `clients` tömb, `Client`/`GytLevel`/`LevelState` típusok, `codeLabel()` és `initialVariables` átkerültek egy önálló, megosztott modulba (`src/data/gytClients.ts`) — így más GYT-oldali oldal (most az új ügyfél-lista, később a dokumentáció/munkafüzet stb.) is hivatkozhat ugyanarra az ügyfél-adatra, egy forrásból.
- **Kiválasztott ügyfél megosztása:** `getSelectedClientId()`/`setSelectedClientId()` — `localStorage` (`fyb-gyt-client` kulcs), ugyanaz a perzisztencia-minta, mint a `fyb-theme`/`fyb-session`-nél. Hiányzó/érvénytelen kulcs esetén az első kliensre (`clients[0].id`) esik vissza — így egy közvetlen URL-lel érkező, még nem választott GYT sem kap üres/hibás állapotot.
- **Új oldal — `GytUgyfelek.tsx` (`/gyt/ugyfelek`):** egyszerű, kattintható névlista (`.card-fyb` + `.module-item` minta újrahasznosítva, kezdőbetű-jelvénnyel) — kattintásra elmenti a választást és a videókiosztás oldalra navigál. Ez lett az ÚJ landolóoldal GYT-bejelentkezés után (`Belepes.tsx` `ROLE_PATH.gyt`: `/gyt/videokiosztas` → `/gyt/ugyfelek`), ÉS egy önálló, mindig elérhető sidebar-menüpont (`ügyfeleim`, első helyen, `ikon_kezdolap.svg`) — nem egyszeri kapu, bármikor visszaléphet ide a GYT másik ügyfelet választani.
- **`GytVideokiosztas.tsx` egyszerűsítve:** a korábbi, oldalon belüli ügyfél-választó legördülő (saját state, kattintás-kívülre-zárás logika) törölve; a `clientId` most `getSelectedClientId()`-ból inicializálódik (a komponens minden új mountnál — pl. "ügyfeleim"-ből visszanavigálva — újraolvassa). A fejlécben az ügyfél neve helyette egy kattintható "[Név] · váltás" gomb, ami az `/gyt/ugyfelek` listára navigál vissza.

**Buktató, amit menet közben találtunk:** a `VariablesPanel` típusaihoz szükséges `ClientVariables` importot a kiszervezés közben véletlenül eltávolítottam (a `codeLabel`/`initialVariables` importja mellett) — `tsc` build hibát adott (`Cannot find name 'ClientVariables'`), egy hiányzó import visszapótlásával azonnal javítva.

**Tesztelve böngészőben:** GYT-belépés után egyenesen az "ügyfeleim" lista jelenik meg (nem a videókiosztás); Kovács Gábor kiválasztása a "kozben" módú listáját tölti be helyesen; "· váltás" gombbal vissza az ügyfél-listára; Péter kiválasztása a "utana" módú tömeges kiosztást tölti be helyesen; `localStorage` törlése + közvetlen `/gyt/videokiosztas` URL-lel érkezés az első ügyfélre (Péter) esik vissza hiba nélkül. Konzol-hiba nincs, `npm run build` hibamentes.

## 2026.08.27. — "váltás" gomb törölve, keresőmező az "ügyfeleim" oldalon

Marci visszajelzése: a videókiosztás fejlécében lévő "[Név] · váltás" gomb felesleges (a sidebar "ügyfeleim" menüpontja már biztosítja az ügyfél-váltást), és az "ügyfeleim" listán legyen kereső, hogy sok ügyfél esetén gyorsan rá lehessen szűrni egy névre.

**Megvalósítás:**
- `GytVideokiosztas.tsx`: a fejlécbeli kattintható "[Név] · váltás" gomb egyszerű, nem interaktív `<span className="fw-bold">` feliratra cserélve — az ügyfél neve továbbra is látszik (kontextus, kivel dolgozik éppen a GYT), de navigáció/kattintás nélkül. Az ezzel feleslegessé vált `useNavigate` import/hívás törölve.
- `GytUgyfelek.tsx`: új `search` state + `<input type="search">` a lista fölött; a `clients` tömb `.filter()`-rel szűrve (kisbetűsített, ékezet-érzékeny substring-egyezés a névre). Nulla találat esetén "nincs találat" üzenet a lista helyén.

**Tesztelve böngészőben:** "gáb" beírására csak Kovács Gábor marad a listán; értelmetlen keresésre ("xyz") "nincs találat" jelenik meg; a videókiosztás fejlécében az ügyfél neve (pl. "Péter") változatlanul látszik, de gomb/kattintás nélkül. Egy régi (sok korábbi HMR-frissítést átélt) böngészőfülön hamis "useNavigate is not defined" konzolhiba jelent meg — friss fülön megismételve nem reprodukálódott, tehát a megszokott stale HMR-gyorsítótár-hiba volt, nem valós kódhiba. `npm run build` hibamentes.

## 2026.08.27. — Rövidebb kereső, "kijelentkezés" az oldalsáv alján

Marci két apró korrekciót kért: az "ügyfeleim" keresőmező legyen rövidebb (eddig a teljes tartalom-szélességet kitöltötte); az oldalsáv alján lévő, eddig "vissza a főoldalra" feliratú link neve legyen "kijelentkezés".

**Megvalósítás:**
- `GytUgyfelek.tsx`: a keresőmező `max-width: 16rem`-re korlátozva (a `form-control` alapból teljes szélességű lenne).
- `AppLayout.tsx` (közös komponens, ÜF és GYT oldalsávra egyaránt hat): a link felirata "kijelentkezés"-re változott. Mivel ez a felirat már valódi kijelentkezést sugall, a kattintás nemcsak a főoldalra navigál, hanem törli a munkamenet-állapotot is (`localStorage` `fyb-session` és `fyb-gyt-client` kulcsok) — így egy következő belépés/oldal-látogatás nem az előző (bejelentkezett vagy kiválasztott) személy adataival indul, hanem az alapértelmezett/választás előtti állapottal.

**Tesztelve böngészőben:** a keresőmező szélessége JS-mérve pontosan 256px (16rem); "kijelentkezés"-re kattintva a `fyb-session` és `fyb-gyt-client` kulcsok törlődnek, és az oldal a főoldalra navigál. `npm run build` hibamentes.

## 2026.08.27. — App-belüli logó ne navigáljon, "Szia, név" a mobil fejlécbe középre

Marci két korrekciót kért: (1) bejelentkezve (az app-felületen belül) a Fix Your Back logóra kattintva ne történjen semmi — eddig a "/" főoldalra navigált, ami az app-vázból (AppLayout) kiléptetett, ez a felhasználó számára kijelentkezésnek tűnt; (2) a "Szia, [név]!" köszöntés kerüljön be a mobil fejlécbe, a logó és a hamburgermenü közé, középre — más nézetekben (tablet, asztali) maradjon csak az oldalsávban, ahogy eddig is.

**Megvalósítás:**
- `AppLayout.tsx`: a mobil fejléc és az oldalsáv tetején lévő logó mindkét előfordulása `<Link to="/">`-ból egyszerű, nem interaktív `<div className="brand-logo">`-ra cserélve (az oldalsávi példánynál az `onClick={() => setOpen(false)}` is törölve) — kattintásra tényleg semmi nem történik, sem navigáció, sem menü-bezárás.
- A korábban a fejléc-sor ALATT, külön sorban lévő `.app-topbar-greeting` a sorba (`.app-topbar-row`) került, a logó és a hamburger-gomb közé.
- `components.css`: `.app-topbar-row` flex+space-between helyett 3 oszlopos rács (`grid-template-columns: 1fr auto 1fr`) — a logó és a hamburger-gomb egyenlő "1fr" oszlopokban van, a köztük lévő auto-szélességű oszlopban a köszöntés így optikailag középre kerül. **Buktató:** először `minmax(0, 1fr)`-rel próbáltam matematikailag PONTOSAN egyenlő oszlopszélességet kikényszeríteni — ez azonban a logó (két soros "FIX YOUR BACK" felirat) természetes szélessége alá szorította a logó oszlopát 375px-es mobil nézetben, és a logó képe rálógott a köszöntés szövegére. Visszaállítva sima `1fr auto 1fr`-re (a fr-oszlopok implicit tartalom-alapú minimumával) — ez nem matematikailag pixelpontos közép (JS-méréssel ~12px eltérés egy 335px széles sorban, kb. 3,6%), de nincs átfedés, és a szem számára gyakorlatilag középen van.

**Tesztelve böngészőben:** mobil (375px) nézetben a logóra kattintva nem történik semmi (a `<div>`-nek nincs `href`-je); "Szia, Judit!" jól láthatóan, átfedés nélkül a logó és a hamburger között ül; asztali (1280px) nézetben a fejléc-sor egyáltalán nem jelenik meg (`d-lg-none`), a köszöntés csak az oldalsávban látszik, ahogy eddig is. Konzol-hiba nincs, `npm run build` hibamentes.

## 2026.08.27. — SALES belépési oldal (3. szerepkör)

Marci kérése: hozzuk létre a SALES (értékesítő) belépési oldalát. A `Projket specifikáció.md` szerint a SALES feladata: "az ÜF-et GYT-hez rendeli" — ez a projekt 3. szerepköre az ÜF és a GYT mellett.

**Egyeztetés Marcival (AskUserQuestion):** ebben a körben csak a belépési pont és egy helykitöltő kezdőlap készül el (a "hamarosan" mintát követve, mint a GYT lakatos, még nem kész almenüinél) — a tényleges ÜF→GYT hozzárendelő lista egy következő körben készül.

**Megvalósítás:**
- Új teszt-fiók: **`ertekes@ertekes.hu`** → Értékes Eszter, `role: 'sales'` — a `Belepes.tsx` `TEST_ACCOUNTS`/`ROLE_PATH` bővítve, a hibaüzenet és a form alatti tájékoztató szöveg is frissítve mindhárom teszt-fiókkal.
- `AppLayout.tsx`: a `role` prop típusa `'ugyfel' | 'gyt'` → `'ugyfel' | 'gyt' | 'sales'`-re bővítve (a `sessionName()` segédfüggvénnyel együtt), hogy a session-alapú névfelismerés a SALES-re is működjön.
- Új oldal, `SalesHozzarendeles.tsx` (`/sales/hozzarendeles`) — egyetlen `.locked-card` "hamarosan" üzenettel (ugyanaz a vizuális minta, mint a GYT-oldal "az együttműködés lezárult" dobozánál), amíg a tényleges hozzárendelő funkció el nem készül.
- `App.tsx`: új route-csoport (`AppLayout navItems={salesNavItems} userName="Eszter" role="sales"`), a `salesNavItems` egyelőre egyetlen aktív menüpontot tartalmaz ("hozzárendelés", `ikon_plusz.svg`) — a spec egyelőre nem sorol fel több SALES-specifikus almenüt, ezért nem találtunk ki továbbiakat.

**Tesztelve böngészőben:** `ertekes@ertekes.hu` bejelentkezés → egyenesen a "ügyfél–GYT hozzárendelés" placeholder oldalra navigál, mobil fejlécben "Szia, Értékes Eszter!" középen, asztali nézetben az oldalsávban ugyanez, egyetlen "hozzárendelés" menüponttal; "kijelentkezés" a session-t helyesen törli. Konzol-hiba nincs, `npm run build` hibamentes.

## 2026.08.27. — ADMIN belépési oldal (4. szerepkör)

Marci kérése: készítsük el az ADMIN oldalát. A specifikáció szerint az ADMIN "mindent lát" — a projekt negyedik (és egyben utolsó) szerepköre az ÜF, GYT és SALES mellett. Ugyanazt a mintát követtem, mint a SALES-nél: teszt-belépés + helykitöltő kezdőlap, a tényleges "mindent látó" áttekintő funkció (összes ügyfél/GYT/SALES egy nézetben) egy következő körre halasztva — nem kellett újra megkérdezni, mivel ez már az előző körben egyeztetett, bevált minta.

**Megvalósítás:**
- Új teszt-fiók: **`admin@admin.hu`** → Admin Anna, `role: 'admin'` → `/admin/attekintes`. `Belepes.tsx` `TEST_ACCOUNTS`/`ROLE_PATH`/hibaüzenet/tájékoztató szöveg mind a 4 teszt-fiókkal bővítve.
- `AppLayout.tsx` `role` típusa `'ugyfel' | 'gyt' | 'sales'` → `+ 'admin'`.
- Új oldal, `AdminAttekintes.tsx` (`/admin/attekintes`) — ugyanaz a `.locked-card` "hamarosan" minta, mint a SALES placeholder oldalánál.
- `App.tsx`: új route-csoport (`AppLayout navItems={adminNavItems} userName="Anna" role="admin"`), `adminNavItems` egyelőre egyetlen aktív menüponttal ("áttekintés", újrahasznosítva az `ikon_kezdolap.svg`-t, mint a GYT "ügyfeleim" menüpontjánál).

**Mellékes megfigyelés (nem hiba, csak visszaigazolás):** az "Admin Anna" hosszabb név, mint a korábbi tesztnevek — a mobil fejléc középső oszlopán a korábban (a "Szia, [név]!" középre-igazítás körében) bevezetett `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` szabály itt élesben is helyesen működött, "Szia, Admin A…"-ra vágva a szöveget túlcsordulás/tördelés helyett.

**Tesztelve böngészőben:** `admin@admin.hu` bejelentkezés → egyenesen az "áttekintés" placeholder oldalra navigál, asztali és mobil nézetben egyaránt helyesen; "kijelentkezés" a session-t törli. Konzol-hiba nincs, `npm run build` hibamentes.

## 2026.08.27. — SALES oldal belseje: ügyfél–GYT hozzárendelés

Marci kérése: dolgozzuk ki a SALES oldal (eddig "hamarosan" placeholder) tényleges tartalmát — a specifikáció szerinti fő SALES-funkciót, az ÜF-ek GYT-hez rendelését.

**Adatmodell:** új `src/data/salesClients.ts` — `GYT_STAFF` (3 fős demó gyógytornász-lista: Kollé Gábor, Nagy Réka, Tóth Bence — ez a projekt első helye, ahol több GYT is szerepel, eddig csak egy GYT-teszt-fiók volt) és `initialSalesClients` (5 demó ügyfél: a 3, GYT-oldalon már ismert kliens — Péter, Kovács Gábor, Varga Dániel — mind "Kollé Gábor"-hoz rendelve, a történet-folytonosság kedvéért; plusz 2 ÚJ, még hozzárendelés nélküli demó-ügyfél — Tóth Eszter, Balogh Máté —, hogy legyen mit ténylegesen elvégeznie a SALES-nek).

**Megvalósítás (`SalesHozzarendeles.tsx`):**
- Fejléc alatt egy mondat mutatja, hány ügyfél vár még hozzárendelésre (`0` esetén más szöveg: "minden ügyfélhez tartozik gyógytornász").
- Keresőmező (a GYT "ügyfeleim" mintájával azonos: `max-width: 16rem`, valós idejű névszűrés, "nincs találat" üres állapot).
- Minden ügyfél egy sorban: név + `.status-chip` (`--pending` "vár hozzárendelésre" / `--done` "hozzárendelve"), jobb oldalt egy `GytPicker` legördülő (a `.level-select`/`.level-select-toggle`/`.level-select-menu` osztályok újrahasznosításával, a `VideoPickerRow` GYT-oldali mintájára) a GYT kiválasztásához/módosításához.
- **A hozzárendelésre váró ügyfelek a lista tetejére rendezve** — ez a SALES napi prioritása, nem az eredeti (adatbeviteli) sorrend.

**Tesztelve böngészőben:** asztali (1280px) és mobil (375px) nézetben is — a legördülő helyesen felsorolja mindhárom GYT-t; egy GYT kiválasztása azonnal frissíti a sort ("hozzárendelve" jelvényre vált, a névre a kiválasztott GYT kerül, a fejléc alatti számláló csökken, a sor a lista végére kerül a következő renderkor); keresés "péter"-re csak Pétert mutatja. Konzol-hiba nincs, `npm run build` hibamentes.

## 2026.08.27. — SALES oldal: teljes ügyfél-felvételi űrlap

Marci pontosította a SALES oldal felépítését: legyen egy beviteli űrlap ezekkel a mezőkkel — név, e-mail, telefonszám, kezdő időpont, gyógytornász, befizetett (utóbbi egy kapcsoló/toggle). Kiegészítés: a kezdő időpont csak akkor jelenjen meg a gyógytornász naptárában, ha az ügyfél már fizetett — ez egy jövőbeli, még nem épített GYT-funkció (a "kapacitás" almenü, ami egyelőre lakatos) üzleti szabálya, amit itt dokumentumként/jövőbeli megkötésként rögzítettünk, nem egy ma megépített naptár-nézetként.

**Megvalósítás:**
- **Adatmodell bővítve** (`salesClients.ts`): a `SalesClient` típus 3 új mezővel: `email`, `phone`, `startTime` (datetime-local string), `paid` (boolean). Az 5 meglévő demó-ügyfél kitöltve plauzibilis adatokkal; **Varga Dánielnél tudatosan `assignedGyt` KIOSZTVA, de `paid: false`** — ez mutatja be a leírt üzleti szabály harmadik, köztes állapotát (van GYT, de mégsem látszana a naptárban, amíg nincs fizetve), a "még hozzá sincs rendelve" (Tóth Eszter, Balogh Máté) állapottól elkülönítve.
- **Új `.switch-toggle` CSS komponens** (`components.css`) — ez az első valódi be/ki csúszka-kapcsoló a projektben (a korábbi bináris állapotok, pl. "limitációk" panel "van/nincs" mezői, mind kétgombos szegmens-pirulával (`.auth-tab`) voltak megoldva, nem klasszikus csúszka-kapcsolóval). Rejtett natív `<input type="checkbox">` + vizuális sáv/gomb pár (a "checkbox hack" mintával, `input:checked + .track` szelektorral) — akadálymentesen billentyűzettel is használható, `:focus-visible` kiemeléssel.
- **`SalesHozzarendeles.tsx` átépítve:** a lap tetején egy "új ügyfél felvétele" `.card-fyb-accent` kártya, benne a kért 6 mezős űrlap (2 oszlopos rács asztali nézetben, mobilon egy oszlopban egymás alatt) — név/e-mail/telefonszám natív input, kezdő időpont `datetime-local` input, gyógytornász a meglévő `GytPicker` legördülővel, befizetett az új `SwitchToggle`-lel, alatta magyarázó szöveg a naptár-szabályról. Beküldéskor kötelező a gyógytornász kiválasztása (piros hibaszöveg, ha hiányzik); sikeres beküldés új sort ad a lista tetejére/megfelelő helyére és üríti az űrlapot.
- **A meglévő lista soraiban** a `SwitchToggle` a "fizetve" állapot utólagos módosítására is használható (nem csak az űrlapon, új ügyfél felvételekor), és egy második `.status-chip` jelzi a fizetési állapotot a hozzárendelési állapot mellett.

**Tesztelve böngészőben:** asztali (1280px) és mobil (375px) — új ügyfél (Szabó Rita) felvétele gyógytornász nélkül helyes hibaüzenetet ad; gyógytornász kiválasztása (Nagy Réka) után a beküldés sikeres, az űrlap ürül, az új sor megjelenik a listában "hozzárendelve"/"fizetésre vár" jelvényekkel; a lista soraiban a fizetve-kapcsoló átváltása azonnal frissíti a jelvényt. Konzol-hiba nincs, `npm run build` hibamentes.

## 2026.08.27. — SALES lista egyszerűsítve, "befizetve" kapcsoló megerősítéssel

Marci visszajelzése: a beviteli doboz (az űrlap) jó, de a lista alatta legyen egyszerűbb — soronként csak név, e-mail, gyógytornász, kapcsoló szerepeljen (a két állapot-jelvény törlendő). Emellett új szabály: a "befizetve" kapcsolót be lehet kapcsolni szabadon, de KIkapcsolni csak megerősítés után ("Tényleg nem fizetett be?" felugró ablakkal).

**Megvalósítás — lista egyszerűsítés:** `SalesHozzarendeles.tsx` lista-soraiból törölve mindkét `.status-chip` (hozzárendelés-állapot, fizetés-állapot) — helyettük egyetlen, 4 elemű flex-sor: név (fw-bold, fix min-szélesség az igazításhoz) → e-mail (halvány, kisebb szöveg) → `GytPicker` legördülő → `SwitchToggle`. A hozzárendelésre várók lista tetejére sorolása (rendezési szabály) megmaradt, csak vizuálisan nincs többé jelvény hozzá — a "válassz gyógytornászt" placeholder-szöveg és a lista-pozíció önmagában jelzi az állapotot.

**Megvalósítás — megerősítő ablak:** új, helyben definiált `ConfirmDialog` komponens (`.modal-backdrop-fyb` + `.modal-fyb card-fyb` — ez az első modális ablak a projektben). A kapcsoló `onChange`-e helyett egy `handleTogglePaid(client, next)` függvény fut: ha a kliens jelenleg fizetett (`paid: true`) ÉS a felhasználó ki akarja kapcsolni (`next: false`), a tényleges állapotváltás helyett megnyílik a megerősítő ablak (`unpayTargetId` state); "mégse" bezárja változtatás nélkül, "igen, nem fizetett be" végrehajtja a kikapcsolást és bezárja az ablakot. **Bekapcsolásnál (nem fizetettről fizetettre) nincs megerősítés** — csak a "már fizetett" állapot visszavonása igényel rákérdezést.

**Tervezési döntés, dokumentálva:** ez a szabály csak a LISTA sorainak kapcsolóira vonatkozik (már mentett/létező ügyfelek), NEM az "új ügyfél felvétele" űrlap kapcsolójára — ott még csak egy be nem küldött piszkozat-értéket állítunk, nincs mit "visszavonni".

**Tesztelve böngészőben:** asztali (1280px) és mobil (375px) — a lista sorai most 4 elemesek, jelvények nélkül; egy fizetett ügyfél (Péter) kapcsolójának kikapcsolására felugrik "Tényleg nem fizetett be?"; "mégse" gombra a kapcsoló változatlanul BE marad; újra próbálva "igen, nem fizetett be"-re a kapcsoló ténylegesen KI-ra vált; egy nem fizetett ügyfél (Tóth Eszter) bekapcsolása azonnali, felugró ablak nélkül. Konzol-hiba nincs, `npm run build` hibamentes.

## 2026.08.27. — SALES lista: fejléc-sor, kezdő dátum, GYT már nem módosítható a listán

Marci három pontosítást kért: a listán ne lehessen többé módosítani a hozzárendelt gyógytornászt (az csak az "új ügyfél felvétele" űrlapon dől el); szerepeljen a kezdő dátum is a listában; a lista tetején legyen egy fejléc-sor, ami megnevezi az oszlopokat (Név, Email, Kezdés, Gyógytornász, Befizetett).

**Megvalósítás:**
- A lista soraiban a `GytPicker` (kattintható legördülő) egyszerű, nem interaktív szövegre cserélve — kiosztott gyógytornász esetén annak neve, egyébként "—" (halványabb színnel). A `GytPicker` komponens megmaradt, mert az űrlap gyógytornász-mezője továbbra is ezt használja.
- Új `formatStart()` segédfüggvény: a `datetime-local` nyers értéket ("2026-09-01T10:00") magyaros, pontokkal tagolt formátumra alakítja ("2026.09.01. 10:00").
- Új fejléc-sor a lista tetején (`d-none d-lg-flex` — csak asztali/tablet nézetben jelenik meg, mert mobilon a sorok tördelődnek/wrap-elnek, ahol egy fix oszlop-fejléc félrevezető lenne): "név / email / kezdés / gyógytornász / befizetett" — **kisbetűvel**, a projekt egységes, kisbetűs feliratozási konvenciója szerint (Marci üzenetében a szavak nagybetűvel szerepeltek, de ez a chat-beli írásmód, nem UI-előírás — a `Design jegyzet.md` szerint minden felirat kisbetűs a márkahangban).
- A lista minden sora most 5 oszlopot mutat: név, e-mail, kezdés (formázott dátum), gyógytornász (sima szöveg), kapcsoló (befizetve) — a korábbi `.status-chip`-ek már a múlt körben törölve lettek.

**Tesztelve böngészőben:** asztali (1280px) — a fejléc-sor helyesen felirat­ozza az oszlopokat, a dátumok "ÉÉÉÉ.HH.NN. óó:pp" formában jelennek meg, a gyógytornász-oszlop nem kattintható (nincs `.level-select` a sorban); mobil (375px) — a fejléc-sor helyesen rejtve van, a sorok minden adatot tartalmaznak, olvashatóan tördelve. Konzol-hiba nincs, `npm run build` hibamentes.

## 2026.08.27. — Kötelező mezők, mobil-optimalizált lista, ügyfél-törlés

Marci négy pontosítást kért egyszerre: (1) az "ügyfél felvétele" gomb csak akkor engedje a felvételt, ha minden mező ki van töltve/kiválasztva a "befizetett" kivételével (tehát gyógytornász nélkül ne kerülhessen be senki a listába); (2) mobil nézetben ne jelenjen meg az e-mail, helyette Név+alatta dátum egy blokkban, mellette a gyógytornász neve, mellette pipálható négyzet (a kapcsoló helyett, azonos logikával); (3) mobilon is legyen fejléc-sor: Ügyfél, Gyógytornász, Befizetett; (4) a "Tényleg nem fizetett be?" ablak mintájára legyen egy kuka-ikonos törlési lehetőség a MÉG NEM fizetett ügyfeleknél, saját megerősítő szöveggel: `biztosan törölni szeretnéd "[név]" ügyfelet a rendszerből?`.

**Megvalósítás — kötelező mezők:** a korábbi, csak beküldéskor futó `if (!form.gyt) setError(...)` ellenőrzés helyett egy `formValid` számított érték (`name && email && phone && startTime && gyt` mind kitöltve) — a submit gomb `disabled={!formValid}`, és alatta egy állandó, halvány szöveg jelzi, mi hiányzik még ("a gombhoz minden mezőt ki kell tölteni…"). Új `.btn-fyb:disabled` CSS szabály (`opacity: 0.5; cursor: not-allowed`, hover-transform kikapcsolva) — ez az első helye a projektben, ahol egy `.btn-fyb` letiltott állapotban jelenik meg.

**Megvalósítás — mobil lista-elrendezés:** a lista soraihoz mostantól KÉT külön JSX-blokk tartozik (a GYT-oldali `LevelRow` mintájára): `d-none d-lg-flex` az asztali/tablet sor (változatlan, csak `gap-3` → `gap-2`-re szűkítve, hogy a kuka-ikonnak is jusson hely túlcsordulás nélkül), és egy új `d-flex d-lg-none` mobil sor, ami NEM mutatja az e-mailt — helyette név+dátum egy függőlegesen egymás alatti blokkban, mellette a gyógytornász neve, mellette egy `CheckboxToggle` (natív checkbox, a már meglévő `.form-check-input:checked` márkaszínezéssel, nagyobb, 1.4rem-es tapintható mérettel). **A `CheckboxToggle` ugyanazt a `handleTogglePaid()` függvényt hívja, mint az asztali `SwitchToggle`** — a megerősítés-logika (csak kikapcsoláskor kérdez rá) egységesen érvényesül mindkét vezérlőn.

**Megvalósítás — mobil fejléc:** külön `d-flex d-lg-none` fejléc-sor "ügyfél / gyógytornász / befizetett" felirattal (3 oszlop, a desktop 5-oszlopos fejlécétől eltérően, mert a név+dátum egy blokkba van vonva mobilon).

**Megvalósítás — ügyfél-törlés:** a `ConfirmDialog` általánosítva — mostantól egy `confirmLabel` propot is kap (a megerősítő gomb szövege), és egy `pendingAction: {type: 'unpay'|'delete', client} | null` state dönti el, melyik szöveg/melyik végrehajtandó művelet tartozik hozzá. Új `DeleteButton` komponens — egy 🗑 emoji-alapú, **ideiglenes** gomb (a projekt hivatalos, kézzel rajzolt SVG ikonkészletében nincs kuka-ikon; ha készül hozzá márka-ikon, ezt kell lecserélni), csak a MÉG NEM fizetett ügyfelek sorában jelenik meg (`{!c.paid && <DeleteButton .../>}`), mind az asztali, mind a mobil sorban. Kattintásra a megerősítő ablak Marci által megadott, pontos szövegével nyílik meg; megerősítéskor az ügyfél kikerül a `clients` state tömbből (`filter`).

**Tesztelve böngészőben:** asztali (1280px) — a submit gomb üres/részlegesen kitöltött űrlapnál letiltva (JS-mérve `disabled: true`, `opacity: 0.5`), minden mező kitöltése után engedélyeződik; a kuka-ikon csak a nem fizetett sorokon jelenik meg, kattintásra a pontos "biztosan törölni szeretnéd…" szöveg jelenik meg, megerősítésre az ügyfél eltűnik a listából. Mobil (375px) — nincs e-mail a listában, a checkbox jól látható és tapintható méretű, a "Tényleg nem fizetett be?" ablak ugyanúgy megjelenik a checkbox kikapcsolásakor. **Menet közben talált és javított hiba:** az eredeti `gap-3` térköz a kuka-ikon hozzáadása után a leghosszabb e-mail-es sorban (Tóth Eszter) a sor tartalmát a konténer szélessége fölé tolta, ami miatt a kuka-ikon egy külön sorba tördelődött — `gap-2`-re szűkítve minden sor pontosan egy sorban fér el 900px-es konténer-szélességig. Konzol-hiba nincs, `npm run build` hibamentes.

## 2026.08.27. — Asztali nézet is jelölőnégyzet, saját rajzolt kuka-ikon

Marci két utolsó finomítást kért: az asztali nézetben is a `CheckboxToggle` (pipálható négyzet) jelenjen meg a csúszka-kapcsoló helyett a lista "befizetett" oszlopában (a mobil már ezt kapta az előző körben); és a kuka-ikon ne ideiglenes emoji legyen, hanem a projekt saját, kézzel rajzolt ikon-stílusában készült SVG.

**Megvalósítás — egységes jelölőnégyzet:** az asztali sor `SwitchToggle`-je `CheckboxToggle`-re cserélve — mostantól a lista mindkét nézetben (asztali ÉS mobil) ugyanazt a klasszikus checkbox-vezérlőt használja a "befizetett" mezőhöz, azonos `handleTogglePaid()` logikával. **A `SwitchToggle` komponens megmaradt** — az "új ügyfél felvétele" ŰRLAP saját "befizetett" mezője továbbra is ezt használja (ez egy piszkozat-érték egy még be nem küldött ügyfélhez, nem egy már mentett lista-sor állapota, ezért indokolt, hogy vizuálisan is más maradjon).

**Megvalósítás — kézzel rajzolt kuka-ikon:** új `public/icons/ikon_kuka.svg`, a projekt meglévő 17 hand-drawn ikonjának (pl. `ikon_lakat.svg`, `ikon_naptar.svg`) stílusát követve — `viewBox="0 0 21.7078 21.7078"`, `stroke="currentColor"`, `stroke-width="0.55"`, kerekített vonalvégek/találkozások, enyhén "kézzel rajzolt" (nem tökéletesen geometrikus) koordináták. Az ikon egy kuka-fedelet (fogantyúval), a kuka testét és 2 függőleges bordázó vonalat ábrázol. A `DeleteButton` komponens mostantól a projekt szabványos `Icon` komponensével jeleníti meg (`mask-image` + `currentColor` technika, `color: var(--color-danger)` felülírással), NEM emojiként — így az ikon a többivel azonos vizuális nyelvet követi, és a projekt hivatalos ikonkészletének részévé vált.

**Tesztelve böngészőben:** asztali (1280px) nézetben a "befizetett" oszlop most checkbox-ot mutat (nem csúszkát), a checkbox kikapcsolása a megerősítő ablakot nyitja meg, akárcsak mobilon; a kuka-ikon vizuálisan felismerhető kuka-sziluettként jelenik meg (fedél+fogantyú+test+bordázás), a projekt többi ikonjával megegyező vékony vonalas stílusban, danger-piros színnel. Konzol-hiba nincs, `npm run build` hibamentes.

## 2026.08.27. — SALES lista: valódi rács-igazítás, rövidebb megerősítő gomb

Marci két utolsó pontosítást kért: az azonos típusú elemek (ugyanaz az oszlop különböző sorokban) mindig pontosan egymás alá legyenek igazítva — szövegnél ez a szöveg elejéhez (bal oldalhoz) igazítást jelenti; és a "Tényleg nem fizetett be?" ablak megerősítő gombjának szövege legyen egyszerűbb: "tényleg nem".

**Ok — miért nem igazodtak pontosan az oszlopok eddig:** a lista sorai flexbox + `minWidth` kombinációt használtak (nem valódi CSS Grid) — a `minWidth` csak egy alsó korlát, nem egy tényleges, minden sorban azonos oszlopszélesség. Ha egy sor tartalma (pl. egy hosszabb név vagy e-mail) meghaladta a minWidth-et, az ADOTT sorban minden utána következő elem jobbra tolódott, míg a többi sorban nem — ez pontosan az a hiba, amit a GYT-oldali videókiosztás listánál egy korábbi körben (`.level-row-grid`) már kijavítottunk, csak itt még nem lett átvéve ugyanaz a megoldás.

**Megvalósítás:** két új CSS osztály (`components.css`): `.sales-row-grid` (asztali/tablet, `992px`-től, `grid-template-columns: 9rem 11rem 9rem 8rem 6rem` — név/email/kezdés/gyógytornász/befizetett) és `.sales-row-grid-mobile` (`992px` alatt, `grid-template-columns: 1fr 8rem 4rem` — ügyfél/gyógytornász/befizetett). **Mindkét fejléc-sor ÉS minden adat-sor ugyanazt az osztályt kapja**, így a rács-oszlopok szélessége garantáltan azonos minden sorban (ellentétben a korábbi, soronként külön `minWidth`-del közelített igazítással). A checkbox+kuka-ikon egy közös grid-cellába kerül (belső `d-flex`-szel), mert ez a két elem együtt egy "akció" egységet alkot, nem külön oszlopokat igényel.

**Buktató, amit menet közben találtunk:** a mobil fejléc-sor "gyógytornász" felirata (nagybetűs, félkövér) szélesebb, mint maga az adatsorokban megjelenő tényleges gyógytornász-név (pl. "Kollé Gábor") — az eredetileg tervezett `6rem`-es mobil oszlopszélesség elég volt az adatnak, de nem a saját fejléc-címkéjének, ami emiatt belelógott a "befizetett" fejléc-cellába. Javítva: a mobil középső oszlop `6rem` → `8rem`-re szélesítve. **Tanulság minden további rács-fejlécnél:** a fix oszlopszélességet a LEGHOSSZABB tartalomhoz kell igazítani, ami vagy az adat, vagy a saját fejléc-címke lehet — mindig mindkettőt ellenőrizni kell, nem csak az adatsorokat.

**Megvalósítás — rövidebb gomb:** a "Tényleg nem fizetett be?" ablak megerősítő gombjának szövege `"igen, nem fizetett be"` → `"tényleg nem"`-re rövidítve (a törlés-megerősítés "igen, törlöm" szövege változatlan maradt, azt Marci nem érintette).

**Tesztelve böngészőben:** asztali (1280px) — JS-méréssel minden sor 5 oszlopa pixelpontosan azonos x-pozícióban kezdődik (`[355,511,699,855,995]` minden sorban). Mobil (375px) — a 3 oszlop szintén pixelpontosan illeszkedik minden sorban (`[34,173,277]`), a fejléc-címkék már nem lógnak egymásba; a megerősítő ablak gombja "tényleg nem" szöveggel jelenik meg. Konzol-hiba nincs, `npm run build` hibamentes.

## 2026.08.27. — Lista fejléc-szövegek rövidítve

Marci kérése: a lista fejléc-sorában "gyógytornász" → "gyt", "befizetett" → "fizetve". Csak a lista OSZLOP-FEJLÉCEIT érinti (asztali és mobil fejléc-sor egyaránt) — az "új ügyfél felvétele" ŰRLAP mezőcímkéi ("gyógytornász", "befizetett") változatlanul a teljes szót használják, mivel a Marci kérése kifejezetten "címsor"-ra (a lista fejléc-sorára) vonatkozott, nem az űrlapra.

**Tesztelve böngészőben:** asztali és mobil nézetben egyaránt a lista fejléce most "gyt" és "fizetve" feliratot mutat, az adat-oszlopok (a teljes gyógytornász-nevek, pl. "Kollé Gábor") változatlanul, a korábban rögzített fix oszlopszélességben jelennek meg — a rövidebb fejléc-szöveg nem okoz újabb illesztési problémát (csak ürül a hely a fejléc-cellában, ami harmlessen). Az űrlap mezőcímkéi nem változtak. Konzol-hiba nincs, `npm run build` hibamentes.

## 2026.08.27. — Finomhangolt térközök, élénkpiros kuka-ikon sötét módban

Marci három apró finomítást kért: a checkbox és a kuka-ikon között legyen nagyobb tér; a mobil "ügyfél" és "gyt" oszlop között legyen kisebb; a kuka-ikon sötét módban legyen élénkpiros a jobb kontraszt miatt (a semleges `--color-danger` navy háttéren nem elég feltűnő).

**Megvalósítás:**
- A checkbox+kuka-ikon közös cellájának belső `gap-2` (0.5rem) → `gap-3` (1rem)-re nőtt, mind az asztali, mind a mobil sorban.
- A mobil rács (`.sales-row-grid-mobile`) `column-gap`-je `0.5rem` → `0.35rem`-re csökkent — ez az "ügyfél" és "gyt" oszlop közti teret (és vele együtt a "gyt"–"fizetve" közöttit is, mivel egy CSS Grid `column-gap`-je minden oszlopközre egyformán vonatkozik) szűkíti.
- **Kuka-ikon színezése CSS-re költöztetve:** korábban a `DeleteButton` inline `style`-jában volt a `color: var(--color-danger)`, ami — mivel az inline stílus mindig felülírja a külső CSS-t, függetlenül a szelektor specifikusságától — lehetetlenné tette volna egy `html[data-theme='dark'] .sales-delete-icon`-szerű felülírást. Megoldás: a szín kikerült egy új `.sales-delete-icon` CSS-osztályba (`color: var(--color-danger)` alapból), amit a `html[data-theme='dark'] .sales-delete-icon` szabály `#FF5C4D`-re (élénkpiros) módosít. **Ez a buktató (inline style nem írható felül külső, akár attribútum-szelektoros CSS-szabállyal sem) minden további "sötét módban más szín" jellegű igénynél felmerülhet** — a színt mindig CSS-osztályba kell tenni, sosem inline style-ba, ha várhatóan lesz rá mód/állapot-alapú felülírás.

**Tesztelve böngészőben:** JS-méréssel a checkbox–kuka gap 16px (korábban 8px), a mobil "ügyfél"–"gyt" oszlopköz 5.6px (korábban 8px); sötét módban a kuka-ikon számított színe `rgb(255, 92, 77)` (#FF5C4D), világos módban változatlanul a semleges `--color-danger` (#C15B4A). Konzol-hiba nincs, `npm run build` hibamentes.

## 2026.08.27. — Kuka-ikon és térköz, 2. kör (Marci: "mintha nem csináltál volna semmit")

Marci visszajelzése: a kuka-ikon sötét módban továbbra is túl sötétnek tűnt, és a checkbox-tól való távolság is túl kicsinek — mindkettő minden képernyőméreten. Első lépésként JS-mérésekkel (`getComputedStyle`) ellenőriztem az élesben futó oldalt: a `gap: 16px` és a sötét módú `rgb(255, 92, 77)` szín ténylegesen alkalmazva volt a kódban és a böngészőben is — a CSS-kaszkád (a `.sales-delete-icon` osztály felülírta a `.icon-fyb` alapértelmezését, a `html[data-theme='dark']`-os szabály pedig ezt) helyesen működött. **Egy mellékes megfigyelés menet közben:** az egyik korábbi teszt-lépésben (localStorage közvetlen `fyb-theme` állítása egy másik fülön) átmenetileg világos módra váltotta a megosztott `localStorage`-ot (ugyanaz az origin, ugyanaz a `localStorage`, függetlenül a fültől) — ez okozhatta, hogy időközben Marci is világos módban látta az oldalt, ahol a szín szándékosan változatlan (csak sötét módban tér el).

**Mivel a korábbi változtatás (#FF5C4D szín, 1rem gap, 1.15rem ikonméret) érzékelhetően nem volt elég kifejezett, ezúttal határozottan nagyobb lépést tettem, ne maradjon kétség:**
- A checkbox–kuka gap `gap-3` (1rem/16px) → `gap-4` (1.5rem/24px)-re nőtt.
- A kuka-ikon mérete `1.15rem` → `1.3rem`-re nőtt.
- A sötét módú szín `#FF5C4D` (halványabb korall-piros) → `#FF3B30`-ra (határozottan telített, tiszta piros) cserélve.

**Tesztelve böngészőben (friss lapon, mind a `seed`, mind egy teljesen új fülön, mert a `localStorage`-alapú `fyb-theme` megosztott az origin összes fülén):** sötét módban a kuka-ikon számított háttérszíne `rgb(255, 59, 48)`, a checkbox–kuka gap `24px` — mindkettő JS-méréssel megerősítve mind asztali (1280px), mind mobil (375px) nézetben. Vizuálisan is egyértelműen nagyobb, élénkebb piros ikon látszik minden képernyőméreten. Konzol-hiba nincs egy friss lapon (a `seed` fülön megjelenő "useNavigate is not defined" hiba a lap hosszú HMR-előzménye miatti, korábban is dokumentált gyorsítótár-artifact volt, friss fülön nem reprodukálódott). `npm run build` hibamentes.

## 2026.08.27. — A "befizetve" oszlop két térköze felcserélve

Marci egy képernyőképpel jelölte meg a problémát: a "fizetve" oszlopon belül két térköz van — (1) a checkbox és a kuka-ikon között, (2) a kuka-ikon és az oszlop jobb szélé között —, és ezek fordítva voltak jók: a (2) trailing tér volt nagyobb (mert az oszlop fix szélessége, `6rem`/asztali és `4rem`/mobil, bőven meghaladta a tényleges tartalom szélességét), a (1) checkbox–kuka gap pedig ehhez képest kisebbnek látszott, annak ellenére, hogy az előző körben kifejezetten megnöveltem.

**Ok:** az oszlop fix rács-szélessége (asztali `6rem`=96px, mobil `4rem`=64px) jóval szélesebb volt, mint amennyit a checkbox+gap+kuka ténylegesen elfoglal (~67px) — a maradék hely a cellán belül, a tartalom UTÁN, kihasználatlan trailing térként jelentkezett (mivel a grid-cella tartalma alapból balra igazodik).

**Javítás:** az oszlop szélessége `6rem`/`4rem` → egységesen `4.5rem`-re csökkentve (mindkét nézetben), ami szorosan a tényleges tartalomhoz igazodik. Ezzel a checkbox–kuka gap (`1.5rem`/24px, változatlan) most a DOMINÁNS, jól látható térköz, a kuka és az oszlop jobb széle közötti trailing tér pedig minimálisra (`~4.8px`) csökkent — pontosan a kért felcserélés.

**Tesztelve böngészőben:** JS-méréssel mindkét nézetben (asztali 1280px, mobil 375px) `gap1 (checkbox→kuka) = 24px`, `gap2 (kuka→cella vége) = 4.8px` — a két érték szerepe felcserélődött a korábbihoz képest. Nincs sortördelés/túlcsordulás az új, szűkebb oszlopszélesség mellett. Konzol-hiba nincs, `npm run build` hibamentes.

## 2026.08.27. — Kuka-ikon a sor legvégén, egységesen élénkpiros (3. kör)

Marci egy újabb, pontosabb képernyőképpel jelezte: az előző javítás nem volt látható változás ("most így néz ki, nem változott"). Új instrukció: a kuka-ikon kerüljön a sor LEGVÉGÉRE (a kártya jobb szélére), a checkbox maradjon a jelenlegi helyén (a "fizetve" oszlopban) — tehát a kettő között ne csak nagyobb `gap`, hanem tényleges, nagy távolság legyen, mert most külön-külön helyezkednek el a sorban. A kuka-ikon színe legyen "világos élénkpiros", mert továbbra sem látszott jól.

**Megvalósítás — kuka a sor végén:**
- Az asztali rács (`.sales-row-grid`) 5 oszlopból 6-ra bővült: `9rem 11rem 9rem 8rem 3rem 1fr` — az 5. oszlop (`3rem`) csak a checkbox-ot tartalmazza, a 6. (`1fr`) a kuka-ikont, `justify-self: end`-del a kártya jobb szélére tolva. **Fontos technikai részlet:** a kuka-ikon celláját MINDIG meg kell jeleníteni (akár üresen, ha az ügyfél már fizetett), különben a hiányzó 6. gyermek-elem miatt a CSS Grid automatikus oszlop-kiosztása eltolódna, és a checkbox rossz oszlopba kerülne a "fizetett" soroknál — ezért `{!c.paid && <DeleteButton .../>}` helyett `<span className="sales-delete-cell">{!c.paid && ...}</span>` mindig renderelődik, csak a tartalma feltételes.
- **Mobilon MÁS a megoldás, mint asztalin:** első próbálkozásra a mobil rácsot is 4 oszlopra bővítettem (`1fr 8rem 2.5rem 1fr`), de ez elrontotta az elrendezést — **két `1fr` oszlop egy sorban EGYENLŐ arányban osztja a maradék helyet**, így az "ügyfél" (név+dátum) oszlop az utolsó (kuka) oszloppal egyenlő, túl kicsi szélességet kapott, ami a szöveg összecsúszásához/átfedéséhez vezetett. **Javítás:** a mobil rács visszaállítva 3 oszlopra (`1fr 8rem 5rem`), a checkbox+kuka egy közös, fix szélességű utolsó cellában marad, de belső `display:flex; justify-content:space-between`-nel a cella két végére tolva — így a checkbox balra, a kuka jobbra kerül EGY oszlopon belül, nem külön oszlopokban, elkerülve a dupla-`1fr` problémát.
- **Szín — egységesen élénkpiros, mindkét módban:** a korábbi, csak sötét módú felülírás törölve; a `.sales-delete-icon` mostantól MINDIG `#FF3B30` (nem csak sötét módban), mivel Marci visszajelzése szerint világos módban sem volt elég feltűnő a semleges `--color-danger`.

**Tesztelve böngészőben:** asztali (1280px) — JS-méréssel a checkbox és a kuka közötti táv 131px, a kuka a kártya jobb szélétől 30px-re helyezkedik el, minden sor "fizetve" oszlopának JOBB széle pixelpontosan egyezik (`1171px` mind az 5 sorban), függetlenül attól, hogy az adott sorban van-e ténylegesen kuka-ikon. Mobil (375px) — a 3 oszlop (`[34,127,261]`) minden sorban pontosan egyezik, nincs többé szöveg-átfedés. Világos ÉS sötét módban egyaránt a kuka-ikon számított színe `rgb(255, 59, 48)`. Konzol-hiba nincs, `npm run build` hibamentes.

## 2026.08.27. — Kuka-ikon sötét módban rózsaszín, rendezhető lista

Marci két új kérést fogalmazott meg: a kuka-ikon sötét módban legyen rózsaszín (nem piros); a lista mindig a legfrissebben hozzáadott ügyfelet mutassa legfelül alapból, DE legyen rendezhető is név, dátum és gyógytornász szerint.

**Megvalósítás — rózsaszín sötét módban:** a már meglévő `.sales-delete-icon` osztályhoz (ami mindkét módban `#FF3B30`-at adott) hozzáadva egy `html[data-theme='dark'] .sales-delete-icon { color: #FF4FA3; }` felülírás — világos módban változatlanul piros, sötétben rózsaszín.

**Megvalósítás — alapértelmezett rendezés + kézi rendezés:**
- A korábbi "hozzárendelésre várók előre" automatikus rendezés törölve, helyette: rendezés hiányában a lista a `clients` tömb hozzáadási sorrendjének MEGFORDÍTÁSÁT mutatja (`[...bySearch].reverse()`) — mivel új ügyfél mindig a tömb VÉGÉRE kerül (`setClients(prev => [...prev, new])`), a megfordítás a legutóbb hozzáadottat teszi elsővé.
- Új `sort` állapot (`{ key: 'name'|'date'|'gyt', dir: 'asc'|'desc' } | null`) és egy 3-állapotú `toggleSort()`: első kattintásra `asc`, másodikra `dir` váltás `desc`-re, harmadikra vissza `null`-ra (alapértelmezett, "legfrissebb elöl" nézet).
- Új `SortButton` komponens: a "név"/"kezdés"/"gyt" fejléc-feliratok mostantól kattintható gombok (▲/▼ jelzéssel az aktív oszlopnál), NEM natív inheritance-re hagyatkozva a színnél/betűstílusnál — a korábbi buktató (natív `<button>` nem örökli a szülő szövegstílusát) miatt a gomb explicit megkapja ugyanazokat az osztályokat/inline színt, amit a sima `<span>` fejléc-cellák is használnak.
- **Mobil nézet:** csak "ügyfél" (→ név szerint rendez) és "gyt" fejléc kattintható — nincs külön "kezdés" fejléc-cella mobilon (a dátum a névvel egy blokkban jelenik meg), ezért a dátum szerinti rendezéshez asztali nézetben kell rákattintani a "kezdés" fejlécre; a rendezési állapot közös (React state), ezért utána mobilon nézve is érvényben marad.

**Tesztelve böngészőben:** "név" gombra kattintva ABC-sorrendbe rendez (▲), újra kattintva fordítva (▼), harmadszor visszaáll az alapértelmezett "legfrissebb elöl" nézetre; "kezdés" időrendi sorrendbe rendez helyesen; "gyt" gyógytornász neve szerint (üres/nincs-hozzárendelve elöl, mert az üres string ábécében a legelső); új ügyfél (Zsolnai Zita) felvétele után alapértelmezett nézetben a lista tetején jelenik meg. Világos módban a kuka-ikon pirosan (`rgb(255, 59, 48)`), sötét módban rózsaszínűen (`rgb(255, 79, 163)`) jelenik meg. Konzol-hiba nincs, `npm run build` hibamentes.

## 2026.08.27. — Fejléc-felirat egységesítve, oszlop-igazítási hiba javítva

Marci két dolgot kért: minden nézetben (asztali és mobil is) "ügyfél" szerepeljen az első oszlop fejlécében (eddig asztalin "név" állt); és a fejléc-doboz "valamiért elmozdult" a bal szélről — tegyük vissza.

**Ok — miért mozdult el:** az előző körben a fejléc-feliratokat (`SortButton`) `<span>`-ből natív `<button>`-né alakítottam a kattinthatóság kedvéért. A böngésző alapértelmezett stílusa szerint egy `<button>` `text-align: center` — és mivel a rács-oszlop szélére nyújtotta a gombot (CSS Grid `justify-items: stretch` alapértelmezés, a natív `<button>` mint rács-elem `display: block`-ká "blockosodik"), a gomb TELJES oszlopszélességre nyúlt, a szöveg pedig KÖZÉPRE került azon belül — nem a doboz bal szélén. JS-méréssel megerősítve: a gomb bal széle helyesen 354.5px-en volt (ugyanott, mint az alatta lévő adat-sor), de a SZÖVEG tényleges bal széle 412.9px-en (~58px-es vizuális eltolódás) — ez a natív gomb-alapértelmezés okozta, nem egy elrendezési hiba a rácsban magában.

**Javítás:** a `SortButton` stílusa kiegészítve `textAlign: 'left'` és `justifySelf: 'start'` tulajdonságokkal — utóbbi megakadályozza, hogy a gomb egyáltalán a teljes oszlopszélességre nyúljon (a doboza a tartalmához igazodik, mint egy `<span>`), így a szöveg pontosan a rács-oszlop bal szélén jelenik meg. **Ez egy újabb konkrét eset a natív `<button>` stílus-alapértelmezéseinek buktatójára** (a korábbi, dokumentált szövegszín-öröklési eset mellett) — minden további "fejléc-felirat legyen kattintható gombbá alakítva" kérésnél explicit `textAlign` és `justifySelf`/`width` beállítás szükséges, nem szabad a natív alapértelmezésekre hagyatkozni.

**Megvalósítás — egységes felirat:** az asztali fejléc első oszlopának `SortButton label="név"` → `label="ügyfél"`-re cserélve (a mobil fejléc már eddig is "ügyfél"-t mutatott). Az "új ügyfél felvétele" ŰRLAP saját "név" mezőcímkéje változatlan (az egy másik kontextus, nem táblázat-fejléc).

**Tesztelve böngészőben:** JS-méréssel a fejléc "ügyfél" gomb szövegének bal széle és az alatta lévő adat-sor bal széle mindkét nézetben (asztali 1280px, mobil 375px) pixelpontosan egyezik; a "kezdés" és "gyt" fejléc-gombok is ellenőrizve, ugyanez a hiba ott is jelen volt és javítva lett. A rendezés (kattintásra ▲/▼ jelzés) továbbra is helyesen működik. Konzol-hiba nincs, `npm run build` hibamentes.

## 2026.08.27. — 3. fázis lezárva: ÜF, GYT, SALES

Marci megerősítése: a 3 felhasználói mód (ÜF, GYT, SALES) készen van, ezt rögzítjük. A `Design jegyzet.md`-ben egy új **"Státusz (2026.08.27.)"** sor jelzi a lezárást, a Fázis 1/Fázis 2 mintájára — ez a 3. fázis: az Együttműködés oldal ÜF (`/gyakorlatok`), GYT (`/gyt/ugyfelek`, `/gyt/videokiosztas`) és SALES (`/sales/hozzarendeles`) felülete, a hozzájuk tartozó teszt-belépéssel, valamennyi eddig dokumentált minta (rács-igazítás, megerősítő ablakok, kapcsolók, rendezhető lista) véglegesítve, további fázisok kötelező kiindulópontjaként.

Ezzel kezdődik a **4. fázis: az ADMIN szerepkör kidolgozása** (eddig csak egy "hamarosan" helykitöltő oldala volt). Marci a 3 admin-feladatkört vázolta: (1) új munkatárs (GYT vagy SALES) hozzáadása; (2) rálátás az egyes kollégák felületére — admin be tud lépni egy adott kolléga nevében, pontosan azt látja, amit a kolléga látna, tud is módosítani, de minden módosítás előtt megerősítő ablak ("biztosan módosítod? igen/nem"), és minden admin általi módosítást egy piros "admin által módosítva" címke jelöl; (3) statisztikák kollégákról/együttműködésekről — ez utóbbi Marci szerint egy KÉSŐBBI fázis, most csak megjegyezve, nem építve.

## 2026.08.27. — 4. fázis: ADMIN szerepkör — munkatárs-felvétel, "belépés a kolléga nevében"

A feladatkör körvonalazása után (ld. előző bejegyzés) két tisztázó kérdést tettünk fel (1. alapszabály, mert a "rálátás" funkció terjedelme és a technikai megvalósítás módja is nyitott volt):

**Tisztázó kérdések és válaszok:**
- **A megerősítő ablak + piros címke mechanizmus terjedelme:** Marci választása — **minden meglévő szerkeszthető elemen** épüljön meg, mind a GYT-, mind a SALES-oldalon, nem csak egy 1-2 elemes demón.
- **A "belép a kolléga nevében" nézet technikai megvalósítása:** Marci választása — **a meglévő, valódi GYT/SALES oldalak újrahasználása** (nem egy külön, egyszerűsített admin-mock nézet).

**Megvalósítás:**
- `AdminAttekintes.tsx` (a 4. fázis előtti helykitöltő) törölve, helyette új `src/pages/AdminMunkatarsak.tsx` — a `Belepes.tsx` és az `App.tsx` admin-route-ja mostantól ide mutat.
- Új `src/data/colleagues.ts`: `initialColleagues` — a GYT-roszter első, központi, kanonikus forrása; a `salesClients.ts` `GYT_STAFF` listája mostantól ebből származik (`filter(role==='gyt').map(name)`), nem önálló, duplikált tömb.
- `AdminMunkatarsak.tsx`: "új munkatárs felvétele" form (név, e-mail, szerepkör-váltó) + munkatárs-lista (a SALES-oldalról ismert valódi CSS Grid rács-minta újrahasznosítva), soronként "belépés a nevében" gombbal.
- Új `src/hooks/useAdminEditGuard.tsx` — a teljes admin-funkció gerince:
  - `getAdminView()`/`setAdminView()`: önálló `localStorage` kulcs (`fyb-admin-view`), szándékosan elkülönítve a `fyb-session`-től — az admin saját identitása változatlan marad impersonáció közben, kilépéskor nincs mit visszaállítani.
  - `useAdminEditGuard(role)`: `guard(id, action)` (egyedi vagy tömbös `id`-vel), `isModified(id)`, kész `modal` JSX. Admin-nézetben minden `guard`-olt művelet előbb megerősítő ablakot mutat, igenre a művelet lefut és az érintett id(k) piros `AdminModifiedBadge`-et kapnak; normál felhasználónál a `guard` teljesen átlátszó no-op.
- `AppLayout.tsx`: a `sessionName()` GYT/SALES nézetnél előbb az admin-view-t nézi (a kolléga nevét mutatja, ha impersonáció aktív), utána esik vissza a valódi `fyb-session`-re. Admin-nézet aktív esetén egy `.admin-view-banner` sáv jelenik meg a tartalom tetején ("admin nézet — éppen [Név] felületét látod" + "kilépés az admin nézetből" gomb). A "kijelentkezés" link az admin `fyb-admin-view`-ját is törli.
- **GYT-oldalon (`GytVideokiosztas.tsx`) MINDEN szerkeszthető elem admin-guardolt:** "limitációk" panel mentése, minden egyedi szint-videó kiosztás/javítás, a "javasolt csomag alkalmazása" tömeges gomb (a `guard` tömbös `id`-s változata — egy megerősítésre az összes érintett szint `modified` lesz), minden videó-választó sor (kód + megjegyzés).
- **SALES-oldalon (`SalesHozzarendeles.tsx`) tudatos kivétellel:** csak a "fizetve" kapcsoló megy át az admin-guardon — a törlés és a "fizetett visszavonása" már eleve kötelező megerősítést kér minden felhasználótól, ezért admin-nézetben sem kapnak MÁSODIK, redundáns ablakot; admin-nézetben a "fizetve" kapcsoló mindkét irányú váltása (a normál, aszimmetrikus szabályt felülbírálva) a generikus admin-ablakon megy át. A piros címke itt egy külön, teljes szélességű sor a rács-sor alatt (a fix szélességű "fizetve" oszlopba nem fért volna el ütközés nélkül).
- Új CSS: `.admin-view-banner`, `.admin-modified-badge` (`src/styles/components.css`).

**Tesztelve böngészőben, mindkét szerepkörnél, asztali (1280px) és mobil (375px) nézetben egyaránt:** munkatárs-felvétel form működik; "belépés a nevében" a valódi GYT/SALES oldalra navigál, helyes bannerrel és köszöntő-névvel; a "biztosan módosítod?" ablak megjelenik videó-kiosztásnál, "limitációk" váltásnál és a SALES "fizetve" kapcsolónál is, igenre a módosítás megtörténik és a piros "admin által módosítva" címke a helyes pozícióban jelenik meg (GYT: rács-oszlopban/panel-fejlécben; SALES: sor alatti külön sorban); "kilépés az admin nézetből" helyreállítja az admin saját nevét; egy VALÓDI (nem-admin) GYT-belépés ellenőrzötten nulla viselkedésváltozást mutat (azonnali szerkesztés, se ablak, se címke). Konzol-hiba egyszer sem jelentkezett, `npm run build` hibamentes.

**Tesztelési tanulság:** a `localStorage` az origin összes lapja között megosztott — teszt közben beállított admin-nézet/session átszivárgott a felhasználó saját, hosszan nyitva tartott lapjára is; a teszt végén explicit `localStorage.removeItem(...)`-mel kellett törölni az admin-view/session/kliens kulcsokat minden érintett lapon.

Ezzel a **4. fázis (ADMIN — munkatárs-felvétel, kolléga nevében belépés) lezárva.** A statisztikák feladatkör Marci döntése szerint továbbra is későbbi fázisra vár, a nav-menüben lakattal jelölve.

## 2026.08.27. — Javítás: admin által felvett új SALES-ügyfél is jelölve

Marci visszajelzése: ha adminként (Értékes Eszter nevében) új ügyfelet vesz fel a SALES oldalon, ahhoz nem került semmilyen "admin csinálta" jelzés — a többi admin-funkció (megerősítő ablak + piros címke a meglévő elemeken) helyesen működött.

**Ok:** a `useAdminEditGuard` eredetileg csak MEGLÉVŐ adat módosítására volt bekötve (ld. előző bejegyzés) — egy teljesen új ügyfél felvétele nem ezen az útvonalon megy, ezért nem kapott jelzést.

**Tisztázó kérdés és válasz:** milyen szövegű címke kerüljön az új ügyfél mellé — Marci választása: **"admin által felvéve"** (nem az általános "admin által módosítva", mert ez létrehozás, nem egy meglévő érték felülírása).

**Megvalósítás:**
- `AdminModifiedBadge` (`useAdminEditGuard.tsx`) mostantól opcionális `label` propot fogad, alapértelmezetten "admin által módosítva".
- `SalesHozzarendeles.tsx`: új `adminAddedIds` (`Set<string>`) állapot — `handleSubmit`-ben, ha `adminActive`, az újonnan létrehozott ügyfél id-je bekerül ide. A lista soraiban a piros címke-sor mostantól mindkét feltételt figyeli (`adminAddedIds.has(id)` VAGY a meglévő `isModified('paid-...')`), és a megfelelő szövegű címkét (vagy akár mindkettőt egymás mellett) jeleníti meg.
- Nincs megerősítő ablak az új ügyfél felvételéhez — a létrehozás normál felhasználónál sem igényel rákérdezést, ezért admin-nézetben sem indokolt, csak a jelző címke hiányzott.

**Tesztelve böngészőben:** admin-nézetben (Értékes Eszter nevében) új ügyfél felvétele után a listában megjelenik a piros "admin által felvéve" címke a sor alatt, mind mobil (375px), mind az adat szintjén (a rács mindkét — asztali és mobil — variánsa egyaránt kirenderel); egy VALÓDI (nem-admin) Értékes Eszter-belépéssel felvett új ügyfélnél nem jelenik meg semmilyen címke. Konzol-hiba nincs, `npm run build` hibamentes.

## 2026.08.27. — GYT: kötelező ügyfél-választás, fallback törölve

Marci jelezte: ha a GYT még nem választott ki ügyfelet (ez az alapállapot), és mégis egy másik almenüre (pl. videókiosztás) kattint, a rendszer csendben egy alapértelmezett ügyféllel dolgozik tovább — ehelyett vagy irányítsa át automatikusan az "ügyfeleim" oldalra, vagy jelenjen meg egy "kivel dolgozunk? válassz ügyfelet!" felugró ablak (OK gombbal az ügyfeleim fülre, vagy X-szel bezárva). Megkérdezte a véleményemet.

**Ajánlásom, amit Marci elfogadott:** az automatikus átirányítás jobb, mint egy modal — eggyel kevesebb kattintás (nincs külön "OK" a modalon), és nincs vele az a bizonytalanság, hogy mi történik, ha valaki a modalt X-szel, választás nélkül zárja be. Az átirányított oldalon egy rövid üzenet jelzi, miért került oda a felhasználó, hogy az átirányítás ne legyen zavaróan "néma".

**Megvalósítás:**
- `src/data/gytClients.ts`: `getSelectedClientId()` visszatérési típusa `string` → `string | null`. A korábbi "nincs mentett érték esetén az első ügyfélre esik vissza" fallback törölve — ez csak dev-kényelemből származott, nem tervezett viselkedés volt. `null`, ha nincs `localStorage`-érték, VAGY ha a mentett id már nem létező ügyfélre mutat.
- `src/pages/GytVideokiosztas.tsx`: a komponens kettévált — a külső `GytVideokiosztas` csak a `clientId`-t olvassa és `useEffect`-ben átirányít az "ügyfeleim" oldalra (`navigate('/gyt/ugyfelek', { replace: true })`), ha `null`; a tényleges, sok saját state-et/hookot használó tartalom egy `GytVideokiosztasInner({ clientId: string })` komponensbe került, ami csak érvényes `clientId` esetén mountol. Ez elkerüli a feltételes hook-hívás problémáját (React hook-szabályok).
- `src/pages/GytUgyfelek.tsx`: ha nincs érvényes kiválasztás, egy `.select-client-notice` sáv jelenik meg a lista fölött (csengő-ikon + "kivel dolgozunk? válassz ügyfelet a listából!" szöveg, borostyánsárga `--color-warning` kerettel/háttérrel) — ugyanígy megjelenik akkor is, ha valaki közvetlenül az "ügyfeleim" menüpontra kattint először, nem csak átirányításkor, mert az ok mindkét esetben azonos. Egy választás után a sáv véglegesen eltűnik.
- Új CSS: `.select-client-notice` (`src/styles/components.css`).

**Tesztelve böngészőben:** kiválasztott ügyfél nélkül (`fyb-gyt-client` törölve) a `/gyt/videokiosztas` közvetlen megnyitása azonnal a `/gyt/ugyfelek`-re irányít, a figyelmeztető sávval; ügyfél kiválasztása után a videókiosztás oldal a választott ügyféllel töltődik be, a sáv pedig utána sem az "ügyfeleim", sem semmilyen más oldalon nem jelenik meg újra; admin-nézetben (kolléga nevében, kiválasztott ügyfél nélkül) az átirányítás és a figyelmeztető sáv az admin-banner mellett is helyesen, egyszerre jelenik meg. Konzol-hiba nincs, `npm run build` hibamentes.

## 2026.08.28. — Naptár-integráció, 1. kör: SALES felület (GYT-kapacitás láthatóvá tétele, "egy kattintással" hozzárendelés)

Marci a következő nagy funkcióterületet vázolta: a naptár-integráció — a valós Google Naptár-összekötést egy programozó fogja megépíteni, ez a kör csak a UI-t és a kattintható logikát tervezi meg, placeholder-adatokkal. A SALES kolléga két naptárt kezel: a sajátját (Calendly-ből érkező sales-hívások) és a GYT-kollégák naptárait (GYT-ÜF konzultációk, amiket a GYT 1-2 héttel előre, 1 órás bontásban tervez be). Cél: a GYT-k szabad kapacitásának láthatóvá tétele, és a Calendly-adatok egy kattintással történő átvitele a GYT naptárába (csak az 1. alkalom — további alkalmakat a sales nem jogosult berakni).

**Tisztázó kérdések, majd Marci két korrekciója a saját ajánlásainkhoz képest:**
- **Nézet-formátum:** ajánlásunk (mindenhol lista) helyett Marci pontosította — a GYT-naptáraknak (egyéni ÉS összesített nézet is) heti RÁCS-naptár kell, a SALES saját naptára maradhat lista.
- **Mobil nézet — korrekció:** az általunk javasolt "egy nap egyszerre + nap-választó csík" kompromisszum helyett Marci egy Google Calendar mobil képernyőképet küldött, és kérte, hogy mobilon is a TELJES heti bontás (mind a 7 nap egyszerre) jelenjen meg — ezt építettük meg.
- **Elhelyezés + adatkapcsolat — korrekció:** ajánlásunk (külön nav-pont, később összekötve a meglévő űrlappal) helyett Marci megkérdezte, miért halasztanánk a összekötést — jogos észrevétel, mert ez ugyanazt a hibát reprodukálta volna, amit a `gytClients.ts`/`salesClients.ts` egymástól független adatai kapcsán már ismerünk (nem ideális, vállalt korlát). **Végeredmény: azonnal, teljesen összekötve, a meglévő "ügyfél–GYT hozzárendelés" oldalon belül, új fülekkel.**
- **Flow jóváhagyva változtatás nélkül:** GYT-választó → szabad időpont-lista (következő 2 hét) → megerősítés → automatikus "[Név] 1" elnevezés.

**Megvalósítás:**
- Új `src/data/calendarData.ts`: `BUSINESS_HOURS` (8-17, 13:00 ebédszünet), `getBaseDaySlots()` — determinisztikus (nem `Math.random`) szabad/foglalt/nincs-meghirdetve mintázat GYT-nkénti "seed" alapján, csak a jelen és a következő hétre; `GYT_COLOR_VAR`/`gytColorVar()` — kollégánkénti szín (Kollé Gábor kék, Nagy Réka lila, Tóth Bence oliva-zöld, `theme.css`-ben világos/sötét módú token-párokkal); `initialSalesCalls` — a Calendly-hívások demo-listája.
- Új `src/components/GytWeeklyCalendar.tsx`: a heti rács, `selectedGytId` prop dönti el egyéni/összesített nézetet; összesített nézetben kolléganként egy vékony sáv egy cellában (csak akinek van adata); `onFreeSlotClick` opcionális — a "gyt naptárak" fülön nincs átadva, ott a rács tisztán kapacitás-áttekintő, nem kattintható.
- Új `src/components/GytBookingModal.tsx`: GYT-választó pirulák + napi bontású szabad-időpont lista, opcionális ügyfél-előnézettel (név/email/telefon, ha már ismert).
- `SalesHozzarendeles.tsx` 3 fülre bővült (`.auth-tabs`): "hozzárendelés" (a meglévő űrlap+lista, a GYT+időpont mezők helyett egy "időpont választása a naptárból" gombbal), "saját naptár" (Calendly-hívások, `.call-row-grid`), "gyt naptárak" (`GytWeeklyCalendar`, összes/kollégankénti váltóval + hét-navigációval). Mindkét belépési pont (hívás-kártya ÉS űrlap) UGYANAZT a `GytBookingModal`-t nyitja; a hívás-kártyáról induló foglalás azonnal létrehozza az ügyfelet is, az űrlapból induló csak a form mezőit tölti ki, a tényleges foglalás a form beküldésekor válik véglegessé (hogy egy félbehagyott űrlap ne foglaljon le hiába egy sávot).
- Munkamenet-szintű `bookings` overlay-réteg (`Record<string,string>`, kulcs `gytId__dateISO__hour`) rétegződik a determinisztikus alap-adat fölé — csak ez mutálódik felhasználói művelet hatására.
- Dead code eltávolítva: `GytPicker` komponens és a `GYT_STAFF` export (`salesClients.ts`) — mindkettőt a `GYT_COLLEAGUES`/`GytBookingModal` váltja fel.

**Tesztelve böngészőben, asztali (1280px) és mobil (375px) nézetben, világos és sötét módban is:** mindkét belépési pont (hívás-kártya, űrlap) helyesen létrehozza az ügyfelet és foglalja le a naptár-sávot ("[Név] 1" címkével); a heti rács mind a 7 napja mindig egyszerre látszik mobilon is, vízszintes görgetés nélkül (`scrollWidth === clientWidth`); az összesített és egyéni nézet színezése helyes mindkét módban; admin-nézetben a hívás-kártyás foglalás is helyesen kapja meg az "admin által felvéve" címkét. Konzol-hiba nincs, `npm run build` hibamentes. **Ez csak az első kör** — a SALES-lista fejlesztéséhez hasonlóan itt is várható több finomító kör Marci visszajelzései alapján.

## 2026.08.28. — Naptár-integráció, 2. kör: önálló "hívásaim" oldal, mai hívások + naptár, munkaidő 6–21, hétvége keskenyebb

Marci öt pontos korrekciót kért az 1. körre: (1) a "saját naptár" fülnél két nézet kell — "mai hívások" lista ÉS egy naptár-kép, a GYT-naptárakhoz hasonlóan; (2) a telefonszám legyen külön az e-mailtől, kattintható, hogy telefonon egy érintéssel induljon a hívás; (3) a naptárak munkaideje 6:00–21:00 legyen; (4) a szombat/vasárnap oszlopok legyenek feleakkora szélesek, mert oda valószínűleg nem terveznek időpontot; (5) a "saját naptár" legyen önálló "hívásaim" menüpont, a "hozzárendelés" pedig önálló "hozzárendelések" menüpont.

**Tisztázó kérdés:** az (5) pont nem mondta meg, hova kerüljön a korábbi "gyt naptárak" fül — Marci válasza: maradjon a "hozzárendelések" oldalon, második fülként (mert a hozzárendelés eldöntése előtt logikus megnézni a GYT-k szabad kapacitását).

**A legnagyobb technikai kihívás — megosztott állapot két külön route között:** amíg minden egy oldalon volt fülekkel, a `clients`/`salesCalls`/`bookings`/admin-jelölések egyetlen komponens helyi state-je lehettek. Külön oldalsáv-menüpontokra (külön route-okra) bontva ez elveszett volna navigáció közben (React Router lecseréli a route-elemet). **Megoldás:** új `src/context/SalesDataContext.tsx` — egy `SalesDataProvider`, ami az `App.tsx`-ben egy közös szülő-route-ként fogja körbe a `/sales/hivasaim` és `/sales/hozzarendeles` route-okat (`<Route element={<SalesDataProvider><Outlet/></SalesDataProvider>}>`). Mivel ez a szülő-route AZONOS marad a két testvér-oldal közti navigáció alatt, a Provider (és minden state, beleértve a `useAdminEditGuard`-ot és a foglalási modalt is) mindvégig mountolva marad — semmi nem vész el, ha a felhasználó a két menüpont között kattint.

**Megvalósítás:**
- Új `src/pages/SalesHivasaim.tsx`: "mai hívások" (lista, csak a mai napra szűrve, `call-row-grid` 5 oszloppal — ügyfél/email/telefon/hívás időpontja/állapot) és "naptár" (a meglévő `GytWeeklyCalendar` újrafelhasználva, egyetlen szintetikus "saját hívásaim" sorozattal — a komponens már eleve elég generikus volt ehhez, nem kellett módosítani).
- `SalesHozzarendeles.tsx`: a "saját naptár" fül törölve (átköltözött), 2 fül maradt ("ügyfelek", "gyt naptárak"); az összes helyi state (clients, bookings, admin-guard stb.) a context-ből jön.
- Telefonszám: `tel:${phone.replace(/\s+/g,'')}` href, a megjelenített szöveg változatlanul szóközös/olvasható marad.
- `calendarData.ts`: `BUSINESS_HOURS` 8–17 → 6–21 (15 óra); `buildInitialSalesCalls(today)` — a demó sales-hívások dátumai mostantól a mindenkori "ma"-hoz relatívak (nem fix naptári dátumok), különben a "mai hívások" lista szinte mindig üres lett volna.
- `components.css`: `.gyt-cal-grid` oszlop-sablon — a hétvégi (Szo/V) oszlopok `0.5fr`, a hétköznapiak `1fr` (feleakkora szélesség); `.call-row-grid` 4 → 5 oszlopra bővült.
- `App.tsx`: `salesNavItems` — "hívásaim" (`ikon_naptar`) és "hozzárendelések" (`ikon_plusz`) két önálló nav-item; mindkettő route-ja a `SalesDataProvider`-en belül. `Belepes.tsx` és `AdminMunkatarsak.tsx` sales-redirectje `/sales/hivasaim`-ra frissítve (ez az új "első" oldal, a GYT "ügyfeleim" mintájára).

**Tesztelve böngészőben, asztali (1280px) és mobil (375px), világos és sötét módban:** a "mai hívások" nézet pontosan a mai napra eső hívásokat mutatja, a telefon-linkek helyesek; a "naptár" nézet 6:00–21:00 sorokkal és láthatóan keskenyebb hétvégi oszlopokkal jelenik meg, mind a 7 nap görgetés nélkül elfér mobilon is; a két oldal (hívásaim / hozzárendelések) közti navigáció közben egyetlen adat sem vész el (context-teszt: egy foglalás az egyik oldalon azonnal látszik a másikon); admin-nézetben mindkét oldalon helyes a banner, és a "hívásaim"-ról indított admin-foglalás helyesen kapja meg a piros "admin által felvéve" címkét. Konzol-hiba nincs, `npm run build` hibamentes.

## 2026.08.28. — Naptár-integráció, 3. kör: hívás-módosítás fogaskerékkel, elutasító üzenet-sablonok, "üzenetek" menüpont

Marci a "hívásaim" oldalhoz kért továbbfejlesztést: a hívás-sorok elrendezése (időpont vezesse a sort, nagyobb betűvel), egy "módosítás" fogaskerék-ikon minden sorban (asztali és mobil nézetben is), ami egy popupot nyit 3 státuszgombbal (piros=törlés+elutasító üzenet, sárga=nem jelent meg, zöld=rendben), és egy új "üzenetek" felület a 2 elutasító-sablon szerkesztésére. A naptár-nézetben egy ügyfél-sávra kattintva is jelenjen meg egy gyors popup (időpont, név, telefonszám, módosítás ikon).

**Tisztázó kérdések:** (1) hova kerüljön az "üzenetek" felület — Marci: önálló, harmadik SALES nav-pont; (2) hogyan válasszunk a 2 sablon közül törléskor — Marci: a megerősítő popupon egyből a 2 sablon szövege jelenjen meg 2 gombként, egy lépésben; (3) a sárga/zöld állapot maradjon-e látható jelvény a soron — Marci: igen, tartósan; (4) törlés után mi történjen a hívással — Marci: egyszerűen eltűnik a listából.

**Megvalósítás:**
- `calendarData.ts`: `SalesCall` típus bővítve `assignedGytId`, `assignedClientId`, `outcome` (`'nem_jelent_meg' | 'rendben'`) mezőkkel.
- `SalesDataContext.tsx`: új `messageTemplates` állapot (2 szerkeszthető szöveg, alapértelmezett tartalommal, "{Név}" jelölővel) + `setMessageTemplates`; új `removeBooking()` (az `addBooking()` párja, egy naptár-sáv felszabadítására).
- Új `src/components/CallDetailModal.tsx`: a fogaskerék-gombra megnyíló popup — adatok + 3 kör alakú státuszgomb (`.circle-icon-btn` + szín-variánsok). A piros gomb egy második lépésben (ugyanabban a modalban) megmutatja a 2 sablon teljes szövegét saját gombként; bármelyikre kattintva törlődik a hívás, és ha már volt hozzá GYT-foglalás, az a naptárból és a hozzá tartozó ügyfél a listából is törlődik (nincs "árva" foglalás egy elutasított hívás mögött).
- Új `src/pages/SalesUzenetek.tsx`: 2 textarea, közvetlenül a context `messageTemplates`-ére kötve — az itt szerkesztett szöveg azonnal megjelenik a törlés-popupban is.
- `SalesHivasaim.tsx`: a hívás-sorok átrendezve — nagy, a sort vezető időpont (óra:perc, dátum nélkül, hiszen ez mindig a mai nap); mobilon a szöveges "GYT-időpont foglalása" gomb egy kör "+" ikonra cserélve; minden sorban (asztali+mobil) egy fogaskerék kör-gomb; tartós színes jelvény a sáron a "nem jött"/"rendben" kimenetnek.
- `GytWeeklyCalendar.tsx`: új opcionális `onBookedSlotClick` prop — csak a "hívásaim" saját naptár-nézete használja (a "gyt naptárak" kapacitás-áttekintő nem), egy foglalt sávra kattintva egy mini-előnézet nyílik (időpont, név, telefon, fogaskerék), ami a fogaskerékre kattintva megnyitja a teljes `CallDetailModal`-t ugyanarra a hívásra.
- `App.tsx`: új `/sales/uzenetek` route + "üzenetek" nav-item (`ikon_csengo`).

**Tesztelve böngészőben, asztali (1280px) és mobil (375px), világos és sötét módban:** az új sor-elrendezés, a fogaskerék-popup mindhárom gombja, a törlés kétlépéses (törlés-gomb → sablon-választás) flow-ja, a naptár mini-előnézet → teljes popup lánc mind helyesen működik; egy törölt hívás a hozzá tartozó GYT-foglalással és klienssel együtt tűnik el; az "üzenetek" oldalon módosított sablon-szöveg azonnal látszik a törlés-popupban. Konzol-hiba nincs, `npm run build` hibamentes.

## 2026.08.28. — Naptár-integráció, 4. kör: "adatok importálása", a hozzárendelés egyetlen útvonala, sablon-elnevezés

Marci egy munkafolyamat-egyszerűsítést kért: a "hívásaim" oldal ne tudjon TÖBBÉ közvetlenül GYT-hez rendelni ÜF-et — ez a képesség kizárólag a "hozzárendelések" oldal "ügyfelek" fülén, egy új "adatok importálása" gombbal legyen elérhető. Emellett a törlés-popup sablon-gombjai csak egy rövid, külön mezőben megadható elnevezést mutassanak, ne a teljes üzenetszöveget.

**Megvalósítás:**
- `SalesHozzarendeles.tsx`: új `ImportCallDropdown` komponens az "új ügyfél felvétele" cím mellett — a MÉG NEM hozzárendelt hívások neveit listázza (`.level-select` mintával). Rendezés két lépésben: (1) a "most"-hoz abszolút időkülönbségben legközelebbi hívás az első; (2) a maradék hívás sima csökkenő időrendben követi. Ez tudatosan eltér egy sima csökkenő rendezéstől, mert egy jövőbeli hívás simán a legelejére kerülne, holott nem az van legközelebb a jelen pillanathoz. Egy név kiválasztása kitölti a form név/email/telefon mezőit; a form beküldésekor a forrás-hívás állapota is `'hozzarendelve'`-re vált.
- `SalesHivasaim.tsx`: a "GYT-időpont foglalása" gomb (asztali szöveg + mobil "+" ikon) és a hozzá tartozó `handleCallBookingConfirm`/`bookForCall` logika törölve — helyette egyszerű szöveg jelzi az állapotot ("hozzárendelve: [GYT]" / "vár hozzárendelésre"). A fogaskerék (módosítás/törlés/kimenet) gomb változatlanul megmaradt, mert az a hívás KIMENETÉT követi, nem a GYT-hez rendelést.
- `SalesDataContext.tsx`: `messageTemplates` típusa `[string, string]` → `{ name: string; body: string }` pár (`MessageTemplate` típus). `SalesUzenetek.tsx` mindkét sablonhoz külön "elnevezés" mezőt kapott a meglévő szöveg-textarea mellé. `CallDetailModal.tsx` törlés-gombjai mostantól csak a `name`-et mutatják.
- Dead code eltávolítva: `.circle-icon-btn--add` CSS-osztály (többé nem használt).

**Tesztelve böngészőben, asztali (1280px) és mobil (375px):** az import-legördülő helyes sorrendben listázza a hívásokat (böngészőben ellenőrizve: 15:42-kor egy 15:00-as hívás megelőzött egy 5 nappal későbbi jövőbeli hívást), a kiválasztás kitölti a formot, beküldés után a forrás-hívás "hozzárendelve" állapotba kerül gomb nélkül; a törlés-popup gombjai csak a rövid elnevezést mutatják; az "üzenetek" oldal mindkét mezője szerkeszthető. Konzol-hiba nincs, `npm run build` hibamentes.

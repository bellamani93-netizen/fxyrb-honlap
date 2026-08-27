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

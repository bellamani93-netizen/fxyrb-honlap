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

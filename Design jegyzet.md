Design jegyzet — véglegesített (2026.08.25., Marci jóváhagyásával). Korábbi Google Drive ötletelés alapján, a Fejlesztési napló.md-ben rögzített döntésekkel kiegészítve.

1\. MÁRKAHANG (fixyourback.hu és a "Derekas Levelek" hírlevél alapján)  
\- Tegező, közvetlen, "konyhanyelven" magyarázó stílus, személyes hangvétel (Bella Márton szól az olvasóhoz/ÜF-hez, nem egy személytelen cég).  
\- A cél mindig a megértetés, az ok-okozati összefüggés elmagyarázása — nem csak tipp vagy trükk. Az alkalmazáson belüli szövegek (leírások, oktatóanyag) ezt a logikát kövessék: mi történik → miért fáj → mit tegyél.  
\- Bátorító, őszinte, helyenként frappáns/humoros hangvétel megengedett hosszabb szövegekben (blog, hírlevél); az app mikroszövegei (gombok, státuszüzenetek) maradjanak rövidek és egyszerűek — pl. "Szia \[Név\]\! Jó gyakorlást\!", "gratulálunk\!", "meg is vagyunk\!".  
\- Fázis 1 tapasztalat: célzott (niche) landing oldalaknál a headline/subheadline lehet konkrétabb, „direct response" stílusú (pl. konkrét célcsoport-megszólítás: "kizárólag ülőmunkát végző férfiaknak") — ez nem tér el a márkahangtól, csak élesebben fogalmaz egy adott kampány/oldal céljának megfelelően.

2\. SZÍNPALETTA

Alap márkaszínek:  
\- Mint/türkiz (élénk): \#5FD3BC  
\- Sötétkék / szénkék: \#1A2634  
\- Tompított zöldes-szürke: \#5E807F  
\- Klasszikus teal (sötétebb türkiz): \#008080  
\- Törtfehér: \#F8F9FA

Kiemelő szín (citrom-lime): \#D7E834  
\- Szerep: meleg, energikus kontraszt a hideg mint/teal paletta mellett — mérföldkő-jelvények, streak-számláló, kategória-badge-ek (pl. "kizárólag X-nek" célzó címke), és olyan helyeken, ahol az ÜF két egyenrangú út közül választ.  
\- Használati szabály: SÖTÉT módban szabadon használható szöveg- vagy ikonszínként is (kiváló kontraszt sötét navy háttéren). VILÁGOS módban NE szövegszínként, hanem kitöltésként használandó, rajta sötét navy (\#1A2634) szöveggel/ikonnal.  
\- Visszafogottabb alternatíva: \#B8D94D · élénkebb, csak apró kiemelésekhez: \#C6E600.

Javasolt felosztás:  
\- Világos mód — háttér: \#F8F9FA · szöveg: \#1A2634 · elsődleges akcentus: \#008080 · másodlagos/nyugodt akcentus: \#5E807F · kiemelő (badge-kitöltés, sötét szöveggel): \#D7E834  
\- Sötét mód — háttér: \#1A2634 (kártyákhoz egy árnyalattal világosabb szürkéskék variáns javasolt) · szöveg: \#F8F9FA · elsődleges akcentus: \#5FD3BC · másodlagos akcentus: \#5E807F · kiemelő (szöveg/ikon is lehet): \#D7E834  
\- **Kontraszt-javítás (2026.08.25.):** a `--color-text-muted` (másodlagos, halványabb szöveg — leírások, dátumok) a sima `#5E807F` sagegray-jel sötét navy háttéren csak ~3,5:1 kontrasztot ad, ami a WCAG AA (4,5:1) alatt van. Sötét módban ezért egy világosított változatra (`#9BB6B5`) van felülírva; világos módban az eredeti `#5E807F` marad (ott bőven megfelelő). Minden további fázisban, minden sötét háttéren futtatott textúra-ellenőrzésnél erre figyelni kell.

Funkcionális jelzések: dicséret \= mint/teal; figyelmeztetés \= visszafogott borostyánsárga; egészségügyi jelzés (pl. fájdalom pontja a testábrán) \= semleges piros/korall.

Fázis 1-ben véglegesített CSS-változó-konvenció (ajánlott a további fázisokban is átvenni): \--color-bg, \--color-bg-alt, \--color-surface, \--color-text, \--color-text-muted, \--color-primary, \--color-primary-contrast, \--color-secondary, \--lime, \--lime-soft, \--lime-bright, \--navy, \--mint, \--teal, \--sagegray, \--offwhite, \--color-border, \--radius-pill, \--radius-card, \--radius-sm, \--shadow-card, \--shadow-card-hover, \--font-heading, \--font-body. A sötét mód a html\[data-theme="dark"\] attribútum-váltással és a fenti változók felülírásával működik — ez a minta bevált, érdemes átvenni.

3\. TIPOGRÁFIA (lezárva)  
\- Címsorok: Poppins Bold (700).  
\- Szövegtörzs: Montserrat (Regular 400 folyószöveghez, Medium 500 kiemelésekhez/feliratokhoz).  
\- UI-feliratok (gombok, tab-nevek) kisbetűvel jelennek meg (pl. "gyakorlás", "eredményeid", "regisztrálok") — Montserrat Medium.  
\- Forrás: Google Fonts, szabadon használható.

4\. MÁRKAJEL — CHEVRON FORMA LEZÁRVA (2026.08.25., Marci jóváhagyásával)  
\- "FIX YOUR BACK" felirat \+ ismétlődő « / » (chevron) minta márkajelként — fejlécben, szekció-eyebrow-kban (pl. "a folyamat «"), töltésjelzőn, footer dísz-csíkban. A chevron ugyanaz az SVG-elem CSS-sel tükrözve (transform: scaleX(-1)) ad "»" irányt is, pl. balról jobbra futó folyamat-nyilakhoz — nem kell hozzá külön ikon.  
\- **Lezárt megvalósítás (2026.08.25.):** két kézzel rajzolt SVG-közelítés sem adta vissza pontosan a logó nyilát, ezért a chevron **magából a logóból (`original logo.png`) pixelre pontosan kivágott PNG-grafika** (`public/images/chevron.png`, 30×41 px, egy teljes ismétlődési periódus — két példány szomszédosan pontosan visszaadja a logó "BACK«««" mintáját, varrat nélkül). Marci jóváhagyta ezt a formát mint véglegeset — minden további fázis ugyanezt a fájlt vegye át, ne rajzolja újra. Nem SVG, nem `currentColor` — mindig a logó saját mint-színét viseli. Magassága `0.72em` (nem `1em`) — így pontosan a mellette álló szöveg tényleges betűmagasságával (nem a teljes sorköz-dobozzal) egyezik. Egyetlen egységként (`<Chevron/>`) vagy két szorosan egymás mellé rakott egységként (`<Chevron double/>`) használható. Iránya CSS-transzformmal állítható: alapértelmezett balra, `direction="right"` (scaleX tükrözés) és `direction="down"` (elforgatás). **Elhelyezés:** eyebrow-knál mindig a szöveg UTÁN áll (a logó "FIX YOUR BACK ‹‹‹‹" mintáját követve), nem elé.  
\- **Logó (2026.08.25.):** a végleges logó-grafika (`Design elemek/original logo.png`) a "FIX YOUR BACK" feliratot törtfehér színnel tartalmazza, ezért csak sötét (navy) háttéren olvasható. Világos háttérhez egy második változat készült, amelyben **csak a fekete** elemek (a "FIX YOUR BACK" felirat és az ikon-sziluett körvonala) lettek a fő sötétkék (navy, `#1A2634`) színre cserélve; az ikon-négyzeten belüli fehér részletek (pl. a sziluett kézfején) és a mint/teal ikon-négyzet, illetve a chevronok változatlanok maradtak. A fejlécben mindkét változat betöltve, CSS-sel (`data-theme` szerint) váltva jelenik meg; a lábléc (mindig navy háttér) csak a sötét-hátterű változatot használja.  
\- **Footer dísz-csík (2026.08.25.):** a chevron-minta a lábléc-blokk TETEJÉN (nem az oldal legalján), teljes szélességben, a logó-hű nyíl-formával, ismétlődő mintaként fut végig. A csík nem közvetlenül a szín-határnál kezdődik — a lábléc navy háttere `padding-top`-pal előbb kezdődik, a csík csak valamennyivel lejjebb következik.

5\. ÚJRAFELHASZNÁLANDÓ KOMPONENSEK (Fázis 1-ben megépítve, a Design elemek / kódban is elérhető, további fázisok vegyék át)  
\- Fejléc: bal felül logó (chevron-ikon \+ "FIX YOUR BACK" \+ mini chevron-pár), jobb felül sötét/világos mód váltó \+ hamburger mobilon.  
\- Gombok (pirula-alakú, kisbetűs felirat): btn-primary (teal/mint), btn-highlight (lime, sötét szöveg), btn-outline, btn-ghost, btn-lg (nagyobb, hero-CTA-hoz).  
\- Kártya (.card): lekerekített, árnyékolt, hover-elmozdulással.  
\- Badge (.badge): lime pirula, nagybetűs, félkövér — kategória-címkékhez, célcsoport-kiemeléshez, állapotjelzőkhöz (pl. "hamarosan").  
\- Eyebrow (.eyebrow): chevron-ikon \+ kisbetűs felirat, szekció-címkékhez.  
\- Folyamat-lépések (.process-flow / .process-step / .process-arrow — Fázis 1-ben új): számozott vagy ikonos lépés-kártyák, köztük tükrözött chevron-nyíllal — konverziós tölcsér vagy módszertani lépéssor bemutatására. Mobilon függőlegesre esik szét, a nyíl 90°-ban elfordul.  
\- Modul-/lecke-lista (.module-list / .module-item): sorszám \+ cím \+ rövid leírás, kurzus-modulokhoz vagy videó-leckékhez.  
\- Lezárt tartalom-előnézet (.locked-card / .locked-list — Fázis 1-ben új): szaggatott keretes doboz, lakat-ikonnal jelzett fejléccel — olyan tartalom bemutatására, ami feltételhez kötötten (pl. videó megtekintése után) nyílik meg a végleges rendszerben.  
\- Testimonial-kártya (.testimonial): csillagos értékelés \+ idézet \+ monogramos avatar \+ név/szerepkör. **Tartalom (2026.08.25.):** csak valódi Google-értékelés kerülhet be (a "FixYourBack Kft." Google-adatlapjáról), kitalált vélemény nem — jelenleg 1 db valós értékelés érhető el, ezt kell frissíteni, ha újabbak érkeznek.  
\- Videó-kártya (.video-card / .video-thumb / .play-btn): placeholder thumbnail \+ lejátszás-gomb.  
\- Hírlevél/regisztrációs panel (.newsletter): sötét (navy) kártya, cím \+ leírás \+ form (e-mail, illetve szükség esetén név \+ e-mail) \+ mikroszöveg.  
\- Hero-fotó \+ aláírás (.hero-photo-wrap — 2026.08.25., véglegesítve ugyaneznap): kivágott (átlátszó hátterű) portré-fotó, alja a szekció szín-határával egybeeső elhelyezéssel. Jobb alsó sarkában félig lelógó aláírás-grafika (46,2% szélesség, jobbról 1,25rem-re a szélétől — ne essen egészen a széléhez). Az árnyék `filter: drop-shadow(...)`-val az aláírás-grafika saját sziluettjéhez tapad (nem külön elmosott folt) — így ténylegesen a kép és az aláírás közé kerül, nem a kép mögé/alá csúszik. Az aláírás két színváltozatban létezik: világos módban navy (sötétebb árnyék), sötét módban türkiz `#5FD3BC` (világos derengés) — külön PNG-fájlként, a logóhoz hasonló data-theme-alapú váltással (nem CSS-szűrővel/invertálással).  
\- Body-chart (test-vázlat): világos módban valósághű bőrszínű ábrázolás, sötét módban röntgen-szerű, türkiz-árnyalatú csontváz-overlay. **Véglegesítve (2026.08.25.):** a "Design elemek / felvételi lap" mappában lévő kidolgozott elöl-hátul látványterv az alap referencia (nem az újratervezés), a jelenlegi lime/teal/navy palettához igazítva kell megvalósítani a 4. fázisban (Állapotfelmérő kérdőív + eredménylap).

6\. VILÁGOS / SÖTÉT MÓD  
Mindkét mód megépült és működik Fázis 1-ben (data-theme attribútum \+ localStorage-mentés). Minden további felületen ugyanezt a mechanizmust és színfelosztást kell követni.  
\- **Mód-váltó ikon (2026.08.25.):** emoji helyett egyszerű, vékony vonalas (stroke, currentColor) nap/hold SVG-ikon, az ikonkészlet stílusához igazítva.

7\. IKONOK — LEZÁRVA (2026.08.06)  
Forrás: a "Design elemek" mappában lévő 17 kézzel rajzolt SVG (9 vékony vonalas "eredeti" \+ 8 tömör kitöltésű "v4" ikon). Minden fázis-munkamenet ugyanebből a 17 fájlból dolgozzon. A kódban `stroke`/`fill` értékük `currentColor`-ra cserélve, hogy szövegszínt kövessék világos/sötét módban.  
\- **Fontos technikai megkötés (2026.08.25., hiba javítva):** egy `<img src=".../ikon.svg">`-be töltött SVG belső `currentColor`-ja NEM örökli az oldal színét — a böngésző a képet elszigetelt erőforrásként rendereli, a `currentColor` az alapértelmezett feketére esik vissza. Emiatt minden ikon feketén jelent meg (világos módban ez véletlenül navy szöveggel majdnem egybeesett, sötét módban viszont láthatóan rossz volt). **Megoldás:** az ikonokat a `src/components/Icon.tsx` komponens jeleníti meg, ami CSS `mask-image` \+ `background-color: currentColor` technikával tölti be és színezi az SVG-t (`.icon-mask` osztály). Minden további fázisban ikon-megjelenítéshez ezt a komponenst kell használni, sima `<img>`-et nem (kivéve a logót és a chevront, amik saját, fix márkaszínű PNG-ként helyesen működnek `<img>`-ként is).

8\. KORÁBBI (NEM VÉGLEGES) MOCKUPOK KEZELÉSE — döntés 2026.08.25.  
A "Design elemek / webalkalmazás phone látvány" képek (Együttműködés oldal korai wireframe-jei: gyakorlás, eredmények, checklist folyamatok) narancssárga kiemelőszínt használnak, ami nem szerepel a lezárt palettában. Ezekből csak a képernyő-szerkezetet/folyamatot vesszük át referenciaként, a végleges vizuális megvalósítás mindig a jelen dokumentum lezárt palettáját (mint/teal/lime/borostyán) követi.

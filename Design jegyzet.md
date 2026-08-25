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

Funkcionális jelzések: dicséret \= mint/teal; figyelmeztetés \= visszafogott borostyánsárga; egészségügyi jelzés (pl. fájdalom pontja a testábrán) \= semleges piros/korall.

Fázis 1-ben véglegesített CSS-változó-konvenció (ajánlott a további fázisokban is átvenni): \--color-bg, \--color-bg-alt, \--color-surface, \--color-text, \--color-text-muted, \--color-primary, \--color-primary-contrast, \--color-secondary, \--lime, \--lime-soft, \--lime-bright, \--navy, \--mint, \--teal, \--sagegray, \--offwhite, \--color-border, \--radius-pill, \--radius-card, \--radius-sm, \--shadow-card, \--shadow-card-hover, \--font-heading, \--font-body. A sötét mód a html\[data-theme="dark"\] attribútum-váltással és a fenti változók felülírásával működik — ez a minta bevált, érdemes átvenni.

3\. TIPOGRÁFIA (lezárva)  
\- Címsorok: Poppins Bold (700).  
\- Szövegtörzs: Montserrat (Regular 400 folyószöveghez, Medium 500 kiemelésekhez/feliratokhoz).  
\- UI-feliratok (gombok, tab-nevek) kisbetűvel jelennek meg (pl. "gyakorlás", "eredményeid", "regisztrálok") — Montserrat Medium.  
\- Forrás: Google Fonts, szabadon használható.

4\. MÁRKAJEL  
\- "FIX YOUR BACK" felirat \+ ismétlődő « / » (chevron) minta márkajelként — fejlécben, szekció-eyebrow-kban (pl. "a folyamat «"), töltésjelzőn, footer dísz-csíkban. A chevron ugyanaz az SVG-elem CSS-sel tükrözve (transform: scaleX(-1)) ad "»" irányt is, pl. balról jobbra futó folyamat-nyilakhoz — nem kell hozzá külön ikon.

5\. ÚJRAFELHASZNÁLANDÓ KOMPONENSEK (Fázis 1-ben megépítve, a Design elemek / kódban is elérhető, további fázisok vegyék át)  
\- Fejléc: bal felül logó (chevron-ikon \+ "FIX YOUR BACK" \+ mini chevron-pár), jobb felül sötét/világos mód váltó \+ hamburger mobilon.  
\- Gombok (pirula-alakú, kisbetűs felirat): btn-primary (teal/mint), btn-highlight (lime, sötét szöveg), btn-outline, btn-ghost, btn-lg (nagyobb, hero-CTA-hoz).  
\- Kártya (.card): lekerekített, árnyékolt, hover-elmozdulással.  
\- Badge (.badge): lime pirula, nagybetűs, félkövér — kategória-címkékhez, célcsoport-kiemeléshez, állapotjelzőkhöz (pl. "hamarosan").  
\- Eyebrow (.eyebrow): chevron-ikon \+ kisbetűs felirat, szekció-címkékhez.  
\- Folyamat-lépések (.process-flow / .process-step / .process-arrow — Fázis 1-ben új): számozott vagy ikonos lépés-kártyák, köztük tükrözött chevron-nyíllal — konverziós tölcsér vagy módszertani lépéssor bemutatására. Mobilon függőlegesre esik szét, a nyíl 90°-ban elfordul.  
\- Modul-/lecke-lista (.module-list / .module-item): sorszám \+ cím \+ rövid leírás, kurzus-modulokhoz vagy videó-leckékhez.  
\- Lezárt tartalom-előnézet (.locked-card / .locked-list — Fázis 1-ben új): szaggatott keretes doboz, lakat-ikonnal jelzett fejléccel — olyan tartalom bemutatására, ami feltételhez kötötten (pl. videó megtekintése után) nyílik meg a végleges rendszerben.  
\- Testimonial-kártya (.testimonial): csillagos értékelés \+ idézet \+ monogramos avatar \+ név/szerepkör.  
\- Videó-kártya (.video-card / .video-thumb / .play-btn): placeholder thumbnail \+ lejátszás-gomb.  
\- Hírlevél/regisztrációs panel (.newsletter): sötét (navy) kártya, cím \+ leírás \+ form (e-mail, illetve szükség esetén név \+ e-mail) \+ mikroszöveg.  
\- Body-chart (test-vázlat): világos módban valósághű bőrszínű ábrázolás, sötét módban röntgen-szerű, türkiz-árnyalatú csontváz-overlay. **Véglegesítve (2026.08.25.):** a "Design elemek / felvételi lap" mappában lévő kidolgozott elöl-hátul látványterv az alap referencia (nem az újratervezés), a jelenlegi lime/teal/navy palettához igazítva kell megvalósítani a 4. fázisban (Állapotfelmérő kérdőív + eredménylap).

6\. VILÁGOS / SÖTÉT MÓD  
Mindkét mód megépült és működik Fázis 1-ben (data-theme attribútum \+ localStorage-mentés). Minden további felületen ugyanezt a mechanizmust és színfelosztást kell követni.

7\. IKONOK — LEZÁRVA (2026.08.06)  
Forrás: a "Design elemek" mappában lévő 17 kézzel rajzolt SVG (9 vékony vonalas "eredeti" \+ 8 tömör kitöltésű "v4" ikon). Minden fázis-munkamenet ugyanebből a 17 fájlból dolgozzon. A kódban `stroke`/`fill` értékük `currentColor`-ra cserélve, hogy szövegszínt kövessék világos/sötét módban.

8\. KORÁBBI (NEM VÉGLEGES) MOCKUPOK KEZELÉSE — döntés 2026.08.25.  
A "Design elemek / webalkalmazás phone látvány" képek (Együttműködés oldal korai wireframe-jei: gyakorlás, eredmények, checklist folyamatok) narancssárga kiemelőszínt használnak, ami nem szerepel a lezárt palettában. Ezekből csak a képernyő-szerkezetet/folyamatot vesszük át referenciaként, a végleges vizuális megvalósítás mindig a jelen dokumentum lezárt palettáját (mint/teal/lime/borostyán) követi.

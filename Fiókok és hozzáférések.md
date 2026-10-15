# Fiókok, menüpontok és hozzáférések

A FixYourBack felület (UI-terv / prototípus) összes felhasználói szerepköre, azok menüpontjai, a közöttük lévő kapcsolatok és kizárások. Állapot: 2026.10.15.

---

## 0. Fontos tudnivalók a prototípusról

- **Nincs backend és nincs valódi hitelesítés.** A belépés egy böngészőbeli (localStorage) munkamenet-jelölő, a jelszót nem ellenőrzi semmi. A szerepkörök jelenleg a **menüt** és a **kezdőoldalt** határozzák meg.
- **Nincs szerepkör-alapú útvonalvédelem.** Aki ismeri egy másik szerepkör útvonalát (pl. `/gyt/ugyfelek`, `/admin/blog`), azt közvetlen címmel megnyithatja. Az egyetlen valódi kapu az ÜF-nél az állapotfelmérő (lásd 3. fejezet), a GYT-nél az ügyfélválasztás (lásd 5. fejezet).
- **Az ÜF-oldal egyetlen demó-ügyfélre épül:** "Péter" (`peter`), akit a "kollega@kollega.hu" GYT-hez (Kollé Gábor / a felületen "Judit") rendeltünk. A GYT-oldal a hozzá rendelt ügyfeleket látja.
- **Az adatok tárolása:** nagy részük csak a böngésző memóriájában él (oldalfrissítéskor elvész), néhány a localStorage-ban marad (lásd 9. fejezet). Éles működéshez backend és valódi jogosultságkezelés kell (lásd 10. fejezet).

---

## 1. Fiókok (szerepkörök) áttekintése

| Szerepkör | Ki ő | Belépés | Kezdőoldal belépés után |
|---|---|---|---|
| **Látogató** (nincs fiók) | Bárki, aki a nyilvános oldalt nézi | nincs | – (főoldal) |
| **ÜF – ügyfél** | A programban részt vevő ügyfél | teszt-fiók: `peldabela@peldabela.hu`; vagy **regisztráció** (csak ÜF regisztrálhat) | `/checklist`; ha még nem töltötte ki az állapotfelmérőt, automatikusan az **állapotfelmérőre** kerül |
| **GYT – gyógytornász** | A saját ügyfeleivel dolgozó kolléga | teszt-fiók: `kollega@kollega.hu` (Kollé Gábor) | `/gyt/ugyfelek` |
| **SALES – értékesítő** | A Calendly-foglalásokat kezeli, az ügyfelet GYT-hez rendeli | teszt-fiók: `ertekes@ertekes.hu` (Értékes Eszter) | `/sales/hivasaim` |
| **ADMIN – adminisztrátor** | Mindent lát, tartalmat és munkatársakat kezel | teszt-fiók: `admin@admin.hu` (Admin Anna) | `/admin/munkatarsak` |

Megjegyzések:
- **GYT-k a rendszerben:** Kollé Gábor, Nagy Réka, Tóth Bence (a SALES mindháromnak oszthat ügyfelet; a demóban a belépett GYT mindig Kollé Gábor).
- **Regisztráció** csak ÜF-et hoz létre; minden más szerepkört az admin vesz fel ("munkatársak").
- Regisztrációkor a korábbi állapotfelmérés-adatok törlődnek (új ügyfél tiszta lappal indul).

---

## 2. Nyilvános (belépés nélküli) felület

Fejléc: főoldal · mélyedukáció · gyorsítósáv · időpontfoglalás · belépés. Lábléc: oldaltérkép, kapcsolat (e-mail, Instagram, Facebook, edukációs csoport), ÁSZF · Adatvédelmi tájékoztató · cookie.

| Oldal | Tartalom / működés | Megjegyzés |
|---|---|---|
| **Főoldal** | hero, kinek segítünk, hogyan segítünk (3 lépés), visszajelzések (Google-értékelés carousel), hírlevél-feliratkozás | |
| **Mélyedukáció** (blog) + cikk | az admin által felvett bejegyzések listája, cikk-oldal | tartalom: admin → blog |
| **Gyorsítósáv** | belépés nélkül elérhető, **e-mailes regisztrációval** indul; videók sorban, mindig csak az aktuális látszik; tudáscheck → komment → következő videó; visszaszámláló és ajándék; befejezés után gratuláló oldal (`/gyorsitosav/kesz`) | beállítások: admin → gyorsítósáv; a haladás böngészőben tárolt, **nem azonos az ÜF-fiókkal** |
| **Időpontfoglalás** | leírás, bemutatkozás, videós és Google-értékelés carousel, Calendly-beágyazás (helyőrző) | **nincs feltételhez kötve** (a gyorsítósáv nem előfeltétele) |
| **Belépés / regisztráció** | belépés a teszt-fiókokkal, ÜF regisztráció | |
| **ÁSZF, Adatvédelmi tájékoztató, cookie** | helyőrző oldalak ("hamarosan elérhető") | a végleges szöveg még hiányzik |

Kizárások a nyilvános felületen: a látogató a belépés utáni (ÜF / GYT / SALES / ADMIN) oldalakat a menüben nem látja; közvetlen címmel való elérésüket jelenleg nem védi hitelesítés (lásd 0. fejezet).

---

## 3. ÜF – ügyfél fiók

### 3.1 Menüsor (fentről lefelé)

1. **checklist**
2. **oktatóanyag**
3. **munkafüzet**
4. **konzultációk**
5. **gyakorlatok**
6. **állapotfelmérő**
7. **kérdéseim**
8. **utánkövetés**
9. **eredményeim**

### 3.2 Hozzáférési feltételek (kapuk)

| Feltétel | Mire hat |
|---|---|
| **Állapotfelmérő kitöltve** (legalább egyszer beküldve) | Az **állapotfelmérő** kivételével minden menüpont zárolt (lakat), és közvetlen címmel is visszairányít az állapotfelmérőre. A kitöltés megmarad a böngészőben, így utána minden belépés a checklistre vezet. |
| **Oktatóanyag mindkét leckéjének tudáscheckje teljesítve** | A **munkafüzet** megnyílásának feltétele (menü-szintű zár; a lap közvetlen címmel nem védett). |
| **A GYT az ügyfelet utánkövetésbe tette** (10 hét lezárva) | Az **utánkövetés** menüpont csak ekkor nyílik meg (menü-szintű zár). |
| **Befizetve (SALES jelöli)** | A **konzultációk** lista csak akkor mutat tételeket; előtte tájékoztató üzenet látszik. |
| **Utánkövetés megnyílt** | A **kérdéseim** oldalon **új kérdés nem tehető fel** (a korábbiak olvashatók). |

### 3.3 Menüpontonként

| Menüpont | Mit lát / mit tehet | Ki látja még |
|---|---|---|
| **checklist** | Naponta tölthető követés: tünet-időtartam és -intenzitás, "nem hajolás", edzések rögzítése tünet-válasszal, szintek szerinti diagramok; szintváltás. | A saját GYT **csak olvasható** nézetben (GYT → checklist). |
| **oktatóanyag** | Az admin által felvett leckék és fejezetek (egyelőre cím-helyőrzők), leckénként tudáscheck. | A GYT az összes videót látja (GYT → oktatóanyag). |
| **munkafüzet** | Gerinc-optimalizáló munkafüzet (rossz/jó mozdulat-párok), mentés. | A saját GYT csak olvashatja (GYT → munkafüzet). |
| **konzultációk** | A saját rögzített konzultációk (alkalom, időpont, Meet-link). | A GYT a naptárában kezeli; a SALES az 1. alkalmat foglalja. |
| **gyakorlatok** | Szintek (12–13, sorrendje az állapotfelmérő limitációitól függ): aktuális szint videója és leírása, lezárt szintek visszanézhetők, a további szintek zároltak. | A videókat a GYT osztja ki (GYT → videókiosztás); a videót az admin tölti fel. |
| **állapotfelmérő** | 9 lapos kérdőív (alapadatok, tünet, testábra, történet, rizikófaktorok, mozgékonyság, cél, gerincterhelés-kalkulátor). Újabb kitöltés **új eredménylapot** hoz létre. | A saját GYT látja az eredménylapot (GYT → állapotfelmérők). |
| **kérdéseim** | Szabad szöveges kérdés a saját GYT-nek; egyszerre **legfeljebb 2 megválaszolatlan** kérdés; a GYT hozzászólásban válaszol; új választ **pötty** jelzi a menüponton. | Kizárólag a saját GYT látja és válaszol. |
| **utánkövetés** | A saját GYT heti csoportos Google Meet mítingjének időpontja és linkje; jelentkezés max. 2 mondatos leírással; a férőhelyek (alap: 6) jelentkezési sorrendben telnek be, betelés után nem lehet jelentkezni; a jelentkezéseket mindenki látja. | A saját GYT és a vele utánkövetésben lévő többi ÜF látja a jelentkezéseket és a linket. |
| **eredményeim** | A beküldött állapotfelmérések eredménylapja (a legújabb elöl). | A saját GYT. |

### 3.4 Kezdő útvonal (útmutatás, nem kényszer)

Az állapotfelmérő után az eredménylap tetején sárga sáv, a menüben sárga kiemelés és pulzáló pötty mutatja a következő lépést: **oktatóanyag → munkafüzet**. A munkafüzet mentése után minden jelzés eltűnik, és a használat szabad.

### 3.5 Az ÜF mit NEM láthat/tehet

- Más ügyfél adatait nem látja (kivétel: az utánkövetési mítingre jelentkezők neve és szövege, a kommentszekció rövidített névvel).
- A GYT, SALES és ADMIN felületeit a menüben nem látja.
- Nem szerkesztheti a videókat, a tartalmat, a naptárt, a hozzárendelést.

---

## 4. GYT – gyógytornász fiók

### 4.1 Menüsor (fentről lefelé)

1. **ügyfeleim** (pötty: újonnan hozzárendelt ügyfelek száma)
2. **dokumentáció**
3. **videókiosztás**
4. **munkafüzet**
5. **checklist**
6. **kérdések** (pötty: még meg nem nyitott kérdések száma)
7. **naptár**
8. **utánkövetés**
9. **dokumentáció beállításai**
10. **állapotfelmérők**
11. **oktatóanyag**
12. **eredmények** (zárolt helyőrző)

### 4.2 Kapuk

- **Ügyfélválasztás (kapu):** a *dokumentáció, videókiosztás, munkafüzet, checklist, állapotfelmérők* oldalak csak akkor nyílnak meg, ha az **ügyfeleim** oldalon ki van választva egy ügyfél; ennek hiányában a rendszer visszairányít az ügyfeleim oldalra. Minden belépés törli a korábbi kiválasztást.
- **Kapun kívüli oldalak** (nem egy ügyfélhez kötöttek): ügyfeleim, kérdések, naptár, utánkövetés, dokumentáció beállításai, oktatóanyag.

### 4.3 Menüpontonként

| Menüpont | Mit lát / mit tehet | Hatókör |
|---|---|---|
| **ügyfeleim** | A saját (hozzárendelt) ügyfelek listája, keresés, szűrés (mai / összes / 14 hetes utánkövetés / archivált), ügyfél kiválasztása. | Csak a saját ügyfelek. |
| **dokumentáció** | Alkalmankénti szöveges dokumentáció a kiválasztott ügyfélhez (gyorsgombok, időkorlátos szerkeszthetőség, az 1. alkalomnál az állapotfelmérés folytatása és az eredménylap). | A kiválasztott saját ügyfél. |
| **videókiosztás** | Szintenként videót oszt ki a kiválasztott ügyfélnek (automata javaslat az állapotfelmérő limitációiból, felülbírálható), limitációk (fájdalom helye, hason fekvés, váll, térd, vérnyomás). | A kiválasztott saját ügyfél. |
| **munkafüzet** | Az ügyfél munkafüzet-válaszai — **csak olvasható**. | A kiválasztott saját ügyfél. |
| **checklist** | Az ügyfél checklist-diagramjai szintenként — **csak olvasható**. | A kiválasztott saját ügyfél. |
| **kérdések** | A saját ügyfelek kérdéseinek beérkezője (megválaszolatlanok elöl), megnyitás után hozzászólásban válaszol. | Csak a saját ügyfelek kérdései. |
| **naptár** | "Mai konzultációk" lista és heti naptár a saját időpontokkal; új időpont felvétele (szabad / terv / konzultáció), meet-link; az utánkövetési míting is megjelenik (sötétkék blokk). | Csak a saját naptár. |
| **utánkövetés** | Heti csoportos míting kiírása (időpont, férőhelyek száma; a Google Meet link automatikusan készül), jelentkezők kezelése, ügyfél utánkövetésbe helyezése / kivétele. | A saját utánkövetett ügyfelek. |
| **dokumentáció beállításai** | Az 1. alkalom "állapotfelmérés folytatása" sablonja (közös sablon, nem visszamenőleges). | Saját sablon, nem ügyfélhez kötött. |
| **állapotfelmérők** | A kiválasztott ügyfél állapotfelmérő eredménylapja (nyomtatás is). | A kiválasztott saját ügyfél. |
| **oktatóanyag** | Az összes videó csak olvasható listája: az oktatóanyag leckéi és az összes szint videója (szint-számokkal sorrendenként), plusz az egyedi videók. | Nem ügyfélhez kötött. |
| **eredmények** | Zárolt helyőrző, még nem épült meg. | – |

### 4.4 A GYT mit NEM láthat/tehet

- **Más GYT ügyfeleit nem látja** (az ügyfeleim lista, a kérdések és a naptár csak a sajátjait mutatja).
- Az ÜF munkafüzetét és checklistjét **nem szerkesztheti**, csak olvashatja.
- Az ÜF állapotfelmérőjét nem töltheti ki helyette.
- Az admin által kezelt tartalmat (blog, anyagok, gyorsítósáv) nem szerkesztheti.
- A SALES hozzárendelési és hívás-oldalait a menüben nem látja.

---

## 5. SALES – értékesítő fiók

### 5.1 Menüsor

1. **hívásaim** (pötty: új, még el nem bírált Calendly-foglalások száma)
2. **hozzárendelések**
3. **üzenetek**

### 5.2 Menüpontonként

| Menüpont | Mit lát / mit tehet |
|---|---|
| **hívásaim** | A Calendly-ből érkező hívások naptára és listája; kimenetel jelölése, hívás szerkesztése/elutasítása. |
| **hozzárendelések** | Ügyfél felvétele (név, e-mail, telefon), **ügyfél–GYT hozzárendelés**, az 1. konzultáció időpontjának lefoglalása a GYT naptárában, **befizetve** jelölés; az összes GYT naptárának áttekintése. |
| **üzenetek** | Az elutasító üzenet-sablonok szerkesztése (a hívás elutasításakor az ügyfélnek menő automata üzenet). |

### 5.3 Kapcsolatok

- A SALES által felvett ügyfél **azonnal megjelenik a kiválasztott GYT "ügyfeleim" listájában** (újként, pöttyel) és a naptárában a lefoglalt 1. alkalom.
- A **befizetve** jelölés nyitja meg az ügyfél "konzultációk" listáját.
- A SALES az összes GYT **szabad időpontjait** látja, de az ügyfelek dokumentációját, munkafüzetét, checklistjét **nem**.

---

## 6. ADMIN – adminisztrátor fiók

### 6.1 Menüsor

1. **munkatársak**
2. **blog**
3. **anyagok kezelése**
4. **gyorsítósáv**
5. **statisztikák** (zárolt helyőrző)

### 6.2 Menüpontonként

| Menüpont | Mit lát / mit tehet |
|---|---|
| **munkatársak** | GYT és SALES munkatársak felvétele; **belépés a munkatárs nevében** ("admin nézet": az admin ugyanazt látja, amit a kolléga, egy sáv jelzi, hogy admin nézetben van, és innen kiléphet). |
| **blog** | Mélyedukáció-bejegyzések és kategóriák létrehozása (a nyilvános oldalon azonnal megjelenik). |
| **anyagok kezelése** | A szint-videók (S01–S13, A01–A07) feltöltése, egyedi videó létrehozása (nem kerül az automata ajánlásba), oktatóanyag leckék és fejezetek, tudáspróba-kérdések felvétele. |
| **gyorsítósáv** | A gyorsítósáv szerkesztője: videók feltöltése és sorrendje, tudáscheck-kérdések, visszaszámláló határideje, ajándék (neve, leírás, letöltési link), kommentek moderálása, teszt-visszaállítás. |
| **statisztikák** | Zárolt helyőrző. |

### 6.3 Jogosultság

Az admin "mindent lát" (specifikáció szerint): a munkatársak nevében belépve látja a GYT és a SALES felületet is. Új munkatárs felvétele jelenleg csak a munkamenetben él (nem hoz létre valódi, belépésre alkalmas fiókot).

---

## 7. Kapcsolatok szerepkörök között (ki mit hoz létre, ki lát)

| Folyamat | Létrehozza | Látja / használja |
|---|---|---|
| Ügyfél felvétele és GYT-hez rendelése | SALES | GYT (ügyfeleim, új pötty), ADMIN (nézet) |
| 1. konzultáció foglalása | SALES | GYT (naptár), ÜF (konzultációk, ha befizetett) |
| Befizetve jelölés | SALES | ÜF (konzultációk megnyílik) |
| Későbbi konzultációk időpontja | GYT | ÜF (konzultációk) |
| Állapotfelmérő kitöltése | ÜF | ÜF (eredményeim), saját GYT (állapotfelmérők, dokumentáció 1. alkalom) |
| Videók feltöltése (szintek) | ADMIN | GYT (videókiosztás, oktatóanyag), ÜF (gyakorlatok, ha a GYT kiosztotta) |
| Videók kiosztása szintenként | GYT | ÜF (gyakorlatok) |
| Oktatóanyag leckék, tudáspróba-kérdések | ADMIN | ÜF (oktatóanyag), GYT (oktatóanyag, csak olvasható) |
| Munkafüzet kitöltése | ÜF | saját GYT (csak olvasható) |
| Checklist naponta | ÜF | saját GYT (csak olvasható) |
| Dokumentáció | GYT | GYT (a saját ügyfeleire) |
| Kérdés | ÜF | saját GYT (kérdések, pötty) |
| Válasz (hozzászólás) | GYT | ÜF (kérdéseim, pötty) |
| 10 hét lezárása → utánkövetésbe helyezés | GYT | ÜF (utánkövetés megnyílik, kérdéseim tilt) |
| Heti csoportos míting kiírása (+ Meet link) | GYT | a saját utánkövetett ÜF-ek (utánkövetés), GYT naptára és "mai konzultációk" |
| Mítingre jelentkezés | ÜF | a saját GYT és a többi utánkövetett ÜF |
| Blog-bejegyzések | ADMIN | Látogatók (mélyedukáció) |
| Gyorsítósáv tartalma és beállításai | ADMIN | Látogatók (nyilvános gyorsítósáv) |
| Munkatársak felvétele | ADMIN | ADMIN (belépés munkatárs nevében) |

---

## 8. Kizárások és korlátozások összefoglalva

- **ÜF ↔ ÜF:** az ügyfelek egymás adatait nem látják; kivétel az utánkövetési míting jelentkezői listája (név + 2 mondatos leírás) és a Google Meet link.
- **GYT ↔ GYT:** a gyógytornászok csak a **saját ügyfeleiket**, saját naptárukat és saját kérdéseiket látják.
- **GYT → ÜF adatai:** olvasási jog az állapotfelmérőre, munkafüzetre, checklistre; **szerkesztés nincs**.
- **SALES:** az ügyfél személyes/orvosi tartalmához (dokumentáció, munkafüzet, checklist) nincs hozzáférése; csak a hozzárendelést és a naptár-foglaltságot kezeli.
- **ADMIN:** tartalom-szerkesztés és munkatárs-kezelés; a munkatársak nevében belépve a felületüket látja.
- **Állapotfüggő zárak (ÜF):** állapotfelmérő → minden más; oktatóanyag-tudáscheckek → munkafüzet; GYT beállítás → utánkövetés; befizetés → konzultációk; utánkövetés → új kérdés tiltása.
- **Mennyiségi korlátok:** egyszerre legfeljebb 2 megválaszolatlan kérdés ügyfelenként; a csoportos míting férőhelyeinek száma a GYT által megadott (alap: 6), jelentkezés ≤ 2 mondat / 300 karakter, ügyfelenként egy jelentkezés mítingenként.
- **Mi nem ellenőrzött:** a menü-szintű zárak (pl. munkafüzet, utánkövetés) és a szerepkör-elválasztás közvetlen címmel megkerülhetők, amíg nincs szerveroldali ellenőrzés.

---

## 9. Hol tárolódik az adat (a prototípusban)

| Adat | Tárolás | Frissítéskor |
|---|---|---|
| Belépési munkamenet, kiválasztott ügyfél (GYT) | localStorage | megmarad |
| Beküldött állapotfelmérések | localStorage | megmarad |
| Kérdések és válaszok | localStorage | megmarad |
| Utánkövetési mítingek és jelentkezések | localStorage | megmarad |
| Gyorsítósáv: beállítások, haladás, kommentek | localStorage | megmarad |
| Gyorsítósáv videófájlok | böngésző (IndexedDB) | megmarad az adott böngészőn |
| Ügyfél-nyilvántartás, naptár, SALES-hívások, munkatársak | memória | elvész |
| Szint-videók feltöltése (anyagok kezelése), oktatóanyag leckék, blog | memória | elvész |
| Munkafüzet, checklist, dokumentáció | memória | elvész |

---

## 10. Éles működéshez szükséges (a backenddel)

- Valódi belépés (jelszó, e-mail megerősítés) és **szerver-oldali szerepkör-ellenőrzés** minden útvonalra és adatra.
- Az ügyfél–GYT kapcsolat szerver-oldali érvényesítése (egy GYT csak a saját ügyfeleit kérhesse le).
- Tartós adatbázis az összes fenti adathoz (ügyfelek, naptár, kérdések, jelentkezések, dokumentáció stb.).
- Videótárolás külső szolgáltatóban (pl. Mux); a gyorsítósáv és a szint-videók közös kezelése.
- Valódi Google Meet-szoba létrehozása (Google Naptár API) az utánkövetési mítingekhez.
- Értesítések (e-mail/push) a pöttyök mellé: új kérdés, új válasz, új hozzárendelés.

// A "mélyedukáció" (korábban "blog") oldal valódi tartalma — Marci saját
// Facebook-posztjai/hírlevelei (a "blog" mappában megosztott .docx fájlok),
// amik lecserélték a korábbi, csak UI-terv célú kamu posztokat (2026.09.02.,
// Marci kérésére). A `content` mező bekezdésenként `\n\n`-nel tagolt nyers
// szöveg — az admin szerkesztőben is ez az EGY "szöveg" mező adja (nincs
// külön gazdag-szöveg/HTML szerkesztő, ez UI-terv, nem valódi CMS).

export type BlogPost = {
  id: string
  title: string
  category: string
  content: string
  date: string
}

export const initialCategories: string[] = [
  'mítoszok és eszközök',
  'kezelési módszerek',
  'mozgásminták',
  'porckorongsérv és műtét',
  'gyógytorna alapelvek',
]

export const initialBlogPosts: BlogPost[] = [
  {
    id: 'p11',
    title: 'tornázgatunk?',
    category: 'gyógytorna alapelvek',
    date: '2026.08.25.',
    content: `Tornázgatunk? Nyújtogatunk? Edzegetünk? Hogyan tudsz szintet lépni a derékfájás és porckorongsérv kezelésében úgy, hogy kimaxolod a gyógytornában rejlő potenciált?

A következő posztban bemutatom neked, hogyan működik és mire képes a valóban hatékony gyógytorna.

Az emberek általában fogalmak szintjén, nagyjából tudják a megoldást.

Például egy porckorongsérvnél (konyhanyelven gerincsérvnél) a legtöbb ember tudja, hogy, először nem szokták műteni, csak, ha a konzervatív kezelés (azaz például a torna) nem használt.

Sőt még az az információ is megvan, hogy a törzs izmait kell erősíteni, és figyelni a mindennapokban, hogy ne terheljük túl a gerincet.

Eddig azt hiszem, nem mondtam semmi újat.

Pedig elmondtam a megoldást. Azt a megoldást, amivel önerőből, már sokan kijöttek nagyon durva derékfájásból, masszív gerincsérvből, és köszönik, jól vannak.

A bökkenő az, hogy csupa olyan fogalomról beszéltem, amit már ismersz, és már van róla egy kialakított kép a fejedben. Tehát, ha olvasod a fogalmat, azt gondolod, ja igen, ezt már ismerem, ez azt jelenti, hogy… És így lehet nagyon szépen elbeszélni egymás mellett.

Tehát most olyan dolgokról fogok írni, amiket „ismersz”, tudnál róla értelmesen beszélni, csak nem érted a lényegét igazán.

Kezdjük a derékfájással. A derékfájás egy tünet. Valaminek a jele. Annak a jele, hogy valami nem oké a derekadban. Mi az, ami nem oké? Hacsak nem látok egy baltát kiállni a derekadból, nem tudom konkrétan megmondani.

Ugyanis a fájdalmat senki sem látja. Az orvos sem látja, a gyógytornász sem látja, a röntgen, a CT, sőt az MR sem látja. Azt te érzed.

A részletes tünetek alapján persze tudunk következtetni, hogy mi az, ami fájhat, de korántsem biztos, hogy most neked tényleg az fáj. Arra vissza fogunk térni, hogy ez miért másodlagos.

Mi az a gerincsérv, vagy porckorongsérv? Az egy folyamat vége. Először csak kiboltosulás (protrusio) aztán ez még nagyobb (bulging), majd a porckorong szerkezetén belül egy hasadékon keresztül a középső zselés része is megindul a kidomborodás irányába, ez a sérv.

Igazából egy icipici bütyli a porckorongodon. Ha képiesen akarom elmondani, akkor képzelj el egy felkarikázott krumplit. Ebből az egyik szelet a porckorong, és a peremén mászik egy katicabogár. Körülbelül ezek a méretek.

Ha a katicabogár jobbra mászik, akkor a jobb fenékbe-lábba kisugárzó tüneteid lesznek, ha balra mászik, akkor balra lesznek tüneteid. Hogy milyen nagyok lesznek a tüneteid, azaz a fájdalmad, az attól függ, mekkora a katica, ahhoz képest, hogy mekkora helye van elférni. Vagyis egy 5mm-es kitüremkedést valaki meg sem érez évtizedekig, valakinek meg komoly fájdalmat okoz.

Ugyanis, bár kitüremkedésnek, kiboltosulásnak hívják, technikailag a gerinc belsejében történik az elváltozás, egy csontos csőrendszer belsejében. Annak az átmérője fix és genetikailag adott. Vagyis ha még a katica is odamászik, akkor valaminek már nem jut hely.

Fáj-e a porckorongsérv? Nem! Önmagában a porckorongod nem képes fájni, mert nincsenek idegei. Nem érez semmit!

El tud-e fáradni a porckorong? Például, ha túlterheled?

Nem, nem tud elfáradni, abban az értelemben, hogy nem érezhető a fáradtsága. Mi következik ebből?

Az következik, hogy sosem fogod közvetlenül érezni, ha a porckorongod túlterhelődött, vagy sérült!

Ha beütöd a könyöködet, az egyből fáj, ha eltöröd valamelyik csontodat, az egyből fáj, ha egy szalagod elszakad, szintén fáj, ha túlerőltettél egy izmot, érezni fogod. A porckorongtól nem fogsz kapni semmilyen direkt visszajelzést!

Miért fontosak ezek a részletek? Azért, hogy egy nyelvet beszéljünk. Én azt mondom, hogy ne terheld túl a porckorongodat. Te pedig azt gondolhatod, hogy nem terheled túl a porckorongodat, hiszen nem érzel sem fájdalmat, sem fáradtságot az adott testhelyzetben.

Mert el is érkeztünk a probléma gyökeréhez, a helytelen terheléshez. A porckorongod ugyanis túl van terhelve. Ez nem kérdés.

Nem arról van szó, hogy néha rosszul tartod magad, vagy „ki kéne húzni magadat”. Nem azon múlik, hogy egyenesen ülsz-e, vagy nem bírsz egyenesen ülni. És nem is azon a pár alkalmon múlik a derékfájás, amikor valami nehezet emeltél, nem szabályosan.

Csupán néhány százalék azoknak a száma, akiknél egy konkrét gyulladásos, vagy ortopédiai betegség áll a háttérben, a derékfájás a legtöbb esetben a mindennapi szokásaid következménye.

Tehát azoknak a dolgoknak, amikről sose gondoltad volna, hogy releváns. Olyan mozzanatok, amiknek nem tulajdonítottál jelentőséget. Mert nem tudtál róluk. Ez teljesen normális, a legtöbb ember nem tudja a helyes gerinchasználat alapelveit, ezért is népbetegség. Tehát nem a te hibád, de a te felelősséged, hogy megismerve, végre változtass rajta.

Vagyis van egy túlterhelt porckorongod, aminek a következménye a fájdalom. Az történik ugyanis, hogy a terhelés hatására a porckorongból vizet préselsz ki, deformálódik.

Ha ellaposodik, akkor kisebb hely lesz a hely azok között a csontok között, amiket elválaszt.

Ha kisebb a hely, akkor hamarább egymásnak ütköznek/nyomódnak kisízületek, csontbütykök, ami fáj.

Vagy a becsípődik egy ízületi tok, na az nagyon fáj. Vagy csak egy helyi instabilitás miatt a környező izomzat védekezésből bemerevedik, fájdalmat és merevséget okozva.

Vagy éppen a példánál maradva a katicabogár nyomja az ideggyököt, ami meg nagyon fáj és ki is sugárzik láb felé.

Ez mind-mind fájdalomforrás, és ennél több is lehetséges, de közös bennük, hogy mindegyik a terhelés következménye.

A kérdés az, hogy ezt a terhelést hogyan tudod minimalizálni és mivel tudod kompenzálni.

Az egyszerű válasz: gyógytornával. Te mire gondolsz ezalatt? Nem tudom, de vannak ötleteim. Mondok néhány általános tévhitet a gyógytornáról, amivel már találkoztam:

• a gyógytorna fáj. Sőt az a jó, ha fáj.
• a gyógytornában keményen oda kell magadat tenni, fárasztó, izzasztó
• a gyógytora arról szól, hogy kapok egy A4-es lapra írt gyakorlatokat, és azokat csinálom rendszeresen. Vagy csinálgatom, ha ráérek.
• a gyógytora arról szól, hogy nyújtunk, meg erősítünk, ezért keresek a neten nyújtó és erősítő gyakorlatokat.
• a gyógytornát csoportban csináljuk, és 10 alkalmat írt fel az orvos, tehát 10 alkalom elég lesz.

Az az igazság, hogy ez nem így van.

Először is nincsen általános gyógytorna, ami általánosan így működik. Vagyis van általános gyógytorna, és nagyon jó arra, hogy heti egyszer eljárva a nyugdíjasok találkozzanak, fittek maradjanak.

De speciális problémára speciális gyógytorna kell. Ez pedig az adott sérüléstől függően más és más.

Egészen más a cél és az eszköztár egy élsportolónál, mint egy irodai munkásnál. Sőt, ha már sportoló, egészen mást kap, ha például meccs közben lesérül, hogy aztán vissza tudjon térni a pályára, mint a mérkőzés utáni rehabilitáción.

Másként kezelünk egy térdproblémát, mint egy vállproblémát, vagy porckorongsérvet.

Elmondom a hatékony porckorongsérv-specifikus gyógytorna alapelveit.

1. Sosem fáj, hanem fájdalmat csillapít. (Közben is, utána is)
2. Nem nehéz. Sosem dolgoztat maximális, vagy maximális-közeli intenzitáson.
3. Megéreztet és edz olyan izmokat, amiknek a használatáról leszoktál.
4. Nem fogsz tőle leizzadni és nem lesz izomlázad.
5. Nem igényel semmi különösebb felszerelést, vagy eszközt
6. Nem egy gyakorlatsor ismétlése a végtelenségig, hanem egy lépcsőfokokból álló rendszer, ami a fájdalmadhoz és képességeidhez igazodik
7. Egyéni, fókuszált munka, precíz részletekkel.

Működhet-e valami, amire nem igazak a fentiek? A statisztikai esély megvan rá. Hegyet is többféleképp lehet mászni. Valakinek lehet, hogy papucsban is sikerül valahogy, de aki a hatékonyságra és jó eredményre törekszik, az túrabakancsot húz.

Remélem, hogy segítettem jobban megérteni a problémádat, és azt is, milyen szempontoknak kell megfelelnie annak a gyógytornának, amivel a leghatékonyabban lehet azt megoldani.`,
  },
  {
    id: 'p9',
    title: 'miért ne az idegsebész mondja meg, hogy mikor kell megműteni a porckorongsérvedet?',
    category: 'porckorongsérv és műtét',
    date: '2026.08.18.',
    content: `Gyakori tévhit a porckorongsérvvel (gerincsérvvel) kapcsolatban, hogy az igazi megoldás előbb-utóbb mégis csak a műtét lesz, a különböző konzervatív (vagyis műtét nélküli) módszerek csak arra valók, hogy a műtét időpontját elodázzák.

Ezt a nézetet sokan osztják azok közül, akik már évek óta kínlódnak a fájdalommal, de az orvosok között is elég elterjedt, pedig mi sem állhatna távolabb a valóságtól.

Miért is?

A gerincműtétről két fontos dolgot érdemes tudni:
1. Nem oldja meg az alap problémát, vagyis a porckorong túlterhelésből eredő károsodását
2. Többször elkerülhető lenne, mint ahányszor elvégzik

Az első ponttal tisztában van az orvos is. Hiszen pontosan tudja egyrészt a rizikókat, másrészt azt, hogy a porckorong kidomborodó részét, ha levágja, annak egy célja van: hogy ne nyomja az ideget. Nem az, hogy a porckorong egészségesebb legyen. És nem is az, hogy erősebb, terhelhetőbb legyen. Egyetlen célja van, hogy elkerülje a komoly idegkárosodást. És ezért beáldozza a porckorongot.

Nem fogja sosem azt ígérni, hogy innentől rendben lesz a porckorong. Sőt, bármelyik kórház, vagy magánklinika tájékoztatóját, ha elolvasod, azt találod benne, hogy még szólnak is előre, hogy vagy máshol, vagy ugyanott kiújulhat a sérv.

Arra is felhívják a figyelmet, hogy mikor indokolt a porckorongsérv műtéti kezelése.

A következő esetekben lehet szükség műtétre:
- erővesztés/ bénulás/ érzéskiesés egyik, vagy mindkét lábban
- vizelet/ széklettartási problémák
- hetek óta fennálló intenzív, csillapíthatatlan fájdalom, ami a megfelelő konzervatív terápiára nem reagált

És itt jön képbe az, hogy a legtöbb idegsebész tisztában van vele, milyen eredményeket lehet elvárni a megfelelő konzervatív kezeléstől, csak azt nem fogja tudni, hogy valóban a megfelelő konzervatív kezelést kapta a páciens, mielőtt hozzá fordult.

Hogy jobban értsd: én gyógytornászként csak azzal vagyok tisztában, hogy mire képes a megfelelő műtét. Az előbb le is írtam neked.

De arra nincs kvalitásom, hogy eldöntsem, melyik esetben mi a megfelelő műtéti technika, annak milyen a jó kivitelezése, mit kell még figyelembe venni. Ezt nem tudom eldönteni.

Nem tudom, hogy az adott orvos jól mérte-e fel a dolgot, hogy a jó technikát választotta-e, hogy a jó technikát precízen alkalmazni tudja-e, hogy tudja-e kezelni a műtét közben felmerülő problémákat.

Én csak annyit tudok, hogy mi az, amit el lehet műtéttel érni, és le tudom csekkolni amikor egy műtött embert kezelek, hogy nála elérték-e ezt.

Fordítva is így működik. Az orvos tisztában van azzal, hogy a megfelelő konzervatív módszerekkel, gyógytornával mit lehet elérni. Hogy el lehet érni a fájdalommentességet és azt, hogy gyakran elkerülhető vele a műtét.

Amit viszont nem tud eldönteni, mert nincs hozzá kvalitása, az az, hogy eldöntse, adott esetben mi a legmegfelelőbb módszer, milyen gyakorlatok, milyen gyógytorna, pontosan hogyan kivitelezve, precízen hétről-hétre meghatározva.

Ehhez nem ért, mert nem is kell értenie hozzá, így végeredményében az alapján fog döntést hozni, hogy mi lett a konzervatív kezelés végeredménye.

Tehát, ha azt látja, hogy az MR mutat egy porckorongsérvet, ami ideggyököt nyom, ami komoly fájdalommal jár és azt is látja, hogy volt már konzervatív kezelés, de sikertelen, akkor megnézi, hogy lehetséges-e az operáció, és ha igen, akkor elvégzi. Hiszen ez a következő logikus lépés.

Tehát ő nem azt tudja eldönteni, hogy mikor kell, hanem azt, hogy mikor lehetséges megműteni.

Hogy mikor kell műteni, azt az a gyógytornász kell eldöntse, akinek az a szakterülete, hogy porckorongsérvet gyógyít. Hiszen ő pontosan tudja, hogy mire képes a rendszere, és mire nem, tehát pontosabban meg tudja állapítani a konzervatív kezelés határait.

El tudja dönteni, hogy hol a plafon, és hogyan lehet kihozni az adott állapotból a maximumot a megfelelő módszerrel.

A gond az, hogy sokszor összemosódnak a fogalmak, nem elég precízek.

Mert az a fogalom, hogy „konzervatív kezelés” az orvosi nyelvben csak azt jelenti, hogy nem műtét. Vagyis ugyanúgy jelenti a fájdalomcsillapítót, az injekciókúrát, a masszázst, elektroterápiát az iszappakolást és általános gyógytornát. De ezek nagy része teljesen haszontalan.

Egy példával illusztrálnám.

Pillanatnyilag a leggyorsabb sorozatgyártású autó 490 km/h sebességre képes. Ez a Bugatti Chiron Super Sport 300+.

Beletartozik abba a halmazba, hogy sorozatgyártású autó. Ugyanebbe a halmazba tartozik a Dacia Logan is, a maga 186 km/h értékével (ami azért jó szándékúan elméleti határ, de tegyük fel, hogy képes rá).

Ha egy földönkívülinek azt mondanám, hogy nyélgázon jöttem rettentő gyorsan egy sorozatgyártású autóval, akkor gondolhatná azt, hogy a létező leggyorsabb autóból hoztam ki a maximumot és száguldottam 490-el. Közben pedig lehet, hogy 160-al rettegtem egy Dacia Loganben.

A különböző konzervatív kezelések is egy ugyanilyen halmazba tartoznak bele. Itt is megvannak a Daciák és a Bugattik. A megfelelő elongáción alapuló gyógytornarendszer a Bugatti. A masszázs, a kenőcs, a fájdalomcsillapító, az egyéb tornák pedig a Dacia.

Sok Dacia nem fog legyorsulni egy Bugattit, ahogyan sok alkalmatlan kezelés halmozása sem helyettesíti a helyes megközelítést.

Ha viszont a megfelelő rendszer mentén, a gerinced fizikáját megértve kezdesz dolgozni a gerinced egészségén, akkor azt fogod tapasztalni, hogy sokkal több gyógyulási potenciál van benne, mint amit gondoltál.

Természetesen, ha elérted a plafont, és nem jutsz tovább, akkor a műtét fog továbbsegíteni, csak szerettem volna felhívni a figyelmedet, hogy Daciával sosem fogod elérni a lehetőségeid határait.

Így megeshet, hogy teljesen „szabályosan” követve az ajánlásokat úgy fognak megműteni, hogy nem is lett volna rá szükséged.

Azt szeretném, hogy legyen lehetőséged ezt elkerülni, ezért is tanítalak a gerinced megértésére és használatára.

Hajrá!`,
  },
  {
    id: 'p6',
    title: 'lehet-e, vagy szabad-e gyógytornával kezelni a gerincsérvemet?',
    category: 'porckorongsérv és műtét',
    date: '2026.08.11.',
    content: `Vagy sokkal tisztább és biztonságosabb egyszerűen megműttetni? Mi alapján tudom eldönteni, hogy melyik való nekem? Ebben a posztban 3 különböző nézőpontot mutatok be neked, amik alapján el tudod dönteni, hogy megműttesd-e magadat, vagy sem.

Alapvető hozzáállásban két fő irány van, az egyik a műtétet próbálja elkerülni, ahogy lehet, míg a másik a műtét drasztikusságában látja a probléma drasztikus megoldását.

Nézzük az első csoportot, aki nem akarja megműttetni magát. Ezt hívja a szakma konzervatív kezelésnek.

Vegyünk egy férfit, aki alapvetően ülőmunkát végez, és egyszer csak szembesült vele, hogy derékfájdalmai, majd porckorongsérve lett. Gyötrődik, bizonytalan, mert nem tudja, mi lenne a legjobb megoldás. A műtéttől fél, hallott egy csomó rémtörténetet, de közben a konzervatív kezelések sem hozzák azt, amit elvárt, nem érzi a haladást, vagy túl sokat követelnek, túl sok tudatosságot, utánajárást. Esetleg a bizalmát is elveszíti a konzervatív kezelésben, vagy amiatt, mert sokan kísérleteznek csak rajta, vagy mert egyszerűen nem működnek. Ebből a szemszögből kezd racionálissá válni a műtét, hiszen sokkal egzaktabb. Ott van bent valami, ami útban van, és a valamit a műtét kiveszi.

De azért sokan próbálkoznak, küzdenek férfiasan, eljárnak fizikóra, gyógytornára, masszázsra, manuálterápiára, a lista gyakorlatilag végtelen. De a bizonytalanság nagyon gyakran ott motoszkál, hogy nem haladok elég gyorsan, csak elmegy egy csomó időm, meg energiám, hogy innen-oda járjak, legegyszerűbb lenne erőt venni magamon, összeszedni a bátorságomat és befeküdni műtétre.

A második csoport, helyzete sem egyszerűbb, hiszen nekik másból fakadóan de szintén ott van a bizonytalanság. Ha valaki már túl van a műtéten, vagy már több műtéten is, lehet, hogy most éppen küszködik a rehabilitációval, hogy újra felépítse a terhelhetőségét, de mindenki azt mondja neki, hogy fogja vissza magát. Esetleg megint kiújult a sérv, a kiboltosulás, amit nem ért, teljesen, hiszen egyszer már meg lett oldva a probléma, de az is gyakori, hogy el sem múlt teljesen a fájdalom.

Folyton műtétre járni sem lehet, mégiscsak egy kockázatos dolog, de ott legalább „csinálnak tényleg valamit”, nem csak ráolvasnak, meg okoskodnak.

Bármelyik irányt nézzük, a bizonytalanság közös. A bizonytalanságra, pedig nem a műtét a megoldás, nem is a műtét elkerülése, hanem a tudás. Ha érted a gerinced, és a porckorongod fizikáját, azt hogy mi okoz mit, és arra hogyan lehet hatni, akkor elmúlik a bizonytalanságod.

És a helyes kérdést fogod feltenni. Nem azt, hogy melyiket válaszd, hanem azt, hogy miért.

De nézzük a porckorongot. Túl sokat hallottál már szerintem róla, ezért példákkal mutatom be, hogy megértsd a természetét. Különböző tulajdonságaira és feladataira külön példákat hozok, így az analógiák mentén könnyebb lesz értelmezni.

Nagyon primitíven a porckorong két csont közötti izé, ami erőhatásra deformálódik, ezért a két csont egymáshoz képest korlátozottan elmozdul.

• Fontos, hogy a porckorong NEM rugó! Nem rugalmas! Ha már a felfüggesztésnél vagyunk, akkor ő a szilent a futóműben. Elsősorban rezgést csillapít és az alakját deformálva mozgást enged.
• Más szempontból a porckorong olyan, mint egy szivacs. Nem arra gondolok, hogy olyan egyszerű lenne összenyomni, hiszen több száz kilónyi terhelés sem képes laposra préselni. De az igaz, hogy ha nagyobb erő hat rá, akkor folyadékot veszít, ha kisebb, akkor pedig folyadékot szív magába.
• Ha ezt ritmikusan ismételjük, például gyaloglás, de gondolhatsz más ritmikus mozdulatra is, akkor az, mint egy pumpa fog működni és biztosítja a porckorong tápanyagellátottságát. (Más nem fogja, mert erei azok nincsenek)
• Ennek van egy napi ritmusa is. Nappal több a terhelés, éjszaka kevesebb. Mit csinál? Éjszaka megszívja magát vízzel. Reggel tehát magasabbak vagyunk.

Ez eddig fizika.

A többi ebből fakad. A porckorongod túl van terhelve. Emiatt több folyadékot veszít nappal, mint amennyit képes visszapótolni éjjel. Ezzel évek alatt meggyengíted az ellenálló képességét. Ezért könnyebben sérül egy hirtelen rossz mozdulattól. Vagy emiatt veszít a magasságából, nem tudja elég távol tartani egymástól a szomszédos csontokat, amik ezért irritálják egymást. Ez fáj. Ha a csonthártyát irritáljuk, csontképzéssel reagál, az MRI, ha belenéz, „meszesedést”, „csőrképződést” fog látni. Ha a porckorong kevésbé tart, több teher jut a kisízületekre, ezek elkezdenek kopni. Ízületi kopás lokális gyulladással jár, az meg fáj. De az is lehet, hogy túl sokszor végzel olyan mozdulatot (előrehajlás), ami amellett, hogy extrém nyomásnövekedést okoz, még a rossz irányba is préseli a porckorongot. Az meg kitüremkedik és nyomja az ideget. Kicsinek látszik a képen, de nincs hova mennie, egy csontos üreg átmérőjét szűkíti, ami néhány milliméter.

Minden kezelési megközelítés, aminek nem központi célja a porckorong terhelésének optimalizálása, hosszú távon haszontalan.

A terhelést pedig úgy lehet optimalizálni, hogy átalakítom a mindennapi tevékenységeket, amik túlterhelték a porckorongot (megelőzés), és saját finom izommunkával képes vagyok aktívan csökkenteni a terhelést különböző testhelyzetekben (kezelés).

Vagyis akkor most műtsem, vagy nem műtsem?

• Ha túl sokáig húztad, és csillapíthatatlan, masszív fájdalmad van hosszabb ideje, izomerővesztés a lábaidban, bénulás, érzéskiesés, vizelet- és széklettartási zavar, ilyenkor a műtét lesz a megoldás. Hiszen bármilyen rizikós is egy-egy műtéti beavatkozás, a mostani állapotodnál jó eséllyel csak jobb lesz az eredmény.
• Ha nem állnak fenn ilyen súlyos tünetek, akkor pedig ne műttesd meg. Minden műtét jelent valamekkora rizikót. Hogy mekkorát, azt úgyis aláírod, amikor odajutsz. Fölöslegesen nem érdemes kockáztatni. Mit is csinál a műtét? Szeretném, hogy elképzeld!

Van a porckorongod, ami olyasmi forma, mint a hamburgerhús. A közepe egy nagy víztartalmú golyó, akörül pedig körben erős rostok vannak, amik ezt a golyót középen tartják. Kiboltosulásnál az történik, hogy ez a rostos rész domborodik ki a pereménél, míg sérvnél már néhány rost elszakad, és a köztük lévő hasadékon keresztül a középső golyó anyaga is kezd kitüremkedni.

Ezt a kitüremkedést műtétnél levágják. Vagyis elvágnak jó néhány tartó rostot. Eredmény?

• Nem nyomódik tovább az ideg, tehát nem fáj (Kivéve, ha a vágási felületen keletkező hegszövet nem kezdi nyomni).
• Cserébe van egy sérült porckorong. A terhelhetősége drasztikusan lecsökken, elég csak elolvasni a műtét utáni ajánlásokat. Nem sok mozgásteret engednek.
• Utána nagyon komoly gyógytorna rendszerre van szükség, hogy lassan ismét felépüljön a terhelhetőséged.
• Vagyis a műtéttől nem leszel hamarabb „készen”. Nem leszel terhelhetőbb. És nem úszod meg azt sem, hogy komoly munkát beletegyél a javulásba.

De tegyük fel, hogy nem akarod te megműttetni, de semmilyen más kezelés úgy látszik nem vezet célra. Ha ezt tapasztalod, de az 1. pontban leírt durva tüneteket nem, akkor annak a kezelésnek a fókusza nem az okokon van, hanem valamelyik következményen.

Ez NEM azt jelenti, hogy meg kell műteni, hanem azt, hogy nem a megfelelő kezelést kapod.

Van még egy harmadik, leginkább szomorú út. Ha valaki egy életen át húzta és mindig a következményeket kezelte, de sohasem az okot és az életmódot, van egy határ, ami után a regeneráció képessége nagyon lecsökken.

Ezek azok az emberek, akiknél már túl rizikós lenne a műtét, ezért nem vállalják őket sehol, de a konzervatív kezelésre is már alkalmatlanok, hiszen évtizedek alatt létrehozhatóak olyan károsodások, amik tényleg visszafordíthatatlanok.

Tegyük hozzá gyorsan, hogy gyakrabban képzelnek visszafordíthatatlannak egy gerincproblémát, mint ahányszor a valóságban menthető lenne. De az ismeret hiánya ezt eredményezi.

Ha nem tudom a lehetőségét és nem ismerem a módszerét az úszásnak, akkor egy folyóhoz érve azt fogom hinni, hogy innen nem lehet tovább jutni. Ha nem tudom a lehetőségét és a módszerét a porckorong kiboltosulás visszafordításának, akkor azt mondom, hogy ez egy visszafordíthatatlan folyamat, műtsük meg, vagy csak tegyük elviselhetővé a fájdalmat.

De valóban vannak olyan esetek, ahol felelősségteljes szakember nem fog javulást ígérni. Ilyen esetben segítenek a gerincfűzők, tapaszok, kenőcsök, fájdalomcsillapítók annyit, hogy el lehessen viselni, hiszen a cél már csak erre redukálódik.

A porckorong helyes kezelésénél elsődleges kell legyen, hogy a rá ható erőket kell elsősorban befolyásolni és nem magát a sérvet.

Ha a tehermentesítés hatékony, a porckorongnak van tere, megszívja magát vízzel, és elkezd visszagömbölyödni. Persze nem egy nap alatt, hiszen lassú az anyagcseréje. De egy féléves program a megfelelő keretben képes visszafordítani a folyamatot.

Hiszen minden tényező adott hozzá: a fizika változatlan, ha a megfelelő testhelyzetet, megfelelő mozdulatot választom, akkor drasztikusan tudom csökkenteni a nyomást.

És az anatómiánk is alkalmas rá, hiszen van konkrétan olyan izmunk (ez a haránt hasizom), ami övként körbeöleli a derekat és megfelelő intenzitással megfeszítve képes aktív elongációt létrehozni. Vagyis visszatérve a konyhanyelvre, a két csont közti teret növelve a köztük lévő izé fel tud lélegezni.

Ezek azok az alapelvek és ismeret, amik alapján el tudod dönteni, hogy a műtét esetedben megoldás-e, vagy nem. Kivételek mindig vannak, de a törvényszerűségeket és fizikai összefüggéseket szerettem volna megértetni.`,
  },
  {
    id: 'p4',
    title: 'el tudod érni, hogy elmúljon a derékfájásod, sőt még a gerincsérvedet is vissza tudod csinálni, ha ismered, milyen hatással van a gerincedre az ülés',
    category: 'mozgásminták',
    date: '2026.08.04.',
    content: `Ha viszont nem vagy tisztában a jelentőségével, sosem fogsz tartós eredményt elérni.

Ebben a posztban bemutatom neked, hogyan befolyásolja a mindennapi munkád, azon belül is az ülés, a gerinced állapotát.

Elmagyarázom, milyen törvényszerűségek miatt kezdett fájni a derekad, és mekkora mozgástered van a gyógyulásra. Vagyis mi az, amit máshogy lehet csinálni, és mik azok a kompenzációs lehetőségek, amikkel ellensúlyozható az ülés káros hatása.

Mert azt ki lehet jelenteni, hogy az ülés nem egészséges. Nem önmagában nézve, hanem, mint életforma.

Mit és hogyan befolyásol az, hogy végigülöd a munkaidődet?

A probléma a következő 4 dologgal van:

1. az ülés egy statikus terhelés

Statikus, vagyis nincs mozgás, pedig kéne. A test mozgásra lett tervezve. Ha nem mozoghat, az önmagában túlterhelést jelent neki, amit kompenzálni kell.

Nincs olyan szerv, vagy szövettípus, ami örülne annak, hogy hosszabb ideig mozdulatlanul hagyjuk.

Mindegy, hogy ez a mozdulatlanság passzív (például fekvés), vagy aktív (például állás, vagy ülés). Minden szövet akkor él igazán, amikor a terhelésnek ritmusa van. Egyrészt van egy napi ritmusa is a terhelés-nem terhelés váltakozásának, másrészt maga a mozdulat is valamilyen ciklikusságot mutat.

Például sétálás közben egyszer egy lábon megtartom az egész testsúlyomat, de a következő pillanatban máris a levegőben a talpam. Amikor közben a lábamat lendítem, az az izomcsoport, ami a lábamat előre mozdítja: dolgozik, miközben az antagonistája (amelyik hátra mozgatná) reflexesen kikapcsol, ellazul. De a következő pillanatban már be is kapcsol, hogy fékezze a mozgást, hogy egy fél másodperccel később már, amikor a sarkam talajhoz ért, megint más feladatot kapjon.

És most csak egy láb mozgásáról beszéltem egy egyszerű séta alatt. Ez alatt a pár másodperc alatt egy izmom volt teljesen kikapcsolt állapotban, változó feszülés mellett indított, majd változó feszülés mellett fékezett egy mozdulatot. Ez egy nagyon változatos terhelés.

Ehhez képest ülésben ugyanazt csinálja folyamatosan.

Egy egész mozgástankönyvet lehetne írni ide arról, melyik szöveteddel mi történik, ha nem mozgatod.

Most elég, hogy megismered az elvet, vagyis azt, hogy a mozgás esszenciális a fájdalommentes gerinc eléréséhez.

2. probléma: az ülés egyoldalú terhelés

Ez fakad abból, hogy statikus. Hiszen ahogy láttad, mozgás közben mennyiféle dolgot csinál egyetlen izom is, hányféleképp dolgozik és pihen, na ez az ülés közben sokkal szimplább.

Itt két lehetősége van: Ha az adott izom éppen a gravitáció ellen tart, akkor meg van feszülve, minden más izom pedig: OFF. Ki van kapcsolva. Ezért lesznek rövidült, fájdalmas, begörcsölt izmok, és lesznek gyengült izmok.

Az, hogy melyik izom van be, -és melyik izom van kikapcsolva, az pedig egyetlen dologtól függ: honnan támadja a testet a gravitáció.

Hogy könnyebben elképzeld: rengeteg embert kezeltem már, akiknek kőkeményen feszes izomzata volt deréktájon, de petyhüdt volt a pocakja. Ez azért van, mert a legtöbb ember picit előredőlve dolgozik (ülve, állva, mindegy), ezért folyamatosan a hátizmok dolgoznak. (Tartanak a gravitáció ellen) Ha valaki úgy töltené a napjait, hogy picit mindig hátradőlve tartja magát, akkor kockahasa lenne és laza hátizmai.

A széken ülés miatti egyoldalú terhelésnek az egyik legkárosabb hatása viszont az, hogy az a mély törzsizomzat, aminek az lenne a szerepe, hogy védje a lumbális gerincedet (vagyis a derekadat), a folyamatos nemhasználat következtében gyenge lesz. És ami még rosszabb, hogy az automatizmusa is kikapcsol, ezért akkor sem fog tartani, amikor pedig kellene.

Ez az egyik elsődleges oka a derékfájás, később a porckorongsérv kialakulásának.

Hogy miért?

Láttál már súlyemelőt?

Vagy már te is emeltél, akkor találkoztál már olyan övvel, ami a derekadat tartja, hogy ne sérülj le.

Azt tudtad, hogy erre van egy konkrét izmunk? Na ezt az izmot már nem használod, pedig ez az egyik kulcs az egészséges gerinchez. Ez az izom egyszerűen fölösleges az üléshez, ezért azóta, hogy először beültél az iskolapadba, folyamatosan gyengíted. Mivel ez nem tart megfelelően és automatikusan, nagyobb lesz az instabilitás, és megnövekedik a porckorongokra nehezedő nyomás.

3. probléma: az ülés fokozott terhelés

Azon túl, hogy az ülés egysíkú, ezzel konkrét izmok automatikus használatáról szoktat le, hozzáadódik még a dologhoz, hogy egy statikus, álló testhelyzethez képest nagyobb nyomást okoz a porckorong belsejében. Tehát nem elég, hogy folyamatos terhelést kap a porckorong, amit nem szeret, de még nagyobbat is. Ez pedig elvezet ahhoz, hogy folyadékot veszít, a magasságából veszít, és sokkal kisebb lesz a terhelhetősége, magyarán, hamarább fog lesérülni.

4. az ülés nem ideális szögben terheli az ízületeket.

Van az úgynevezett „egyenes ülés” vagy szabályos ülés.

Ennek az az ismérve, hogy úgysem így ülsz.

Főleg azért, mert nem bírsz így ülni.

De azért azt gondolod, hogy az lenne a jó, és, ha bírnád, akkor nem is fájna úgy a derekad.

Az tény, hogy az ülés közben valóban rosszul terheled a gerincedet. De fontos megérteni, hogy erre nem az a megoldás, hogy figyelsz magadra, hogy egyenesebben ülj!

Azt kell látnod, hogy az, hogy hogyan ülsz az egy következmény. Nem tudsz rajta közvetlenül változtatni.

Annak a következménye, amit szokás szinten elég sokat csináltál.

De akkor hogyan tudsz rá hatni?

Úgy, hogy a szokásokon változtatsz. El is mondom milyen szokásokon.

Menjünk végig ezen a négyes listán még egyszer, most a megoldásra fókuszálva:

1. Ha ülőmunkát végzel, ami egy statikusterhelés, akkor két dolgot tehetsz: vagy abbahagyod, és olyan munkába kezdesz, ami dinamikus, ezzel megkapja a tested a szükséges napi mozgást. A másik út, hogy tudomásul veszed az ülés hatását, és rendszeres, intenzív mozgásba kezdesz, hogy kompenzáld. Így napi szinten meglesz a kellő mennyiségű mozgás, amivel a keringési rendszered, az izmaid, ízületeid a nekik való terhelést is megkapják.

2. Ha a terhelés, amit kapsz egyoldalú, akkor azt speciális módszerrel kompenzálni kell. Sokan azt, hiszik, hogy elég, ha mozognak rendszeresen, ahhoz, hogy elmúljon a derékfájásuk. Ez kezdődő derékfájásnál néha így is van. De egy komolyabb fájdalomnál, porckorongsérvnél már nem elég.

Miért nem elég?

Kicsit messzebbről próbálom megvilágítani: minden komoly élsportolónak van saját edzője, akár többféle is. (Külön a technikára, külön az erőnlétre)

És van fiziója, azaz gyógytornásza is. Miért? Hiszen mozog ő eleget! Sőt, erősebb, mint egy átlagember!

Azért van rá szüksége, mert ő is valamilyen szempontból extrém egyoldalú terhelést kap, és ennek a kompenzálására szüksége van gyógytornára. Ezt az élsportoló tudja, és nem próbálja megúszni.

Tehát az egyoldalúság miatt szükség lesz személyre szabott gyógytornára. Olyanra, ami bekapcsolja az inaktív izmokat (amit az ülés kikapcsol), és visszaépíti szokás szinten az aktiválódásukat a mindennapokba.

3. Az ülés jelentette fokozott terhelésre többféleképpen lehet hatni. A legegyszerűbb, ha gyakran megszakítod. Tudod állítani az üléspozíciódat, tudsz használni álló asztalt, ezek mind fontosak, de a leghatékonyabb kompenzálás az a gerinced aktív elongációja. Vagyis a rá nehezedő nagy nyomást, azzal tudod ellensúlyozni, hogy aktívan, saját izomzattal létrehozol a gerincedben egy nyomáscsökkentést. Így tudod kompenzálni azt, hogy az üléssel túlságosan kifacsarod a porckorongodat. Ezt eleinte csak speciális gyakorlatokkal tudod elérni, később már automatikusan ülés, állás közben is aktívak lesznek azok az izmok, amik ezt létrehozzák.

4. Ezzel eljutottunk oda, hogy a fentieket követve ki fog alakulni a képességed arra, hogy „szabályosan” ülj, anélkül, hogy tudatosan ezen erőlködnél, és elfáradnál benne.

Ezzel pedig tovább segíted a gyógyulási folyamatot, hiszen az ülésed annál kevésbé lesz terhelő.

Ezek az ülőmunka velejárói, bár valószínűleg nem tudtad, de ezekre is igent mondtál, amikor a jelenlegi munkádat választottad.

Az írásommal arra akartam rámutatni, hogy az ülőmunkával abszolút nem vagy arra predesztinálva, hogy fájjon a derekad, de a megfelelő tudatosság elengedhetetlen az egészséghez.

Jó fejlődést!`,
  },
  {
    id: 'p7',
    title: 'mitől van az, hogy valakinek egy előrehajlástól, egy rossz emeléstől fájdul meg a dereka, később mégis úgy érzi, hogy az előre hajolva nyújtás jól esik neki?',
    category: 'mozgásminták',
    date: '2026.07.28.',
    content: `Akkor most árt az előre hajlás, vagy használ? Vagy minden csak a mértéken múlik?

Az talán eddig is evidens volt neked is, hogy a leggyakoribb sérülési mechanizmus az, amikor a deréktáji gerincet előrehajlítjuk.

Ennek az egyértelmű formája, amikor valami nehezet kell emelni, lehetőleg szűk helyről, gyorsan, és kevés segítséggel.

Tehát a gerinc alsó része hajlított helyzetben volt, és ennek következtében jelenleg fáj.

A fájdalom mellett nagyon gyakori, hogy a gerinc melletti izmok görcsösen feszülnek.

Erre általában az szokott a magyarázat lenni, hogy persze, hogy feszülnek, hiszen most dolgoztattad meg őket.

Következtetés: az izmok túl feszesek, tehát az izmokat meg kell nyújtani. A deréktáji hátizmok nyújtása pedig úgy történik, hogy előrehajolsz.

A hátizmot nyújtod, laza lesz, elmúlik a görcsös fájdalom, készen vagyunk.

Még jól is esik (vagy nem), tehát készen vagyunk.

Eddig a józan paraszti logika.

A szakma pedig azt mondja, hogy az előrehajlás a sérülési mechanizmus, azért mert ebben a helyzetben a porckorong belső nyomása extrém módon nő, ráadásul extrém egyenlőtlenül.

Ezért vizet veszít, magasságot veszít, és vagy kiboltosodva nyomni kezd egy ideggyököt, vagy ellaposodva túl közel engedi egymáshoz a kisízületi felszíneket, ezzel ízületi kopást, instabilitást és tokbecsípődést okozva.

Amikor ezek közül bármelyik bekövetkezett, akkor reakcióképpen görcsösen megfeszülnek a hátizmok, megpróbálva ezzel lokálisan védeni a gerincet.

Ezeknek a görcsös hátizmoknak a nyújtása jó érzés lehet, attól függően, hogy a felsoroltak közül mi is a konkrét fájdalomforrás.

VISZONT!

Függetlenül attól, hogy jól esik, vagy sem, a porckorong számára továbbra is extrém terhelést jelent az előrehajlás.

Ha derékfájással küzdesz, akkor nincsen ideális mértéke ennek a mozdulatnak.

Nincs olyan, hogy csak 5 kilót emelhetsz!

Hiszen, ha nem emelsz semmit sem, akkor is olyan nyomás keletkezik hajláskor a porckorongban, mintha 20 kilót emeltél volna egyenes, függőleges gerinccel.

Neked nem a következményes izomgörccsel kell foglalkoznod, hanem a porckorong egészségével.

Ezt pedig úgy tudod megtenni, hogy először is leállítasz minden előrehajló mozdulatot.

Vagyis optimalizálod az életmódodat.

Másrészről elkezded kompenzálni az életmód hatását, vagyis aktív elongációval, vagyis a gerinc axiális (hosszirányú), saját izomzattal létrehozott megnyújtásával tehermentesíted a porckorongodat.

Ami bár fájdalmat nem érzékel, de mégis az elhúzódó derékfájdalmak jelentős többségének az okozója.

Ha a porckorong fel tud kicsit lélegezni, akkor vissza tud gömbölyödni, és a deréktáji feszesség ok hiányában reflexesen oldódni fog.

Vagyis hiába esik akár jól az előrehajló nyújtózás, derékfájás esetén ne csináld, mert többet ártasz vele, mint amennyit a felszínen használsz.

Ellenben, ha a megfelelő módon közelíted meg a problémát, akkor az okra hatva sokkal következetesebb de ugyanolyan instant oldódást fogsz tapasztalni a hátizmok görcsös feszülésében, mintha nyújtottál volna.`,
  },
  {
    id: 'p2',
    title: 'a csontkovács kezelések 3 árnyoldala, amikről még senki nem beszélt neked, és amit ha nem értesz, soha nem lesz stabilan terhelhető, fájdalommentes gerinced',
    category: 'kezelési módszerek',
    date: '2026.07.21.',
    content: `Ebben a posztban segítek, hogy megértsd mit gondoltál rosszul eddig a csontkovács kezelésekről, és lásd, hogyan tudod egészen a kiváltó okot kezelni, ahelyett, hogy kétes sikerű tüneti kezelésektől várnád a megoldást.

Miért van az, hogy a becsípődött derekadat a csontkovács egy óra alatt helyrerakja, de mégis attól félsz, hogy mikor fog megint becsípődni?

Fordult már elő veled, hogy úgy becsípődött a derekad, hogy mozdulni is alig bírtál? Hogy négykézláb mentél a mosdóba is? Hogy csak feküdni bírtál napokig?

Mit próbálsz először? Nyilván, valami fájdalomcsillapítót. Esetleg bemész az ügyeletre, és kapsz rá néhány injekciót.

Ha így állsz hozzá, akkor általában néhány hét alatt rendbe is jössz, elmúlik a fájdalom és megint rendesen tudsz mozogni.

Aztán valami ismerősöd ajánl egy aranykezű csontkovácsot, aki egy óra alatt megoldotta az ő fájdalmát.

Eltelik fél-egy év, és egy rossz mozdulattól újra becsípődik valami a derekadban. Borzalmasan fáj, alig bírsz megint mozogni, és eszedbe jut, hogy teszel egy próbát, elmész a csontkovácshoz.

És valóban, egyetlen kezelés, és az esetek nagy többségében valóban megszűnik a fájdalom. (amennyiben tényleg ügyes az illető csontkovács).

Nem érted pontosan, mit csinált, volt néhány törzscsavaró testhelyzet, néhány hirtelen mozdulat, valami roppant, és kész. Esetleg elmondja neked, hogy helyretett néhány csigolyát. Vagy volt egy keresztcsonti blokkod, és az egyik lábad rövidebb volt, most ő ezt helyreállította.

A fájdalom kiváltó okára nem kaptál magyarázatot, de nem is igazán érdekel, hiszen elmúlt, minek vele tovább foglalkozni.

És örülsz is, hiszen végre találtál valakit, aki, ha jönne a baj, megoldja.

Mi ezzel a probléma?

Két dolog.

1. A csontkovácsok hiteles szakmai tudása minimum megkérdőjelezhető
2. A tökéletesen kivitelezett, pontosan rád szabott csontkovács kezelés is csak egy (általában gyorsan ható) tüneti kezelés.

Kifejtem bővebben:

1. Bármilyen hétvégi masszázstanfolyamon lehet egy-két kiropogtatós technikát tanulni.

Ahhoz nincs meg a kellő élettani és anatómiai alapozás, hogy a tanulók értsék is ezeknek a mozdulatoknak a biomechanikáját, és a lehetséges rizikóit. A hangsúly a kivitelezésen van, és azon, hogyan lehet elérni azt a bizonyos roppanást.

Mit jelent valójában a roppanás, mi történik akkor? Minél képzetlenebb valaki, annál határozottabb válasza van erre a kérdésre. Akik elmélyedtek ennek a témának a kutatásában, azok egyelőre nem tudják a pontos magyarázatot. Elméletek vannak, de egyik sem bizonyított pillanatnyilag.

Azt viszont tudjuk, hogy mikor történik a roppanás általában. Általában hirtelen mozgással lehet kiváltani. Ez az ízületi manipulációnak nevezett folyamat, ami röviden annyit jelent, hogy egy ízületre olyan gyorsan hatunk, hogy nincs ideje az őt stabilizáló izmoknak a védekező reakcióra, ezzel az ízületet olyan pozícióban állítom, ami nem lett volna lehetséges, mert az izmok megfeszülve ellentartottak volna.

Ebből talán érzékelhető, hogy miért rizikós a ropogtatást megfelelő anatómiai tudás nélkül csinálni. Hiszen olyan területre jutunk, ahol a test nem tudja magát megvédeni, teljes mértékben a kezelőtől függ, hogy mi lesz az eredmény.

Pontosan ezért ízületi manipulációt tudod ki végezhet? Olyan manuálterapeuta, aki vagy gyógytornász, vagy orvos alapképzettséggel rendelkezik, és évekig tartó manuálterápia képzést végez el, hogy biztonságosan kezelhessen. És ez nem egy szakmai ajánlás, hanem egy jogszabályi feltétel.

2. probléma a módszerrel. Tegyük fel, hogy nem egy csontkovács kezelt, akinek az összes tudása a kezében van, fejben annál kevesebb, hanem tényleg egy hozzáértő, manuálterapeuta szakember.

Az a baj, hogy hiába csinál mindent jól, hiába hat gyorsan, nem fog tudni tartós eredményt adni.

Ezt leírom még egyszer. A csontkovács, de a képzett manuálterapeuta is csupán tüneti kezelést végez a gerincen, aminek nem lesz tartós az eredménye. Magyarul nem oldja meg.

Néhány hónap, 1-2 év, és a becsípődés újra jelentkezni fog. Általában akkor, amikor úgyis sokat kellene dolgozni, és nem tehetnéd meg, hogy kidőlj, vagy, amikor nyaralásra készülve pakolsz be az autóba…

Miért nem fog soha tartós megoldást hozni ez a fajta kezelés?

Azért, mert a becsípődés csak egy tünet. Oka van, hogy becsípődött például a kisízületi tok a csigolyák között. És nem az az oka, hogy a csomagtartóba rakodtad be a bőröndöket. Rengeteg embernek semmi baja nem lesz attól, hogy bőröndöket pakol a kocsijába.

Nem azzal az egy mozdulattal van bajod.

Az a probléma, hogy a gerincednek azt a részét, ami nem érez semmit (ez a porckorong), amiatt, hogy nem érez semmit, addig nyírod, míg valami más, aminek viszont jó az érzékelése, el nem kezd fájni. Például becsípődik egy ízületi tok, vagy az ideggyök, vagy irritálják egymást a túl közel került csontszélek.

Vagyis, ha sikerül megértened, hogyan működik a porckorongod, miért azzal kell elsősorban foglalkozni, akkor leszel képes hosszú távra, tartósan biztosítani a gerinced egészségét.

És itt jön képbe a harmadik probléma a gerincre alkalmazott csontkovács technikákkal. Hiába szabadítja fel a becsípődött, érzékeny ízületi tokot, ha közben olyan törzscsavaró mozgásokat végeztet, ami a porckorong nyírását, és ebből eredő mikrosérüléseit okozza.

Vagyis megágyaz annak, hogy a probléma kiújuljon.

Ehelyett a megfelelő ismeretek birtokában, a helyes gerinchasználat szabályait követve, és speciálisan erre alkalmas gyógytornát végezve a fájdalommentes állapot ugyanúgy elérhető, csak hosszú távra, önerőből fenn is tartható.

És igen, a megfelelő gyógytorna a becsípődés tünetére is alkalmas. Ha a csontkovács technikákkal hasonlítom össze képiesen, akkor képzeld el, hogy rácsuktad a kocsiajtót a kezedre, és odacsípted az ujjadat.

A csontkovács megfogja a kezedet, és kirántja.

A gyógytorna pedig megtanít arra, hol van a kilincs, amit a másik kezeddel ki tudsz nyitni.

Ha eddig azt gondoltad, hogy a csontkováccsal úgy-ahogy végül is szinten lehet tartani a problémádat, akkor azt szerettem volna megértetni veled, hogy nem.

Ha ez téged elsőre frusztrál, megértem. Engem is frusztrált, amikor ezzel akkor szembesültem, amikor rengeteg időmet és messziről szemmel látható összeget áldoztam arra, hogy a lehető legjobb manuálterápiát megtanuljam, és realizáltam, hogy arra a célra, amire használni akarom, arra csak korlátozottan alkalmas.

A gerincproblémádat nem fogja megoldani más helyetted. Semmilyen eszköz, vagy rajtad elvégzett passzív kezelés. Azért írom le, azért magyarázom el neked a leggyakoribb tévutakat, hogy neked már ne kelljen fölösleges köröket járnod.

A fejlődés a te kezedben van, az elméleti muníciót az írásaimból megkapod.

Hajrá!`,
  },
  {
    id: 'p5',
    title: 'ha kalapács a szerszámod, mindent szögnek nézel',
    category: 'kezelési módszerek',
    date: '2026.07.14.',
    content: `„Ha kalapács a szerszámod, mindent szögnek nézel!” – avagy a mindent is gyógyító masszázs mítosza. Derékfájással küszködsz és évek óta masszázsra kell járnod, hogy szinten tartson? Lebeszélnek róla, mert azt gerincsérvnél nem szabad? Rábeszélnek, mert csak az működik? Hogyan hat, mire hat a masszázs? Ha téged is érint a kérdés, az alábbi posztban részletesen elmagyarázom a masszázs határait, és azokat az elveket, amik mentén legyőzhető a derékfájás.

Tegyük fel, hogy sokat ültél a gép előtt, irodában, vagy home office-ban, és tegyük fel, hogy mindezt azért, mert ez a munkád. Mert mondjuk mérnök vagy, vagy könyvelő, vagy vállalkozó, vagy bármi más.

Tegyük fel azt is, hogy elkezd fájni a derekad. A hátizmaid be vannak feszülve, kellemetlen, zavaró, nem kényelmes. Keresed a megfelelő pozíciót a székeden, nyújtózkodsz, de sehogy sem igazán komfortos. Nem tudsz annyira a munkádra sem figyelni, hiszen a figyelmedet újra és újra eltereli a derékfájás. Na nem olyan masszív, hogy fel sem bírsz egyenesedni, nem olyan, mintha egy baltát vágtak volna a hátadba, de azért érzékelhetően és zavaróan ott van.

Tedd a szívedre a kezedet! Őszintén, mi az ELSŐ dolog, ami eszedbe jut? Hogyan fejeznéd be a következő mondatot?

„De jól esne egy …”

Te is úgy fejezted volna be, hogy: „… olyan rendszer, ami megérteti velem, hogy ezt a fájdalmat hogyan okoztam saját magamnak, eszközt ad a kezembe, amivel saját magam, a probléma okára hatva képes vagyok a derékfájást megszüntetni!”?

Nem?

Nem erre gondoltál? Az első három ötleted között ott volt a masszázs is? Vagy csak a masszázs jutott elsőre eszedbe? Valószínűleg igen.

Ha nagyon tudatos vagy, akkor mondjuk nem várod, hogy teljesen rendbehozzon, de egy próbát, meg még egyet azért megér. Hiszen jól esik. Vagy pont, hogy fáj, de hát ettől működik. És valóban utána megkönnyebbülsz.

Mi ezzel a gond?

Az, hogy a fájdalomnak oka van, a masszázs pedig nem képes eljutni az okáig. Persze, hogy a masszázs is egy okot kezel, de amit nem vesz figyelembe, hogy ez egy láncreakció, aminek az utolsó pontja csak a fájdalom.

Induljunk ki a fájdalomtól visszafelé, hogy megértsd az egyes lépéseket:

Fáj a derekad → Konkrétan a gerinced melletti futó izomkötegek fájnak → Az izmok azért fájnak, mert rossz a keringésük → azért rossz az izmok keringése, mert görcsösen, nagyon masszívan állandó feszülés alatt állnak, ezért a benne futó erek össze vannak préselődve → az izmaid azért feszülnek görcsösen, mert valami nincs rendben a gerincednél, ezért a test védekezésként, mintegy „begipszeli önmagát” → Mi az, ami nincs rendben a gerincednél: nem elég stabilak az egyes mozgásszegmentumok (csigolya+porckorong), VAGY irritálódnak a kisízületi felszínek, VAGY kezd kitüremkedi a porckorong és elkezd nyomni valamit, VAGY a csigolyák nyúlványa (amit a bőrfelszín alatt tapintani is tudsz) ér össze és irritálja egymást → mindezek egyetlen közös okra visszavezethetőek, mégpedig a porckorong túlterhelésére → az okozza a porckorong túlterhelését, hogy nem tudod jól használni a gerincedet → azért nem tudod jól használni a gerincedet, mert kritikus izomzatodat tetted képtelenné a feladatára, és a mindennapi szokásaid és mozdulataid folyamatos extra terhelést jelentenek a porckorongnak.

Ez a vázlata a folyamatnak, ennek nyilván vannak mélységei, de a megértéshez elég lesz.

Most már látod, hol avatkozik a folyamatba a masszázs? A logikai bukfenc ott szokott általában lenni, hogy a masszív izomfeszülés okát vagy egyáltalán nem firtatják, nem kutatják tovább, vagy egyszerűen a hátizmok túlerőltetésével magyarázzák. Fontos tudni, hogy létezik ilyen. Főleg, ha sportoló vagy. De sokkal ritkábban ez az eredeti oka az izomfeszülésnek deréktájon, mint gondolnád.

Tegyük fel, hogy tényleg túlerőltetted az izomzatodat, ami ettől most fáj és feszül. Nézzük a karizmaidat a könnyebb érthetőség kedvéért.

Két irány van. A terhelés, vagy egyszeri, vagy folyamatos.

Ha a terhelés egyszeri, valószínűleg nagyobb volt a terhelhetőségnél, a bicepszed tiltakozik, feszül, a masszázs kilazítja, probléma megoldva.

Ha a terhelés folyamatos, ismétlődő, a bicepszed először megint csak tiltakozik, feszül. A masszázs segít, hogy kilazuljon, majd ismét jön a terhelés, és idővel az izom felnő a feladathoz. Ha rendszeresen éri a terhelés, akkor megerősödik, később már nem fog a kezdeti terheléstől elfáradni, beállni, tehát a masszázsra egy idő után nem lesz szükség, probléma megoldva.

Nincs ez másként a hátizmokkal sem deréktájon. Vagyis az, hogy a mindennapi terheléstől konstans fáj, akár éveken keresztül, és masszázsra van szükség a karbantartáshoz, ez azt jelenti, hogy a probléma oka nem az izomzatodban van. (Hacsak nem egész testes masszázsra van mindig szükséged, mert az izomzatod tónusa alapból nagyobb az átlagnál)

Másik, szintén létező, de nem leggyakoribb ok, a pszichés eredetű, stressz következtében kialakuló fokozott tónus (feszülés), leggyakrabban a deréktáji izmokban és a nyak körüli izmokban. Ez a mindennapi túlterheléshez hozzáadódva szintén tudja tüneteket erősíteni. Erre például a megfelelő pszichoterápiával kiegészítve segítség lehet a masszázs, de az életmódból eredő túlterhelést már nem tudja kompenzálni.

Mire képes tehát a masszázs? Arra, hogy a folyamatba beavatkozva, feloldja a kritikus izomfeszülést, ezáltal az izmok fájdalma elmúlik. Mivel az eredeti ok megmarad, a fájdalom vissza fog térni. Egy masszázs folyamat általában heti-kétheti periódusokkal működik, hiszen ennyi idő alatt térnek vissza a tünetek.

Hol itt a probléma? Nekem jól esik, a masszőr is megél, mi a baj ezzel?

Az, hogy ezzel szépen évekre elodázódik az ok felderítése és kezelése. Ezzel lehet olyan masszív ízületi kopásokat létrehozni, meszesedést, porckorong kiboltosulást, vagy sérvet, amik már csak nagyon durva terápiára, műtétre reagálnak, vagy arra sem.

Tehát ez csak abban segít, hogy legyen egy pillanatnyi megkönnyebbülésed, cserébe elfedi azokat a tüneteket, amikkel foglalkozva még kezelhető és visszafordítható lenne a porckorong és a gerinc többi elemének a károsodása.

Az igaz, hogy azzal, hogy a masszázs a hátizmok feszességét feloldotta, az általuk generált feszültség lekerül a porckorongról, vagyis közvetve mégis hat a porckorong terhelésére is. Csak azt nem veszi figyelembe, hogy a porckorong már ettől függetlenül a mindennapi testhelyzetek, mozdulatok miatt túlterhelt állapotban volt.

Mi a helyes megközelítés derékfájás esetén?

Nem a következmények eltussolása, hanem az okok kezelése. Ez pedig azt jeleni, hogy a mindennapi tevékenységeidet, munkakörnyezetet, munkamozdulatokat, (magyarul azokat a testhelyzeteket és mozdulatokat, amiket napközben a legtöbbet végzel) optimalizáld úgy, hogy a legkisebb terhelést jelentsék a porckorongnak. Ez lenne a megelőzés, vagy egy fogorvosos példával élve ez a fogmosás.

A másik pont a kezelés (a fog tömése). Ebben az esetben olyan kritikus izomzat erősítése, aminek jó eséllyel a létezéséről sem sokat tudtál, a használatáról pedig gyerekkorodban leszoktattak. Ez a megfelelő rendszerben rád szabva képessé tesz, hogy aktív izommunkával te magad tehermentesíteni tudjad a porckorongodat, ezáltal vissza tudja nyerni az erejét. Ennek köszönhetően instant fájdalomcsillapítást tudsz elérni magadnál.

Mi lesz akkor a masszázs szerepe? Az okot kezeli a torna, az izomfeszülésre pedig kiegészítésként a masszázs a megoldás?

Nem.

Ha az okot kezeled, akkor ahogy az javul, az általa kiváltott következmények is egyre gyengébbek lesznek. Másképp fogalmazva, az izomfeszülésed egy reflexes válasz volt, mivel a gerincedet káros terhelés érte. Amint ezt megszünteted, a feszülés reflexesen, „magától” fel is oldódik.

Tehát a masszázs szerepe a konkrétan valóban izom eredetű, általában egyszeri tünetek kezelése. Ha hosszabb ideje masszázzsal együtt is visszatér a fájdalom, akkor ott a masszázs nem fogja megoldani, csak elhúzni a problémát.

Remélem segítettem ezzel az írással! Lehet, hogy kényelmetlen szembesülni azzal, hogy rosszul álltál eddig a derékfájáshoz, de ennek a rossz érzését, vagy esetleg dühét fel tudod használni, hogy lökjön rajtad egyet és elindulj a megoldás irányába.

Hajrá!`,
  },
  {
    id: 'p3',
    title: 'derékfájásra fájdalomcsillapítót szedni szerinted tüneti kezelés?',
    category: 'kezelési módszerek',
    date: '2026.07.07.',
    content: `Tudod mi a tüneti kezelés?

A masszázs, a derékmerevítő, az elektroterápia, az izomlazító meg a gerincműtét.

Na ezek tényleg tüneti kezelések.

Ha te is elhitted azt a reklámok által sugallt képet, hogy a fájdalomcsillapítók tényleg gondoskodnak a te fájdalommentes életedről, akkor ki kell ábrándítsalak.

Azért hiszed el, hogy hosszú távon kihúzod fájdalomcsillapítókkal úgy-ahogy elviselhetően, mert
- nem ismered a fájdalom okát
- nem tudod, hogy lehetne rá hatni

Ezzel nem vagy egyedül, nem a te hibád. Viszont a te felelősséged, hogy változtatsz-e, vagy sem.

Ebben szeretnélek segíteni ezzel az írással.

Mit csinál a fájdalomcsillapító? Egy egyszerű dolgot:

Akadályozza, hogy eljusson az információ A-ból B-be. Lekapcsolja a wifit.

Van egy sérülés, egy irritáció, ezt érzi a fájdalomérző receptor, elindítja az üzenetet az agyba, ahol a valóságban kialakulna a fájdalomérzet.

A fájdalomcsillapító pedig azon dolgozik, hogy ez az üzenet ne érjen oda.

Ezeket nyilván te is tudtad.

Viszont a legtöbb fájdalomcsillapító egyben gyulladáscsökkentő is, tehát megadja azt az illúziót, hogy mégiscsak valamennyire az okot is kezeli.

Az a helyzet, hogy egy sérülés, vagy irritáció automatikus következménye a helyi gyulladás. Az nem csak úgy érkezik hirtelen valahonnan a világmindenségből, hanem egy természetes reakció valamilyen irritációra.

(Kivételt képeznek azok a kórképek, reumatoid és más gyulladásos betegségek, amelyeknél valamilyen autoimmun folyamat következtében a gyulladás az elsődleges probléma. Létezik ilyen, de nem túl gyakori, és ilyenkor jellegzetesen nem csak egyetlen ponton jelentkezik a gyulladás.)

Tehát, mivel a fájdalom csak a legvégső reakció, ha csak erre hatsz az nem tüneti kezelés, hanem a tünet tompítása.

Viszont azzal, hogy azt mondod, tüneti kezelés, azzal elhiteted magaddal, hogy mégiscsak kezelsz valamit, és nem csak elnyomsz egy védekező reakciót.

Másik hangzatos hazugság, amivel gyakran találkozom, hogy valaki azt mondja, igen tudja, hogy a fájdalomcsillapító az csak tűzoltás. Ez is jól hangzik. Azt sugallja, hogy valamit mégiscsak teszel magadért.

Hogy legalább oltod a tüzet.

Ha viszont úgy vészeled át a komoly fizikai terhelést, hogy beveszel fájdalomcsillapítót, akkor te nem oltod a tüzet. Ha képies akarok lenni, akkor kikapcsolod a tűzjelzőt, mielőtt rálocsolsz egy kanna benzint az égő házra.

Elodázod annak a lehetőségét, hogy tényleg meg lehessen oldani a problémát.

A gerinc nagyon jól tud regenerálódni, de van az a pont, amikor hiába kapsz észbe.

Van az az állapot, amikor se gyógytornával, se műtéttel, se más módon nem hozható helyre a károsodás, mert túl sokat vártál, mert „kibírtad”.

Ettől szeretnélek megóvni.

Nem azt mondom, hogy a fájdalomcsillapító rossz.

Két szerepe van:

1. kibírhatóvá tenni a fájdalmat addig, amíg a megfelelő oki kezelést elkezded
2. vagy kibírhatóvá tenni a fájdalmat, ha az oki kezelés, és a tüneti kezelések már hatástalanok

És az oki kezelés ott kezdődik, hogy a porckorong helyes terhelését kezded visszaállítani.

Hogyan?

Ehhez egyrészt szükség van egy rendszerre, ami felkeléstől lefekvésig a mindennapi mozdulataidat, testtartásodat optimalizálja, hogy a lehető legkevesebb túlterhelés érje a porckorongot.

Ha a terhelés rendeződik, a porckorong anyagcseréje javul, vizet szív magába, „visszagömbölyödik”, ezzel több tér lesz a csigolyák között, amik eddig a közelség miatt irritálódva fájdalmat okoztak, azok most fellélegezhetnek.

Másrészt képessé is tesz erre, azáltal, hogy speciális gyakorlatokkal megtanít az gerinc aktív elongációjára, amit helyesen alkalmazva a legtöbb embernél azonnali fájdalomcsillapító hatás jelentkezik.

Tehát, ha te eddig azért szedted a fájdalomcsillapítót, mert nem láttál más megoldást, azt akartam megmutatni, hogy van megoldás csak nem ismerted.

Ha egyébként sejted, hogy valahol a gyógytorna irányában van a megoldás, de nincs hozzá kedved, mert fárasztó és kellemetlen, vagy fájdalmas, tudod mit? Az olyan terápiát ne is csináld, mert nincs is értelme!

A megfelelő gyakorlatok nem megerőltetőek, hanem megkönnyebbülést hoznak.

Nem fájdalmasak, hanem konkrétan fájdalmat csillapítanak!

És nehezedre esne-e olyan gyakorlatokat beépíteni a mindennapjaidba, amik nem egy plusz nyűgöt jelentenek, hanem a megkönnyebbülést? Rád bízom.

Hajrá!`,
  },
  {
    id: 'p8',
    title: 'miért ne csinálj reggeli tornát, ha szeretnél egészséges, fájdalommentes gerincet?',
    category: 'gyógytorna alapelvek',
    date: '2026.06.30.',
    content: `A következő posztban gyakorlati szempontból magyarázom el a porckorongod működését, hogy minél hatékonyabban tudd visszaállítani az egészségét.

Ha fáj a derekad, akkor előbb-utóbb eljutsz arra a felismerésre, hogy a gyógyulásért neked is tenni kell valamit. Hogy a masszázs, a manuálterápia, a fájdalomcsillapítók és kenőcsök bár mind azt ígérik, hogy nélküled megoldják a fájdalmadat, idővel eljutsz oda, hogy ez nem igaz.

Hiszen a te tested nem tud független lenni tőled. És a mozgásszerv-rendszered épsége sem tud függetlenedni a mozgásaidtól.

Ezért elkezdesz valamit mozogni. Eleinte saját kútfőből, ami eszedbe jut, vagy, amit a youtube-on láttál. Vagy elkéred valamilyen derékfájós kollégától azokat a gyógytorna gyakorlatokat, amiket ő kapott.

De az is lehet, hogy személyre szabott gyakorlataid, edzésterved van, amit szakember állított össze.

A lényeg, hogy sokan tudatlanságból a tornát reggel végzik.

Van rá magyarázat, hogy miért, de arra is, hogy derékfájás esetén miért nem túl jó ötlet.

Általánosságban a reggeli mozgás jó hatású. Bemozgatja az ízületeket, az izmokat, jobb lesz az általános keringés, sőt azáltal, hogy emeli a testhőmérsékletet, segít a felébredésben, hiszen a testhőmérséklet emelkedése az ébredési folyamat legkomolyabb beindítója. Mi akkor a bökkenő?

Az, ami minden mással kapcsolatban, ha az általános dolgokat összekeverjük a specifikus dolgokkal.

A derékfájás, porckorong-kiboltosulás, porckorongsérv mind specifikus dolgok, ezért specifikus hozzáállást igényelnek.

Két csigolya, közte a porckorong — ha rajta egy kiboltosulást, kidomborodást képzelsz el, könnyebben megérted, mi történik éjszaka és reggel.

Így néz ki a porckorongod, mikor lefekszel este aludni: az éjszaka folyamán a porckorongodon belüli nyomás elkezd nőni.

Reggelre körülbelül két és félszer nagyobb benne a nyomás, mint ami volt este.

Két dolog történt vele az éjszaka alatt:

• a csigolyák között icipicit nagyobb lesz a tér, tehát reggel magasabbak vagyunk
• mivel a belső nyomása intenzíven megnőtt, ezért a kitüremkedett részben is nagyobb a nyomás, vagyis a kitüremkedés mértéke is megnő.

Ezért jobban útban van. Jobban feszül. Több lehetősége van fájdalmat okozni és sérülni is.

Ezért nem ajánlott ebben az állapotában nagy reggelitornázásba vágni, hiszen jóval sérülékenyebb, könnyebben sérül még tovább, ezt pedig szeretnénk elkerülni.

Érdemes várni felkelés után 1-1.5 órát, mielőtt az ember elkezd komolyabban tornázni.

Ezzel elérheted azt, hogy jó szándékból ne ronts az állapotodon.

Ahhoz, hogy javíts, és meg is oldd a derékfájásod, ahhoz nyilván ennél többre lesz szükséged.

Ebben a posztban csupán a reggeli torna félreértését szerettem volna tisztázni, hogy tudatlanságból ne okozz magadnak még több problémát.`,
  },
  {
    id: 'p10',
    title: 'te is tudod, hogy derékfájásra a mély hátizmokat kell erősíteni?',
    category: 'mítoszok és eszközök',
    date: '2026.06.23.',
    content: `Akkor te is rosszul tudod!

Ez is egy üres lózung csupán. Egy tudálékos „tipp”, valamiféle színes magazinból származó „8 praktika a derékfájás ellen”-lista tagja.

De az a baj, vele, hogy nem igaz.

Sőt, pont az ellenkezője igaz.

De tudod mit? Akár igaz is lehetne, akkor sem mennél vele semmire.

Hiszen melyik izmokról is beszélünk? Azokat milyen edzéssel tudom erősíteni? Milyen intenzitással? Kell-e, hogy fájjon, mert akkor hat? Vagy ne fájjon, mert azzal ártasz? A te gerincednek, a te terhelhetőségednek mi az ami megfelel?

Sőt még tovább megyek. Ha precíz, pontosan, minden részletét személyre szabottan meg is kapnád, valaki egyértelműen megmutatja, és tényleg neked való erősítő gyakorlatokat kapsz, az esetek 50%-ában már egy hét alatt torzul annyit a helyes kivitelezés, hogy korrigálni kelljen, tehát a tippekkel és általános gyakorlatokkal nem mész semmire.

Az ilyen tanácsok azt az illúziót keltik, hogy a probléma megoldása „csak ennyi”, csak kicsit oda kell figyelni, kicsit erősíteni kell a hátizmokat és már rendbe is jössz. Persze, ha komolyan veszed és elkezdenéd követni őket, akkor érzed, hogy semmit sem érnek.

Éppen ezért itt nem fogok konkrét gyakorlatot, vagy edzéstervet megosztani, hanem egy lépéssel távolabbról megmutatom az alapelveket és törvényszerűségeket a derékfájás mögött.

Tehát térjünk vissza oda, hogy nem a mély hátizmokat kéne erősíteni.

Nem azért fáj, mert gyönge, ezért nem bírja a terhelést. Nem is emiatt görcsöl be.

A feszessége és érzékenysége több forrásból fakad.

Egyrészt munka közben állandóan dolgozik, hiszen a legtöbb munkatevékenység enyhén előredőlt felsőtestet követel. Mivel a gerinc előre van dőlve, a hátizmoknak hátrafelé kell húznia, hogy ne essünk orra.

Viszont, ha folyamatosan feszülés alatt vannak a hátizmok, akkor el fognak fáradni és be fognak görcsölni.

Másrészt az ülőmunka és a hajolással járó tevékenységek nagy nyomást helyeznek a porckorongra, ami ettől deformálódik, vizet veszít. Az így egymáshoz közelebb került csigolyák miatti helyi instabilitás, kisízületi kopás, vagy ízületi tok becsípődés azt fogja kiváltani, hogy a környező mély hátizmok görcsös feszüléssel próbálják a helyzet romlását akadályozni.

Vagyis nem a hátizmokkal van a probléma, hanem a terheléssel.

Így a megoldás sem a hátizmokkal kezdődik.

Nem a mély hátizmokat kell erősíteni, hogy bírják a terhelést, hanem a terhelést kell csökkenteni és változatossá tenni, amennyire lehetséges.

Azt a rossz hatást pedig, amit nem tudunk elkerülni, valami mással ki kell kompenzálni.

Mit jelent ez a gyakorlatban?

A hátizmokat érő állandó terhelést azzal lehet optimalizálni, hogy változatossá tesszük. A testünk mozgásra van kitalálva, minél gyakrabban megszakítjuk a statikus testhelyzeteket, annál inkább közelítünk ahhoz a terheléshez, amit képes hosszú távon elviselni.

Például, ha a törzsedet csak néhány fokkal hátrafelé döntöd, te is tapasztalhatod, hogy komplett izomcsoportok kapcsolódnak be, míg mások kikapcsolnak. A hasizmok megfeszülnek, a gerinc melletti két vaskos izomköteg pedig hirtelen ellazul.

A porckorongok terhelését szintén a mozgás, és a megfelelő testhelyzet precíz beállítása fogja optimalizálni.

Ezek a lehetőségeid a terhelés optimalizálására, természetesen ennek vannak mélységei, de az elv érthető. Egy pont után viszont elfogynak a lehetőségek, hiszen már mindent a legkímélőbben, ergonómikusan csinálsz, de továbbra is túl nagy terhelést kap a gerinced.

Ezért van szükség arra, hogy ezt ellensúlyozzuk valahogyan.

A túlterhelés rossz hatását kompenzálni egy precíz feladat. Azt kell ugyanis elérni, hogy a porckorong valahogy „fellélegezhessen”. Vagyis eddig állandó, fokozott nyomás alatt volt (ülőmunka közben, vagy a rendszeres előrehajlás miatt), ezért el kell érni, hogy a belső nyomása csökkenni tudjon. Egyrészt a munkát megszakítva, vagy utána ellensúlyozásként, másrészt a terhelés közben is aktívan, saját izomzat által létrehozott elongáció segítségével.

Lehet, hogy kicsit bonyolultan hangzik, ha nagyon egyszerűen akarom megfogalmazni, akkor arra van szükséged, hogy saját izomzatoddal aktívan tudd távolítani a csigolyáidat egymástól.

És ezt a távolítást nem a mély hátizmok fogják elírni, hiszen a hátizmok a csigolyákat egymással összekötik, vagyis, ha megfeszülnek, akkor egymás felé húzzák a csigolyákat.

Felmerülhet a kérdés, hogy hogy a csudába távolítsak el egymástól két csontot, amikor a csontokat csak izmokkal tudom mozgatni, és az izmok csak összehúzódni, összehúzni tudnak, tolni nem...

Erre való az aktív elongációnak nevezett gerincnyújtás, ami egy összetett, precíz folyamat, és fontos eleme egy olyan izom aktiválása, amit haránt hasizomnak nevezünk, és a has körül egyfajta övként húzódik. Ha ezt megfeszíted a megfelelő módon, akkor a hasűri nyomás növelésével besegít az ágyéki gerinc (deréktáji gerinc) megnyúlásába.

Úgy képzeld el, mintha a markodba fognál egy lufit. A markod a haránt hasizom, a lufi pedig a törzsed deréktájon. Ha erősebben szorítod, a lufi alul-felül „megnő”, kitüremkedik a markodból. Hasonló jelenségben segít a haránt hasizom is.

Vagyis, ha primitíven akarnám megfogalmazni, akkor derékfájásnál nem mély hátizmokat kell erősíteni, hanem mély hasizmot.

Fent már kifejtettem, hogy ez nem ilyen egyszerű, nem akarom azt az illúziót kelteni benned, hogy ezt összeguglizod magadnak, és kitapasztalod. Ez egy szakember vezetését, egy személyre szabott rendszert igényel.

Az volt a célom ezzel az írással, hogy eloszlassam ezt az általános tévhitet, hogy a mély hátizmokat kell erősíteni, ha fáj a derekad.

És az is célom volt, hogy lásd, nem elég tippeket és praktikákat követni, mert, még ha jók is lennének, sosem lesz annyira pontosan rád szabva, hogy eredményt érj el vele.

Remélem segítettem a megértésben.

Hajrá!`,
  },
  {
    id: 'p1',
    title: '4 élettani következmény, ami kimaradt a denevérpadok marketingkommunikációjából',
    category: 'mítoszok és eszközök',
    date: '2026.06.16.',
    content: `Avagy hogyan állíts be hasznosnak egy haszontalan terméket úgy, hogy nem kell közben hazudnod?

Az alábbi posztban bemutatom neked a denevérpad (gravitációs pad) hatását, azt, hogy miért jelent sok embernek megkönnyebbülést, miért nem tud mégsem megoldást adni arra az egyetlen dologra, amire használják: a krónikus derékfájásra.

Ha még nem találkoztál a fogalommal (amit erősen kétlek), akkor röviden bemutatom neked a denevérpadot.

Képzeld el egy libikóka és egy masszázságy közös gyerekét. Van egy fekvő felülete, ennek az egyik végén rögzítési lehetőség a bokádnak, és van egy kerete, amin ezt a fekvőpad részét lehet billenteni. Ezzel elérhető az, hogy fejjel lefelé helyzetbe kerülj.

Milyen megfontolásból?

Abból az ok-okozati levezetésből, miszerint: A fájdalom oka a beszűkült csigolyák közti tér, ezáltal kiváltott kisízületi kopás, irritáció, idegbecsípődés, stb. A csigolyák közti tér azért szűkült be, mert a porckorong vizet veszített, ellaposodott. A porckorong azért veszített vizet, mert a gravitáció nyom össze bennünket.

Megoldás?

Fordítsuk meg a gravitációt, és ha nem összenyom, hanem fejjel lefelé helyzetben pont, hogy megnyújt, akkor ezzel helyreáll minden.

Ez a denevérpad alkalmazásának az alapja.

Mi itt a gond? Egyáltalán van-e ezzel bármi gond? Hiszen nem egy, nem két ember mondja azt, hogy nála működik! Sőt, ez az egyetlen dolog, amivel képes úgy-ahogy kibírni a napokat, ha ez nem lenne, akkor nagyon durva tünetei lennének.

Lépjünk egy kicsit messzebb, hogy ne vesszünk el a részletekben.

A gerincünk arra lett tervezve, hogy két lábon járva, felegyenesedve használjuk, és egy életen keresztül ki legyen téve a gravitációnak.

Vagyis, a gravitáció nem az ellenségünk, hanem a szükségletünk.

Ahhoz, hogy egészséges izomzatunk, csontszerkezetünk, porckorongjaink, szalagrendszerünk legyen, ehhez elengedhetetlenül szükségünk van a gravitáció okozta terhelésre!

Ennek hiányában drasztikus gyorsasággal mennénk tönkre. Nem véletlen, hogy a mai napig a legnagyobb kihívás az űrállomáson tartózkodó személyzet számára az a mikrogravitációs környezet, aminek a káros hatásait semmilyen edzőgéppel nem tudják kiküszöbölni.

Vagyis a hiba nem a gravitációban van, és nem is a gerincedben.

A hiba abban van, hogy nem tudod jól használni a gerincedet.

(Természetesen van az az állapot, amikor egyéb ok: születési fejlődési rendellenesség, gyulladásos autoimmun betegség, daganatos áttét, amikor az ok máshol keresendő. De ezeknek az eseteknek a száma elenyésző az összes derékfájós esethez képest.)

Hogy nem tudod jól használni a gerincedet, ez azt jelenti, hogy nem ismered azt, hogy a különböző tevékenységeid mekkora terhelést jelentenek a gerincedre, és épp pozitívan, vagy negatívan hatnak.

Persze mondhatod, hogy ez pofonegyszerű, hiszen érzed, hogy mi esik jól, és mi nem. Csak az a bökkenő, hogy a gerinc legsérülékenyebb része nem igazán érez semmit…

Értsd, ahogy írom, a porckorong nem fog neked visszajelzést adni arról, ha valami nincs rendben, mert nincs benne szenzor! Nem tud fájni!

Éppen ezért nem pofonegyszerű, hogy mi használ a gerincnek.

A fájdalommentes gerinc két alappillére a rá eső terhelés optimalizálása, és az esetleges túlterhelés kompenzálása.

Mit értek a terhelés optimalizálása alatt? Egyszerű: minél inkább hasonlít a terhelés az ideálisra (két lábon felegyenesedve járás), annál optimálisabb. Minél távolabb van ettől (statikus, görnyedt ülés, hajolás), annál károsabb.

És mi a kompenzálás? Mivel nem egy ideális világban élünk, ezért kénytelenek vagyunk az optimálistól eltérően használni a testünket, akár hosszú órákig is, ekkor van arra szükség, hogy azt a nagy mínuszt, amit generáltunk, valami plusszal kiegyenlítsük. Erre kiválóan alkalmas az aktív gerinc elongációja, ami saját izomzattal létrehozott gerincnyújtást jelent. Ez egy precíz izommunka, ami személyre szabott, progresszíven változó gyakorlatokkal hónapok munkájával megtanulható.

Ezekből már látszik, hogy a denevérpad a két alappillér közül csak az egyikre hat, vagyis a kompenzálásra, hiszen azt nem fogja befolyásolni, hogy mit csinálsz abban a maradék időben, amíg nem fejjel lefelé lógsz.

Nézzük meg alaposabban, hogyan is hat:

1. A fejjel lefelé lógás, és a gerincünk passzív megnyújtása nem fiziológiás terhelés. Azaz nem erre van tervezve a szervezet. Mit fog csinálni? Védekezni!

Vagyis, ha lógatom magam és ezzel passzívan nyújtom a gerincemet, akkor a csigolyákat összekötő izmok védekezni fognak, és megfeszülnek. Meg akarják akadályozni a nyújtást.

Szóval első körben nem is biztos, hogy sikerül nyújtani.

Idővel azért ki tudod cselezni ezt a védekezést, és valódi megnyúlást tudsz elérni. Ezért érezheti sok ember, hogy ez jó. Hiszen valóban távolodtak az irritált csigolyák, idegek egymástól. Tehát, ha rangsorolni kéne, akkor a denevérpad mindenképpen korábban avatkozik az ok-okozati láncba, mint például a fájdalomcsillapító.

Mit érsz még el azzal, ha sikeresen kikapcsoltad az izmaid védekező feszülését, és sikerült megnyújtani a gerincedet?

2. Azt, hogy az izom már nem tart, mert kikapcsoltad. Mi tart? A szalagrendszer, az ízületi tok, vagyis a passzív kötőszövetes elemek. És ennek már nincs beépített fékezőrendszere, vagyis úgy nyújtod túl, ahogy tetszik.

Következmény? A lazább szalagok miatti megnövekedett helyi instabilitás.

Tehát a porckorongnak jót tettünk, a szalagokat meg túlnyújtottuk, mindezt passzívan.

Vagyis megvan rá a garancia, hogy amikor visszakerülsz a normális testhelyzetedbe, és a gravitáció megint „felülről jön”, akkor továbbra is eszköztelen maradsz a túlterheléssel szemben.

Viszont amiatt, hogy a szalagjaidat kezded túlnyújtani, a szegmentális instabilitás következtében beállnak a hátizmaid védekezésképp. És ez innentől egy magát fenntartó folyamat, hiszen egyre rászorultabb leszel a denevérpadra, aminek egyre inkább a denevérpad használat lesz az oka…

3. De tegyük fel, te nem passzívan lógsz azon a padon, hanem gyógytornát végzel rajta, erősítő gyakorlatokat, amik majd segítenek megtartani a helyes testtartásodat.

Jól hangzik?

Elsőre logikusan. De ha kicsit a mélyére ásol, akkor már nem olyan logikus.

Hiszen fejjel lefelé, amikor a gerincedet megnyújtja a gravitáció, azokat az izmokat fogod aktiválni és erősíteni, amik ez ellen tartanak. Vagyis azokat, amik a csigolyákat egymás felé húzzák, a köztük lévő teret szűkítik és a porckorong terhelését növelik.

Ez olyan, mintha azt mondanád, hogy amikor felemelsz egy súlyt, azt a bicepszeddel csinálod, hiszen az hajlítja a könyöködet, a leengedést pedig a tricepszeddel, hiszen az meg nyújtja a könyöködet. A valóság meg az, hogy mindig a gravitáció ellen dolgozol, és az az izom fog bekapcsolni, ami a gravitáció ellen dolgozik.

Tehát egy denevérpadon sosem fogod megerősíteni azokat az izmokat, amik ahhoz szükségesek, hogy a természetes testhelyzetedben stabil legyen a gerinced.

4. Mindezekhez még hozzáadódik a fejjel lefelé helyzetben jelentkező megnövekedett szemnyomás, és az agyi erek megnövekedett terhelése, és máris látod, hogy a denevérpad sosem fog neked hosszú távra stabil, terhelhető gerincet biztosítani.

Ha neked ez így oké, és kiegyezel ezekkel a lehetőségekkel, rendben van.

Ha ezzel szemben megtanulnád a gerincedet optimálisan használni, és az esetleges túlterhelést kompenzálni aktívan, az erről szóló posztot belinkelem hozzászólásban.

Tedd meg az első lépést a gyógyulásod felé, és tanulmányozd át alaposan, hogy ki tudj lépni a mostani állapotodból!

Hajrá!`,
  },
]

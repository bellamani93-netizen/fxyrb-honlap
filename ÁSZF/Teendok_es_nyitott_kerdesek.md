# ÁSZF és Adatkezelési tájékoztató – teendők

Frissítve: 2026.11.25. Az egyetlen szolgáltató és adatkezelő a FixYourBack Kft. Az üzleti szabályok a 2024. 10. 01-i ÁSZF-fel azonosak.

## A. Kitöltendő adatok

Minden adat megvan (hatály: 2026.11.25., ügyvezető: Bella Márton, Allianz AHB995793093, Számlázz.hu / KBOSS.hu Kft.). Ha a domain és az e-mail továbbra is a Sybellnél van, a Sybellt fel kell venni az adatfeldolgozók közé.

## B. Ellenőrizendő a szolgáltatóknál

- **Neon:** az adatbázis tárolási régiója. Egészségügyi adat miatt EU-s régió (például Frankfurt) javasolt. A Vercel futtatási régiójára ugyanez vonatkozik.
- **Clerk:** nem találtam nyilvános DPF-tanúsítást. A szöveg ezért az adatfeldolgozói szerződés (DPA) általános szerződési feltételeire (SCC) hivatkozik; a Clerk DPA-ját el kell fogadni.
- **Calendly és Databricks/Neon:** a saját oldalukon két különböző cégnév, illetve cím szerepel. A táblázatba a privacy notice szövegében szereplő adatokat vettem át.
- Minden szolgáltatónál el kell fogadni az adatfeldolgozói szerződést (DPA).

## C. Jogi szempontból változott (nem üzleti szabály)

- **Az egészségügyi adatok jogalapja:** hozzájárulás helyett egészségügyi ellátás és törvényi dokumentációs kötelezettség (GDPR 9. cikk (2) h)). A 30 éves kötelező megőrzés mellett a hozzájárulás nem lehet jogalap, mert az bármikor visszavonható.
- **Felelősségkorlátozás (ÁSZF 8.6.5.):** a régi kivétel („szándékos bűncselekménnyel okozott károk”) kiegészült azzal, amit a Ptk. 6:152. § kötelezően előír: a szándékos és a súlyosan gondatlan károkozás, valamint az élet, a testi épség és az egészség megsértése nem korlátozható.
- **Kikerültek:** az EU vitarendezési (ODR) platformja (2025-ben megszűnt), a Google Forms, a Google Analytics és a Skype (az új honlap nem használja őket), valamint minden egyéni vállalkozói adat és a MESZK.
- **Bekerültek:** a honlap új funkciói (fiók, gyorsítósáv, állapotfelmérő, checklist, munkafüzet, kérdések, csoportos utánkövetés, ranglista, műveleti napló), a sütitáblázat, a szerepkörönkénti hozzáférések és a békéltető testület.
- **Megjegyzés ügyvédnek:** a régi felmondási szabályt („a Résztvevő felmondása esetén nincs visszatérítés”) változatlanul hagytuk. Fogyasztói szerződésben ezt bíróság tisztességtelennek ítélheti (Ptk. 6:278., 6:104.); érdemes megkérdezni róla az ügyvédet.

## D. Honlap

**Beépítve (2026.11.25.):**
- A jogi oldalak (`/aszf`, `/adatvedelem`, `/cookie`) közvetlenül az ebben a mappában lévő .md fájlokat jelenítik meg (`src/lib/legal.ts`). Ha egy szöveg változik, csak a .md fájlt kell átírni; új változatnál a `LEGAL_VERSION` értékét is frissíteni kell.
- Sütisáv „csak a szükségesek”, „elfogadom mindet” és „beállítások” gombbal; a láblécben „sütibeállítások” link. A YouTube- és a Calendly-beágyazás csak hozzájárulás után töltődik be.
- Regisztráció: kötelező ÁSZF-elfogadás, tájékoztatás az adatkezelésről, és az elfogadás időpontjának és változatának mentése.
- Hírlevél: kötelező hozzájárulási jelölőnégyzet.
- Gyorsítósáv: önkéntes hírlevél-jelölőnégyzet, adatkezelési tájékoztatás, és figyelmeztetés arra, hogy a tudáscheck-válasz komment formájában mások számára is látható.
- Utánkövetés: kötelező hozzájárulás és figyelmeztetés a láthatóságra.
- Időpontfoglalás: adatkezelési tájékoztatás a foglaló felett.
- A láblécben „FixYourBack Kft. · impresszum” szerepel.

**Még hátra van:**
1. **Calendly:** a foglaló saját kérdései közé fel kell venni egy kötelező jelölőnégyzetet (kifejezett hozzájárulás az egészségügyi válaszok kezeléséhez). Ezt a Calendly beállításaiban kell megcsinálni, nem a kódban.
2. **ListaMester:** kétlépcsős megerősítés (double opt-in) a hírlevélhez.
3. **Ranglista** (amikor elkészül): csak külön beleegyezéssel (opt-in) jelenjen meg rajta valaki, választható becenévvel.
4. **Éles backend:**
   - az elfogadások és a hozzájárulások a fiókhoz mentve (most a böngészőben tárolódnak);
   - az értékesítő szerveroldalon se férjen hozzá egészségügyi adathoz;
   - műveleti napló;
   - adatexport és fióktörlés úgy, hogy a dokumentáció megmaradjon.
5. A Mux-mérést csak hozzájárulás után, vagy süti nélküli módban szabad bekapcsolni (a videólejátszó most még helyőrző).

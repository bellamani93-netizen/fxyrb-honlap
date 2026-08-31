// Forrás: "torna szintek.odt" (2026.08.26., Marci — "ez a program központja").
// Minden gyakorlatnak több kartartás-változata van, a dokumentumban A/B/C/(D/E/F/G)
// jelöléssel, "KH" (kiinduló helyzet) rövidítéssel, "K" (kivitelezés) alatt az
// ismétlésszámmal. Az adatok szó szerint a dokumentumból származnak — a "mint A, de: ..."
// jelölés is a forrás saját rövidítés-mintáját követi (a KH/ismétlésszám ott is egy korábbi
// változatra hivatkozva van megadva, csak a különbséget írja le). A megtartás (mp) ideje
// NEM szerepel számként a dokumentumban (mindenhol "a megadott ideig" áll) — ez a checklist-
// fázis külön, Marci által megerősített szabálya, ld. lent (HOLD_START_SECONDS stb.).

export type ExerciseCode =
  | 'S01' | 'S02' | 'S03' | 'S04' | 'S05' | 'S06' | 'S07' | 'S08' | 'S09' | 'S10' | 'S11' | 'S12' | 'S13'
  | 'A01' | 'A02' | 'A03' | 'A04' | 'A05' | 'A06' | 'A07'

export type ExerciseVariant = { label: string; start: string; reps: string }
type Exercise = { name: string; variants: ExerciseVariant[]; note?: string }

const DYN4 = '1x (4 mozgásváltozatban)'
const DYN4_ALT = '3x (4 mozgásváltozatban)'

export const EXERCISES: Record<ExerciseCode, Exercise> = {
  S01: {
    name: 'Háton fekvés, alsó kartartás',
    variants: [
      { label: 'A', start: 'háton fekve, kemény felületen (szőnyeg, jógamatrac), lábak talpon, térd kb. 90 fokban, karok törzs mellett, tenyér a talajon.', reps: '10x' },
      { label: 'B', start: 'mint A.', reps: '10x' },
      { label: 'C', start: 'mint A, de a karok srégen oldalra lefelé, a kézhát van a talajon (kisujj, hüvelykujj is).', reps: '10x' },
      { label: 'D', start: 'mint A, de a karok vállmagasságban a talajon, kézháttal lefelé.', reps: '10x' },
    ],
  },
  S02: {
    name: 'Háton fekvés, felső kartartás',
    variants: [
      { label: 'A', start: 'háton fekve, kemény felületen (szőnyeg, jógamatrac), lábak talpon, térd kb. 90 fokban, karok vállmagasságban, könyök 90 fokban behajlítva ("kezeket fel!"-tartás), az egész kézhát a talajon (amennyiben leér).', reps: '10x' },
      { label: 'B', start: 'mint A, de a karok tartása más: két ujjunkat összeérintjük a fejünk felett.', reps: '10x' },
      { label: 'C', start: 'mint A, de a karok srégen felfelé a talajon, kézháton a kezek.', reps: '10x' },
      { label: 'D', start: 'mint A, de a karok fül mellett felnyújtva, egyenesen.', reps: '10x' },
    ],
  },
  S03: {
    name: 'Hason fekvés, alsó kartartás',
    variants: [
      { label: 'A', start: 'hason fekve talajon szőnyegen/tornaszőnyegen (nem ágyon), homlok alá habszivacs alátét, karok a törzs mellett, kézhát a földön.', reps: '10x' },
      { label: 'B', start: 'mint A, plusz karok, vállak elemelése a talajról.', reps: '10x' },
      { label: 'C', start: 'mint A, de a karok srégen oldalra lefelé, tenyérrel a talajon.', reps: '10x' },
      { label: 'D', start: 'mint A, de a karok vállmagasságban, tenyérrel a talajon.', reps: '10x' },
    ],
  },
  S04: {
    name: 'Hason fekvés, felső kartartás',
    variants: [
      { label: 'A', start: 'hason fekve talajon szőnyegen/tornaszőnyegen (nem ágyon), homlok alá habszivacs alátét, karok vállmagasságban, könyök 90 fokban behajlítva, tenyér a földön ("kezeket fel!").', reps: '10x' },
      { label: 'B', start: 'mint A, de a karok helyzete változik: két ujj a fejtető fölött összeér.', reps: '10x' },
      { label: 'C', start: 'mint A, de a karok kinyújtva srégen felfelé, tenyér a földön.', reps: '10x' },
      { label: 'D', start: 'mint A, de a karok kinyújtva egyenesen fül mellett, tenyér a földön.', reps: '10x' },
    ],
  },
  S05: {
    name: 'Hason fekvés, dinamikus',
    variants: [
      { label: 'A', start: 'hason fekvés, homlok alatt alátámasztás, karok törzs mellett a földön, kezek kézháton.', reps: DYN4 },
      { label: 'B', start: 'karok srégen oldalra lefelé 45 fokban, kezek tenyéren.', reps: DYN4 },
      { label: 'C', start: 'karok vállmagasságban, kezek tenyéren.', reps: DYN4 },
      { label: 'D', start: 'karok "kezeket fel!"-tartásban (váll, könyök 90 fok).', reps: DYN4 },
      { label: 'E', start: 'kezek fej fölött, két-két ujj összeér, kezek tenyéren.', reps: DYN4 },
      { label: 'F', start: 'karok váll fölött, srégen oldalra felfelé kinyújtva, kezek tenyéren.', reps: DYN4 },
      { label: 'G', start: 'karok váll fölött, fül mellett egyenesen kinyújtva, kezek tenyéren.', reps: DYN4 },
    ],
  },
  S06: {
    name: 'Állva, alsó kartartás',
    variants: [
      { label: 'A', start: 'állva a falhoz támaszkodva, sarok kb. fél lábfejnyivel távolabb a faltól, medence és lapockák a falon, karok test mellett lógnak, tenyerek a fal felé.', reps: '10x' },
      { label: 'B', start: 'mint A, plusz tenyerek, vállak feszítése a falba.', reps: '10x' },
      { label: 'C', start: 'mint A, de a karok srégen oldalra lefelé, kézhát a falon, plusz kézhát/vállak feszítése a falba.', reps: '10x' },
      { label: 'D', start: 'mint A, de a karok vállmagasságban, kézháton a falon.', reps: '10x' },
    ],
  },
  S07: {
    name: 'Állva, felső kartartás',
    variants: [
      { label: 'A', start: 'állva a falhoz támaszkodva (mint S06-nál), karok "kezeket fel!"-tartásban (váll, könyök 90 fok).', reps: '10x' },
      { label: 'B', start: 'mint A, de a karok helyzete más: fej fölött két-két ujj összeér.', reps: '10x' },
      { label: 'C', start: 'mint A, de a karok srégen oldalra felfelé kinyújtva, kézhát a falon.', reps: '10x' },
      { label: 'D', start: 'mint A, de a karok egyenesen fül mellett felnyújtva, kézhát a falon.', reps: '10x' },
    ],
  },
  S08: {
    name: 'Állva, dinamikus',
    variants: [
      { label: 'A', start: 'állva szabadon, lábak kényelmes csípőszéles tartásban, karok törzs mellett lógnak.', reps: DYN4 },
      { label: 'B', start: 'karok srégen oldalra lefelé, tenyerek előre.', reps: DYN4 },
      { label: 'C', start: 'karok vállmagasságban.', reps: DYN4 },
      { label: 'D', start: 'karok vállmagasságban, könyök 90 fokban behajlítva, tenyér előre.', reps: DYN4 },
      { label: 'E', start: 'karok váll fölött, fej fölött két-két ujj összeérint.', reps: DYN4 },
      { label: 'F', start: 'karok váll fölött, srégen oldalra felfelé, tenyér előre néz.', reps: DYN4 },
      { label: 'G', start: 'karok váll fölött, fül mellett egyenesen felnyújtva, tenyér előre néz.', reps: DYN4 },
    ],
  },
  S09: {
    name: 'Ülve falnál, alsó kartartás',
    variants: [
      { label: 'A', start: 'ülve egy támla nélküli széken, csípő és térd 90 fokban, ülőlap vízszintes, medence és lapockák a falhoz érnek, karok a test mellett lógnak, tenyér a fal felé.', reps: '10x' },
      { label: 'B', start: 'mint A, plusz tenyerek/vállak a falba szorítva.', reps: '10x' },
      { label: 'C', start: 'mint A, de a karok srégen oldalra lefelé, egész tenyér/kézhát a falon, plusz tenyerek/vállak a falba szorítva.', reps: '10x' },
      { label: 'D', start: 'mint A, de a karok vállmagasságban, egész tenyér/kézhát a falon, plusz tenyerek/vállak a falba szorítva.', reps: '10x' },
    ],
  },
  S10: {
    name: 'Ülve falnál, felső kartartás',
    variants: [
      { label: 'A', start: 'ülve egy támla nélküli széken (mint S09-nél), karok vállmagasságban, könyök 90 fokban behajlítva, kézhát a falon.', reps: '10x' },
      { label: 'B', start: 'mint A, de a karok váll fölött, könyök behajlítva, két-két ujj fej fölött összeér.', reps: '10x' },
      { label: 'C', start: 'mint A, de a karok váll fölött, srégen oldalra felfelé, tenyér előre.', reps: '10x' },
      { label: 'D', start: 'mint A, de a karok váll fölött, egyenesen fül mellett felnyújtva, tenyér előre.', reps: '10x' },
    ],
  },
  S11: {
    name: 'Ülve, dinamikus',
    variants: [
      { label: 'A', start: 'ülve egy támla nélküli, magas széken, szabadon, a comb picit előre lejt, karok a törzs mellett lógnak, tenyerek hátrafelé néznek.', reps: DYN4 },
      { label: 'B', start: 'karok srégen oldalra lefelé, tenyerek előre.', reps: DYN4 },
      { label: 'C', start: 'karok vállmagasságban.', reps: DYN4 },
      { label: 'D', start: 'karok vállmagasságban, könyök 90 fokban behajlítva, tenyér előre.', reps: DYN4 },
      { label: 'E', start: 'karok váll fölött, fej fölött két-két ujj összeérint.', reps: DYN4 },
      { label: 'F', start: 'karok váll fölött, srégen oldalra felfelé, tenyér előre néz.', reps: DYN4 },
      { label: 'G', start: 'karok váll fölött, fül mellett egyenesen felnyújtva, tenyér előre néz.', reps: DYN4 },
    ],
  },
  S12: {
    name: 'Plank',
    variants: [
      { label: 'A', start: 'alkartámasz a padlón szőnyegen, könyök 90 fokban, hát vízszintes, térdek és lábujjak a padlón, arc a föld felé.', reps: '10x' },
      { label: 'B', start: 'mint A, de a hát lejt a lábak irányába, a térdeket hátrébb helyezzük.', reps: '10x' },
    ],
  },
  S13: {
    name: 'Dinamikus, instabil felszínen',
    note: '2 tetszőlegesen választott helyzet az alábbiak közül.',
    variants: [
      { label: 'A', start: 'ülve nagy fitneszlabdán, lábak a talajon enyhe terpeszben, comb előre lejt.', reps: 'a tanult 4 dinamikus karmozgás, minden kartartásban' },
      { label: 'B', start: 'ülve egy székre helyezett dynair-en (levegőpárna), lábak talajon enyhe terpeszben, comb előre lejt.', reps: 'a tanult 4 dinamikus karmozgás, minden kartartásban' },
      { label: 'C', start: 'állva dynair-en / balance boardon / más instabil, billegő eszközön (házilag barkácsolt is lehet).', reps: 'a tanult 4 dinamikus karmozgás, minden kartartásban' },
      { label: 'D', start: 'négykézláb a padlón, kezek és/vagy lábak alatt dynair vagy labda (puha vagy kemény is jó), vállak közé beejtett háttal, derék lógatva, arc a föld felé.', reps: 'hasizmok aktiválása, hát kiegyenesítése, fejtetővel nyújtózás, térdek elemelése és megtartása' },
    ],
  },
  A01: {
    name: 'Hason fekvés, dinamikus alsó tartással',
    variants: [
      { label: 'A', start: 'hason fekvés, homlok alatt alátámasztás, karok törzs mellett a földön, kezek kézháton.', reps: DYN4_ALT },
      { label: 'B', start: 'karok srégen oldalra lefelé 45 fokban, kezek tenyéren.', reps: DYN4_ALT },
      { label: 'C', start: 'kezek a csípőre téve.', reps: DYN4_ALT },
      { label: 'D', start: 'karok vállmagasságban, kezek tenyéren.', reps: DYN4_ALT },
    ],
  },
  A02: {
    name: 'Négykézláb A',
    variants: [
      { label: 'A', start: 'négykézláb helyzet padlón szőnyegen, kezek a váll alatt, térdek csípő alatt (kar és comb függőleges) — kényelmetlen csuklónál ököllel vagy kis kézisúlyzón is támaszkodható —, tekintet a padló felé.', reps: '20x' },
      { label: 'B', start: 'mint A, de lábujjak a padlón, és a térdeket csak 1 cm-re emeljük el a talajtól.', reps: '20x' },
    ],
  },
  A03: {
    name: 'Négykézláb B',
    variants: [
      { label: 'A', start: 'négykézláb helyzet padlón szőnyegen, kezek a váll alatt, tenyerek egymás felé néznek, térdek csípő alatt (kar és comb függőleges), tekintet a padló felé.', reps: '15x' },
      { label: 'B', start: 'mint A, de egyik láb kinyújtva a törzs folytatásaként, a felemelt láb a törzzsel egy vonalban emelkedik.', reps: '2×10x' },
    ],
  },
  A04: {
    name: 'Állva, dinamikus alsó tartással',
    variants: [
      { label: 'A', start: 'állva szabadon, lábak kényelmes csípőszéles tartásban, karok törzs mellett lógnak.', reps: DYN4_ALT },
      { label: 'B', start: 'karok srégen oldalra lefelé, tenyerek előre.', reps: DYN4_ALT },
      { label: 'C', start: 'kezek a csípőn.', reps: DYN4_ALT },
      { label: 'D', start: 'karok vállmagasságban.', reps: DYN4_ALT },
    ],
  },
  A05: {
    name: 'Ülve, dinamikus alsó tartással',
    variants: [
      { label: 'A', start: 'ülve egy támla nélküli széken, szabadon, csípő és térd 90 fokban, ülőlap lehetőleg vízszintes, karok a törzs mellett lógnak, tenyerek hátrafelé néznek.', reps: DYN4_ALT },
      { label: 'B', start: 'karok srégen oldalra lefelé, tenyerek előre.', reps: DYN4_ALT },
      { label: 'C', start: 'kezek a csípőn.', reps: DYN4_ALT },
      { label: 'D', start: 'karok vállmagasságban.', reps: DYN4_ALT },
    ],
  },
  A06: {
    name: 'Ülve, dinamikus alsó, előre dőlve',
    variants: [
      { label: 'A', start: 'ülve egy magas, támla nélküli széken, szabadon, a comb picit előre lejt, karok a törzs mellett lógnak, tenyerek hátrafelé néznek.', reps: DYN4_ALT },
      { label: 'B', start: 'karok srégen oldalra lefelé, tenyerek előre.', reps: DYN4_ALT },
      { label: 'C', start: 'kezek csípőn.', reps: DYN4_ALT },
      { label: 'D', start: 'karok vállmagasságban.', reps: DYN4_ALT },
    ],
  },
  A07: {
    name: 'Háton fekvés, alsó kartartás B',
    variants: [
      { label: 'A', start: 'háton fekve, kemény felületen (szőnyeg, jógamatrac), lábak talpon, térd kb. 90 fokban, karok törzs mellett, kezek csípőn.', reps: '10x' },
      { label: 'B', start: 'mint A, de a karokat másképp helyezzük: felkar a törzs mellett, könyök 90 fokban behajlítva, alkar függőleges.', reps: '10x' },
      { label: 'C', start: 'mint A, de a felkar srégen oldalra lefelé kb. 45 fokban, könyök 90 fokban behajlítva, alkar függőleges.', reps: '10x' },
      { label: 'D', start: 'mint A, de a felkar vállmagasságban, könyök 90 fokban behajlítva, alkar függőleges.', reps: '10x' },
    ],
  },
}

/** "S01 Háton fekvés, alsó kartartás" alakú felirat egy gyakorlat-kódhoz — a GYT
 * videókiosztás oldalán a legördülő/kiosztott videó feliratához (áthelyezve
 * a gytClients.ts-ből az ügyfél-nyilvántartások összevonásakor, 2026.09.01.). */
export function codeLabel(code: ExerciseCode) {
  return `${code} ${EXERCISES[code].name}`
}

// "Szintek sorrendje" táblázat a dokumentumból. HNO ≡ LNO és HNN ≡ LNN
// (a dokumentum szerint: "Gyakorlatban összesen 6 féle sorrend"), ezért
// azokat nem tároljuk külön — a sequenceKey függvény erre a 2 kódra képez.
export type SequenceKey = 'LOO' | 'LON' | 'LNO' | 'LNN' | 'HOO' | 'HON'

export const SEQUENCES: Record<SequenceKey, ExerciseCode[]> = {
  LOO: ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08', 'S09', 'S10', 'S11', 'S12', 'S13'],
  LON: ['S01', 'S03', 'A01', 'A02', 'A03', 'S06', 'A04', 'S09', 'A05', 'A06', 'S12', 'S13'],
  LNO: ['S01', 'S02', 'A07', 'A02', 'A03', 'S06', 'S07', 'S08', 'S09', 'S10', 'S11', 'S12', 'S13'],
  LNN: ['S01', 'A07', 'A02', 'A03', 'A03', 'S06', 'A04', 'S09', 'A05', 'A06', 'S12', 'S13'],
  HOO: ['S03', 'S04', 'S05', 'A02', 'A03', 'S01', 'S02', 'S06', 'S07', 'S08', 'S09', 'S10', 'S13'],
  HON: ['S03', 'A01', 'A02', 'A03', 'S12', 'S01', 'A07', 'S06', 'A04', 'S09', 'A05', 'A06', 'S13'],
}

export type ClientVariables = {
  /** Fájdalom helye. */
  painLocation: 'also' | 'felso'
  /** Hason fekvés kivitelezhető-e (pocak / nyaki gerinc probléma). */
  proneOk: boolean
  /** Vállmobilitás: váll feletti kartartás lehetséges-e. */
  shoulderOk: boolean
  /** Térdfájdalom — rá tud-e térdelni (négykézláb helyzetekhez). Ha igen, a négykézláb gyakorlatok kimaradnak. */
  kneePain: boolean
  /** Magas vérnyomás — a checklist "megtartás" paraméterének max. értékét korlátozza, ld. maxHoldSeconds(). */
  highBloodPressure: boolean
}

export function sequenceKey(v: ClientVariables): SequenceKey {
  const first = v.painLocation === 'also' ? 'L' : 'H'
  const second = v.proneOk ? 'O' : 'N'
  const third = v.shoulderOk ? 'O' : 'N'
  const key = `${first}${second}${third}`
  // "HNO megegyezik LNO-val, HNN pedig LNN-el" — a dokumentum szerint.
  if (key === 'HNO') return 'LNO'
  if (key === 'HNN') return 'LNN'
  return key as SequenceKey
}

/** Négykézláb helyzetű gyakorlatok — térdfájdalom esetén ezeket nem csináljuk (Marci, 2026.08.27.). */
const QUADRUPED_CODES: ExerciseCode[] = ['A02', 'A03']

/**
 * Javasolt szint-sorrend a befolyásoló tényezők alapján. Csak javaslat — a GYT felülbírálhatja.
 * Térdfájdalom esetén a négykézláb gyakorlatok (A02, A03) kiszűrve — a dokumentum nem ad helyettesítő
 * gyakorlatot ezekre, ezért egyszerűen kimaradnak, a sorrend ennyivel rövidebb lesz.
 */
export function suggestedSequence(v: ClientVariables): ExerciseCode[] {
  const seq = SEQUENCES[sequenceKey(v)]
  if (!v.kneePain) return seq
  return seq.filter((code) => !QUADRUPED_CODES.includes(code))
}

// --- Checklist-fázishoz (később építendő) — a "Megtartás" paraméter szabálya. ---
// Forrás: Projekt specifikáció.md "Mért paraméterek" + Marci megerősítése (2026.08.27.):
// "10 x 3s, kétnaponta 1s-el tovább, maximum 10s-ig... ha a magas vérnyomás be van kattintva,
// akkor 4s a maximum." Itt csak eltároljuk/dokumentáljuk — a checklist UI-ban lesz felhasználva.
export const HOLD_START_SECONDS = 3
export const HOLD_STEP_SECONDS = 1
export const HOLD_STEP_DAYS = 2

/**
 * A "megtartás" felső korlátja (mp) — magas vérnyomásnál alacsonyabb. A checklist-fázisig
 * (amíg a napi progresszió nincs kiszámolva) az ÜF "szintjeid" oldal ezt NEM számolja ki
 * dinamikusan, csak a statikus kezdőértéket mutatja (ld. Gyakorlatok.tsx), a lépésszabályt
 * pedig egy megjelenő magyarázatban írja le (Marci, 2026.08.29.).
 */

/** A "megtartás" (statikus tartás, mp) paraméter felső korlátja — magas vérnyomásnál alacsonyabb. */
export function maxHoldSeconds(v: Pick<ClientVariables, 'highBloodPressure'>): number {
  return v.highBloodPressure ? 4 : 10
}

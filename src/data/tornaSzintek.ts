// Forrás: "torna szintek.odt" (2026.08.26., Marci — "ez a program központja").
// A leírásoknál szándékosan csak a kiinduló helyzet szerepel — a részletes kivitelezés
// (légzés, izomaktiválás mértéke stb.) nem, az a videóban lesz. Az ismétlésszám és a
// megtartás (ld. lent) az ÜF-felületen egységesített, leegyszerűsített szabály szerint jelenik meg,
// nem az itt szereplő, gyakorlatonként eltérő (mozgásváltozat-számláló) ismétlés-jelöléssel.

export type ExerciseCode =
  | 'S01' | 'S02' | 'S03' | 'S04' | 'S05' | 'S06' | 'S07' | 'S08' | 'S09' | 'S10' | 'S11' | 'S12' | 'S13'
  | 'A01' | 'A02' | 'A03' | 'A04' | 'A05' | 'A06' | 'A07'

type Exercise = { name: string; start: string }

export const EXERCISES: Record<ExerciseCode, Exercise> = {
  S01: { name: 'Háton fekvés, alsó kartartás', start: 'háton fekvés, térdek kb. 90 fokban behajlítva, karok törzs mellett a talajon.' },
  S02: { name: 'Háton fekvés, felső kartartás', start: 'háton fekvés, térdek behajlítva, karok "kezeket fel" tartásban, könyök 90 fokban.' },
  S03: { name: 'Hason fekvés, alsó kartartás', start: 'hason fekvés, homlok alatt alátámasztás, karok törzs mellett.' },
  S04: { name: 'Hason fekvés, felső kartartás', start: 'hason fekvés, karok "kezeket fel" tartásban.' },
  S05: { name: 'Hason fekvés, dinamikus', start: 'hason fekvés, karok törzs mellett.' },
  S06: { name: 'Állva, alsó kartartás', start: 'állva a falnak támaszkodva, karok test mellett lógnak.' },
  S07: { name: 'Állva, felső kartartás', start: 'állva a falnak támaszkodva, karok "kezeket fel" tartásban.' },
  S08: { name: 'Állva, dinamikus', start: 'állva szabadon, karok test mellett lógnak.' },
  S09: { name: 'Ülve falnál, alsó kartartás', start: 'ülve támla nélküli széken, a falnak támaszkodva, karok test mellett lógnak.' },
  S10: { name: 'Ülve falnál, felső kartartás', start: 'ülve a falnak támaszkodva, karok vállmagasságban, könyök 90 fokban.' },
  S11: { name: 'Ülve, dinamikus', start: 'ülve szabadon, magas széken, karok test mellett lógnak.' },
  S12: { name: 'Plank', start: 'alkartámasz, könyök 90 fokban, térdek a padlón.' },
  S13: { name: 'Dinamikus, instabil felszínen', start: 'fitneszlabdán/dynairen ülve vagy állva, illetve négykézláb instabil felszínen.' },
  A01: { name: 'Hason fekvés, dinamikus alsó tartással', start: 'hason fekvés, karok törzs mellett.' },
  A02: { name: 'Négykézláb A', start: 'négykézláb, kezek a váll alatt, térdek csípő alatt.' },
  A03: { name: 'Négykézláb B', start: 'négykézláb, tenyerek egymás felé néznek.' },
  A04: { name: 'Állva, dinamikus alsó tartással', start: 'állva szabadon, karok test mellett lógnak.' },
  A05: { name: 'Ülve, dinamikus alsó tartással', start: 'ülve támla nélküli széken, karok test mellett lógnak.' },
  A06: { name: 'Ülve, dinamikus alsó, előre dőlve', start: 'ülve magas széken, comb előre lejt, karok test mellett lógnak.' },
  A07: { name: 'Háton fekvés, alsó kartartás B', start: 'háton fekvés, karok törzs mellett, kezek a csípőn.' },
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

/** Az ÜF-felületen megjelenő, egységesített ismétlésszám — négykézláb gyakorlatoknál magasabb (Marci, 2026.08.29.). */
export function repCount(code: ExerciseCode): number {
  return QUADRUPED_CODES.includes(code) ? 15 : 10
}

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

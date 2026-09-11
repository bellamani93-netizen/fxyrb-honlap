import { useState } from 'react'
import Icon from '../components/Icon'
import ToggleSwitch from '../components/ToggleSwitch'
import type { GerincterhelesReszlet } from '../components/GerincterhelesKalkulator'
import { withBase } from '../lib/assetUrl'
import { getSessionName } from '../lib/session'
import { useAllapotfelmero } from '../context/AllapotfelmeroContext'
import { BODYCHART_IMAGES, BodyChartMarksLayer } from './Allapotfelmero'
import { calculateAge, calculateBmi, bmiCategory, type BmiCategory } from '../lib/allapotfelmeroEredmeny'

// Az Eredménylap (2026.09.07., Marci kérésére, 2. fázis) — az "allapot
// logika.odt" (Marci saját dokumentuma, NEM a repóban, ld. .gitignore) 13
// sorát dolgozza fel 7 tematikus szakaszra bontva. Design/elrendezés a
// "Minta_hát értékelés.pdf" IHLETÉSÉVEL készült (Marci kifejezett kérése:
// "ne másold, csak használd ötletnek"), de a színek/elemek továbbra is a
// projekt saját design-rendszerét követik (.card-fyb, badge-fyb stb.) — a
// PDF egyetlen betűtípusa/színe/elrendezése sincs átvéve.
// Munkamenet-szintű, mint minden más Context: frissítéskor elvész, nincs
// backend/mentés (Marci megerősítése, A)2. válasz: "rendben").

function fmtHu(n: number, decimals = 1): string {
  const rounded = Math.round(n * 10 ** decimals) / 10 ** decimals
  return rounded.toFixed(decimals).replace('.', ',').replace(/,0$/, '')
}

/** Marci kérésére (2026.09.11.: "ha az előzmények túl hosszú lenne, akkor
 * ezt a két blokkot el lehet rejteni [Mikor kezdődött? / Volt már korábban
 * is?], hiszen valószínűleg leírta részletesen, viszont ha nem írt eleget,
 * akkor jó, ha látszódik") — a küszöböt böngészős méréssel kalibráltam: a
 * legszűkebb asztali nézeten (992×800) is MÁR ÜRES Előzmények mellett is
 * van egy ~12-17px-es, korábbról (108-109. pont) elfogadott maradék
 * görgetés — ez a küszöb nem ezt hivatott megszüntetni, hanem azt
 * akadályozza meg, hogy egy HOSSZÚ, több mondatos/vázlatpontos válasz
 * (amit a mező placeholder-e kifejezetten kér: "vázlatpontokban") a
 * Történet dobozt annyira megnyújtsa, hogy a `align-items:stretch` miatt a
 * MÁSIK 2 oszlopban is nagy, kitöltetlen rés keletkezzen (ld. Design
 * jegyzet korábbi böngészős tesztje). 150 karakter kb. 1-2 rövid mondatnak
 * felel meg — eddig még nem "vázlatpontos" a válasz, utána már valószínűleg
 * igen, és a "Mikor kezdődött?"/"Volt már korábban is?" tartalma ekkorra
 * jó eséllyel úgyis szerepel a szövegben. */
const ELOZMENYEK_HOSSZU_KUSZOB = 150

function SectionCard({
  icon,
  title,
  className,
  order,
  children,
}: {
  icon: string
  title: string
  className?: string
  /** a MOBIL (egyoszlopos, `display:flex`) sorrendet rögzíti a `order`
   * CSS-tulajdonsággal — azért van rá szükség, mert asztalon a kártyák 3,
   * DOM-ban egymástól független magasságú oszlopba csoportosulnak (ld.
   * `.eredmeny-col`, `display:contents` mobilon), így a DOM-sorrend már
   * NEM egyezik a kívánt mobil-sorrenddel. A `order` mindkét kontextusban
   * (a mobil lapos flex-listában ÉS az asztali oszlop-flexekben) a
   * SAJÁT testvérei közötti relatív sorrendet adja meg helyesen, mivel a
   * `display:contents` "átlátszó" a flex-elrendezés szempontjából — a
   * gyerekek mindig a ténylegesen legközelebbi flex-konténerükön belül
   * sorolódnak be a `order` érték szerint (2026.09.09.). A mobil ÉS az
   * asztali sorrend 2026.09.10-től UGYANAZOKKAL az értékekkel fejezhető
   * ki (ld. Eredmenyeim() jegyzetét), ezért nincs többé szükség KÜLÖN
   * mobil/asztali `order`-készletre. */
  order?: number
  children: React.ReactNode
}) {
  return (
    <div
      className={`card-fyb eredmeny-card ${className ?? ''}`}
      style={order !== undefined ? { order } : undefined}
    >
      <div className="eredmeny-card-header">
        <Icon src={icon} />
        <h2 className="eredmeny-card-title">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="eredmeny-info-row">
      <span className="eredmeny-info-label">{label}</span>
      <span className="eredmeny-info-value">{value || '—'}</span>
    </div>
  )
}

// --- félkör-műszer (DialGauge) — a gerincterhelés kalkulátor SAJÁT
// mutatós dial-jának (buildDial/setNeedle, ld. GerincterhelesKalkulator.tsx)
// geometriája, statikus (nem interaktív) React-elemként újraírva: itt egy
// MÁR KISZÁMOLT végeredményt jelenítünk meg egyetlen render-ben, nem élő
// csúszka-bevitelt, ezért nincs szükség a kalkulátor nyers DOM-építő
// megoldására (2026.09.07., Marci kérésére: "mint az eredeti gerincterhelés
// kalkulátorban" — a BMI ÉS a gerincterhelés/aktivitás mutató is ezt kapja).
const DIAL_CX = 100
const DIAL_CY = 100
const DIAL_R_ARC = 82
const DIAL_R_NEEDLE = 64

function dialPolar(r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: DIAL_CX + r * Math.cos(rad), y: DIAL_CY - r * Math.sin(rad) }
}
function dialAngleForValue(v: number, min: number, max: number) {
  const pct = Math.min(1, Math.max(0, (v - min) / (max - min)))
  return 180 - pct * 180
}

function DialGauge({
  value,
  min,
  max,
  zones,
  score,
  unit,
  category,
  categoryColor,
  caption,
  size = 'md',
  onClick,
}: {
  value: number
  min: number
  max: number
  zones: { min: number; max: number; color: string }[]
  score: string
  unit: string
  category: string
  categoryColor?: string
  /** opcionális — ha a dial már egy saját, ugyanezt a nevet viselő kártya-cím
   * alatt jelenik meg (ld. Eredmenyeim() "BMI"/"Gerincterhelés"/"Aktivitási
   * szint" dobozai, 2026.09.07., Marci kérésére), a felirat elhagyható, hogy
   * ne ismétlődjön kétszer ugyanaz a szöveg egy kis dobozon belül. */
  caption?: string
  size?: 'sm' | 'md'
  /** opcionális — a Gerincterhelés/Aktivitási szint dial-ok Marci kérésére
   * (2026.09.11.) kattinthatóvá váltak, az óra-megoszlás popupot nyitják
   * (ld. lent, OraMegoszlasPopup) — a BMI/Intenzitás/Időtartam dial-ok
   * VÁLTOZATLANUL nem interaktívak, mert nincs propjuk. */
  onClick?: () => void
}) {
  const needleRotation = 90 - dialAngleForValue(value, min, max)
  return (
    <div
      className={`eredmeny-dial eredmeny-dial--${size} ${onClick ? 'eredmeny-dial--clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } } : undefined}
    >
      {caption && <span className="eredmeny-dial-caption">{caption}</span>}
      <svg viewBox="-16 -8 232 124" className="eredmeny-dial-svg">
        {zones.map((z, i) => {
          const zmin = Math.max(z.min, min)
          const zmax = Math.min(z.max, max)
          const p1 = dialPolar(DIAL_R_ARC, dialAngleForValue(zmin, min, max))
          const p2 = dialPolar(DIAL_R_ARC, dialAngleForValue(zmax, min, max))
          return <path key={i} d={`M ${p1.x} ${p1.y} A ${DIAL_R_ARC} ${DIAL_R_ARC} 0 0 1 ${p2.x} ${p2.y}`} stroke={z.color} strokeWidth={15} fill="none" />
        })}
        {[min, (min + max) / 2, max].map((v, i) => {
          const p = dialPolar(DIAL_R_ARC + 20, dialAngleForValue(v, min, max))
          return <text key={i} x={p.x} y={p.y + 4} textAnchor="middle" fontSize={10} fontWeight={600} fill="var(--color-text-muted)">{Math.round(v)}</text>
        })}
        <line
          x1={DIAL_CX} y1={DIAL_CY} x2={DIAL_CX} y2={DIAL_CY - DIAL_R_NEEDLE}
          stroke="var(--color-text)" strokeWidth={3.5} strokeLinecap="round"
          transform={`rotate(${needleRotation} ${DIAL_CX} ${DIAL_CY})`}
        />
        <circle cx={DIAL_CX} cy={DIAL_CY} r={7} fill="var(--color-text)" />
      </svg>
      <div className="eredmeny-dial-readout">
        <span className="eredmeny-dial-score">{score}</span>
        <span className="eredmeny-dial-unit">{unit}</span>
      </div>
      <div className="eredmeny-dial-category" style={{ color: categoryColor }}>{category}</div>
    </div>
  )
}

const LOAD_ZONES = [
  { min: -20, max: -15, color: 'var(--z1)' },
  { min: -15, max: -5, color: 'var(--z2)' },
  { min: -5, max: 0, color: 'var(--z3)' },
  { min: 0, max: 10, color: 'var(--z4)' },
  { min: 10, max: 15, color: 'var(--z5)' },
  { min: 15, max: 20, color: 'var(--z6)' },
]
const ACT_ZONES = [
  { min: 0, max: 5, color: 'var(--a1)' },
  { min: 5, max: 10, color: 'var(--a2)' },
  { min: 10, max: 15, color: 'var(--a3)' },
  { min: 15, max: 20, color: 'var(--a4)' },
  { min: 20, max: 25, color: 'var(--a5)' },
]
/** a BMI-sávhoz NEM önálló token-készlet, hanem a meglévő terhelés-skála
 * (--z1..z6) néhány foka újrafelhasználva, U-alakú (piros→zöld→piros)
 * elrendezésben — a "hasonló skálát" kérésnek megfelelően, új színek
 * bevezetése nélkül. */
const BMI_ZONES = [
  { min: 15, max: 18.5, color: 'var(--z2)' },
  { min: 18.5, max: 25, color: 'var(--z6)' },
  { min: 25, max: 30, color: 'var(--z2)' },
  { min: 30, max: 35, color: 'var(--z1)' },
]
const BMI_CATEGORY_COLOR: Record<BmiCategory['key'], string> = {
  sovany: 'var(--z2)',
  optimalis: 'var(--z6)',
  tulsuly: 'var(--z2)',
  elhizas: 'var(--z1)',
}

/** az IDOTARTAM_OPTIONS (Allapotfelmero.tsx) kategorikus válaszai nincsenek
 * konkrét óraszámhoz kötve, ezért mindegyikhez egy jellemző napi óraszámot
 * rendelünk (a sáv középértéke) — ezt mutatja az Időtartam `DialGauge`
 * (2026.09.10-től MINDEN képernyőméreten ez az egy komponens jeleníti meg,
 * a korábbi, csak mobilra szánt `DurationDonut` megszűnt). */
const IDOTARTAM_HOURS: Record<string, number> = {
  'kevesebb, mint 1 óra': 0.5,
  '1–2 óra': 1.5,
  '3–5 óra': 4,
  '6–8 óra': 7,
  'szinte egész nap': 20,
}
/** semleges (nem piros→zöld) egyetlen szín — az időtartamnak nincs
 * "jó/rossz" jelentése, mint pl. a BMI-nek, ezért nem kap zóna-skálát.
 * Marci kérésére (2026.09.09., 4. kör: "a mutatók színskálájához... használj
 * neonszíneket") a korábbi `--color-primary` (téma-függő teal/mint) helyett
 * a többi mutatóval azonos neon-skála egyik fokát (`--z4`, neon türkiz)
 * kapja, hogy vizuálisan egységes maradjon a Mutatók-szekció. */
const DURATION_ZONES = [{ min: 0, max: 24, color: 'var(--z4)' }]
/** az intenzitás dial-jához (2026.09.08., Marci kérésére, "terv.jpg") — a
 * meglévő --z1/--z3/--z6 zóna-színeket újrahasznosítva (enyhe→zöld,
 * közepes→sárga, erős→piros), új szín bevezetése nélkül. */
const INTENSITY_ZONES = [
  { min: 0, max: 3, color: 'var(--z6)' },
  { min: 3, max: 6, color: 'var(--z3)' },
  { min: 6, max: 10, color: 'var(--z1)' },
]

/** Mozgékonyság ikon-rács (2026.09.07., Marci kérésére: "a lehető legtöbb
 * grafikus megjelenítéssel") — a korábbi 4 sima "igen/nem" szöveges sor
 * helyett egy pipa/X/felkiáltójel jelvény + rövid felirat, hogy a 4 válasz
 * egyetlen pillantással áttekinthető legyen. A piros/sárga/zöld jelentés a
 * projekt meglévő, --z1/--z2/--z6 zóna-színskáláját használja (ugyanaz a
 * "hasonló skála" elv, mint a BMI-sávnál), nem vezet be új színt. */
type MobilityState = 'ok' | 'not-ok' | 'caution'
const MOBILITY_STYLE: Record<MobilityState, { color: string; symbol: string }> = {
  ok: { color: 'var(--z6)', symbol: '✓' },
  'not-ok': { color: 'var(--z1)', symbol: '✕' },
  caution: { color: 'var(--z2)', symbol: '!' },
}
function MobilityItem({ label, state }: { label: string; state: MobilityState }) {
  const { color, symbol } = MOBILITY_STYLE[state]
  return (
    <div className="eredmeny-mobility-item">
      <span className="eredmeny-mobility-badge" style={{ background: color }}>{symbol}</span>
      <span className="eredmeny-mobility-label">{label}</span>
    </div>
  )
}

// --- óra-megoszlás körsávdiagram popup (2026.09.11., Marci kérésére: "A
// gerincterhelés, vagy aktivitási szint mutatókra kattintva nyíljon meg egy
// popup, amiben ábrázolva van egy kördiagramon, hogyan töltődik a 24 óra
// [bejelölt válaszok alapján]. A kördiagram körsávdiagram legyen. A
// kördiagram egy körsáv-cikkjére kattintva jelenjen meg a %, a tevékenység
// neve, a konkrét időtartam, és két sáv: a gerincterhelés, és aktivitási
// szint értékek alapján mutassa, hogy ez mennyiben járul hozzá a végső
// eredményhez (+ vagy - hatás)." — 2 döntés Marci választása (rákérdezés
// után, 2026.09.11.): (1) a szeletek EGYEDI tevékenységenként jelennek meg
// (nem az 5 fő kategóriába összevonva); (2) a 2 hozzájárulás-sáv a FŐ
// mutatókkal (Gerincterhelés -20..20, Aktivitási szint 0..25) AZONOS
// léptékben skálázódik, közvetlenül összevethetően velük.
const ORA_GYURU_R = 72
const ORA_GYURU_STROKE = 34
const ORA_GYURU_KERULET = 2 * Math.PI * ORA_GYURU_R
/** apró rés a szomszédos szeletek között (a kerület px-jeiben) — tisztán
 * vizuális tagolás, hogy a szomszédos (esetleg közeli árnyalatú) szeletek
 * határa akkor is látszódjon, ha nincs köztük éles szín-ugrás. */
const ORA_GYURU_RES = 3
/** a kiválasztott szelet ennyivel "húzódik ki" a gyűrűből, a saját
 * középszöge irányában — Marci mutatott egy mintaképet (2026.09.11., egy
 * energiamix-donut widgetről): a kiválasztott cikk kihúzva + derengéssel
 * emelkedik ki, NEM vastagabb vonallal (ahogy korábban itt is volt). */
const ORA_GYURU_KIEMELES = 9

/** minden szelet a forrás-sorrend (a kalkulátor `activities` tömbje, ld.
 * GerincterhelesKalkulator.tsx) szerint egyenletesen elosztott árnyalatot
 * kap — ez garantáltan annyi, egymástól jól megkülönböztethető színt ad,
 * ahány tevékenységet valaki ténylegesen kitöltött, fix palettakészlet
 * nélkül. A 200°-os kezdő eltolás elkerüli a piros/zöld tartományt (a
 * mutatók saját, "rossz/jó" jelentésű --z1/--z6 skálája), hogy a szelet-szín
 * NE keveredjen a hozzájárulás-sávok piros/zöld jelentésével. */
function szeletSzin(i: number, n: number): string {
  const hue = (200 + (i * 360) / Math.max(1, n)) % 360
  return `hsl(${hue}, 62%, 56%)`
}

/** egy hozzájárulás-sáv — a `min..max` a FŐ mutató (Gerincterhelés/
 * Aktivitási szint) teljes tartománya, tehát a sáv hossza/pozíciója
 * közvetlenül összevethető azzal, amit a felhasználó a nagy dial-okon lát.
 * A "0" jelölés a Gerincterhelés-sávnál (szimmetrikus -20..20 tartomány)
 * középen, az Aktivitási szint-sávnál (0..25, mindig ≥0 hozzájárulás) a bal
 * szélen jelenik meg — ugyanaz a képlet mindkét esetben helyesen számolja. */
function OraContribSav({ label, value, min, max, unit }: { label: string; value: number; min: number; max: number; unit: string }) {
  const zeroPct = ((0 - min) / (max - min)) * 100
  const valuePct = ((value - min) / (max - min)) * 100
  const left = Math.min(zeroPct, valuePct)
  const width = Math.abs(valuePct - zeroPct)
  const positive = value >= 0
  const color = positive ? 'var(--z6)' : 'var(--z1)'
  return (
    <div className="ora-contrib">
      <div className="ora-contrib-head">
        <span>{label}</span>
        <span className="ora-contrib-value" style={{ color }}>{positive ? '+' : ''}{fmtHu(value)} {unit}</span>
      </div>
      <div className="ora-contrib-track">
        <div className="ora-contrib-fill" style={{ left: `${left}%`, width: `${width}%`, background: color }} />
        <div className="ora-contrib-zero" style={{ left: `${zeroPct}%` }} />
      </div>
    </div>
  )
}

/** a `reszletek` sorrendjében a `id`-hoz tartozó szelet KUMULATÍV kezdő
 * hányada (0..1) — a gyűrű-rajzolásnál ÉS a kiemelt szelet középszögének
 * (kihúzás iránya) számolásánál is UGYANEZT a sorrendet kell követni, ezért
 * egy helyen, elöl számoljuk ki mindkettőhöz. */
function kumulativHanyadok(reszletek: GerincterhelesReszlet[]): number[] {
  let cumulative = 0
  return reszletek.map((r) => {
    const start = cumulative
    cumulative += r.ora / 24
    return start
  })
}

function OraMegoszlasPopup({ reszletek, onClose }: { reszletek: GerincterhelesReszlet[]; onClose: () => void }) {
  const [kivalasztott, setKivalasztott] = useState<string | null>(reszletek[0]?.id ?? null)
  const aktiv = reszletek.find((r) => r.id === kivalasztott) ?? null
  const kezdoHanyadok = kumulativHanyadok(reszletek)
  return (
    <div className="modal-backdrop-fyb no-print" onClick={onClose}>
      <div className="modal-fyb card-fyb ora-megoszlas-modal" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
        <div className="ora-megoszlas-head">
          <h2 className="h6 mb-0">napi 24 óra megoszlása</h2>
          <button type="button" className="ora-megoszlas-close" onClick={onClose} aria-label="bezárás">✕</button>
        </div>
        {reszletek.length === 0 ? (
          <p className="mb-0" style={{ color: 'var(--color-text-muted)' }}>Nincs kitöltött tevékenység.</p>
        ) : (
          <>
            {/* Marci mintaképe alapján (2026.09.11.: "Az adatok ábrázolásához
               használj ilyen elrendezést a legördülő lista helyett") — a
               gyűrű és a jelmagyarázat EGYMÁS MELLETT (nem egymás alatt,
               nem egy kis görgethető dobozban), a kiválasztott szelet
               KIHÚZVA+derengéssel emelkedik ki a gyűrűből, a jelmagyarázat
               megfelelő sora pedig háttér-kiemelést kap — ugyanaz a
               kiválasztás egyszerre 2 helyen (gyűrű+lista) látszik. */}
            <div className="ora-megoszlas-body">
              <svg viewBox="0 0 200 200" className="ora-gyuru-svg">
                <g transform="rotate(-90 100 100)">
                  {reszletek.map((r, i) => {
                    const frac = r.ora / 24
                    const dash = Math.max(0, frac * ORA_GYURU_KERULET - ORA_GYURU_RES)
                    const gap = ORA_GYURU_KERULET - dash
                    const kezdoHanyad = kezdoHanyadok[i]
                    const offset = -kezdoHanyad * ORA_GYURU_KERULET
                    const active = kivalasztott === r.id
                    const color = szeletSzin(i, reszletek.length)
                    // a szelet KÖZÉPSZÖGE (a gyűrű SAJÁT, forgatás előtti
                    // koordinátarendszerében) adja a kihúzás irányát — a
                    // körüli <g> -90°-os forgatása ezt automatikusan a
                    // helyes végső (képernyős) irányba viszi tovább.
                    const midDeg = (kezdoHanyad + frac / 2) * 360
                    const midRad = (midDeg * Math.PI) / 180
                    const dx = active ? Math.cos(midRad) * ORA_GYURU_KIEMELES : 0
                    const dy = active ? Math.sin(midRad) * ORA_GYURU_KIEMELES : 0
                    return (
                      <circle
                        key={r.id}
                        cx={100}
                        cy={100}
                        r={ORA_GYURU_R}
                        fill="none"
                        stroke={color}
                        strokeWidth={ORA_GYURU_STROKE}
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={offset}
                        transform={active ? `translate(${dx} ${dy})` : undefined}
                        style={active ? { filter: `drop-shadow(0 0 5px ${color})` } : undefined}
                        className="ora-gyuru-szelet"
                        onClick={() => setKivalasztott(r.id)}
                      />
                    )
                  })}
                </g>
                {aktiv && (
                  <>
                    <text x={100} y={94} textAnchor="middle" fontSize={30} fontWeight={800} fill="var(--color-text)">{fmtHu((aktiv.ora / 24) * 100)}%</text>
                    <text x={100} y={116} textAnchor="middle" fontSize={12} fontWeight={600} fill="var(--color-text-muted)">{fmtHu(aktiv.ora)} óra</text>
                  </>
                )}
              </svg>

              <div className="ora-legenda">
                {reszletek.map((r, i) => (
                  <button
                    key={r.id}
                    type="button"
                    className={`ora-legenda-item ${kivalasztott === r.id ? 'is-active' : ''}`}
                    onClick={() => setKivalasztott(r.id)}
                  >
                    <span className="ora-legenda-szin" style={{ background: szeletSzin(i, reszletek.length) }} />
                    <span className="ora-legenda-nev">{r.nev}</span>
                    <span className="ora-legenda-pct">{fmtHu((r.ora / 24) * 100)}%</span>
                  </button>
                ))}
              </div>
            </div>

            {aktiv && (
              <div className="ora-reszlet">
                <OraContribSav label="Gerincterhelésre gyakorolt hatás" value={aktiv.terheles} min={-20} max={20} unit="pont" />
                <OraContribSav label="Aktivitási szintre gyakorolt hatás" value={aktiv.aktivitas} min={0} max={25} unit="pont" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function Eredmenyeim({
  displayName,
  showPrint = false,
}: {
  /** GYT-oldali megjelenítéskor (ld. GytAllapotfelmerok.tsx) a kiválasztott
   * ÜGYFÉL neve — mivel nincs backend, minden más mező (Tünet, mutatók stb.)
   * továbbra is a KÖZÖS, munkamenet-szintű `AllapotfelmeroContext`-ből
   * jön (ugyanaz a demó-adat, akárhonnan nézzük), csak a fejlécben
   * megjelenő NÉV cserélődik a valós ügyfél-nyilvántartásból (2026.09.10.,
   * Marci kérésére: "az eredménylap üf-hez rendelve legyen látható a gyt
   * fiókban is"). Adás esetén a becenév-toldalék elmarad (az a session-
   * szintű ÜF-demóadat része, a GYT-oldali ügyfél-rekordnak nincs ilyen
   * mezője). Az ÜF saját `/eredmenyeim` oldalán nincs megadva — ott a
   * `getSessionName()`-ből jövő névre esik vissza, változatlanul. */
  displayName?: string
  /** a "nyomtatás" gomb — Marci kérésére (2026.09.10.) KIZÁRÓLAG a GYT-
   * oldali nézetben jelenik meg, az ÜF saját "eredményeim" oldaláról
   * törölve (alapértelmezetten `false`). */
  showPrint?: boolean
}) {
  const { adatok } = useAllapotfelmero()
  const [nezet, setNezet] = useState(adatok.bodyChartNezet)
  const imageSrc = withBase(BODYCHART_IMAGES[nezet])
  // az óra-megoszlás popup (2026.09.11., Marci kérésére) — a Gerincterhelés
  // ÉS az Aktivitási szint dial is UGYANAZT a popupot nyitja (mindkét sáv
  // mindig együtt látszik benne, ld. OraMegoszlasPopup), ezért elég 1 boolean.
  const [oraPopupOpen, setOraPopupOpen] = useState(false)

  const teljesNev = displayName ?? getSessionName('Péter')
  const becenev = displayName ? undefined : adatok.megszolitas
  const eletkor = calculateAge(adatok.szuletesiEv, adatok.szuletesiHo)
  const bmi = calculateBmi(adatok.magassag, adatok.suly)
  const bmiCat = bmi !== null ? bmiCategory(bmi) : null

  const rizikoTetelek = adatok.rizikofaktorok

  const gt = adatok.gerincterhelesEredmeny
  const idotartamOra = IDOTARTAM_HOURS[adatok.idotartam] ?? 0

  const bodyChartImg = (
    <>
      <img src={imageSrc} alt="testábra" className="eredmeny-bodychart-hero-img" draggable={false} />
      <BodyChartMarksLayer jelek={adatok.bodyChartJelek} maskSrc={imageSrc} />
    </>
  )
  const nezetToggle = (
    <div className="eredmeny-tunet-nezet no-print">
      <span className="small" style={{ color: 'var(--color-text-muted)' }}>nézet</span>
      <ToggleSwitch checked={nezet === 'rtg'} onChange={(c) => setNezet(c ? 'rtg' : 'hat')} label="nézet váltása hát és röntgen nézet között" />
    </div>
  )
  // nyomtatáskor a kapcsoló (interaktív elem, papíron értelmetlen) helyett
  // egy sima, statikus felirat mutatja, melyik nézet van kiválasztva
  // (2026.09.10., Marci kérésére, 3. fázis: "nyomtatóbarát" A4 összegzés).
  const nezetPrintLabel = <span className="eredmeny-print-only eredmeny-print-nezet">nézet: {nezet === 'rtg' ? 'röntgen' : 'hátulnézet'}</span>

  return (
    <section className="py-3 py-lg-3">
      <div className="container-fluid eredmeny-page-container">
        {/* Fejléc-összegzés (2026.09.09., asztalra; 2026.09.10-től MINDEN
           képernyőméreten ez jelenik meg, a korábbi, csak mobilra szánt
           "eredményeim" cím + külön Alapadatok-doboz helyett — Marci
           kérésére, 2. fázis: "az asztali nézet minden módosítását
           átvesszük"). A kitöltés dátuma asztalon a sáv jobb szélén marad
           (`eredmeny-desktop-only`); mobilon a dátum a lap ALJÁN, a
           dobozok UTÁN jelenik meg (ld. lent, `eredmeny-mobile-only`) —
           ez az EGYETLEN érdemi tartalmi különbség a 2 nézet között, minden
           más (doboz-alak, cím-stílus, neon mutató-színek stb.) közös. */}
        <div className="app-page-header mb-3 mobile-sticky-header">
          <div className="eredmeny-header-summary">
            <div className="eredmeny-header-summary-main">
              <div className="eredmeny-header-summary-name">{becenev ? `${teljesNev} (${becenev})` : teljesNev}</div>
              <div className="eredmeny-header-summary-sub">
                {eletkor !== null ? `${eletkor} év` : '—'}
                <span className="eredmeny-header-summary-sep">·</span>
                {adatok.magassag ? `${adatok.magassag} cm` : '—'}
              </div>
            </div>
            <div className="eredmeny-header-summary-date eredmeny-desktop-only">Kitöltés időpontja: {adatok.kitoltesDatuma ?? '—'}</div>
          </div>
          {/* Marci kérésére (2026.09.10., 3. fázis: "hogyan tudjuk ezeket egy
             A/4-es állított lapra... nyomtatóbarát legyen") — a böngésző
             natív nyomtatását indítja; a gomb maga `no-print`, papíron nem
             jelenik meg. Marci KÉSŐBBI kérésére (ugyanazon a napon: "nyomtatás
             opció csak a gyt fiókban legyen, az üf fiókból töröld") a gomb
             mostantól a `showPrint` prop-tól függ — az ÜF saját
             "eredményeim" oldalán (`showPrint` alapértelmezetten `false`)
             nem jelenik meg, KIZÁRÓLAG a GYT-oldali nézetben (ld.
             GytAllapotfelmerok.tsx). */}
          {showPrint && (
            <button type="button" className="btn-fyb btn-fyb-outline btn-fyb-sm no-print eredmeny-print-btn" onClick={() => window.print()}>
              nyomtatás
            </button>
          )}
        </div>

        {/* A 7 doboz sorrendje 2026.09.10-től UGYANAZZAL a 7 `order`-
           értékkel (1-7) fejezhető ki mind mobilon (lapos, egyoszlopos
           lista), mind asztalon (3, egymástól független magasságú oszlop,
           ld. `.eredmeny-col`) — mert az asztali OSZLOPOK BELSŐ sorrendje
           (bal: Tünet→Rizikó; közép: testábra→Mozgékonyság→Célod; jobb:
           Történet→Életmód) és a Marci által kért MOBIL sorrend (testábra→
           Tünet→Rizikó→Mozgékonyság→Történet→Életmód→Célod) ugyanazzal az
           1-7 sorszámozással egyszerre teljesíthető — nincs szükség két
           külön `order`-készletre. */}
        <div className="eredmeny-cards">
          <div className="eredmeny-col eredmeny-col--left">
            <SectionCard icon="/icons/ikon_kerdoiv.svg" title="Tünet" className="eredmeny-card--lime-border" order={2}>
              <p className="eredmeny-tunet-description">{adatok.tunetLeiras || '—'}</p>
              <div className="eredmeny-tunet-dials">
                {/* Marci kérésére (2026.09.09.: intenzitásnál, majd 4. kör:
                   időtartamnál is) EGYIK dial-nál sincs külön szöveges
                   magyarázat (pl. "erős", "3–5 óra") az érték alatt — a
                   `category` mindkettőnél üresen marad. */}
                <DialGauge
                  value={adatok.intenzitas}
                  min={0}
                  max={10}
                  zones={INTENSITY_ZONES}
                  score={String(adatok.intenzitas)}
                  unit="/10"
                  category=""
                  caption="Intenzitás"
                  size="sm"
                />
                <DialGauge
                  value={idotartamOra}
                  min={0}
                  max={24}
                  zones={DURATION_ZONES}
                  score={fmtHu(idotartamOra)}
                  unit="óra"
                  category=""
                  caption="Időtartam"
                  size="sm"
                />
              </div>
              <div className="eredmeny-tunet-notes">
                <InfoRow label="Jól esik" value={adatok.miEsikJol} />
                <InfoRow label="Trigger" value={adatok.mikorErzedLegjobban} />
              </div>
            </SectionCard>

            <SectionCard icon="/icons/ikon_checklist.svg" title="Rizikó" order={3}>
              {rizikoTetelek.length === 0 ? (
                <p className="mb-0" style={{ color: 'var(--color-text-muted)' }}>Rizikó: -</p>
              ) : (
                <div className="eredmeny-risk-tags">
                  {rizikoTetelek.map((r) => (
                    <span key={r} className="badge-fyb">{r}</span>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          <div className="eredmeny-col eredmeny-col--center">
            {/* Önálló, nagy, doboz nélküli testábra (2026.09.08., Marci
               kérésére: "Bodychart a lehető legnagyobb legyen") — 2026.09.10-
               től MINDEN képernyőméreten önálló elem, a Tünet dobozból
               KIEMELVE (korábban csak asztalon volt így, mobilon a Tünet
               dobozon belül maradt). A nézet-váltó közvetlenül mellette. */}
            <div className="eredmeny-bodychart-hero" style={{ order: 1 }}>
              <div className="eredmeny-bodychart-hero-frame">{bodyChartImg}</div>
              {nezetToggle}
              {nezetPrintLabel}
            </div>

            <SectionCard icon="/icons/ikon_torna.svg" title="Mozgékonyság" order={4}>
              <div className="eredmeny-mobility-grid">
                <MobilityItem label="hason fekvés" state={adatok.proneOk ? 'ok' : 'not-ok'} />
                <MobilityItem
                  label="váll mozgás"
                  state={adatok.shoulderOk === 'igen' ? 'ok' : adatok.shoulderOk === 'nem' ? 'not-ok' : 'caution'}
                />
                <MobilityItem label="nyak" state={adatok.nyakiPanasz ? 'not-ok' : 'ok'} />
                <MobilityItem label="térd" state={adatok.kneePain ? 'not-ok' : 'ok'} />
              </div>
            </SectionCard>

            <SectionCard icon="/icons/ikon_csillag.svg" title="Célod" order={7}>
              <p className="mb-0">{adatok.szemelyesCel || '—'}</p>
            </SectionCard>
          </div>

          <div className="eredmeny-col eredmeny-col--right">
            <SectionCard icon="/icons/ikon_munkafuzet.svg" title="Történet" order={5}>
              {/* új mező (2026.09.11., Marci kérésére: "az eredménylapon a
                 Történet dobozban jelenjen meg az előzmények mező") — a
                 kérdőív 3. (Tünet) lapján felvett szabad szöveg, itt a
                 "Mikor kezdődött?" mellett, azzal tematikusan összetartozva.
                 HOSSZÚ Előzmények-válasz esetén (ld. ELOZMENYEK_HOSSZU_KUSZOB
                 fenti jegyzete, Marci kérésére 2026.09.11.) ez a 2 mező —
                 "Mikor kezdődött?"/"Volt már korábban is?" — ELTŰNIK, mert
                 tartalmilag átfed egy részletes Előzmények-leírással, és a
                 hely felszabadítása megakadályozza, hogy a Történet doboz a
                 `align-items:stretch` miatt a MÁSIK 2 oszlopba is nagy, üres
                 rést "húzzon be". Rövid/üres Előzmények esetén VÁLTOZATLANUL
                 látszik mindkét mező, hiszen akkor önmagában hordoznak
                 információt. */}
              {adatok.elozmenyek.length < ELOZMENYEK_HOSSZU_KUSZOB && (
                <InfoRow label="Mikor kezdődött?" value={adatok.kezdodesIdo} />
              )}
              <InfoRow label="Előzmények" value={adatok.elozmenyek} />
              {adatok.elozmenyek.length < ELOZMENYEK_HOSSZU_KUSZOB && (
                <InfoRow label="Volt már korábban is?" value={adatok.voltMarKorabban} />
              )}
              <InfoRow label="Szerinted mi lehet az oka?" value={adatok.szerintedMiOka} />
            </SectionCard>

            {/* A korábbi, mobilra szánt 3 KÜLÖN (BMI/Gerincterhelés/
               Aktivitási szint) doboz megszűnt — 2026.09.10-től MINDEN
               képernyőméreten ez az EGY, valódi "Életmód" doboz jelenik
               meg, 2 sorral (Marci kérésére, 2026.09.08.: "felül középen
               BMI, lent a másik kettő"). */}
            <SectionCard icon="/icons/ikon_szintek.svg" title="Életmód" order={6}>
              <div className="eredmeny-eletmod-row eredmeny-eletmod-row--top">
                {bmi !== null && bmiCat && (
                  <DialGauge
                    value={bmi}
                    min={15}
                    max={35}
                    zones={BMI_ZONES}
                    score={fmtHu(bmi)}
                    unit="kg/m²"
                    category={bmiCat.label}
                    categoryColor={BMI_CATEGORY_COLOR[bmiCat.key]}
                    caption="BMI"
                    size="sm"
                  />
                )}
              </div>
              {gt !== null && (
                <div className="eredmeny-eletmod-row eredmeny-eletmod-row--bottom">
                  <DialGauge value={gt.totalLoad} min={-20} max={20} zones={LOAD_ZONES} score={fmtHu(gt.totalLoad)} unit="pont" category={gt.loadLabel} categoryColor={gt.loadColor} caption="Gerincterhelés" size="sm" onClick={() => setOraPopupOpen(true)} />
                  <DialGauge value={gt.totalAct} min={0} max={25} zones={ACT_ZONES} score={fmtHu(gt.totalAct)} unit="pont" category={gt.actLabel} categoryColor={gt.actColor} caption="Aktivitási szint" size="sm" onClick={() => setOraPopupOpen(true)} />
                </div>
              )}
            </SectionCard>
          </div>
        </div>

        {/* Kitöltés dátuma — CSAK mobilon, a dobozsor UTÁN, a lap legalján
           (Marci kérésére, 2. fázis: "kitöltés időpontja" a mobil sorrend
           utolsó eleme). Asztalon ugyanez az adat a fejlécben jelenik meg
           (ld. fent, `eredmeny-header-summary-date`). */}
        <div className="eredmeny-footer-date eredmeny-mobile-only">Kitöltés időpontja: {adatok.kitoltesDatuma ?? '—'}</div>
      </div>
      {oraPopupOpen && gt && (
        <OraMegoszlasPopup reszletek={gt.reszletek} onClose={() => setOraPopupOpen(false)} />
      )}
    </section>
  )
}

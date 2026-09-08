import { useState } from 'react'
import Icon from '../components/Icon'
import ToggleSwitch from '../components/ToggleSwitch'
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

function SectionCard({
  icon,
  title,
  className,
  area,
  prominent,
  headerless,
  children,
}: {
  icon: string
  title: string
  className?: string
  /** csak az asztali "bento" rácsban számít (ld. `.eredmeny-cards` CSS,
   * `@media (min-width:992px)`) — a kártya helyét adja meg a rács
   * `grid-template-areas`-ában. Mobilon nincs hatása (a szülő ott
   * `display:flex`, a `grid-area` inline style figyelmen kívül marad).
   * 2026.09.08., Marci kérésére, a 3 fázisú átalakítás 1. (asztali) fázisa. */
  area?: string
  /** a "fontos tartalmak" (Tünet, Rizikó, Mozgékonyság — Marci kérésére,
   * 2026.09.08.) nagyobb, hangsúlyosabb címet kapnak — CSAK asztalon,
   * `.eredmeny-card-header--prominent` osztályon át (ld. CSS). Mobilon
   * nincs hatása, a cím mérete ott változatlan marad. */
  prominent?: boolean
  /** az Alapadatok kártya a "terv.jpg" vázlat szerint asztalon CÍM/DOBOZ
   * nélküli, sima szöveg — a cím szövege (mobilon szükséges) a JSX-ben
   * MARAD, csak `.eredmeny-card--headerless .eredmeny-card-title`-ként
   * el van rejtve `min-width:992px`-től (2026.09.08.). */
  headerless?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={`card-fyb eredmeny-card ${headerless ? 'eredmeny-card--headerless' : ''} ${className ?? ''}`}
      style={area ? { gridArea: area } : undefined}
    >
      <div className={`eredmeny-card-header ${prominent ? 'eredmeny-card-header--prominent' : ''}`}>
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
}) {
  const needleRotation = 90 - dialAngleForValue(value, min, max)
  return (
    <div className={`eredmeny-dial eredmeny-dial--${size}`}>
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

/** kördiagram (2026.09.07., Marci kérésére: "az időtartam kördiagrammal, ahogy
 * a mintában") — az IDOTARTAM_OPTIONS (Allapotfelmero.tsx) kategorikus
 * válaszai nincsenek konkrét óraszámhoz kötve, ezért mindegyikhez egy
 * jellemző napi óraszámot rendelünk (a sáv középértéke), és ennek a
 * 24 órához viszonyított ARÁNYÁT jelenítjük meg a körön. Mobilon ez a
 * `DurationDonut` jeleníti meg, asztalon (a "terv.jpg" vázlat szerint) egy
 * `DialGauge` — a két nézet MOST már eltérő vizuális elemet használ,
 * ezért mindkét komponens megmaradt, ld. lent. */
const IDOTARTAM_HOURS: Record<string, number> = {
  'kevesebb, mint 1 óra': 0.5,
  '1–2 óra': 1.5,
  '3–5 óra': 4,
  '6–8 óra': 7,
  'szinte egész nap': 20,
}
/** semleges (nem piros→zöld) egyetlen szín — az időtartamnak nincs
 * "jó/rossz" jelentése, mint pl. a BMI-nek, ezért nem kap zóna-skálát. */
const DURATION_ZONES = [{ min: 0, max: 24, color: 'var(--color-primary)' }]
/** az intenzitás dial-jához (2026.09.08., Marci kérésére, "terv.jpg") — a
 * meglévő --z1/--z3/--z6 zóna-színeket újrahasznosítva (enyhe→zöld,
 * közepes→sárga, erős→piros), új szín bevezetése nélkül. */
const INTENSITY_ZONES = [
  { min: 0, max: 3, color: 'var(--z6)' },
  { min: 3, max: 6, color: 'var(--z3)' },
  { min: 6, max: 10, color: 'var(--z1)' },
]
function intensityLabel(v: number): string {
  if (v < 3) return 'enyhe'
  if (v < 6) return 'közepes'
  return 'erős'
}
function intensityColor(v: number): string {
  if (v < 3) return 'var(--z6)'
  if (v < 6) return 'var(--z3)'
  return 'var(--z1)'
}

function DurationDonut({ label }: { label: string }) {
  const hours = IDOTARTAM_HOURS[label] ?? 0
  const fraction = Math.min(1, hours / 24)
  const r = 30
  const c = 2 * Math.PI * r
  return (
    <div className="eredmeny-donut">
      <span className="eredmeny-donut-caption">időtartam</span>
      <svg viewBox="0 0 72 72" className="eredmeny-donut-svg">
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--color-border)" strokeWidth="9" />
        <circle
          cx="36" cy="36" r={r} fill="none" stroke="var(--color-primary)" strokeWidth="9"
          strokeDasharray={`${fraction * c} ${c}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
        />
      </svg>
      <span className="eredmeny-donut-value">{label || '—'}</span>
    </div>
  )
}

/** függőleges intenzitás-sáv (2026.09.07., Marci kérésére) — ugyanaz a
 * teal→mint gradiens-logika, mint a vízszintes `.intensity-range`
 * csúszkáé/az Allapotfelmero.tsx 3. lapján, csak alulról felfelé töltve. */
function VerticalIntensityBar({ value }: { value: number }) {
  const pct = (value / 10) * 100
  return (
    <div className="eredmeny-intensity-vertical">
      <span className="eredmeny-intensity-vertical-caption">intenzitás</span>
      <div className="eredmeny-intensity-vertical-track">
        <span className="eredmeny-intensity-vertical-fill" style={{ height: `${pct}%` }} />
      </div>
      <span className="eredmeny-intensity-vertical-value">{value}<small>/10</small></span>
    </div>
  )
}

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

export default function Eredmenyeim() {
  const { adatok } = useAllapotfelmero()
  const [nezet, setNezet] = useState(adatok.bodyChartNezet)
  const imageSrc = withBase(BODYCHART_IMAGES[nezet])

  const teljesNev = getSessionName('Péter')
  const becenev = adatok.megszolitas
  const eletkor = calculateAge(adatok.szuletesiEv, adatok.szuletesiHo)
  const bmi = calculateBmi(adatok.magassag, adatok.suly)
  const bmiCat = bmi !== null ? bmiCategory(bmi) : null

  const rizikoTetelek = [...adatok.rizikofaktorokI, ...adatok.rizikofaktorokII]

  const gt = adatok.gerincterhelesEredmeny
  const idotartamOra = IDOTARTAM_HOURS[adatok.idotartam] ?? 0

  // a testábra+jelölések JSX-e egyszer íródik le, de KÉTSZER kerül a
  // DOM-ba (a Tünet dobozon belül, mobilra — és önállóan, a "terv.jpg"
  // vázlat szerint, asztalra) — ld. .eredmeny-mobile-only/.eredmeny-
  // desktop-only, 2026.09.08. A duplikáció szándékos: Marci kifejezett
  // kérése, hogy a mobil nézethez EBBEN A FÁZISBAN ne nyúljunk, ezért ott
  // a testábra a Tünet dobozon BELÜL kell maradjon, változatlan helyen.
  const bodyChartImg = (
    <>
      <img src={imageSrc} alt="testábra" className="eredmeny-bodychart-large-img" draggable={false} />
      <BodyChartMarksLayer jelek={adatok.bodyChartJelek} maskSrc={imageSrc} />
    </>
  )
  const nezetToggle = (
    <div className="eredmeny-tunet-nezet">
      <span className="small" style={{ color: 'var(--color-text-muted)' }}>nézet</span>
      <ToggleSwitch checked={nezet === 'rtg'} onChange={(c) => setNezet(c ? 'rtg' : 'hat')} label="nézet váltása hát és röntgen nézet között" />
    </div>
  )

  return (
    <section className="py-3 py-lg-3">
      <div className="container-fluid eredmeny-page-container">
        <div className="app-page-header mb-3 mobile-sticky-header">
          <h1 className="app-page-title mb-0">eredményeim</h1>
        </div>

        <div className="eredmeny-cards">
          {/* Alapadatok — mobilon változatlan, saját dobozzal/címmel; asztalon
             (a "terv.jpg" kézzel rajzolt vázlata szerint, 2026.09.08.) cím és
             doboz-keret NÉLKÜLI, sima szöveg, a név/kor/magasság BAL, a
             kitöltés dátuma JOBB oldalon, egy közös, teljes szélességű sávban
             a rács tetején — ld. `headerless` prop + `.eredmeny-alapadatok-
             card` CSS (`display:flex;justify-content:space-between`). */}
          <SectionCard icon="/icons/ikon_fiok.svg" title="Alapadatok" area="alap" headerless className="eredmeny-alapadatok-card">
            <div className="eredmeny-alapadatok-left">
              <div className="eredmeny-alapadatok-name">{becenev ? `${teljesNev} (${becenev})` : teljesNev}</div>
              <div className="eredmeny-alapadatok-sub">{eletkor !== null ? `${eletkor} év` : '—'}</div>
              <div className="eredmeny-alapadatok-sub">{adatok.magassag ? `${adatok.magassag} cm` : '—'}</div>
            </div>
            <div className="eredmeny-alapadatok-date">Kitöltés időpontja: {adatok.kitoltesDatuma ?? '—'}</div>
          </SectionCard>

          {/* Önálló, nagy, doboz nélküli testábra (2026.09.08., Marci
             kérésére, "terv.jpg": "Bodychart a lehető legnagyobb legyen") —
             CSAK asztalon (`.eredmeny-desktop-only`), a Tünet dobozból
             KIEMELVE. Mobilon ez az elem rejtve marad, ott a testábra
             változatlanul a Tünet dobozon belül jelenik meg (lent). */}
          <div className="eredmeny-bodychart-hero eredmeny-desktop-only" style={{ gridArea: 'bodychart' }}>
            <div className="eredmeny-bodychart-hero-frame">{bodyChartImg}</div>
            {nezetToggle}
          </div>

          {/* "Életmód" csoport-fejléc — CSAK asztalon (2026.09.08., Marci
             kérésére: a BMI/Gerincterhelés/Aktivitási szint mostantól EGY
             közös, közös cím alá csoportosított egység, doboz nélkül). A 3
             mutató SAJÁT (mobilon is látható) kártya-címét meghagytuk —
             azok mutatják, melyik dial melyik mutató, az "Életmód" csak a
             csoportot nevezi meg fölöttük. */}
          <div className="eredmeny-group-header eredmeny-desktop-only" style={{ gridArea: 'eletmodhead' }}>Életmód</div>

          <SectionCard icon="/icons/ikon_szintek.svg" title="BMI" area="bmi">
            {bmi !== null && bmiCat ? (
              <div className="eredmeny-dial-row">
                <DialGauge
                  value={bmi}
                  min={15}
                  max={35}
                  zones={BMI_ZONES}
                  score={fmtHu(bmi)}
                  unit="kg/m²"
                  category={bmiCat.label}
                  categoryColor={BMI_CATEGORY_COLOR[bmiCat.key]}
                  size="sm"
                />
              </div>
            ) : (
              <p className="mb-0" style={{ color: 'var(--color-text-muted)' }}>nincs elég adat a számításhoz.</p>
            )}
          </SectionCard>

          <SectionCard icon="/icons/ikon_szintek.svg" title="Gerincterhelés" area="gerinc">
            {gt !== null ? (
              <div className="eredmeny-dial-row">
                <DialGauge value={gt.totalLoad} min={-20} max={20} zones={LOAD_ZONES} score={fmtHu(gt.totalLoad)} unit="pont" category={gt.loadLabel} categoryColor={gt.loadColor} size="sm" />
              </div>
            ) : (
              <p className="mb-0" style={{ color: 'var(--color-text-muted)' }}>a gerincterhelés kalkulátor még nincs kitöltve.</p>
            )}
          </SectionCard>

          <SectionCard icon="/icons/ikon_szintek.svg" title="Aktivitási szint" area="akt">
            {gt !== null ? (
              <div className="eredmeny-dial-row">
                <DialGauge value={gt.totalAct} min={0} max={25} zones={ACT_ZONES} score={fmtHu(gt.totalAct)} unit="pont" category={gt.actLabel} categoryColor={gt.actColor} size="sm" />
              </div>
            ) : (
              <p className="mb-0" style={{ color: 'var(--color-text-muted)' }}>a gerincterhelés kalkulátor még nincs kitöltve.</p>
            )}
          </SectionCard>

          <SectionCard icon="/icons/ikon_kerdoiv.svg" title="Tünet" className="eredmeny-card--lime-border" area="tunet" prominent>
            <p className="eredmeny-tunet-description">{adatok.tunetLeiras || '—'}</p>
            {/* mobilon (változatlanul) a testábra+intenzitás-sáv itt, a Tünet
               dobozon BELÜL jelenik meg — asztalon rejtve, ld. fent az önálló
               `.eredmeny-bodychart-hero`-t. */}
            <div className="eredmeny-tunet-main eredmeny-mobile-only">
              <div className="eredmeny-bodychart-large">{bodyChartImg}</div>
              <VerticalIntensityBar value={adatok.intenzitas} />
            </div>
            <div className="eredmeny-tunet-secondary eredmeny-mobile-only">
              {nezetToggle}
              <DurationDonut label={adatok.idotartam} />
            </div>
            {/* asztalon (2026.09.08., "terv.jpg": két félkör-műszer, mint a
               BMI/Gerincterhelés dial-ok) — ugyanaz a `DialGauge`, amit a
               Mutatók dobozok is használnak. */}
            <div className="eredmeny-tunet-dials eredmeny-desktop-only">
              <DialGauge
                value={adatok.intenzitas}
                min={0}
                max={10}
                zones={INTENSITY_ZONES}
                score={String(adatok.intenzitas)}
                unit="/10"
                category={intensityLabel(adatok.intenzitas)}
                categoryColor={intensityColor(adatok.intenzitas)}
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
                category={adatok.idotartam || '—'}
                caption="Időtartam"
                size="sm"
              />
            </div>
            <div className="eredmeny-tunet-notes">
              <InfoRow label="Jól esik" value={adatok.miEsikJol} />
              <InfoRow label="Trigger" value={adatok.mikorErzedLegjobban} />
            </div>
          </SectionCard>

          <SectionCard icon="/icons/ikon_munkafuzet.svg" title="Történet" area="tortenet">
            <InfoRow label="Mikor kezdődött?" value={adatok.kezdodesIdo} />
            <InfoRow label="Volt már korábban is?" value={adatok.voltMarKorabban} />
            <InfoRow label="Szerinted mi lehet az oka?" value={adatok.szerintedMiOka} />
          </SectionCard>

          <SectionCard icon="/icons/ikon_checklist.svg" title="Rizikó" area="riziko" prominent>
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

          <SectionCard icon="/icons/ikon_torna.svg" title="Mozgékonyság" area="mozgek" prominent>
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

          <SectionCard icon="/icons/ikon_csillag.svg" title="Célod" area="cel">
            <p className="mb-0">{adatok.szemelyesCel || '—'}</p>
          </SectionCard>
        </div>
      </div>
    </section>
  )
}

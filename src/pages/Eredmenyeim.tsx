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
             jelenik meg. */}
          <button type="button" className="btn-fyb btn-fyb-outline btn-fyb-sm no-print eredmeny-print-btn" onClick={() => window.print()}>
            nyomtatás
          </button>
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
              <InfoRow label="Mikor kezdődött?" value={adatok.kezdodesIdo} />
              <InfoRow label="Volt már korábban is?" value={adatok.voltMarKorabban} />
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
                  <DialGauge value={gt.totalLoad} min={-20} max={20} zones={LOAD_ZONES} score={fmtHu(gt.totalLoad)} unit="pont" category={gt.loadLabel} categoryColor={gt.loadColor} caption="Gerincterhelés" size="sm" />
                  <DialGauge value={gt.totalAct} min={0} max={25} zones={ACT_ZONES} score={fmtHu(gt.totalAct)} unit="pont" category={gt.actLabel} categoryColor={gt.actColor} caption="Aktivitási szint" size="sm" />
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
    </section>
  )
}

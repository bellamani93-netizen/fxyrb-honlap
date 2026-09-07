import { useState } from 'react'
import Icon from '../components/Icon'
import ToggleSwitch from '../components/ToggleSwitch'
import { withBase } from '../lib/assetUrl'
import { getSessionName } from '../lib/session'
import { useAllapotfelmero } from '../context/AllapotfelmeroContext'
import { BODYCHART_IMAGES, BodyChartMarksLayer } from './Allapotfelmero'
import { calculateAge, calculateBmi, bmiCategory } from '../lib/allapotfelmeroEredmeny'

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
  children,
}: {
  icon: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="card-fyb eredmeny-card">
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

/** vízszintes, zóna-színezett skála-sáv, jelölő-csíkkal — a gerincterhelés
 * kalkulátor félkör-műszeréhez HASONLÓ (nem azonos) vizuális logika,
 * ugyanazokkal a --z1..z6 zóna-színekkel (2026.09.07., Marci F)13 válasza:
 * "használjuk a gerincterhelés kalkulátoréhoz hasonló skálát"). */
function ScaleGauge({
  value,
  min,
  max,
  zones,
  label,
  labelColor,
  valueText,
}: {
  value: number
  min: number
  max: number
  zones: { to: number; color: string }[]
  label: string
  labelColor?: string
  valueText: string
}) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
  return (
    <div className="eredmeny-gauge">
      <div className="eredmeny-gauge-top">
        <span className="eredmeny-gauge-label" style={{ color: labelColor }}>{label}</span>
        <span className="eredmeny-gauge-value">{valueText}</span>
      </div>
      <div className="eredmeny-gauge-track">
        <div className="eredmeny-gauge-zones">
          {zones.map((z, i) => {
            const from = i === 0 ? min : zones[i - 1].to
            const width = ((Math.min(z.to, max) - Math.max(from, min)) / (max - min)) * 100
            return <span key={i} className="eredmeny-gauge-zone" style={{ width: `${width}%`, background: z.color }} />
          })}
        </div>
        <span className="eredmeny-gauge-marker" style={{ left: `${pct}%` }} />
      </div>
    </div>
  )
}

const LOAD_ZONES = [
  { to: -15, color: 'var(--z1)' },
  { to: -5, color: 'var(--z2)' },
  { to: 0, color: 'var(--z3)' },
  { to: 10, color: 'var(--z4)' },
  { to: 15, color: 'var(--z5)' },
  { to: 20, color: 'var(--z6)' },
]
const ACT_ZONES = [
  { to: 5, color: 'var(--a1)' },
  { to: 10, color: 'var(--a2)' },
  { to: 15, color: 'var(--a3)' },
  { to: 20, color: 'var(--a4)' },
  { to: 25, color: 'var(--a5)' },
]
/** a BMI-sávhoz NEM önálló token-készlet, hanem a meglévő terhelés-skála
 * (--z1..z6) néhány foka újrafelhasználva, U-alakú (piros→zöld→piros)
 * elrendezésben — pontosan a "hasonló skálát" kérésnek megfelelően, új
 * színek bevezetése nélkül. */
const BMI_ZONES = [
  { to: 18.5, color: 'var(--z2)' },
  { to: 25, color: 'var(--z6)' },
  { to: 30, color: 'var(--z2)' },
  { to: 35, color: 'var(--z1)' },
]

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

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 860 }}>
        <div className="app-page-header mb-3 mobile-sticky-header">
          <h1 className="app-page-title mb-0">eredményeim</h1>
        </div>

        <div className="eredmeny-cards">
          <SectionCard icon="/icons/ikon_fiok.svg" title="Alapadatok">
            <InfoRow label="Teljes név" value={becenev ? `${teljesNev} (${becenev})` : teljesNev} />
            <InfoRow label="Életkor" value={eletkor !== null ? `${eletkor} év` : '—'} />
            <InfoRow label="Magasság" value={adatok.magassag ? `${adatok.magassag} cm` : '—'} />
            <InfoRow label="Testsúly" value={adatok.suly ? `${adatok.suly} kg` : '—'} />
            {bmi !== null && bmiCat && (
              <div className="mt-3">
                <ScaleGauge
                  value={bmi}
                  min={15}
                  max={35}
                  zones={BMI_ZONES}
                  label={bmiCat.label}
                  valueText={`BMI ${fmtHu(bmi)}`}
                />
              </div>
            )}
          </SectionCard>

          <SectionCard icon="/icons/ikon_kerdoiv.svg" title="Tünet">
            <div className="eredmeny-tunet-layout">
              <div className="eredmeny-bodychart-mini">
                <img src={imageSrc} alt="testábra" className="eredmeny-bodychart-mini-img" draggable={false} />
                <BodyChartMarksLayer jelek={adatok.bodyChartJelek} maskSrc={imageSrc} />
              </div>
              <div className="eredmeny-bodychart-toggle">
                <span className="small" style={{ color: 'var(--color-text-muted)' }}>nézet</span>
                <ToggleSwitch checked={nezet === 'rtg'} onChange={(c) => setNezet(c ? 'rtg' : 'hat')} label="nézet váltása hát és röntgen nézet között" />
              </div>
            </div>
            <InfoRow label="Tünet: mit érzel?" value={adatok.tunetLeiras} />
            <InfoRow label="Gyakoriság" value={adatok.gyakorisag} />
            <InfoRow label="Időtartam" value={adatok.idotartam} />
            <div className="mt-2 mb-1">
              <div className="eredmeny-gauge-top">
                <span className="eredmeny-gauge-label">Intenzitás</span>
                <span className="eredmeny-gauge-value">{adatok.intenzitas} / 10</span>
              </div>
              <div className="eredmeny-intensity-track">
                <span className="eredmeny-intensity-fill" style={{ width: `${(adatok.intenzitas / 10) * 100}%` }} />
              </div>
            </div>
            <InfoRow label="Jól esik" value={adatok.miEsikJol} />
            <InfoRow label="Trigger" value={adatok.mikorErzedLegjobban} />
          </SectionCard>

          <SectionCard icon="/icons/ikon_munkafuzet.svg" title="Történet">
            <InfoRow label="Mikor kezdődött?" value={adatok.kezdodesIdo} />
            <InfoRow label="Volt már korábban is?" value={adatok.voltMarKorabban} />
            <InfoRow label="Szerinted mi lehet az oka?" value={adatok.szerintedMiOka} />
          </SectionCard>

          <SectionCard icon="/icons/ikon_checklist.svg" title="Rizikó">
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

          <SectionCard icon="/icons/ikon_torna.svg" title="Mozgékonyság">
            <InfoRow label="hason fekvés kemény felületen" value={adatok.proneOk ? 'igen' : 'nem'} />
            <InfoRow
              label="kar váll fölé emelése"
              value={adatok.shoulderOk === 'igen' ? 'igen' : adatok.shoulderOk === 'nem' ? 'nem' : 'igen, de érzékeny'}
            />
            <InfoRow label="nyaki panasz" value={adatok.nyakiPanasz ? 'igen' : 'nem'} />
            <InfoRow label="térdfájdalom" value={adatok.kneePain ? 'van' : 'nincs'} />
          </SectionCard>

          <SectionCard icon="/icons/ikon_csillag.svg" title="Célod">
            <p className="mb-0">{adatok.szemelyesCel || '—'}</p>
          </SectionCard>

          <SectionCard icon="/icons/ikon_szintek.svg" title="Gerincterhelés">
            {gt === null ? (
              <p className="mb-0" style={{ color: 'var(--color-text-muted)' }}>a gerincterhelés kalkulátor még nincs kitöltve.</p>
            ) : (
              <>
                <InfoRow label="Beosztott napi idő" value={`${fmtHu(gt.totalHours)} / 24 óra`} />
                <div className="mt-2 mb-3">
                  <ScaleGauge value={gt.totalLoad} min={-20} max={20} zones={LOAD_ZONES} label={gt.loadLabel} labelColor={gt.loadColor} valueText={`${fmtHu(gt.totalLoad)} pont`} />
                </div>
                <ScaleGauge value={gt.totalAct} min={0} max={25} zones={ACT_ZONES} label={gt.actLabel} labelColor={gt.actColor} valueText={`${fmtHu(gt.totalAct)} pont`} />
              </>
            )}
          </SectionCard>
        </div>
      </div>
    </section>
  )
}

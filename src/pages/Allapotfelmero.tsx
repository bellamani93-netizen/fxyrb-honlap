import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import Chevron from '../components/Chevron'
import Icon from '../components/Icon'
import ToggleSwitch from '../components/ToggleSwitch'
import { withBase } from '../lib/assetUrl'
import {
  useAllapotfelmero,
  type BodyChartHely,
  type BodyChartMeret,
  type BodyChartNezet,
} from '../context/AllapotfelmeroContext'

// Az ÜF fiók legelső, kötelező lépése (2026.09.03., Marci kérésére, 2. fázis
// indítása) — telefonos, egyképernyős, lapozható flow (nem görgetünk, ld.
// Design elemek/bodychart/f1-f11.png látványtervek, iránymutatóként). Ebben a
// körben csak a design/UI készül el: a válaszok logikáját és a generált
// eredménylapot egy KÉSŐBBI fázisban dolgozzuk ki (Marci kérése) — az adatok
// itt csak a Context-ben élnek, mentés/beküldés nem ír vissza semmilyen
// "valós" nyilvántartásba.

const TOTAL_STEPS = 11
/** "mutasd meg" — a body chart lapja: itt nincs cím/alcím és a padding is
 * minimális, hogy a testábra kapja a lehető legtöbb helyet (2026.09.04.,
 * Marci kérésére). */
const BODY_CHART_STEP = 4

const CURRENT_YEAR = new Date().getFullYear()
const BIRTH_YEARS = Array.from({ length: 76 }, (_, i) => String(CURRENT_YEAR - 14 - i))
const MONTHS = [
  'január', 'február', 'március', 'április', 'május', 'június',
  'július', 'augusztus', 'szeptember', 'október', 'november', 'december',
]
const HEIGHTS = Array.from({ length: 71 }, (_, i) => String(140 + i))
const WEIGHTS = Array.from({ length: 121 }, (_, i) => String(40 + i))

const GYAKORISAG_OPTIONS = ['napi szinten', 'heti szinten', 'havi szinten', 'félévente', 'évente', 'néhány évente']
const IDOTARTAM_OPTIONS = ['kevesebb, mint 1 óra', '1–2 óra', '3–5 óra', '6–8 óra', 'szinte egész nap']
const TORTENET_OPTIONS = ['sose', 'volt egyszer', 'volt többször is']

const RIZIKO_I_OPTIONS = [
  'láz', 'rosszullét', 'asztma', 'aktív daganatos betegség', 'korábbi daganatos betegség',
  'magas vérnyomás', 'csontritkulás', 'nem tervezett súlyvesztés',
]
const RIZIKO_II_OPTIONS = [
  'gyomor/bélbetegség', 'láb zsibbadás', 'izomerő gyengülés egyik/mindkét lábban',
  'szívbetegség', 'COPD', 'vizelettartási problémák', 'széklettartási problémák',
]

const STEP_META: Record<number, { title: string; subtitle?: string }> = {
  1: { title: 'Állapotfelmérő kérdőív' },
  2: { title: 'Állapotfelmérő kérdőív', subtitle: 'alap adatok' },
  3: { title: 'Állapotfelmérő kérdőív', subtitle: 'tünetek' },
  4: { title: 'mutasd meg', subtitle: 'jelöld be, hol és mekkora területen érzed a fájdalmat' },
  5: { title: 'Állapotfelmérő kérdőív', subtitle: 'történet' },
  6: { title: 'Állapotfelmérő kérdőív', subtitle: 'néhány további kérdés' },
  7: { title: 'rizikófaktorok I', subtitle: 'van-e ezek közül valamelyik?' },
  8: { title: 'rizikófaktorok II', subtitle: 'van-e ezek közül valamelyik?' },
  9: { title: 'mozgékonyság', subtitle: 'a tornát érintő kérdések — ne csalj! 🙂' },
  10: { title: 'Állapotfelmérő kérdőív', subtitle: 'személyes célod' },
  11: { title: 'gerincterhelés kalkulátor' },
}

function getSessionName(fallback: string): string {
  try {
    const raw = localStorage.getItem('fyb-session')
    if (!raw) return fallback
    const session = JSON.parse(raw) as { name?: string; role?: string }
    return session.role === 'ugyfel' && session.name ? session.name : fallback
  } catch {
    return fallback
  }
}

/** a fejléc (mobilon a hamburger-sáv) tényleges magasságát vonja le a
 * viewportból, hogy a tartalom+lapozó pontosan a maradék helyre férjen,
 * görgetés nélkül (asztalon a topbar `d-lg-none`, tehát 0 magas). */
function useAvailableHeight(): number | undefined {
  const [height, setHeight] = useState<number>()

  useEffect(() => {
    function measure() {
      const topbar = document.querySelector('.app-topbar')
      const topbarHeight = topbar?.getBoundingClientRect().height ?? 0
      setHeight(window.innerHeight - topbarHeight)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  return height
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="form-label fw-bold">{children}</label>
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <div className="mb-4">
      <FieldLabel>{label}</FieldLabel>
      <select className="form-select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="" disabled>válassz</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  hint?: string
}) {
  return (
    <div className="mb-4">
      <FieldLabel>{label}</FieldLabel>
      <input
        type="text"
        className="form-control"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <span className="small d-block mt-1" style={{ color: 'var(--color-text-muted)' }}>{hint}</span>}
    </div>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <div className="mb-3">
      {label && <FieldLabel>{label}</FieldLabel>}
      <textarea
        className="form-control"
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function RiskCheckboxList({
  options,
  selected,
  onToggle,
}: {
  options: string[]
  selected: string[]
  onToggle: (option: string) => void
}) {
  return (
    <div className="risk-checkbox-list">
      {options.map((opt) => {
        const active = selected.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            className={`risk-checkbox-item ${active ? 'is-active' : ''}`}
            onClick={() => onToggle(opt)}
          >
            <span className="risk-checkbox-box">{active && '✓'}</span>
            <span>{opt}</span>
          </button>
        )
      })}
    </div>
  )
}

function TraitToggleRow({
  label,
  value,
  onChange,
  trueLabel,
  falseLabel,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
  trueLabel: string
  falseLabel: string
}) {
  return (
    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <span>{label}</span>
      <div className="auth-tabs auth-tabs-sm flex-shrink-0">
        <button type="button" className={`auth-tab ${value ? 'active' : ''}`} onClick={() => onChange(true)}>{trueLabel}</button>
        <button type="button" className={`auth-tab ${!value ? 'active' : ''}`} onClick={() => onChange(false)}>{falseLabel}</button>
      </div>
    </div>
  )
}

const MERET_LABELS: Record<BodyChartMeret, string> = { pontszeru: 'pontszerű', kis: 'kis terület', nagy: 'nagy terület' }
const HELY_LABELS: Record<BodyChartHely, string> = { kozepen: 'pont középen', ketoldalt: 'kétoldalt', egyikoldalt: 'egyik oldalt' }
const BODYCHART_IMAGES: Record<BodyChartNezet, string> = { hat: '/images/bodychart-hat.png', rtg: '/images/bodychart-rtg.png' }

function MarkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1.3em" height="1.3em" aria-hidden="true">
      <path d="M5 3 L19 12 L12.5 13.2 L15.5 20 L12.8 21.2 L9.8 14.4 L5 19 Z" fill="currentColor" />
    </svg>
  )
}

function BodyChartStep() {
  const { adatok, setAdatok } = useAllapotfelmero()
  const [armed, setArmed] = useState(false)
  const imageSrc = withBase(BODYCHART_IMAGES[adatok.bodyChartNezet])

  // a kattintás a KERETEN (nem a képen) történik, mert a jelöléseket tartó
  // maszk-div a kép TETEJÉN fedi ugyanazt a területet (ld. lent) — a keret
  // mérete viszont pontosan megegyezik a képével (a kép az egyetlen normál-
  // flow gyermeke benne), ezért a számítás változatlan marad.
  function handleFrameClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!armed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setAdatok({ bodyChartJelek: [...adatok.bodyChartJelek, { x, y, meret: adatok.bodyChartMeret }] })
  }

  function removeMark(index: number) {
    setAdatok({ bodyChartJelek: adatok.bodyChartJelek.filter((_, i) => i !== index) })
  }

  return (
    <div className="bodychart-full">
      <div className="bodychart-controls-col">
        <div className="bodychart-view-toggle">
          <span className={adatok.bodyChartNezet === 'hat' ? 'is-active' : ''}>hát</span>
          <ToggleSwitch
            checked={adatok.bodyChartNezet === 'rtg'}
            onChange={(checked) => setAdatok({ bodyChartNezet: checked ? 'rtg' : 'hat' })}
            label="nézet váltása hát és röntgen nézet között"
          />
          <span className={adatok.bodyChartNezet === 'rtg' ? 'is-active' : ''}>röntgen</span>
        </div>

        <div>
          <span className="bodychart-group-label">méret</span>
          <div className="bodychart-btn-group">
            {(Object.keys(MERET_LABELS) as BodyChartMeret[]).map((m) => (
              <button key={m} type="button" className={`auth-tab ${adatok.bodyChartMeret === m ? 'active' : ''}`} onClick={() => setAdatok({ bodyChartMeret: m })}>
                {MERET_LABELS[m]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="bodychart-group-label">hely</span>
          <div className="bodychart-btn-group">
            {(Object.keys(HELY_LABELS) as BodyChartHely[]).map((h) => (
              <button key={h} type="button" className={`auth-tab ${adatok.bodyChartHely === h ? 'active' : ''}`} onClick={() => setAdatok({ bodyChartHely: h })}>
                {HELY_LABELS[h]}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className={`bodychart-pin-btn ${armed ? 'is-armed' : ''}`}
          onClick={() => setArmed((a) => !a)}
          aria-label="jelölés bekapcsolása a testábrán"
          title={armed ? 'koppints az ábrára, ahol fáj — egy meglévő jelre koppintva törölheted.' : 'a gombbal jelölhetsz be területet az ábrán.'}
        >
          <MarkIcon />
        </button>
      </div>

      <div className={`bodychart-frame ${armed ? 'is-armed' : ''}`} onClick={handleFrameClick}>
        <img src={imageSrc} alt="testábra" className="bodychart-img" draggable={false} />
        {/* a jelölések maszkja maga a testábra-kép (alfa-csatorna) — így egy
           folt sose lóghat túl a test kontúrjain, mert ahol a kép átlátszó,
           ott a maszk is elrejti a folt-tartalmat (2026.09.04., Marci
           kérésére). */}
        <div
          className="bodychart-marks-mask"
          style={{ WebkitMaskImage: `url(${imageSrc})`, maskImage: `url(${imageSrc})` }}
        >
          {adatok.bodyChartJelek.map((jel, i) => (
            <button
              key={i}
              type="button"
              className={`bodychart-mark bodychart-mark--${jel.meret}`}
              style={{ left: `${jel.x}%`, top: `${jel.y}%` }}
              onClick={(e) => { e.stopPropagation(); removeMark(i) }}
              aria-label="jelölés törlése"
              title="koppints a törléshez"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function StepContent({ step }: { step: number }) {
  const { adatok, setAdatok } = useAllapotfelmero()
  const displayName = getSessionName('Péter')

  switch (step) {
    case 1:
      return (
        <p className="lead">
          Szia {displayName}! Üdv a FIXYOURBACK fedélzetén. Első lépés: haladj végig az Állapotfelmérő lépésein!
          Minden válaszodnak jelentősége van, a lehető legpontosabban és legtömörebben válaszolj.
        </p>
      )
    case 2:
      return (
        <>
          <TextField label="hogyan szólítsunk" value={adatok.megszolitas} onChange={(v) => setAdatok({ megszolitas: v })} placeholder="pl. Peti" />
          <div className="row gx-3">
            <div className="col-7">
              <SelectField label="születési év" value={adatok.szuletesiEv} onChange={(v) => setAdatok({ szuletesiEv: v })} options={BIRTH_YEARS} />
            </div>
            <div className="col-5">
              <SelectField label="hónap" value={adatok.szuletesiHo} onChange={(v) => setAdatok({ szuletesiHo: v })} options={MONTHS} />
            </div>
          </div>
          <SelectField label="magasságod (cm)" value={adatok.magassag} onChange={(v) => setAdatok({ magassag: v })} options={HEIGHTS} />
          <SelectField label="súlyod (kg)" value={adatok.suly} onChange={(v) => setAdatok({ suly: v })} options={WEIGHTS} />
        </>
      )
    case 3:
      return (
        <>
          <TextField label="mit érzel?" value={adatok.tunetLeiras} onChange={(v) => setAdatok({ tunetLeiras: v })} placeholder="pl. nyilalló fájdalom derékban" hint="max. 15 szó" />
          <SelectField label="gyakoriság" value={adatok.gyakorisag} onChange={(v) => setAdatok({ gyakorisag: v })} options={GYAKORISAG_OPTIONS} />
          <SelectField label="időtartam (óra/nap)" value={adatok.idotartam} onChange={(v) => setAdatok({ idotartam: v })} options={IDOTARTAM_OPTIONS} />
          <div className="mb-2">
            <FieldLabel>intenzitás</FieldLabel>
            <input
              type="range"
              className="form-range"
              min={1}
              max={10}
              value={adatok.intenzitas}
              onChange={(e) => setAdatok({ intenzitas: Number(e.target.value) })}
            />
            <div className="d-flex justify-content-between small" style={{ color: 'var(--color-text-muted)' }}>
              <span>1 — alig érezhető</span>
              <span className="fw-bold" style={{ color: 'var(--color-primary)' }}>{adatok.intenzitas}</span>
              <span>10 — elviselhetetlen</span>
            </div>
          </div>
        </>
      )
    case 5:
      return (
        <>
          <TextField label="mikor kezdődött?" value={adatok.kezdodesIdo} onChange={(v) => setAdatok({ kezdodesIdo: v })} placeholder="pl. kb. 3 hónapja" />
          <SelectField label="volt már ehhez hasonló korábban is?" value={adatok.voltMarKorabban} onChange={(v) => setAdatok({ voltMarKorabban: v })} options={TORTENET_OPTIONS} />
        </>
      )
    case 6:
      return (
        <>
          <TextAreaField label="mi esik jól, amikor fáj?" rows={2} value={adatok.miEsikJol} onChange={(v) => setAdatok({ miEsikJol: v })} placeholder="pl. pihentetés, nyújtás, meleg…" />
          <TextAreaField label="mikor érzed leginkább? (helyzet, mozdulat, napszak)" rows={2} value={adatok.mikorErzedLegjobban} onChange={(v) => setAdatok({ mikorErzedLegjobban: v })} placeholder="helyzet, mozdulat, napszak…" />
          <TextAreaField label="szerinted mi lehet az oka?" rows={2} value={adatok.szerintedMiOka} onChange={(v) => setAdatok({ szerintedMiOka: v })} placeholder="a saját megérzésed is számít" />
        </>
      )
    case 7:
      return (
        <RiskCheckboxList
          options={RIZIKO_I_OPTIONS}
          selected={adatok.rizikofaktorokI}
          onToggle={(opt) => setAdatok({
            rizikofaktorokI: adatok.rizikofaktorokI.includes(opt)
              ? adatok.rizikofaktorokI.filter((o) => o !== opt)
              : [...adatok.rizikofaktorokI, opt],
          })}
        />
      )
    case 8:
      return (
        <RiskCheckboxList
          options={RIZIKO_II_OPTIONS}
          selected={adatok.rizikofaktorokII}
          onToggle={(opt) => setAdatok({
            rizikofaktorokII: adatok.rizikofaktorokII.includes(opt)
              ? adatok.rizikofaktorokII.filter((o) => o !== opt)
              : [...adatok.rizikofaktorokII, opt],
          })}
        />
      )
    case 9:
      return (
        <>
          <TraitToggleRow
            label="fájdalom helye"
            value={adatok.painLocation === 'also'}
            onChange={(v) => setAdatok({ painLocation: v ? 'also' : 'felso' })}
            trueLabel="alsó lumbális"
            falseLabel="felső lumbális / háti"
          />
          <TraitToggleRow label="hason tudsz feküdni" value={adatok.proneOk} onChange={(v) => setAdatok({ proneOk: v })} trueLabel="igen" falseLabel="nem" />
          <TraitToggleRow label="a karodat váll fölé tudod emelni" value={adatok.shoulderOk} onChange={(v) => setAdatok({ shoulderOk: v })} trueLabel="igen" falseLabel="nem" />
          <TraitToggleRow label="van térdfájdalmad (négykézláb helyzetekhez)" value={!adatok.kneePain} onChange={(v) => setAdatok({ kneePain: !v })} trueLabel="nincs" falseLabel="van" />
          <TraitToggleRow label="van magas vérnyomásod" value={!adatok.highBloodPressure} onChange={(v) => setAdatok({ highBloodPressure: !v })} trueLabel="nincs" falseLabel="van" />
          {adatok.highBloodPressure && (
            <p className="small mb-0 mt-2" style={{ color: 'var(--color-text-muted)' }}>
              megjegyzés: magas vérnyomásnál a napi megtartás-idő maximuma 4 mp (a szokásos 10 mp helyett).
            </p>
          )}
        </>
      )
    case 10:
      return <TextAreaField value={adatok.szemelyesCel} onChange={(v) => setAdatok({ szemelyesCel: v })} placeholder="mit szeretnél elérni a programmal?" />
    case 11:
      return (
        <div className="card-fyb text-center py-5" style={{ border: '2px dashed var(--color-border)' }}>
          <Icon src="/icons/ikon_szintek.svg" className="mx-auto mb-3" style={{ width: '2.5rem', height: '2.5rem' }} />
          <p className="mb-0" style={{ color: 'var(--color-text-muted)' }}>
            ide kerül majd a gerincterhelés kalkulátor — a végleges kód beillesztése és design-illesztése egy következő körben történik.
          </p>
        </div>
      )
    default:
      return null
  }
}

export default function Allapotfelmero() {
  const navigate = useNavigate()
  const { complete } = useAllapotfelmero()
  const [step, setStep] = useState(1)
  const availableHeight = useAvailableHeight()
  const meta = STEP_META[step]

  function handleNext() {
    if (step === TOTAL_STEPS) {
      complete()
      navigate('/gyakorlatok')
      return
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1))
  }

  function handlePrev() {
    setStep((s) => Math.max(1, s - 1))
  }

  return (
    <div className="allapotfelmero-shell" style={{ height: availableHeight }}>
      <div
        className={`allapotfelmero-content ${step === TOTAL_STEPS ? 'allapotfelmero-content--scrollable' : ''} ${step === BODY_CHART_STEP ? 'allapotfelmero-content--full' : ''}`}
      >
        {step === BODY_CHART_STEP ? (
          <BodyChartStep />
        ) : (
          <div className="container-fluid" style={{ maxWidth: 560 }}>
            <h1 className="allapotfelmero-title mb-1">{meta.title}</h1>
            {meta.subtitle && <p className="allapotfelmero-subtitle mb-4">{meta.subtitle}</p>}
            <StepContent step={step} />
          </div>
        )}
      </div>

      <div className="allapotfelmero-pager">
        <div className="allapotfelmero-progress">
          <span style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
        </div>
        <div className="allapotfelmero-pager-row">
          <button type="button" className="allapotfelmero-pager-btn" onClick={handlePrev} disabled={step === 1} aria-label="előző lap">
            <Chevron direction="left" />
          </button>
          <span className="allapotfelmero-pager-count">{TOTAL_STEPS}/{step}.</span>
          {step < TOTAL_STEPS ? (
            <button type="button" className="allapotfelmero-pager-btn" onClick={handleNext} aria-label="következő lap">
              <Chevron direction="right" />
            </button>
          ) : (
            <button type="button" className="btn-fyb btn-fyb-highlight allapotfelmero-save-btn" onClick={handleNext}>
              mentés
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

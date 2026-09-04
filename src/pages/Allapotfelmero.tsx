import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import Chevron from '../components/Chevron'
import Icon from '../components/Icon'
import ToggleSwitch from '../components/ToggleSwitch'
import { withBase } from '../lib/assetUrl'
import {
  useAllapotfelmero,
  type BodyChartJel,
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

/** a "mutasd meg" lap gomb-elrendezése/rajzolási módja csak TELEFONOS
 * nézetben más (2026.09.04., Marci kérésére) — a törésponthoz igazítva,
 * ahol a body chart oldalsávja is vált (ld. components.css @media 768px). */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767.98px)').matches)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767.98px)')
    const onChange = () => setIsMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return isMobile
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
/** rövidebb feliratok a mobil popupban, hogy a 3 opció kiférjen egy sorban
 * (2026.09.04., Marci kérésére: "pontszerű, kicsi, nagy"). */
const MOBIL_MERET_LABELS: Record<BodyChartMeret, string> = { pontszeru: 'pontszerű', kis: 'kicsi', nagy: 'nagy' }
const BODYCHART_IMAGES: Record<BodyChartNezet, string> = { hat: '/images/bodychart-hat.png', rtg: '/images/bodychart-rtg.png' }

// a hát és a röntgen kép mostantól PONTOSAN ugyanakkora (ld. Design jegyzet
// 74. pont) — ez a natív pixelméretük, ami egyben a jelölés-SVG viewBox-a is,
// hogy a pontok/vonalak torzítás nélkül, kör/egyenletes vastagságúak legyenek.
const CHART_W = 166
const CHART_H = 529

// 2026.09.04., Marci kérésére: "a rajzolós vonal/pont vastagságok legyenek
// kisebbek, mindegyik a mostani 75%-a" — az előző (9/20/34, ill. 12/22/36)
// értékek 75%-a.
const DOT_RADIUS: Record<BodyChartMeret, number> = { pontszeru: 7, kis: 15, nagy: 26 }
const LINE_WIDTH: Record<BodyChartMeret, number> = { pontszeru: 9, kis: 17, nagy: 27 }
/** a lágy, elmosott szélű hatás 3 egymásra rétegzett, csökkenő átlátszóságú
 * réteggel — ugyanaz a vizuális nyelv pontnál és vonalnál is. */
const SOFT_LAYERS = [
  { scale: 1.9, opacity: 0.16 },
  { scale: 1.4, opacity: 0.32 },
  { scale: 1, opacity: 0.88 },
]

/** szabálytalan, éles kontúrú árnyékfolt a talp alá, hogy a testábra ne
 * "lebegjen" (2026.09.04., Marci kérésére) — sarkos, nem elmosott path. */
function FootShadow() {
  return (
    <svg className="bodychart-foot-shadow" viewBox="0 0 200 34" preserveAspectRatio="none" aria-hidden="true">
      <path d="M6,20 C10,8 34,4 58,9 C80,3 118,2 142,10 C168,5 194,12 196,21 C198,29 170,32 138,30 C104,34 62,33 34,30 C12,31 3,27 6,20 Z" />
    </svg>
  )
}

function MarkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1.3em" height="1.3em" aria-hidden="true">
      <path d="M5 3 L19 12 L12.5 13.2 L15.5 20 L12.8 21.2 L9.8 14.4 L5 19 Z" fill="currentColor" />
    </svg>
  )
}

/** teljes visszafordulást ábrázoló nyíl — a hurok szinte a teljes kört
 * bejárja, a nyílhegy balról indul és balra mutat (2026.09.04., Marci
 * pontosítására — a korábbi ikon csak egy negyed-fordulatot mutatott). */
function UndoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1.2em" height="1.2em" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"
      />
    </svg>
  )
}

/** a jelölések (pontok ÉS húzott vonalak) egységes rétege — egy maszkolt SVG,
 * aminek a mask-image-e maga a testábra-kép, ezért semmi nem lóghat túl a
 * kontúron (ld. korábbi, 2026.09.04-i javítás, ld. Design jegyzet 73. pont). */
function BodyChartMarksLayer({ jelek, maskSrc }: { jelek: BodyChartJel[]; maskSrc: string }) {
  return (
    <svg
      className="bodychart-marks-svg"
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      style={{ WebkitMaskImage: `url(${maskSrc})`, maskImage: `url(${maskSrc})` }}
      aria-hidden="true"
    >
      {jelek.map((jel, i) => {
        if (jel.points.length <= 1) {
          const p = jel.points[0]
          const r = DOT_RADIUS[jel.meret]
          return (
            <g key={i}>
              {SOFT_LAYERS.map((layer, li) => (
                <circle key={li} cx={(p.x / 100) * CHART_W} cy={(p.y / 100) * CHART_H} r={r * layer.scale} style={{ fill: 'var(--symptom-red)' }} opacity={layer.opacity} />
              ))}
            </g>
          )
        }
        const w = LINE_WIDTH[jel.meret]
        const d = jel.points.map((p, pi) => `${pi === 0 ? 'M' : 'L'} ${(p.x / 100) * CHART_W} ${(p.y / 100) * CHART_H}`).join(' ')
        return (
          <g key={i}>
            {SOFT_LAYERS.map((layer, li) => (
              <path key={li} d={d} fill="none" style={{ stroke: 'var(--symptom-red)' }} strokeWidth={w * layer.scale} strokeLinecap="round" strokeLinejoin="round" opacity={layer.opacity} />
            ))}
          </g>
        )
      })}
    </svg>
  )
}

/** mobil popup: méret-választás + felszólítás + "rajzolás" gomb (2026.09.04.,
 * Marci kérésére) — a szokásos modal-mintát követi (ld. MiniKurzusComingSoonModal.tsx). */
function BodyChartSizePopup({
  meret,
  onSelectMeret,
  onStartDrawing,
  onClose,
}: {
  meret: BodyChartMeret
  onSelectMeret: (m: BodyChartMeret) => void
  onStartDrawing: () => void
  onClose: () => void
}) {
  return (
    <div className="modal-backdrop-fyb" onClick={onClose}>
      <div className="modal-fyb card-fyb" style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
        <h2 className="h6 mb-3">tünet mérete</h2>
        <div className="auth-tabs mb-4" style={{ width: '100%' }}>
          {(Object.keys(MOBIL_MERET_LABELS) as BodyChartMeret[]).map((m) => (
            <button
              key={m}
              type="button"
              className={`auth-tab ${meret === m ? 'active' : ''}`}
              style={{ flex: 1 }}
              onClick={() => onSelectMeret(m)}
            >
              {MOBIL_MERET_LABELS[m]}
            </button>
          ))}
        </div>
        <p className="mb-4">Rajzold be az ábrán a legerősebb tüneted helyét!</p>
        <button type="button" className="btn-fyb btn-fyb-highlight w-100" onClick={onStartDrawing}>
          rajzolás
        </button>
      </div>
    </div>
  )
}

function BodyChartStep() {
  const { adatok, setAdatok, addBodyChartStroke, extendLastBodyChartStroke, undoLastBodyChartStroke } = useAllapotfelmero()
  const [armed, setArmed] = useState(false)
  const [popupOpen, setPopupOpen] = useState(false)
  const isMobile = useIsMobile()
  const isDrawingRef = useRef(false)
  const imageSrc = withBase(BODYCHART_IMAGES[adatok.bodyChartNezet])
  const hasMarks = adatok.bodyChartJelek.length > 0

  function pointFromEvent(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
    return { x, y }
  }

  // Telefonon húzással vonal rajzolható (pointermove pontokat gyűjt), asztalon
  // csak koppintás/kattintás számít (a pointermove figyelmen kívül marad) —
  // 2026.09.04., Marci kérésére: "rajzolni pontszerű rákoppintással, és
  // vonalhúzással is lehet" (ez csak telefonos nézetben elérhető funkció).
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!armed) return
    // a capture hibája (pl. nem-elsődleges/szintetikus pointer) ne akadályozza
    // meg magát a jelölés felvételét — húzás közben csak a folyamatos
    // pointermove-követés esne el, ami koppintásnál (1 pontos jel) nem számít.
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // szándékosan elnyelve
    }
    isDrawingRef.current = true
    addBodyChartStroke(adatok.bodyChartMeret, pointFromEvent(e))
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDrawingRef.current || !isMobile) return
    extendLastBodyChartStroke(pointFromEvent(e))
  }

  function handlePointerUp() {
    isDrawingRef.current = false
  }

  return (
    <div className="bodychart-full">
      <div className={`bodychart-frame ${armed ? 'is-armed' : ''}`}>
        {/* a pontosvessző/koordináta-számítás (pointFromEvent) a WRAP saját
           dobozához viszonyít, ami PONTOSAN a kép mérete — a `.bodychart-frame`
           ennél szélesebb is lehet (a gombok-oszlop mellett középre igazítva),
           ezért a kezelők ide, nem a frame-re kerülnek (2026.09.04.). */}
        <div
          className="bodychart-img-wrap"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <FootShadow />
          <img src={imageSrc} alt="testábra" className="bodychart-img" draggable={false} />
          <BodyChartMarksLayer jelek={adatok.bodyChartJelek} maskSrc={imageSrc} />
        </div>
      </div>

      {/* --- asztali gombsor (változatlan elrendezés, ld. Design jegyzet 73-74. pont) --- */}
      <div className="bodychart-controls-col d-none d-lg-flex">
        <div className="bodychart-view-toggle">
          <ToggleSwitch
            checked={adatok.bodyChartNezet === 'rtg'}
            onChange={(checked) => setAdatok({ bodyChartNezet: checked ? 'rtg' : 'hat' })}
            label="nézet váltása hát és röntgen nézet között"
          />
          <span>rtg</span>
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

        <button
          type="button"
          className={`bodychart-pin-btn ${armed ? 'is-armed' : ''}`}
          onClick={() => setArmed((a) => !a)}
          aria-label="jelölés bekapcsolása a testábrán"
          title={armed ? 'koppints vagy húzz az ábrán, ahol fáj.' : 'a gombbal jelölhetsz be területet az ábrán.'}
        >
          <MarkIcon />
        </button>
        {hasMarks && (
          <button type="button" className="circle-icon-btn circle-icon-btn--undo" onClick={undoLastBodyChartStroke} aria-label="utolsó jelölés visszavonása" title="utolsó jelölés visszavonása">
            <UndoIcon />
          </button>
        )}
      </div>

      {/* --- mobil gombsor: nézet fent, "jelöld be" + gomb, popup, visszavonás (2026.09.04., Marci kérésére) --- */}
      <div className="bodychart-controls-col d-flex d-lg-none">
        <div className="bodychart-view-toggle-block">
          <span className="bodychart-group-label">nézet</span>
          <ToggleSwitch
            checked={adatok.bodyChartNezet === 'rtg'}
            onChange={(checked) => setAdatok({ bodyChartNezet: checked ? 'rtg' : 'hat' })}
            label="nézet váltása hát és röntgen nézet között"
          />
        </div>

        <span className="bodychart-group-label">jelöld be</span>
        {/* a "korábbi fázisok" megszokott kör-gombja (ld. SALES/GYT "+" gombok,
           .circle-icon-btn--add), nem az egyedi bodychart-stílus (2026.09.04.,
           Marci kérésére). */}
        <button
          type="button"
          className="circle-icon-btn circle-icon-btn--add"
          onClick={() => setPopupOpen(true)}
          aria-label="tünet bejelölése"
          title="tünet bejelölése"
        >
          <Icon src="/icons/ikon_plusz.svg" />
        </button>
        {hasMarks && (
          <button type="button" className="circle-icon-btn circle-icon-btn--undo" onClick={undoLastBodyChartStroke} aria-label="utolsó jelölés visszavonása" title="utolsó jelölés visszavonása">
            <UndoIcon />
          </button>
        )}
      </div>

      {popupOpen && (
        <BodyChartSizePopup
          meret={adatok.bodyChartMeret}
          onSelectMeret={(m) => setAdatok({ bodyChartMeret: m })}
          onStartDrawing={() => { setArmed(true); setPopupOpen(false) }}
          onClose={() => setPopupOpen(false)}
        />
      )}
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
      <div className="allapotfelmero-progress">
        <span style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
      </div>

      <div className="allapotfelmero-topnav">
        <button type="button" className="allapotfelmero-nav-btn" onClick={handlePrev} disabled={step === 1} aria-label="előző lap">
          <Chevron direction="left" />
        </button>
        {step < TOTAL_STEPS ? (
          <button type="button" className="allapotfelmero-nav-btn" onClick={handleNext} aria-label="következő lap">
            <Chevron direction="right" />
          </button>
        ) : (
          <button type="button" className="allapotfelmero-nav-btn allapotfelmero-nav-btn--save" onClick={handleNext} aria-label="mentés" title="mentés">
            <Icon src="/icons/ikon_pipa.svg" />
          </button>
        )}
      </div>

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
    </div>
  )
}

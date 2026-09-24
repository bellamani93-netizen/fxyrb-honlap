import { useEffect, useRef, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import {
  useChecklist,
  computeHoldSeconds,
  getHoldSecondsForDay,
  SYMPTOM_OPTIONS,
  DURATION_OPTIONS,
  type ChecklistEntry,
  type SymptomDuringExercise,
} from '../context/ChecklistContext'
import { useClients } from '../context/ClientsContext'
import { LOGGED_IN_UF_ID } from '../data/initialClients'
import { suggestedSequence, codeLabel } from '../data/tornaSzintek'
import { intensityColor, intensityGlow, useDarkMode } from '../utils/intensityColor'
import Icon from '../components/Icon'

// ÜF-oldali "checklist" (2026.09.23., Marci kérésére, 5. fázis — ld.
// ChecklistContext.tsx modul-tető jegyzete az egyeztetés részleteiért).
// "Cél: egy olyan, nagyon egyszerűen használható felület, ahova naponta
// tudja az üf követni az állapotát/a torna kivitelezését."
//
// 181. PONT (2026.09.24., Marci kérésére: "A checklist eredményei kártya az
// rendben van, a logikák is rendben, de a beviteli mező nem jó.
// Újrakészítjük nulláról.") — a napi BEVITELI ŰRLAP (`DailyForm` + a
// `Checklist()` fejléce) TELJES ÚJRATERVEZÉSE, Marci szó szerinti
// diktálása alapján. A diagramok (`ChecklistCharts`) és a mögöttes logika
// VÁLTOZATLAN maradt ("a checklist eredményei kártya... rendben van") —
// csak a `SYMPTOM_OPTIONS`/`DURATION_OPTIONS` új értékkészletéhez lettek
// igazítva (ld. ChecklistContext.tsx).
//
// Egyeztetés (AskUserQuestion, kódírás előtt): (1) az "edzés rögzítése"
// gomb TÖBBSZÖR is megnyomható egy napon belül (marad az edzésenkénti
// tünet-jelölés + halmozott oszlop-diagram); (2) a szint-váltás egy kis
// "⋯" menü mögött marad a fejlécben; (3) a "nem hajolós nap" lett a
// csúszka LÁTHATÓ címe (a "terhelés optimalizálás" csak a diagram
// címében/adatmodellben él tovább, a napi űrlapon nem jelenik meg).
//
// SAJÁT DÖNTÉS (nem volt explicit diktálva, de nem is mond ellent semminek):
// az űrlap mostantól MINDIG szerkeszthető állapotban van (nincs külön
// "szerkesztés" mód / csak-olvasható összegző nézet) — a mai bejegyzés,
// ha van, egyszerűen előre kitöltve jelenik meg, és a "Mentés" bármikor
// újra elmenthető. Ez elhagyja a korábbi `editing`/`showEditor` állapotot
// és a hozzá tartozó render-crash-elhárítást (ami eleve csak azért kellett,
// mert a nézetek közt kellett váltani) — egyszerűbb, kevesebb mozgó rész.

const SYMPTOM_LABELS: Record<string, string> = Object.fromEntries(SYMPTOM_OPTIONS.map((o) => [o.value, o.label]))

/** "1 szint = 2 hetes ciklus" (Projekt specifikáció) — a szintenkénti
 * diagramok X-tengelye MINDIG a teljes, 14 napos idősávot fogja át (a szint
 * kezdő dátumától), akkor is, ha még csak néhány nap van kitöltve. A `null`
 * értékű napok (még be nem következett/ki nem töltött napok) a diagramon
 * egyszerűen kihagyott pontként/hiányzó oszlopként jelennek meg. */
function last14Days(startDate: string): string[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

type ChartPoint = {
  date: string
  intenzitas: number | null
  idotartam: number | null
  terheles: number | null
  edzes: number | null
  holdSeconds: number | null
  workouts: SymptomDuringExercise[] | null
}

function TrainingTooltip({
  active,
  payload,
  show,
}: {
  active?: boolean
  payload?: { payload: ChartPoint }[]
  /** csak a ténylegesen hoverelt diagramon jelenjen meg a popup, a többi
   * (csak a `syncId` miatt "aktív") diagramon ne — ld. `ChecklistCharts`
   * `hoveredChart` jegyzete. */
  show: boolean
}) {
  if (!show || !active || !payload?.length) return null
  const point = payload[0].payload
  if (point.edzes === null) return null
  const symptomatic = (point.workouts ?? []).filter((w) => w !== 'nem')
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        fontSize: 12,
        padding: '0.4rem 0.6rem',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      <div className="fw-bold mb-1">{point.date}</div>
      <div>edzések száma: {point.edzes}</div>
      {point.holdSeconds !== null && <div>megtartás: {point.holdSeconds} mp</div>}
      <div>
        tünet:{' '}
        {symptomatic.length === 0
          ? 'nem'
          : (point.workouts ?? [])
              .map((w, i) => (w === 'nem' ? null : `${i + 1}. edzés: ${SYMPTOM_LABELS[w]}`))
              .filter(Boolean)
              .join(', ')}
      </div>
    </div>
  )
}

/** a diagramok szinkronizált, egységes (lime, világító) kurzor-vonala —
 * a Bar diagramtól kapott `x`/`width`/`height` propokból a sáv KÖZEPÉN, a
 * Line diagramoktól kapott `points`-ból a pontok x-koordinátáján. */
function SyncCursor(props: { points?: { x: number; y: number }[]; x?: number; y?: number; width?: number; height?: number }) {
  const { points, x, y, width, height } = props
  let cx: number | undefined
  let top = 0
  let bottom = 0
  if (points && points.length > 0) {
    cx = points[0].x
    top = Math.min(...points.map((p) => p.y))
    bottom = Math.max(...points.map((p) => p.y))
  } else if (typeof x === 'number' && typeof width === 'number' && typeof y === 'number' && typeof height === 'number') {
    cx = x + width / 2
    top = y
    bottom = y + height
  }
  if (cx === undefined) return null
  return (
    <line
      x1={cx}
      y1={top}
      x2={cx}
      y2={bottom}
      stroke="var(--lime)"
      strokeWidth={2}
      style={{ filter: 'drop-shadow(0 0 4px var(--lime))' }}
    />
  )
}

/** a két vonaldiagram (tünet-intenzitás/időtartam, terhelés-optimalizálás)
 * saját tooltip-komponense — a beépített Recharts-tooltip helyett, hogy a
 * `show` gátat (csak a ténylegesen hoverelt diagramon jelenjen meg) ide is
 * be lehessen kötni. */
function LineTooltip({
  active,
  payload,
  label,
  show,
}: {
  active?: boolean
  payload?: { name?: string; value?: number | string; color?: string }[]
  label?: string
  show: boolean
}) {
  if (!show || !active || !payload?.length) return null
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        fontSize: 12,
        padding: '0.4rem 0.6rem',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      <div className="fw-bold mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  )
}

// a diagram-blokk közös a GYT csak-olvasható nézetével (ld.
// GytChecklist.tsx) — kézzel rajzolt SVG helyett a `recharts` könyvtárral.
export function ChecklistCharts({
  entries,
  levelStartDate,
  holdSecondsFor,
}: {
  entries: ChecklistEntry[]
  /** ha meg van adva, a diagramok a TELJES 14 napos szint-idősávot mutatják
   * (ld. `last14Days`) — "ezen a szinten" nézetben adjuk át. */
  levelStartDate?: string
  /** az adott nap/szint TÉNYLEGES (esetleg felülbírált) megtartás-idejét
   * adja vissza. */
  holdSecondsFor: (date: string, level: number) => number
}) {
  const byDate = new Map(entries.map((e) => [e.date, e]))
  const dates = levelStartDate ? last14Days(levelStartDate) : [...entries.map((e) => e.date)].sort()
  const maxWorkouts = Math.max(1, ...entries.map((e) => e.workouts.length))
  const data: ChartPoint[] = dates.map((date) => {
    const e = byDate.get(date)
    return {
      date: date.slice(5).replace('-', '.'),
      intenzitas: e ? e.symptomIntensity : null,
      idotartam: e ? e.symptomDurationHours : null,
      terheles: e ? e.loadOptimization : null,
      edzes: e ? e.workouts.length : null,
      holdSeconds: e ? holdSecondsFor(e.date, e.level) : null,
      workouts: e ? e.workouts : null,
    }
  })
  const hasAnyData = entries.length > 0

  // csak a ténylegesen hoverelt diagramon jelenjen meg a popup — a `syncId`
  // a `active`/`payload` állapotot IS szinkronizálja mindhárom diagram
  // közt, ezért önmagában az nem különbözteti meg, hogy a felhasználó
  // ténylegesen EZEN a diagramon áll-e.
  const [hoveredChart, setHoveredChart] = useState<'edzes' | 'tunet' | 'terheles' | null>(null)

  if (!hasAnyData) {
    return (
      <p className="small mb-0" style={{ color: 'var(--color-text-muted)' }}>
        még nincs rögzített nap ebben a körben.
      </p>
    )
  }

  const SYNC_ID = 'checklist-charts'
  const AXIS_WIDTH = 34
  const AXIS_PADDING = 14
  const BAR_SIZE = 20

  return (
    <div className="checklist-charts-group">
      <div className="checklist-chart-block">
        <span className="small fw-bold d-block mb-2" style={{ color: 'var(--color-primary)' }}>
          edzésnapok
        </span>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart
            data={data}
            syncId={SYNC_ID}
            onMouseEnter={() => setHoveredChart('edzes')}
            onMouseLeave={() => setHoveredChart(null)}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              scale="point"
              padding={{ left: AXIS_PADDING, right: AXIS_PADDING }}
              tick={{ fontSize: 11 }}
              stroke="var(--color-text-muted)"
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" width={AXIS_WIDTH} />
            <Tooltip content={<TrainingTooltip show={hoveredChart === 'edzes'} />} cursor={<SyncCursor />} />
            {Array.from({ length: maxWorkouts }, (_, slotIdx) => (
              <Bar
                key={slotIdx}
                dataKey={(d: ChartPoint) => (d.workouts && slotIdx < d.workouts.length ? 1 : null)}
                stackId="a"
                barSize={BAR_SIZE}
                radius={slotIdx === maxWorkouts - 1 ? [4, 4, 0, 0] : undefined}
              >
                {data.map((d, i) => (
                  <Cell key={i} fill={d.workouts && d.workouts[slotIdx] && d.workouts[slotIdx] !== 'nem' ? 'var(--z2)' : 'var(--z4)'} />
                ))}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="checklist-chart-block">
        <span className="small fw-bold d-block mb-2" style={{ color: 'var(--color-primary)' }}>
          tünet intenzitása (0-10) és időtartama (óra)
        </span>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart
            data={data}
            syncId={SYNC_ID}
            onMouseEnter={() => setHoveredChart('tunet')}
            onMouseLeave={() => setHoveredChart(null)}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              padding={{ left: AXIS_PADDING, right: AXIS_PADDING }}
              tick={{ fontSize: 11 }}
              stroke="var(--color-text-muted)"
            />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" width={AXIS_WIDTH} />
            <Tooltip content={<LineTooltip show={hoveredChart === 'tunet'} />} cursor={<SyncCursor />} />
            <Line type="monotone" dataKey="intenzitas" name="intenzitás" stroke="var(--z1)" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="idotartam" name="időtartam (óra)" stroke="var(--z2)" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="checklist-chart-block">
        <span className="small fw-bold d-block mb-2" style={{ color: 'var(--color-primary)' }}>
          terhelés optimalizálás (%)
        </span>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart
            data={data}
            syncId={SYNC_ID}
            onMouseEnter={() => setHoveredChart('terheles')}
            onMouseLeave={() => setHoveredChart(null)}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              padding={{ left: AXIS_PADDING, right: AXIS_PADDING }}
              tick={{ fontSize: 11 }}
              stroke="var(--color-text-muted)"
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" width={AXIS_WIDTH} />
            <Tooltip content={<LineTooltip show={hoveredChart === 'terheles'} />} cursor={<SyncCursor />} />
            <Line type="monotone" dataKey="terheles" name="terhelés optimalizálás" stroke="var(--z4)" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/** "a 'X mp'-re kattintva módosítható legyen egy legördülő menüben (csak
 * ugyanakkora, vagy kisebb másodperc választható, min. 1-ig)" — `maxSeconds`
 * MINDIG a számított, felülbírálás NÉLKÜLI "javasolt" érték. */
function HoldSecondsEditor({ seconds, maxSeconds, onChange }: { seconds: number; maxSeconds: number; onChange: (v: number) => void }) {
  const [editing, setEditing] = useState(false)
  if (editing) {
    return (
      <select
        className="form-select form-select-sm d-inline-block"
        style={{ width: 'auto', fontSize: '1.25rem', fontWeight: 800, color: 'var(--lime)' }}
        autoFocus
        value={seconds}
        onChange={(e) => {
          onChange(Number(e.target.value))
          setEditing(false)
        }}
        onBlur={() => setEditing(false)}
      >
        {Array.from({ length: maxSeconds }, (_, i) => i + 1).map((s) => (
          <option key={s} value={s}>
            {s} mp
          </option>
        ))}
      </select>
    )
  }
  return (
    <button
      type="button"
      className="btn btn-link p-0"
      style={{ color: 'var(--lime)', fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.2, textDecoration: 'none' }}
      onClick={() => setEditing(true)}
    >
      {seconds} mp
    </button>
  )
}

/** "a szint-váltás egy kis '⋯' menü mögé kerüljön a fejlécben" —
 * kattintásra nyíló/csukódó panel, dokumentum-szintű `mousedown`
 * figyeléssel záródik, ha máshova kattintunk. */
function LevelMenu({
  currentLevel,
  maxLevel,
  onPrevious,
  onNext,
}: {
  currentLevel: number
  maxLevel: number
  onPrevious: () => void
  onNext: () => void
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleOutsideClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [open])

  if (currentLevel <= 1 && currentLevel >= maxLevel) return null

  return (
    <div className="checklist-level-menu-wrap" ref={wrapRef}>
      <button
        type="button"
        className="checklist-level-menu-toggle"
        aria-label="szint műveletek"
        onClick={() => setOpen((o) => !o)}
      >
        ⋯
      </button>
      {open && (
        <div className="checklist-level-menu">
          {currentLevel > 1 && (
            <button
              type="button"
              className="btn-fyb btn-fyb-outline btn-fyb-sm"
              onClick={() => {
                onPrevious()
                setOpen(false)
              }}
            >
              előző szint
            </button>
          )}
          {currentLevel < maxLevel && (
            <button
              type="button"
              className="btn-fyb btn-fyb-outline btn-fyb-sm"
              onClick={() => {
                onNext()
                setOpen(false)
              }}
            >
              következő szint kezdése
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/** "Alatta csúszka, mint az állapotfelmérőben" / "mint a gerincterhelés
 * kalkulátorban... a csúszka fölött középen írja ki az értéket, mint az
 * intenzitás csúszkán" (181. pont) — mindkét csúszka UGYANAZT a
 * "nagy szám középen a sáv fölött" elrendezést kapja, csak a kitöltés
 * színe tér el: `dynamicColor` (intenzitás, `intensityColor()`-ból) VAGY
 * `gradient` (nem hajolós nap, fix teal→mint) — a kettő kölcsönösen
 * kizárja egymást. */
function CenteredSlider({
  label,
  value,
  min,
  max,
  valueText,
  valueColor,
  gradient,
  glow,
  captions,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  valueText: string
  valueColor: string
  gradient?: [string, string]
  glow?: string
  captions?: [string, string]
  onChange: (v: number) => void
}) {
  const pct = ((value - min) / (max - min)) * 100
  const fillFrom = gradient ? gradient[0] : valueColor
  const fillTo = gradient ? gradient[1] : valueColor
  return (
    <div className="mb-3">
      <span className="small fw-bold d-block mb-1">{label}</span>
      <div className="text-center mb-1">
        <span className="fw-bold" style={{ color: valueColor, fontSize: '1.75rem', lineHeight: 1 }}>
          {valueText}
        </span>
      </div>
      <input
        type="range"
        className="intensity-range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background: `linear-gradient(to right, ${fillFrom} 0%, ${fillTo} ${pct}%, var(--color-border) ${pct}%, var(--color-border) 100%)`,
          boxShadow: glow,
        }}
      />
      {captions && (
        <div className="d-flex justify-content-between small" style={{ color: 'var(--color-text-muted)' }}>
          <span>{captions[0]}</span>
          <span>{captions[1]}</span>
        </div>
      )}
    </div>
  )
}

function DailyForm({ clientId, initial }: { clientId: string; initial: ChecklistEntry | undefined }) {
  const { saveTodayEntry } = useChecklist()
  const dark = useDarkMode()
  const [workouts, setWorkouts] = useState<SymptomDuringExercise[]>(initial?.workouts ?? [])
  const [durationHours, setDurationHours] = useState(initial?.symptomDurationHours ?? 0)
  const [intensity, setIntensity] = useState(initial?.symptomIntensity ?? 0)
  const [load, setLoad] = useState(initial?.loadOptimization ?? 50)

  function handleAddWorkout() {
    setWorkouts((w) => [...w, 'nem'])
  }
  function handleWorkoutChange(index: number, symptom: SymptomDuringExercise) {
    setWorkouts((w) => w.map((s, i) => (i === index ? symptom : s)))
  }
  function handleRemoveWorkout(index: number) {
    setWorkouts((w) => w.filter((_, i) => i !== index))
  }
  function handleSave() {
    saveTodayEntry(clientId, { workouts, symptomDurationHours: durationHours, symptomIntensity: intensity, loadOptimization: load })
  }

  return (
    <div>
      {/* "edzés rögzítése, mellette kör alapon pipa ikon. Ezt megnyomva:
         edzés rögzítve, és felugrik egy kérdés: volt közben tünet?..." (181.
         pont, Marci szó szerinti diktálása) — a `.circle-icon-btn--success`
         + `ikon_pipa.svg` már meglévő, más oldalakon (pl. hívás-részletek
         "rendben" gombja) is használt mintája. A gomb TÖBBSZÖR is
         megnyomható egy napon belül (egyeztetés, AskUserQuestion) — minden
         nyomás egy ÚJ, "nem" alapértelmezésű edzést ad a listához, saját,
         azonnal módosítható tünet-legördülővel. */}
      <div className="d-flex align-items-center gap-3 mb-3">
        <span className="fw-bold">{workouts.length === 0 ? 'edzés rögzítése' : 'edzés rögzítve'}</span>
        <button type="button" className="circle-icon-btn circle-icon-btn--success" aria-label="edzés rögzítése" onClick={handleAddWorkout}>
          <Icon src="/icons/ikon_pipa.svg" />
        </button>
      </div>

      {workouts.length > 0 && (
        <div className="mb-3">
          {workouts.map((symptom, i) => (
            <div key={i} className="d-flex align-items-center gap-2 mb-2">
              <span className="small" style={{ minWidth: 0, flex: workouts.length > 1 ? '0 0 auto' : '0 0 auto' }}>
                {workouts.length > 1 ? `${i + 1}. edzés — volt közben tünet?` : 'volt közben tünet?'}
              </span>
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={symptom}
                onChange={(e) => handleWorkoutChange(i, e.target.value as SymptomDuringExercise)}
              >
                {SYMPTOM_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {workouts.length > 1 && (
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0"
                  style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
                  aria-label={`${i + 1}. edzés törlése`}
                  onClick={() => handleRemoveWorkout(i)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn-fyb btn-fyb-outline btn-fyb-sm" onClick={handleAddWorkout}>
            + még egy edzés
          </button>
        </div>
      )}

      {/* "Mai tünetek" (181. pont) — a nap EGÉSZÉNEK tünet-állapota, nem
         csak a gyakorlat közbeni (ld. korábbi egyeztetés: "ez másra kérdez
         rá" — az itteni Időtartam/Intenzitás mindig releváns, akkor is, ha
         nem volt edzés aznap). */}
      <h3 className="h6 mt-4 mb-3">Mai tünetek</h3>

      <div className="mb-3">
        <span className="small fw-bold d-block mb-1">időtartam</span>
        <select className="form-select" value={durationHours} onChange={(e) => setDurationHours(Number(e.target.value))}>
          {DURATION_OPTIONS.map((o) => (
            <option key={o.label} value={o.hours}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <CenteredSlider
        label="intenzitás"
        value={intensity}
        min={0}
        max={10}
        valueText={String(intensity)}
        valueColor={intensityColor(intensity, dark)}
        glow={intensityGlow(intensity, dark)}
        captions={['0 — semmi', '10 — max. intenzitás']}
        onChange={setIntensity}
      />

      {/* "nem hajolós nap" — a "terhelés optimalizálás" csúszka ÚJ,
         látható címe (181. pont, Marci döntése) — a gerincterhelés
         kalkulátor teal→mint gradiense, de az intenzitás csúszka
         elrendezésével (nagy szám középen, a sáv fölött). */}
      <CenteredSlider
        label="nem hajolós nap"
        value={load}
        min={0}
        max={100}
        valueText={`${load}%`}
        valueColor="var(--teal)"
        gradient={['var(--teal)', 'var(--mint)']}
        onChange={setLoad}
      />

      <div className="checklist-save-spacer" />
      <div className="checklist-save-bar">
        <button type="button" className="btn-fyb btn-fyb-primary" onClick={handleSave}>
          Mentés
        </button>
      </div>
    </div>
  )
}

export default function Checklist() {
  const { clients } = useClients()
  const client = clients.find((c) => c.id === LOGGED_IN_UF_ID)!
  const { getState, getTodayEntry, advanceLevel, previousLevel, setHoldOverride } = useChecklist()
  const sequence = suggestedSequence(client.variables)
  const maxLevel = sequence.length
  const state = getState(client.id)
  const currentCode = sequence[state.currentLevel - 1]
  const todayEntry = getTodayEntry(client.id)
  const [scope, setScope] = useState<'szint' | 'teljes'>('szint')

  const todayISOStr = new Date().toISOString().slice(0, 10)
  const recommendedHoldSeconds = computeHoldSeconds(state.levelStartDate, todayISOStr, client.variables)
  const actualHoldSeconds = getHoldSecondsForDay(state, todayISOStr, state.currentLevel, client.variables)
  const holdSecondsFor = (date: string, level: number) => getHoldSecondsForDay(state, date, level, client.variables)
  const visibleEntries = scope === 'szint' ? state.entries.filter((e) => e.level === state.currentLevel) : state.entries
  const visibleLevelStartDate = scope === 'szint' ? state.levelStartDates[state.currentLevel] : undefined

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 720 }}>
        <div className="app-page-header mb-3 mobile-sticky-header">
          <h1 className="app-page-title mb-0">checklist</h1>
        </div>

        {/* "Fejléc: sötétszürke, benne a szint neve, és a megtartás ideje
           lime színnel (a szám nagyobb legyen, mint a szöveg többi része)"
           (181. pont, Marci szó szerinti diktálása) — a `.card-fyb` saját
           paddingja itt 0-ra állítva (a fejléc teljes szélességben,
           kártya-padding NÉLKÜL fut ki), a tartalom egy külön, saját
           paddingú blokkba kerül alá. */}
        <div className="card-fyb mb-4" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="checklist-daily-header">
            <div className="d-flex align-items-start justify-content-between gap-2">
              <span className="checklist-daily-header-level">
                {state.currentLevel}. szint{' '}
                {currentCode && <span className="checklist-daily-header-code">— {codeLabel(currentCode)}</span>}
              </span>
              <LevelMenu
                currentLevel={state.currentLevel}
                maxLevel={maxLevel}
                onPrevious={() => previousLevel(client.id)}
                onNext={() => advanceLevel(client.id, maxLevel)}
              />
            </div>
            <div>
              <HoldSecondsEditor
                seconds={actualHoldSeconds}
                maxSeconds={recommendedHoldSeconds}
                onChange={(v) => setHoldOverride(client.id, todayISOStr, state.currentLevel, v)}
              />
              <span className="checklist-daily-header-unit"> / gyakorlat</span>
            </div>
          </div>

          <div className="p-4">
            {todayEntry && <span className="badge-fyb mb-3 d-inline-block">✓ mai nap rögzítve</span>}
            <DailyForm key={state.currentLevel} clientId={client.id} initial={todayEntry} />
          </div>
        </div>

        <div className="card-fyb">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <h2 className="h6 mb-0">eredményeim</h2>
            <div className="auth-tabs auth-tabs-sm">
              <button type="button" className={`auth-tab ${scope === 'szint' ? 'active' : ''}`} onClick={() => setScope('szint')}>
                ezen a szinten
              </button>
              <button type="button" className={`auth-tab ${scope === 'teljes' ? 'active' : ''}`} onClick={() => setScope('teljes')}>
                teljes időszak
              </button>
            </div>
          </div>
          <ChecklistCharts entries={visibleEntries} levelStartDate={visibleLevelStartDate} holdSecondsFor={holdSecondsFor} />
        </div>
      </div>
    </section>
  )
}

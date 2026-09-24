import { useState } from 'react'
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
  DURATION_STEPS,
  type ChecklistEntry,
  type SymptomDuringExercise,
} from '../context/ChecklistContext'
import { useClients } from '../context/ClientsContext'
import { LOGGED_IN_UF_ID } from '../data/initialClients'
import { suggestedSequence, codeLabel } from '../data/tornaSzintek'
import { intensityColor, intensityGlow, useDarkMode } from '../utils/intensityColor'

// ÜF-oldali "checklist" (2026.09.23., Marci kérésére, 5. fázis — ld.
// ChecklistContext.tsx modul-tető jegyzete az egyeztetés részleteiért).
// "Cél: egy olyan, nagyon egyszerűen használható felület, ahova naponta
// tudja az üf követni az állapotát/a torna kivitelezését. Ezt szintenként
// könnyen érthető, látványos diagramokon lehet látni."
//
// 172. PONT (2026.09.24., Marci kérésére) — 9 további finomítás: a
// megtartás-idő szövege + kézi felülbírálása, a szint-név külön sávban, a
// "edzés megvolt"/"tünet edzés közben" egymás mellett, a két csúszka
// stílusa az állapotfelmérőből ill. a gerincterhelés kalkulátorból, a 3
// diagram vizuális egyesítése (szinkronizált kurzor), a megtartás-idő
// kiírása a tooltipben, egy "előző szint" gomb, és az extra edzések
// EDZÉSENKÉNTI tünet-jelölése (halmozott oszlop-diagram).

function formatDurationLabel(hours: number) {
  if (hours === 0) return 'nincs'
  if (hours < 1) return `${Math.round(hours * 60)} perc`
  return `${hours} óra`
}

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
  /** "ha az edzésnapoknál van az egerem, akkor csak az ottani popup
   * látszódjon, a másik kettő nem" (173. pont javítása, 2026.09.24.) — a
   * `syncId` (171-172. pont) a kurzor-VONALAT és a `active`/`payload`
   * állapotot IS szinkronizálja mindhárom diagram közt, tehát önmagában az
   * `active` nem különbözteti meg, hogy a felhasználó ténylegesen EZEN a
   * diagramon áll-e. A `show` a ténylegesen hoverelt diagramot jelző, a
   * szülő (`ChecklistCharts`) saját `onMouseEnter`/`onMouseLeave`
   * eseményeiből számolt állapotból jön — csak akkor `true`, ha a kurzor
   * TÉNYLEGESEN ezen a diagramon van. */
  show: boolean
}) {
  if (!show || !active || !payload?.length) return null
  const point = payload[0].payload
  if (point.edzes === null) return null
  const symptomatic = (point.workouts ?? []).filter((w) => w !== 'nincs')
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
          ? 'nincs'
          : (point.workouts ?? [])
              .map((w, i) => (w === 'nincs' ? null : `${i + 1}. edzés: ${SYMPTOM_LABELS[w]}`))
              .filter(Boolean)
              .join(', ')}
      </div>
    </div>
  )
}

/** "A kurzor legyen egységes, ugyanúgy nézzen ki mind3 sorban" (172. pont
 * javítása, 2026.09.24.) — a Recharts alapértelmezett kurzor-rajzolása
 * DIAGRAMTÍPUSONKÉNT eltér: az oszlopdiagram (Bar) egy SZÉLES, szürke
 * kitöltésű téglalapot rajzol (az egész napi sáv szélességében), a
 * vonaldiagramok (Line) viszont egy VÉKONY, függőleges vonalat — emiatt a 3,
 * `syncId`-vel összekötött diagram kurzora vizuálisan NEM egyezett. Ez a
 * közös, kézzel rajzolt kurzor-komponens MINDHÁROM diagramon (Bar ÉS
 * mindkét Line) ugyanazt a vonalat rajzolja — a Bar diagramtól kapott
 * `x`/`width`/`height` propokból a sáv KÖZEPÉN, a Line diagramoktól kapott
 * `points`-ból pedig a pontok x-koordinátáján. "A kurzor a mostani
 * szaggatott helyett egy világító lime egybe csík legyen" (2026.09.24.,
 * Marci kérésére) — tömör (nem szaggatott), `--lime` színű, `drop-shadow`
 * SVG-szűrővel adott derengéssel. */
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

/** A két vonaldiagram (tünet-intenzitás/időtartam, terhelés-optimalizálás)
 * korábban a Recharts BEÉPÍTETT, `contentStyle`-lal színezett tooltipjét
 * használta — ez nem tudta figyelembe venni, hogy MELYIK diagramon áll
 * ténylegesen a kurzor (ld. `TrainingTooltip` `show` jegyzete), ezért egy
 * saját, a beépítettel azonos megjelenésű komponensre cserélve, hogy a
 * `show` gátat ide is be lehessen kötni. */
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

function Slider({
  label,
  valueLabel,
  value,
  min,
  max,
  step,
  color,
  gradient,
  glow,
  onChange,
}: {
  label: string
  valueLabel: string
  value: number
  min: number
  max: number
  step: number
  color: string
  /** ha meg van adva, a kitöltött szakasz KÉT-SZÍNŰ (bal→jobb) átmenet
   * (pl. a gerincterhelés kalkulátor teal→mint gradiense) egyetlen `color`
   * helyett. */
  gradient?: [string, string]
  glow?: string
  onChange: (v: number) => void
}) {
  const pct = ((value - min) / (max - min)) * 100
  const fillFrom = gradient ? gradient[0] : color
  const fillTo = gradient ? gradient[1] : color
  return (
    <div className="mb-3">
      <div className="d-flex align-items-center justify-content-between mb-1">
        <span className="small fw-bold">{label}</span>
        <span className="small fw-bold" style={{ color }}>
          {valueLabel}
        </span>
      </div>
      <input
        type="range"
        className="intensity-range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background: `linear-gradient(to right, ${fillFrom} 0%, ${fillTo} ${pct}%, var(--color-border) ${pct}%, var(--color-border) 100%)`,
          boxShadow: glow,
        }}
      />
    </div>
  )
}

// a diagram-blokk közös a GYT csak-olvasható nézetével (ld.
// GytChecklist.tsx) — kézzel rajzolt SVG helyett a `recharts` könyvtárral.
// "Mindig az aktuális szint adatai grafikonon; opcionálisan a teljes
// időszak is megnézhető" (Projekt specifikáció) — ld. a hívó oldal `scope`
// váltóját.
export function ChecklistCharts({
  entries,
  levelStartDate,
  holdSecondsFor,
}: {
  entries: ChecklistEntry[]
  /** ha meg van adva, a diagramok a TELJES 14 napos szint-idősávot mutatják
   * (ld. `last14Days`) — "ezen a szinten" nézetben adjuk át. "Teljes
   * időszak" (több szint együtt) nézetben elhagyjuk, ott a tényleges
   * bejegyzések természetes szélessége marad. */
  levelStartDate?: string
  /** az adott nap/szint TÉNYLEGES (esetleg felülbírált) megtartás-idejét
   * adja vissza — a hívó (Checklist.tsx/GytChecklist.tsx) építi fel a
   * `getHoldSecondsForDay`-ből, mert ahhoz `ClientVariables` és a teljes
   * checklist-állapot kell, amit a diagram-komponens maga nem ismer. */
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

  // "ha az edzésnapoknál van az egerem, akkor csak az ottani popup
  // látszódjon, a másik kettő nem" (173. pont javítása, 2026.09.24.) —
  // melyik diagramon áll TÉNYLEGESEN a kurzor (nem csak melyiknél a
  // `syncId` szerint "aktív" az index, ami mindhárman egyszerre igaz).
  const [hoveredChart, setHoveredChart] = useState<'edzes' | 'tunet' | 'terheles' | null>(null)

  if (!hasAnyData) {
    return (
      <p className="small mb-0" style={{ color: 'var(--color-text-muted)' }}>
        még nincs rögzített nap ebben a körben.
      </p>
    )
  }

  // Marci kérésére (2026.09.24., 172. pont): "az eredményeim doboz 3
  // grafikonja legyen vizuálisan egyben... amikor a kurzort mozgatjuk akkor
  // az egyszerre mindhárom grafikonon az adott napnál legyen" — a `syncId`
  // a Recharts beépített, több diagram közötti KURZOR-szinkronizálása
  // (nincs kézzel írt esemény-összekötés), az azonos `YAxis width` pedig
  // garantálja, hogy a 3 diagram rajzolt területe (és így a napok oszlopai)
  // pontosan egymás alatt legyenek. A POPUP (tooltip-kártya) viszont a
  // fenti javítás óta CSAK a ténylegesen hoverelt diagramon jelenik meg
  // (ld. `hoveredChart` + a `TrainingTooltip`/`LineTooltip` `show` propja)
  // — a kurzor-VONAL marad szinkronban mindhárom diagramon, csak a kártya
  // nem tud egyszerre 3 helyen felugrani.
  const SYNC_ID = 'checklist-charts'
  const AXIS_WIDTH = 34

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
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" width={AXIS_WIDTH} />
            {/* "ha tünet gyakorlat közben, akkor az aznapi edzés váltson
               narancssárgára (alapértelmezetten türkiz legyen)" — mostantól
               EDZÉSENKÉNT (halmozott oszlop-szegmensenként) színezve, nem a
               teljes napi oszlopra egyben (172. pont). */}
            <Tooltip content={<TrainingTooltip show={hoveredChart === 'edzes'} />} cursor={<SyncCursor />} />
            {Array.from({ length: maxWorkouts }, (_, slotIdx) => (
              <Bar
                key={slotIdx}
                dataKey={(d: ChartPoint) => (d.workouts && slotIdx < d.workouts.length ? 1 : null)}
                stackId="a"
                radius={slotIdx === maxWorkouts - 1 ? [4, 4, 0, 0] : undefined}
              >
                {data.map((d, i) => (
                  <Cell key={i} fill={d.workouts && d.workouts[slotIdx] && d.workouts[slotIdx] !== 'nincs' ? 'var(--z2)' : 'var(--z4)'} />
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
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" />
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
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" width={AXIS_WIDTH} />
            <Tooltip content={<LineTooltip show={hoveredChart === 'terheles'} />} cursor={<SyncCursor />} />
            <Line type="monotone" dataKey="terheles" name="terhelés optimalizálás" stroke="var(--z4)" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/** "A napi másodperc megtartást... a 'X mp'-re kattintva módosítható legyen
 * egy legördülő menüben (csak ugyanakkora, vagy kisebb másodperc
 * választható, min. 1-ig)" (172. pont) — `maxSeconds` MINDIG a számított,
 * felülbírálás NÉLKÜLI "javasolt" érték (nem az aktuális, esetleg már
 * lejjebb állított érték), hogy a választék minden alkalommal újra a teljes
 * [1, javasolt] tartományt kínálja. */
function HoldSecondsEditor({ seconds, maxSeconds, onChange }: { seconds: number; maxSeconds: number; onChange: (v: number) => void }) {
  const [editing, setEditing] = useState(false)
  if (editing) {
    return (
      <select
        className="form-select form-select-sm d-inline-block"
        style={{ width: 'auto', fontSize: '1.1rem', fontWeight: 800, color: 'var(--lime)' }}
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
      style={{ color: 'var(--lime)', fontSize: '2rem', fontWeight: 800, lineHeight: 1.2, textDecoration: 'none' }}
      onClick={() => setEditing(true)}
    >
      {seconds} mp
    </button>
  )
}

/** "Ha még egy edzést hozzáadok, akkor megint lehessen jelölni, hogy volt-e
 * közben tünet" (172. pont, Marci egyeztetés utáni döntése: a teljes 7
 * opciós legördülő, azonnali, megerősítendő inline választóval). */
function AddWorkoutButton({ clientId }: { clientId: string }) {
  const { addWorkout } = useChecklist()
  const [picking, setPicking] = useState(false)
  const [symptom, setSymptom] = useState<SymptomDuringExercise>('nincs')

  if (picking) {
    return (
      <div className="d-flex align-items-center gap-2 flex-wrap">
        <select
          className="form-select form-select-sm"
          style={{ width: 'auto' }}
          value={symptom}
          onChange={(e) => setSymptom(e.target.value as SymptomDuringExercise)}
        >
          {SYMPTOM_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn-fyb btn-fyb-primary btn-fyb-sm"
          onClick={() => {
            addWorkout(clientId, symptom)
            setPicking(false)
            setSymptom('nincs')
          }}
        >
          hozzáadás
        </button>
        <button type="button" className="btn-fyb btn-fyb-outline btn-fyb-sm" onClick={() => setPicking(false)}>
          mégse
        </button>
      </div>
    )
  }

  return (
    <button type="button" className="btn-fyb btn-fyb-outline btn-fyb-sm" onClick={() => setPicking(true)}>
      még egy edzést hozzáadok
    </button>
  )
}

function DailyForm({
  clientId,
  initial,
  onSaved,
}: {
  clientId: string
  initial: ChecklistEntry | undefined
  onSaved: () => void
}) {
  const { saveTodayEntry } = useChecklist()
  const dark = useDarkMode()
  const [trained, setTrained] = useState(initial?.trained ?? false)
  const [symptom, setSymptom] = useState<SymptomDuringExercise>(initial?.workouts[0] ?? 'nincs')
  const [durationIdx, setDurationIdx] = useState(() => {
    const idx = DURATION_STEPS.indexOf(initial?.symptomDurationHours ?? 0)
    return idx === -1 ? 0 : idx
  })
  const [intensity, setIntensity] = useState(initial?.symptomIntensity ?? 0)
  const [load, setLoad] = useState(initial?.loadOptimization ?? 50)

  function handleSave() {
    saveTodayEntry(clientId, {
      trained,
      symptom,
      symptomDurationHours: DURATION_STEPS[durationIdx],
      symptomIntensity: intensity,
      loadOptimization: load,
    })
    onSaved()
  }

  return (
    <div>
      {/* "'Edzés megvolt' 'tünet edzés közben' - ezek egymás mellett
         legyenek" (172. pont) — `flex-wrap`-pel keskeny (mobil) nézetben
         szükség esetén továbbra is 2 sorba törhet. */}
      <div className="d-flex flex-wrap align-items-start gap-3 mb-3">
        <label className="d-flex align-items-center gap-2 pt-1" style={{ cursor: 'pointer', flex: '0 0 auto' }}>
          <input type="checkbox" checked={trained} onChange={(e) => setTrained(e.target.checked)} />
          <span className="fw-bold">edzés megvolt</span>
        </label>
        <div style={{ flex: '1 1 200px' }}>
          <span className="small fw-bold d-block mb-1">tünet gyakorlat közben</span>
          <select className="form-select" value={symptom} onChange={(e) => setSymptom(e.target.value as SymptomDuringExercise)}>
            {SYMPTOM_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Slider
        label="tünet napi időtartama"
        valueLabel={formatDurationLabel(DURATION_STEPS[durationIdx])}
        value={durationIdx}
        min={0}
        max={DURATION_STEPS.length - 1}
        step={1}
        color="var(--z2)"
        onChange={setDurationIdx}
      />

      {/* "Tünet napi intenzitása csúszka legyen olyan, mint az
         állapotfelmérőben a tünet intenzitása csúszka" (172. pont) — a
         nagy, középre igazított, dinamikusan színezett szám a csúszka
         FÖLÖTT, majd a csúszka maga (a `--z1` fix szín helyett
         `intensityColor`-ból jövő, folytonos zöld→sötétvörös
         interpolációval, 9-10-nél piros derengéssel), és min/max
         szövegek — pontosan az Allapotfelmero.tsx `IntensityRange`
         mintáját követve (a színskála-logikát innentől közösen, a
         `src/utils/intensityColor.ts` modulból veszi mindkét hely). */}
      <div className="mb-3">
        <div className="d-flex align-items-center justify-content-between mb-1">
          <span className="small fw-bold">tünet napi intenzitása</span>
        </div>
        <div className="text-center mb-1">
          <span className="fw-bold" style={{ color: intensityColor(intensity, dark), fontSize: '1.75rem', lineHeight: 1 }}>
            {intensity}
          </span>
        </div>
        <input
          type="range"
          className="intensity-range"
          min={0}
          max={10}
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, ${intensityColor(intensity, dark)} 0%, ${intensityColor(intensity, dark)} ${(intensity / 10) * 100}%, var(--color-border) ${(intensity / 10) * 100}%, var(--color-border) 100%)`,
            boxShadow: intensityGlow(intensity, dark),
          }}
        />
        <div className="d-flex justify-content-between small" style={{ color: 'var(--color-text-muted)' }}>
          <span>0 — semmi</span>
          <span>10 — max. intenzitás</span>
        </div>
      </div>

      {/* "Terhelés optimalizálás csúszka legyen olyan, mint a
         gerincterhelés kalkulátor csúszkái" (172. pont) — a kalkulátor
         saját `--grad-start`/`--grad-end` (teal→mint) fix, két-színű
         gradiense a kitöltött szakaszon (a korábbi, egyszínű `--z4`
         helyett). */}
      <Slider
        label="terhelés optimalizálás"
        valueLabel={`${load}%`}
        value={load}
        min={0}
        max={100}
        step={1}
        color="var(--teal)"
        gradient={['var(--teal)', 'var(--mint)']}
        onChange={setLoad}
      />

      <button type="button" className="btn-fyb btn-fyb-primary" onClick={handleSave}>
        Rögzítés
      </button>
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
  const [editing, setEditing] = useState(!todayEntry)
  const [scope, setScope] = useState<'szint' | 'teljes'>('szint')

  // "Következő szint kezdése" ÚJ szintre vált, aminek a mai napja még
  // üres (`todayEntry` `undefined`-ra vált). A puszta `editing` STATE ezt
  // csak egy `useEffect`-tel tudná utólag, a COMMIT UTÁN korrigálni — de a
  // render már A RÉGI `editing=false` érték mellett, `todayEntry`
  // hiányában próbálná kiolvasni `todayEntry!.trained`-ot, ami ÖSSZEOMLIK,
  // mielőtt az effект egyáltalán lefutna. Ezért a ténylegesen megjelenített
  // "szerkesztő nézet"-et SZINKRON, származtatott értékként számoljuk: ha
  // nincs mai bejegyzés az AKTUÁLIS szinthez, MINDIG a szerkesztő nézet
  // jelenik meg, függetlenül a state-től.
  const showEditor = editing || !todayEntry

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

        <div className="card-fyb mb-4">
          {/* "A szint neve legfelül külön szürke sávban" (172. pont) — a
             kártya TETEJÉN, teljes szélességben kitöltő, elkülönített sáv;
             ide kerültek a szint-váltó gombok is (előző/következő). */}
          <div className="checklist-level-bar">
            <span className="fw-bold">
              {state.currentLevel}. szint{' '}
              {currentCode && <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>— {codeLabel(currentCode)}</span>}
            </span>
            <div className="d-flex gap-2">
              {state.currentLevel > 1 && (
                <button type="button" className="btn-fyb btn-fyb-outline btn-fyb-sm" onClick={() => previousLevel(client.id)}>
                  előző szint
                </button>
              )}
              {state.currentLevel < maxLevel && (
                <button type="button" className="btn-fyb btn-fyb-outline btn-fyb-sm" onClick={() => advanceLevel(client.id, maxLevel)}>
                  következő szint kezdése
                </button>
              )}
            </div>
          </div>

          {/* "Mai javasolt megtartási idő"-re módosítjuk a szöveget... a
             'X mp'-re kattintva módosítható legyen" (172. pont). */}
          <div className="mb-3">
            <span className="small d-block" style={{ color: 'var(--color-text-muted)' }}>
              mai javasolt megtartási idő
            </span>
            <span>
              <HoldSecondsEditor
                seconds={actualHoldSeconds}
                maxSeconds={recommendedHoldSeconds}
                onChange={(v) => setHoldOverride(client.id, todayISOStr, state.currentLevel, v)}
              />
              <span className="small" style={{ color: 'var(--color-text-muted)' }}>
                {' '}
                / gyakorlat
              </span>
            </span>
          </div>

          {showEditor ? (
            <DailyForm key={state.currentLevel} clientId={client.id} initial={todayEntry} onSaved={() => setEditing(false)} />
          ) : (
            <div>
              <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                <span className="badge-fyb">✓ mai nap rögzítve</span>
                <span className="small" style={{ color: 'var(--color-text-muted)' }}>
                  {todayEntry!.trained ? 'edzés megvolt' : 'ma nem volt edzés'}
                  {todayEntry!.workouts.length > 1 && ` (+${todayEntry!.workouts.length - 1} további edzés)`}
                </span>
              </div>
              {/* "a mégegy edzést hozzáadok-nál, ha rákattintok, akkor
                 eltűnik a szerkesztés gomb" (172. pont javítása,
                 2026.09.24.) — a két vezérlő korábban EGY közös
                 `flex-wrap` sorban élt, ahol a "még egy edzést hozzáadok"
                 kattintás utáni, szélesebb (legördülő + 2 gomb) nézete
                 kitolta/eltüntette a "szerkesztés" gombot. Mostantól két
                 KÜLÖN sor — a "szerkesztés" gomb helye és láthatósága
                 attól függetlenül fix, hogy az edzés-hozzáadó widget épp
                 milyen (össze- vagy kinyitott) állapotban van. */}
              <div className="d-flex flex-wrap gap-2 mt-3">
                <button type="button" className="btn-fyb btn-fyb-outline btn-fyb-sm" onClick={() => setEditing(true)}>
                  szerkesztés
                </button>
              </div>
              {todayEntry!.trained && (
                <div className="mt-2">
                  <AddWorkoutButton clientId={client.id} />
                </div>
              )}
            </div>
          )}
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

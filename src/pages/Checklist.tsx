import { useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import {
  useChecklist,
  computeHoldSeconds,
  SYMPTOM_OPTIONS,
  DURATION_STEPS,
  type ChecklistEntry,
  type SymptomDuringExercise,
} from '../context/ChecklistContext'
import { useClients } from '../context/ClientsContext'
import { LOGGED_IN_UF_ID } from '../data/initialClients'
import { suggestedSequence, codeLabel } from '../data/tornaSzintek'

// ÜF-oldali "checklist" (2026.09.23., Marci kérésére, 5. fázis — ld.
// ChecklistContext.tsx modul-tető jegyzete az egyeztetés részleteiért).
// "Cél: egy olyan, nagyon egyszerűen használható felület, ahova naponta
// tudja az üf követni az állapotát/a torna kivitelezését. Ezt szintenként
// könnyen érthető, látványos diagramokon lehet látni."

function formatDurationLabel(hours: number) {
  if (hours === 0) return 'nincs'
  if (hours < 1) return `${Math.round(hours * 60)} perc`
  return `${hours} óra`
}

function Slider({
  label,
  valueLabel,
  value,
  min,
  max,
  step,
  color,
  onChange,
}: {
  label: string
  valueLabel: string
  value: number
  min: number
  max: number
  step: number
  color: string
  onChange: (v: number) => void
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="mb-3">
      <div className="d-flex align-items-center justify-content-between mb-1">
        <span className="small fw-bold">{label}</span>
        <span className="small" style={{ color }}>
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
          background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, var(--color-border) ${pct}%, var(--color-border) 100%)`,
        }}
      />
    </div>
  )
}

// a diagram-blokk közös a GYT csak-olvasható nézetével (ld.
// GytChecklist.tsx) — kézzel rajzolt SVG helyett a `recharts` könyvtárral
// (Marci kifejezett választása, AskUserQuestion). "Mindig az aktuális
// szint adatai grafikonon; opcionálisan a teljes időszak is megnézhető"
// (Projekt specifikáció) — ld. a hívó oldal `scope` váltóját.
export function ChecklistCharts({ entries }: { entries: ChecklistEntry[] }) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  const data = sorted.map((e) => ({
    date: e.date.slice(5).replace('-', '.'),
    intenzitas: e.symptomIntensity,
    idotartam: e.symptomDurationHours,
    terheles: e.loadOptimization,
    edzes: e.trained ? 1 + e.extraWorkouts : 0,
  }))

  if (data.length === 0) {
    return (
      <p className="small mb-0" style={{ color: 'var(--color-text-muted)' }}>
        még nincs rögzített nap ebben a körben.
      </p>
    )
  }

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <span className="small fw-bold d-block mb-2" style={{ color: 'var(--color-primary)' }}>
          edzésnapok
        </span>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" width={24} />
            <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', fontSize: 12 }} />
            <Bar dataKey="edzes" name="edzések száma" fill="var(--z6)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <span className="small fw-bold d-block mb-2" style={{ color: 'var(--color-primary)' }}>
          tünet intenzitása (0-10) és időtartama (óra)
        </span>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" width={24} />
            <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', fontSize: 12 }} />
            <Line type="monotone" dataKey="intenzitas" name="intenzitás" stroke="var(--z1)" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="idotartam" name="időtartam (óra)" stroke="var(--z2)" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <span className="small fw-bold d-block mb-2" style={{ color: 'var(--color-primary)' }}>
          terhelés optimalizálás (%)
        </span>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" width={28} />
            <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', fontSize: 12 }} />
            <Line type="monotone" dataKey="terheles" name="terhelés optimalizálás" stroke="var(--z4)" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function DailyForm({
  clientId,
  currentLevel,
  todaysHoldSeconds,
  initial,
  onSaved,
}: {
  clientId: string
  currentLevel: number
  todaysHoldSeconds: number
  initial: ChecklistEntry | undefined
  onSaved: () => void
}) {
  const { saveTodayEntry } = useChecklist()
  const [trained, setTrained] = useState(initial?.trained ?? false)
  const [symptom, setSymptom] = useState<SymptomDuringExercise>(initial?.symptom ?? 'nincs')
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
      <p className="small mb-3" style={{ color: 'var(--color-text-muted)' }}>
        {currentLevel}. szint mai kitűzött megtartás-ideje: <strong>{todaysHoldSeconds} mp</strong> gyakorlatonként.
      </p>

      <label className="d-flex align-items-center gap-2 mb-3" style={{ cursor: 'pointer' }}>
        <input type="checkbox" checked={trained} onChange={(e) => setTrained(e.target.checked)} />
        <span className="fw-bold">volt ma tornám</span>
      </label>

      <div className="mb-3">
        <span className="small fw-bold d-block mb-1">tünet gyakorlat közben</span>
        <select className="form-select" value={symptom} onChange={(e) => setSymptom(e.target.value as SymptomDuringExercise)}>
          {SYMPTOM_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
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

      <Slider
        label="tünet napi intenzitása"
        valueLabel={`${intensity}/10`}
        value={intensity}
        min={0}
        max={10}
        step={1}
        color="var(--z1)"
        onChange={setIntensity}
      />

      <Slider
        label="terhelés optimalizálás"
        valueLabel={`${load}%`}
        value={load}
        min={0}
        max={100}
        step={1}
        color="var(--z4)"
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
  const { getState, getTodayEntry, addExtraWorkout, advanceLevel } = useChecklist()
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
  // mielőtt az effект egyáltalán lefutna (élesben előfordult hiba,
  // böngészős teszteléskor derült ki). Ezért a ténylegesen megjelenített
  // "szerkesztő nézet"-et SZINKRON, származtatott értékként számoljuk: ha
  // nincs mai bejegyzés az AKTUÁLIS szinthez, MINDIG a szerkesztő nézet
  // jelenik meg, függetlenül a state-től.
  const showEditor = editing || !todayEntry

  const todaysHoldSeconds = computeHoldSeconds(state.levelStartDate, new Date().toISOString().slice(0, 10), client.variables)
  const visibleEntries = scope === 'szint' ? state.entries.filter((e) => e.level === state.currentLevel) : state.entries

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 720 }}>
        <div className="app-page-header mb-3 mobile-sticky-header">
          <h1 className="app-page-title mb-0">checklist</h1>
        </div>

        <div className="card-fyb mb-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <h2 className="h6 mb-0">
              {state.currentLevel}. szint {currentCode ? <span style={{ color: 'var(--color-text-muted)' }}>— {codeLabel(currentCode)}</span> : null}
            </h2>
            {state.currentLevel < maxLevel && (
              <button
                type="button"
                className="btn-fyb btn-fyb-outline btn-fyb-sm"
                onClick={() => advanceLevel(client.id, maxLevel)}
              >
                következő szint kezdése
              </button>
            )}
          </div>

          {showEditor ? (
            <DailyForm
              key={state.currentLevel}
              clientId={client.id}
              currentLevel={state.currentLevel}
              todaysHoldSeconds={todaysHoldSeconds}
              initial={todayEntry}
              onSaved={() => setEditing(false)}
            />
          ) : (
            <div>
              <p className="small mb-3" style={{ color: 'var(--color-text-muted)' }}>
                {state.currentLevel}. szint mai kitűzött megtartás-ideje: <strong>{todaysHoldSeconds} mp</strong> gyakorlatonként.
              </p>
              <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                <span className="badge-fyb">✓ mai nap rögzítve</span>
                <span className="small" style={{ color: 'var(--color-text-muted)' }}>
                  {todayEntry!.trained ? 'volt torna ma' : 'ma nem volt torna'}
                  {todayEntry!.extraWorkouts > 0 && ` (+${todayEntry!.extraWorkouts} további edzés)`}
                </span>
              </div>
              <div className="d-flex flex-wrap gap-2 mt-3">
                <button type="button" className="btn-fyb btn-fyb-outline btn-fyb-sm" onClick={() => addExtraWorkout(client.id)}>
                  még egy edzést hozzáadok
                </button>
                <button type="button" className="btn-fyb btn-fyb-outline btn-fyb-sm" onClick={() => setEditing(true)}>
                  szerkesztés
                </button>
              </div>
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
          <ChecklistCharts entries={visibleEntries} />
        </div>
      </div>
    </section>
  )
}

import { useState } from 'react'
import { addDays, formatISODate, getMondayOf, gytColorVar, type SalesCall, type SalesCallOutcome, type TimeSlot } from '../data/calendarData'
import GytWeeklyCalendar from '../components/GytWeeklyCalendar'
import WeekNavHeader from '../components/WeekNavHeader'
import CallDetailModal from '../components/CallDetailModal'
import AppointmentEditorModal, { type AppointmentEditorResult, type ConflictInfo } from '../components/AppointmentEditorModal'
import Icon from '../components/Icon'
import { useSalesData } from '../context/SalesDataContext'

const OWN_ID = 'sajat'
const OWN_LIST = [{ id: OWN_ID, name: 'saját hívásaim' }]

function formatTime(value: string) {
  const t = value.split('T')[1]
  return t ? t.slice(0, 5) : '—'
}

function telHref(phone: string) {
  return `tel:${phone.replace(/\s+/g, '')}`
}

// 2026.08.28., 6. kör: szöveg nélküli, kis színes pötty a korábbi szöveges
// pirula helyett (Marci kérésére) — a listanézet ne legyen zsúfolt
function OutcomeDot({ outcome }: { outcome?: SalesCallOutcome }) {
  if (!outcome) return null
  return <span className={`call-outcome-dot call-outcome-dot--${outcome === 'rendben' ? 'success' : 'warning'}`} title={outcome === 'rendben' ? 'rendben' : 'nem jött'} />
}

// a kattintható terület mérete változatlan (2.2rem, ld. .circle-icon-btn),
// de kör-háttér nélkül, csak maga a fogaskerék-ikon (2026.08.28., 6. kör)
function GearButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="circle-icon-btn circle-icon-btn--gear" aria-label="hívás módosítása" onClick={onClick}>
      <Icon src="/icons/ikon_beallitasok.svg" style={{ width: '1.6rem', height: '1.6rem' }} />
    </button>
  )
}

type SubView = 'mai' | 'naptar'

export default function SalesHivasaim() {
  const { salesCalls, setSalesCalls, setClients, removeBooking, today } = useSalesData()
  const [view, setView] = useState<SubView>('mai')
  const [weekOffset, setWeekOffset] = useState(0)
  const [modifyingCall, setModifyingCall] = useState<SalesCall | null>(null)
  const [previewCall, setPreviewCall] = useState<SalesCall | null>(null)
  // egy üres sávra kattintva nyílik meg, új hívás/időpont felvételéhez a
  // saját naptárban (2026.08.28., 6. kör, Marci kérésére)
  const [creatingAt, setCreatingAt] = useState<{ dateISO: string; hour: number } | null>(null)

  const weekStart = addDays(getMondayOf(today), weekOffset * 7)
  const todayISO = formatISODate(today)
  const todaysCalls = salesCalls.filter((c) => c.callTime.startsWith(todayISO))

  function findCallAt(dateISO: string, hour: number) {
    return salesCalls.find((c) => c.callTime.startsWith(`${dateISO}T${String(hour).padStart(2, '0')}`))
  }

  // üres sáv is "szabad"-nak számít itt (2026.08.28., 6. kör) — ide is lehet
  // új időpontot felvenni, kattintva az onFreeSlotClick nyitja a létrehozó popupot
  function getOwnSlot(_id: string, dateISO: string, hour: number): TimeSlot {
    const match = findCallAt(dateISO, hour)
    if (!match) return { hour, status: 'szabad' }
    const minute = Number(match.callTime.split(':')[1])
    return { hour, status: 'foglalt', label: match.name, minute }
  }

  // színkód a saját naptárban (2026.08.28., Marci kérésére): sárga, ha a
  // hívást a módosító popupon "nem jött"-re állítottuk; a jelenlegi (alap,
  // sagegray) szín minden más MÚLTBELI időpontnál; türkiz (a márka elsődleges
  // színe) minden JÖVŐBELI időpontnál. A sorrend fontos: a sárga megelőzi a
  // múlt/jövő megkülönböztetést, mert egy "nem jött" jelölés mindig erősebb.
  // Az üres (még nem foglalt) sávok mindig a semleges alap-szín halvány
  // tintjét kapják, időtől függetlenül — ez csak azt jelzi, hogy ide LEHET
  // időpontot felvenni, nem egy tényleges hívás állapotát mutatja.
  // Technikai megjegyzés (2026.08.28., 7. kör): a GytWeeklyCalendar SlotBlock-ja
  // a "szabad" státusznál a `solid`, "foglalt"-nál a `tint` mezőt olvassa ki
  // (ld. ott a fordított logikát a GYT-kapacitás-nézet élénkítéséhez) — itt,
  // a "saját naptár" szemantikus (nem kapacitás-) színezésénél ez a
  // megkülönböztetés nem releváns, ezért mindkét mezőbe UGYANAZT az egy
  // szándékolt színt adjuk vissza, státusztól függetlenül helyesen jelenjen meg.
  function getOwnSlotColor(_id: string, dateISO: string, hour: number) {
    const match = findCallAt(dateISO, hour)
    if (!match) {
      const empty = gytColorVar(OWN_ID, 0.15)
      return { solid: empty, tint: empty }
    }
    if (match.outcome === 'nem_jelent_meg') {
      const yellow = 'var(--macos-yellow)'
      return { solid: yellow, tint: yellow, textSolid: 'var(--offwhite)', textTint: 'var(--offwhite)' }
    }
    const slotStart = new Date(`${dateISO}T${String(hour).padStart(2, '0')}:00`)
    if (slotStart.getTime() < today.getTime()) {
      const past = gytColorVar(OWN_ID)
      return { solid: past, tint: past, textSolid: 'var(--offwhite)', textTint: 'var(--offwhite)' }
    }
    const future = 'var(--color-primary)'
    return { solid: future, tint: future, textSolid: 'var(--offwhite)', textTint: 'var(--offwhite)' }
  }

  function handleCreateCall(data: AppointmentEditorResult) {
    const id = `${Date.now()}`
    setSalesCalls((prev) => [
      ...prev,
      {
        id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        note: data.note || undefined,
        callTime: `${data.dateISO}T${String(data.hour).padStart(2, '0')}:${String(data.minute).padStart(2, '0')}`,
        status: 'var_gyt_re',
      },
    ])
    setCreatingAt(null)
  }

  // "call" módban ütközés csak FIGYELMEZTETÉS (felülbírálható) — az órás
  // rács-sáv szerint nézzük, van-e már hívás ugyanabban az órában, a perc
  // nem számít bele (a rács maga is óránkénti bontású, ld. findCallAt)
  function checkOwnConflict(dateISO: string, hour: number): ConflictInfo | null {
    const match = findCallAt(dateISO, hour)
    return match ? { name: match.name, hour } : null
  }

  function handleSetOutcome(callId: string, outcome: SalesCallOutcome) {
    setSalesCalls((prev) => prev.map((c) => (c.id === callId ? { ...c, outcome } : c)))
  }

  // piros gomb: ha a hívás már foglalt GYT-időponttal járt, azt a naptár-
  // sávot és a belőle létrehozott ügyfelet is töröljük — nem maradhat "árva"
  // foglalás egy elutasított hívás mögött
  function handleReject(call: SalesCall) {
    if (call.assignedGytId && call.assignedStart && call.assignedClientId) {
      const [dateISO, hm] = call.assignedStart.split('T')
      removeBooking(call.assignedGytId, dateISO, Number(hm.split(':')[0]))
      setClients((prev) => prev.filter((c) => c.id !== call.assignedClientId))
    }
    setSalesCalls((prev) => prev.filter((c) => c.id !== call.id))
    setModifyingCall(null)
  }

  return (
    <section className="py-3 py-lg-5">
      {/* a naptár-nézet a teljes rendelkezésre álló szélességet használja
         (2026.08.28., 7. kör, Marci kérésére — csak minimális szélső margóval),
         a "mai hívások" lista viszont megtartja az olvasható max-szélességet */}
      <div className="container-fluid" style={{ maxWidth: view === 'naptar' ? undefined : 900 }}>
        {/* mobilon a cím+fülváltó fixen a tetején marad, csak alatta (a
           tájékoztató szöveg és a lista/naptár) görget — ugyanaz a minta,
           mint a GYT "ügyfeleim"/"videókiosztás" oldalán (2026.09.02.,
           Marci kérésére, minden fiókra kiterjesztve). */}
        <div className="mobile-sticky-header">
          <div className="app-page-header mb-3">
            <h1 className="app-page-title mb-0">hívásaim</h1>
          </div>

          <div className="auth-tabs mb-3">
            <button type="button" className={`auth-tab ${view === 'mai' ? 'active' : ''}`} onClick={() => setView('mai')}>
              mai hívások
            </button>
            <button type="button" className={`auth-tab ${view === 'naptar' ? 'active' : ''}`} onClick={() => setView('naptar')}>
              naptár
            </button>
          </div>
        </div>

        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          a Calendly-foglalásokból érkező sales-hívások — a gyógytornászhoz rendeléshez a "hozzárendelések" oldal "adatok importálása" gombjával hozhatod be egy hívás adatait.
        </p>

        {view === 'mai' && (
          <div className="card-fyb">
            <div
              className="call-row-grid pb-2 mb-1 small fw-bold text-uppercase"
              style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}
            >
              <span>időpont</span>
              <span>ügyfél</span>
              <span>email</span>
              <span>telefon</span>
              <span>állapot</span>
              <span />
            </div>

            {todaysCalls.length === 0 ? (
              <p className="mb-0 text-center" style={{ color: 'var(--color-text-muted)' }}>ma nincs hívás.</p>
            ) : (
              todaysCalls.map((call) => (
                <CallRow key={call.id} call={call} onModify={() => setModifyingCall(call)} />
              ))
            )}
          </div>
        )}

        {view === 'naptar' && (
          <div className="card-fyb gyt-cal-card-mobile">
            <WeekNavHeader weekOffset={weekOffset} setWeekOffset={setWeekOffset} weekStart={weekStart} />

            <GytWeeklyCalendar
              weekStart={weekStart}
              today={today}
              gytList={OWN_LIST}
              selectedGytId={OWN_ID}
              getSlot={getOwnSlot}
              getSlotColor={getOwnSlotColor}
              onBookedSlotClick={(_gytId, dateISO, hour) => {
                const match = findCallAt(dateISO, hour)
                if (match) setPreviewCall(match)
              }}
              onFreeSlotClick={(_gytId, _gytName, dateISO, hour) => setCreatingAt({ dateISO, hour })}
            />
          </div>
        )}

        {previewCall && (
          <div className="modal-backdrop-fyb" onClick={() => setPreviewCall(null)}>
            <div className="modal-fyb card-fyb" onClick={(e) => e.stopPropagation()}>
              <h2 className="h6 mb-3">{formatTime(previewCall.callTime)}</h2>
              <p className="fw-bold mb-1">{previewCall.name}</p>
              <p className="small mb-3" style={{ color: 'var(--color-text-muted)' }}>{previewCall.phone}</p>
              <div className="d-flex justify-content-between align-items-center">
                <button type="button" className="btn-fyb btn-fyb-ghost" onClick={() => setPreviewCall(null)}>bezár</button>
                <GearButton
                  onClick={() => {
                    setModifyingCall(previewCall)
                    setPreviewCall(null)
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {modifyingCall && (
          <CallDetailModal
            call={modifyingCall}
            onClose={() => setModifyingCall(null)}
            onSetOutcome={(outcome) => handleSetOutcome(modifyingCall.id, outcome)}
            onReject={() => handleReject(modifyingCall)}
          />
        )}

        {creatingAt && (
          <AppointmentEditorModal
            mode="call"
            isEditing={false}
            initial={{ dateISO: creatingAt.dateISO, hour: creatingAt.hour }}
            checkConflict={checkOwnConflict}
            onSave={handleCreateCall}
            onClose={() => setCreatingAt(null)}
          />
        )}
      </div>
    </section>
  )
}

function CallRow({ call, onModify }: { call: SalesCall; onModify: () => void }) {
  const assigned = call.status === 'hozzarendelve'
  return (
    <div className="py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <div className="call-row-grid">
        <span className="call-row-time">{formatTime(call.callTime)}</span>
        <span className="fw-bold">{call.name}</span>
        <span className="small" style={{ color: 'var(--color-text-muted)' }}>{call.email}</span>
        <a href={telHref(call.phone)} className="small" style={{ color: 'var(--color-primary)' }}>{call.phone}</a>
        <span className="d-flex align-items-center gap-2 flex-wrap">
          <span className="small" style={{ color: 'var(--color-text-muted)' }}>
            {assigned ? `gyt: ${call.assignedGyt}` : 'nincs kiosztva'}
          </span>
          <OutcomeDot outcome={call.outcome} />
        </span>
        <GearButton onClick={onModify} />
      </div>

      {/* mobil sor — nagy időpont vezeti a sort, a jobb szélen a fogaskerék
         (módosítás) kör-gomb (2026.08.28., 4. kör: a "+" foglalás-gomb
         eltávolítva — a GYT-hez rendelés innentől kizárólag a
         "hozzárendelések" oldal "adatok importálása" funkciójával megy) */}
      <div className="d-lg-none">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className="call-row-time">{formatTime(call.callTime)}</span>
          <GearButton onClick={onModify} />
        </div>
        <span className="fw-bold d-block">{call.name}</span>
        <span className="small d-block" style={{ color: 'var(--color-text-muted)' }}>{call.email}</span>
        <a href={telHref(call.phone)} className="small d-block" style={{ color: 'var(--color-primary)' }}>{call.phone}</a>
        <div className="mt-2 d-flex align-items-center gap-2 flex-wrap">
          <span className="small" style={{ color: 'var(--color-text-muted)' }}>
            {assigned ? `gyt: ${call.assignedGyt}` : 'nincs kiosztva'}
          </span>
          <OutcomeDot outcome={call.outcome} />
        </div>
      </div>
    </div>
  )
}

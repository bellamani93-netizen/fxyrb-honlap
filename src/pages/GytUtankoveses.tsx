import { useState } from 'react'
import { useClients } from '../context/ClientsContext'
import { useCalendar } from '../context/CalendarContext'
import { BUSINESS_HOURS, generateMeetLink } from '../data/calendarData'
import {
  DEFAULT_CAPACITY,
  formatMeetingTime,
  isMeetingPast,
  useUtankovetes,
  type Meeting,
} from '../context/UtankovetesContext'
import { LOGGED_IN_GYT_ID } from '../data/colleagues'

function splitStart(startsAt: string): { dateISO: string; hour: number; minute: number } {
  const [dateISO, time = '00:00'] = startsAt.split('T')
  const [h, m] = time.split(':').map(Number)
  return { dateISO, hour: h, minute: m || 0 }
}

/** a Google Meet linket a rendszer hozza létre a míting kiírásakor (a naptár
 * eddigi megoldásával azonos, helyettesítő link-generálással) */
function createMeetLink(seed: string): string {
  return `https://${generateMeetLink(seed)}`
}

const CAL_LABEL = 'Utánkövetés — csoportos míting'

function MeetingForm({ meeting }: { meeting: Meeting | undefined }) {
  const { saveMeeting, newMeeting } = useUtankovetes()
  const { setBooking, removeBooking, getBookingMeta } = useCalendar()
  const [startsAt, setStartsAt] = useState(meeting?.startsAt ?? '')
  const [capacity, setCapacity] = useState(meeting?.capacity ?? DEFAULT_CAPACITY)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // ellenőrzés + a naptár-ütközés vizsgálata (a saját, korábbi helyét nem
  // számítjuk ütközésnek, mert az módosításkor felszabadul)
  function validate(ownSlotStartsAt: string | undefined): { startsAt: string; capacity: number } | null {
    if (!startsAt) return setError('Add meg a míting időpontját.'), null
    if (!Number.isFinite(capacity) || capacity < 1) return setError('A létszám legalább 1 legyen.'), null
    const { dateISO, hour } = splitStart(startsAt)
    if (!BUSINESS_HOURS.includes(hour)) {
      return setError('A naptár 6:00 és 21:00 között kezeli az időpontokat — válassz ebben a sávban.'), null
    }
    const own = ownSlotStartsAt ? splitStart(ownSlotStartsAt) : null
    const isOwnSlot = own && own.dateISO === dateISO && own.hour === hour
    const meta = getBookingMeta(LOGGED_IN_GYT_ID, dateISO, hour)
    if (!isOwnSlot && meta.kind && meta.kind !== 'szabad') {
      return setError(`Ebben az órában már van bejegyzés a naptáradban${meta.name ? ` (${meta.name})` : ''}.`), null
    }
    setError(null)
    return { startsAt, capacity: Math.round(capacity) }
  }

  function writeToCalendar(m: { startsAt: string; meetLink: string }) {
    const { dateISO, hour, minute } = splitStart(m.startsAt)
    setBooking(LOGGED_IN_GYT_ID, dateISO, hour, {
      type: 'utankovetes',
      name: CAL_LABEL,
      meetLink: m.meetLink.replace(/^https?:\/\//, ''),
      minute: minute || undefined,
    })
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const v = validate(meeting?.startsAt)
    if (!v) return
    const meetLink = meeting?.meetLink ?? createMeetLink(`${LOGGED_IN_GYT_ID}-${v.startsAt}-${Date.now()}`)
    // módosításnál a régi naptár-hely felszabadul, ha az időpont megváltozott
    if (meeting && meeting.startsAt !== v.startsAt) {
      const old = splitStart(meeting.startsAt)
      removeBooking(LOGGED_IN_GYT_ID, old.dateISO, old.hour)
    }
    saveMeeting(LOGGED_IN_GYT_ID, { ...v, meetLink })
    writeToCalendar({ startsAt: v.startsAt, meetLink })
    setSaved(true)
  }

  function handleNew() {
    // új heti mítingnél a korábbi a naptárban marad (lezajlott esemény), ezért a saját hely nem "szabadul fel"
    const v = validate(undefined)
    if (!v) return
    if (meeting && !window.confirm('Új heti mítinget írsz ki: a jelenlegi lezárul, a jelentkezések újraindulnak, és új Google Meet link készül. Folytatod?')) return
    const meetLink = createMeetLink(`${LOGGED_IN_GYT_ID}-${v.startsAt}-${Date.now()}`)
    newMeeting(LOGGED_IN_GYT_ID, { ...v, meetLink })
    writeToCalendar({ startsAt: v.startsAt, meetLink })
    setSaved(true)
  }

  return (
    <form onSubmit={handleSave}>
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className="form-label small fw-bold" htmlFor="mit-ido">a míting időpontja</label>
          <input id="mit-ido" type="datetime-local" className="form-control" value={startsAt} onChange={(e) => { setStartsAt(e.target.value); setSaved(false) }} />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label small fw-bold" htmlFor="mit-cap">férőhelyek száma</label>
          <input id="mit-cap" type="number" min={1} className="form-control" value={capacity} onChange={(e) => { setCapacity(Number(e.target.value)); setSaved(false) }} />
        </div>
        <div className="col-12">
          <div className="form-label small fw-bold">Google Meet link</div>
          {meeting ? (
            <a href={meeting.meetLink} target="_blank" rel="noreferrer" className="text-break">{meeting.meetLink}</a>
          ) : (
            <span className="small" style={{ color: 'var(--color-text-muted)' }}>a link automatikusan létrejön, amikor kiírod a mítinget.</span>
          )}
        </div>
      </div>
      <p className="small mt-3 mb-0" style={{ color: 'var(--color-text-muted)' }}>
        A míting automatikusan bekerül a naptáradba, és ha ma van, a „mai konzultációk” között is megjelenik.
      </p>
      {error && <div className="small mt-2" style={{ color: 'var(--bs-danger, #c0392b)' }}>{error}</div>}
      <div className="d-flex flex-wrap gap-2 mt-3 align-items-center">
        <button type="submit" className="btn-fyb btn-fyb-highlight">{meeting ? 'módosítások mentése' : 'míting kiírása'}</button>
        {meeting && (
          <button type="button" className="btn-fyb btn-fyb-outline" onClick={handleNew}>új heti míting kiírása</button>
        )}
        {saved && <span className="small" style={{ color: 'var(--color-primary)' }}>elmentve, a naptárba bekerült</span>}
      </div>
    </form>
  )
}

// GYT "utánkövetés": a 10 hetet már végigjárt, a 14 hetes utánkövetésben lévő
// ügyfelek heti csoportos mítingje — a GYT itt írja ki az időpontot, a Google
// Meet linket és a férőhelyek számát; az ügyfelek jelentkezését is itt látja.
export default function GytUtankoveses() {
  const { clients, updateClient } = useClients()
  const { currentMeeting, signups, removeSignup } = useUtankovetes()
  const [toAdd, setToAdd] = useState('')

  const own = clients.filter((c) => c.assignedGytId === LOGGED_IN_GYT_ID)
  const followUp = own.filter((c) => c.programPhase === 'utankovetes')
  const candidates = own.filter((c) => !c.programPhase)
  const nameOf = new Map(clients.map((c) => [c.id, c.name]))
  const meeting = currentMeeting(LOGGED_IN_GYT_ID)
  const list = meeting ? signups.filter((s) => s.meetingId === meeting.id) : []

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 900 }}>
        <div className="app-page-header mb-3 mobile-sticky-header">
          <h1 className="app-page-title mb-0">utánkövetés</h1>
        </div>
        <p className="small mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Azok az ügyfeleid, akik már végigértek a 10 héten, a következő 14 hétben heti csoportos mítingen vehetnek részt.
          Te adod meg az időpontot, a Google Meet linket és a férőhelyek számát; a jelentkezés érkezési sorrendben telik be.
        </p>

        <div className="card-fyb card-fyb-accent mb-4">
          <h2 className="h5 mb-3">heti míting</h2>
          <MeetingForm meeting={meeting} />
          {meeting && isMeetingPast(meeting.startsAt) && (
            <p className="small mt-3 mb-0" style={{ color: 'var(--color-text-muted)' }}>
              Ez a míting már lezajlott ({formatMeetingTime(meeting.startsAt)}) — a jelentkezés lezárt. Írd ki a következő heti mítinget.
            </p>
          )}
        </div>

        {meeting && (
          <div className="card-fyb mb-4">
            <h2 className="h6 mb-1">jelentkezők ({list.length}/{meeting.capacity})</h2>
            <p className="small mb-3" style={{ color: 'var(--color-text-muted)' }}>{formatMeetingTime(meeting.startsAt)}</p>
            {list.length === 0 && <p className="mb-0" style={{ color: 'var(--color-text-muted)' }}>Még nincs jelentkező.</p>}
            <div className="d-flex flex-column gap-2">
              {list.map((s, i) => (
                <div key={s.id} className="utk-signup">
                  <span className="utk-signup-n">{i + 1}</span>
                  <div className="flex-grow-1">
                    <div className="fw-bold">{nameOf.get(s.clientId) ?? 'ügyfél'}</div>
                    <p className="mb-0">{s.text}</p>
                  </div>
                  <button type="button" className="btn-fyb btn-fyb-ghost text-nowrap" style={{ padding: '0.2rem 0.7rem', fontSize: '0.8rem' }} onClick={() => removeSignup(s.id)}>törlés</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card-fyb">
          <h2 className="h6 mb-3">utánkövetésben lévő ügyfeleid ({followUp.length})</h2>
          {followUp.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>Még nincs ügyfeled az utánkövetésben.</p>}
          <div className="d-flex flex-column gap-2 mb-3">
            {followUp.map((c) => (
              <div key={c.id} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <span className="fw-bold flex-grow-1">{c.name}</span>
                <button type="button" className="btn-fyb btn-fyb-ghost" style={{ padding: '0.2rem 0.7rem', fontSize: '0.8rem' }} onClick={() => updateClient(c.id, { programPhase: undefined })}>kivétel</button>
              </div>
            ))}
          </div>
          <div className="d-flex flex-wrap gap-2">
            <select className="form-select" style={{ maxWidth: 280 }} value={toAdd} onChange={(e) => setToAdd(e.target.value)} aria-label="ügyfél kiválasztása">
              <option value="">ügyfél kiválasztása…</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button
              type="button"
              className="btn-fyb btn-fyb-outline"
              disabled={!toAdd}
              onClick={() => { updateClient(toAdd, { programPhase: 'utankovetes' }); setToAdd('') }}
            >
              10 hét lezárva: utánkövetésbe
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

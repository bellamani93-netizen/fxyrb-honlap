import { useState } from 'react'
import { BUSINESS_HOURS, addDays, formatDateOnly, formatISODate, getMondayOf } from '../data/calendarData'
import { useClients } from '../context/ClientsContext'
import { LOGGED_IN_GYT_ID } from '../data/colleagues'
import { useCalendar } from '../context/CalendarContext'
import GytWeeklyCalendar from '../components/GytWeeklyCalendar'
import GytAppointmentModal, {
  type GytAppointmentResult,
  type GytConflictInfo,
} from '../components/GytAppointmentModal'
import Icon from '../components/Icon'

// A demóban a bejelentkezett GYT mindig "Kollé Gábor" (kollega@kollega.hu) —
// ugyanaz az azonosító, amit a SALES oldal "gyt naptárak" nézete is használ.
// A naptár-állapot (foglalások) mostantól a KÖZÖS CalendarContext-ből jön —
// egy SALES-oldali foglalás ténylegesen megjelenik itt is, és fordítva
// (2026.09.01., Marci kérésére — ld. Design jegyzet 47-48. pont; korábban a
// két oldal egymástól teljesen független overlay-t használt).
const OWN_ID = LOGGED_IN_GYT_ID
const OWN_LIST = [{ id: OWN_ID, name: 'Kollé Gábor' }]

type SubView = 'mai' | 'naptar'

export default function GytNaptar() {
  const {
    today,
    getBooking,
    getEffectiveSlot,
    getBookingMeta,
    setBooking,
    removeBooking,
    nextAlkalomForClient: sharedNextAlkalomForClient,
  } = useCalendar()
  const { clients } = useClients()
  const [view, setView] = useState<SubView>('mai')
  const [weekOffset, setWeekOffset] = useState<0 | 1>(0)
  // isNew: a modal EGY ÚJ időpont felvételére nyílt-e (pl. "+" gomb, üres/szabad
  // sávra kattintás), szemben egy MEGLÉVŐ bejegyzés szerkesztésével — ezt
  // KÜLÖN kell jelölni (nem a dateISO/hour-ból visszafejteni), mert a "+" gomb
  // mindig ugyanazt az alapértelmezett dátum/órát ajánlja fel, ami olykor
  // ÉPP egybeesik egy már meglévő bejegyzéssel.
  const [editingSlot, setEditingSlot] = useState<{ dateISO: string; hour: number; isNew: boolean } | null>(null)

  const weekStart = addDays(getMondayOf(today), weekOffset * 7)
  const todayISO = formatISODate(today)

  // "lezárt" ügyfél fogalma még nincs az adatmodellben (ld. Design jegyzet) —
  // amíg nincs ilyen jelző, minden SAJÁT ügyfél "aktívnak" számít a
  // terv/konzultáció névválasztójában. Az összevont nyilvántartásban MINDEN
  // gyt ugyanazt a listát olvassa, ezért itt a sajátjaira szűrünk
  // (2026.09.01., ügyfél-nyilvántartások összevonása, ld. Design jegyzet 49. pont).
  const clientOptions = clients
    .filter((c) => c.assignedGytId === OWN_ID)
    .map((c) => ({ id: c.id, name: c.name, email: c.email, phone: c.phone }))

  function nextAlkalomForClient(clientName: string) {
    return sharedNextAlkalomForClient(OWN_ID, clientName)
  }

  // csak akkor van "eredeti" bejegyzés, ha TÉNYLEG szerkesztünk (isNew===false)
  // — új felvételnél a form alapértelmezett dátuma/órája sosem számít
  // "meglévőnek", még ha épp egybe is esik egy másik bejegyzéssel.
  const editingMeta = editingSlot && !editingSlot.isNew ? getBookingMeta(OWN_ID, editingSlot.dateISO, editingSlot.hour) : null
  const isEditingExisting = !!editingSlot && !editingSlot.isNew

  // a GYT saját naptárában egy ütközés MINDIG valódi blokk (fizikai
  // időbeosztás — nem lehet két dolgot csinálni ugyanabban az órában). A
  // "saját magával" kivétel csak szerkesztésnél érvényes — új felvételnél soha.
  function checkConflict(dateISO: string, hour: number): GytConflictInfo | null {
    if (isEditingExisting && editingSlot && editingSlot.dateISO === dateISO && editingSlot.hour === hour) return null
    const meta = getBookingMeta(OWN_ID, dateISO, hour)
    if (meta.kind === 'szabad' || meta.kind === null) return null
    return meta.name ? { name: meta.name, hour } : null
  }

  function handleSlotClick(dateISO: string, hour: number) {
    const raw = getBooking(OWN_ID, dateISO, hour)
    // egy overlay-ben LÉTREHOZOTT bejegyzés (akár "szabad", "terv", akár
    // "konzultáció") mindig egyenesen a teljes szerkesztőben nyílik meg —
    // a korábbi, "terv"-re kattintva megjelenő 2-gombos köztes popup
    // megszűnt (2026.09.01., Marci kérésére: kevesebb felesleges popup),
    // a "meet link létrehozása és rögzítése" akció most már magában a
    // szerkesztőben, a típus-választó mellett érhető el.
    if (raw) {
      setEditingSlot({ dateISO, hour, isNew: false })
      return
    }
    const meta = getBookingMeta(OWN_ID, dateISO, hour)
    if (meta.kind === 'konzultacio' || meta.kind === 'szabad') {
      // demo-generált bejegyzés — nincs mögötte overlay, de MÁR van itt egy
      // meghirdetett állapot (konzultáció VAGY szabad), tehát ez is
      // szerkeszthető/törölhető, nem "új felvétel" (2026.09.01., Marci
      // hibajelzésére — korábban a demo-eredetű "szabad" sávok tévesen
      // mindig új felvételként nyíltak meg, törlés-gomb nélkül, mintha ott
      // nem is lenne semmi, holott a naptár lime/menta bejegyzésekhez
      // hasonlóan "szabad"-ként jelölte őket).
      setEditingSlot({ dateISO, hour, isNew: false })
      return
    }
    // teljesen üres/meghirdetetlen óra — itt tényleg nincs semmi, tehát ez
    // mindig ÚJ felvétel.
    setEditingSlot({ dateISO, hour, isNew: true })
  }

  function handleCreateNew() {
    setEditingSlot({ dateISO: todayISO, hour: BUSINESS_HOURS[0], isNew: true })
  }

  function handleSaveAppointment(data: GytAppointmentResult) {
    // ha TÉNYLEG egy meglévő bejegyzést mozgatunk máshova, a régi helyet fel
    // kell szabadítani (removeBooking a demo-adatot is elfedi, ha kell)
    if (editingSlot && !editingSlot.isNew) {
      const samePlace = editingSlot.dateISO === data.dateISO && editingSlot.hour === data.hour
      if (!samePlace) removeBooking(OWN_ID, editingSlot.dateISO, editingSlot.hour)
    }
    if (data.type === 'szabad') {
      setBooking(OWN_ID, data.dateISO, data.hour, { type: 'szabad', minute: data.minute })
    } else {
      const client = clients.find((c) => c.id === data.clientId)
      const alkalom =
        editingMeta?.clientId === data.clientId && editingMeta?.alkalom
          ? editingMeta.alkalom
          : nextAlkalomForClient(client?.name ?? '')
      setBooking(OWN_ID, data.dateISO, data.hour, { type: data.type, clientId: data.clientId, name: client?.name, alkalom, meetLink: data.meetLink, minute: data.minute })
    }
    setEditingSlot(null)
  }

  function handleDeleteAppointment() {
    if (!editingSlot) return
    removeBooking(OWN_ID, editingSlot.dateISO, editingSlot.hour)
    setEditingSlot(null)
  }

  const todaysConsultations = BUSINESS_HOURS.map((hour) => ({ hour, meta: getBookingMeta(OWN_ID, todayISO, hour) }))
    .filter((entry): entry is { hour: number; meta: typeof entry.meta & { name: string } } => (entry.meta.kind === 'terv' || entry.meta.kind === 'konzultacio') && !!entry.meta.name)
    .map(({ hour, meta }) => ({ hour, minute: meta.minute ?? 0, name: meta.name, alkalom: meta.alkalom, meetLink: meta.meetLink }))

  return (
    <section className="py-3 py-lg-5">
      {/* a naptár-nézet a teljes rendelkezésre álló szélességet használja, mint a
         SALES oldalon — a "mai konzultációk" lista viszont olvasható max-szélességű */}
      <div className="container-fluid" style={{ maxWidth: view === 'naptar' ? undefined : 900 }}>
        <div className="app-page-header mb-3">
          <h1 className="app-page-title mb-0">naptár</h1>
        </div>

        <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
          <div className="auth-tabs">
            <button type="button" className={`auth-tab ${view === 'mai' ? 'active' : ''}`} onClick={() => setView('mai')}>
              mai konzultációk
            </button>
            <button type="button" className={`auth-tab ${view === 'naptar' ? 'active' : ''}`} onClick={() => setView('naptar')}>
              naptáram
            </button>
          </div>
          <button type="button" className="circle-icon-btn circle-icon-btn--add" aria-label="új időpont létrehozása" onClick={handleCreateNew}>
            <Icon src="/icons/ikon_plusz.svg" />
          </button>
        </div>

        {view === 'mai' && (
          <div className="card-fyb">
            <div
              className="consultation-row-grid pb-2 mb-1 small fw-bold text-uppercase"
              style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}
            >
              <span>időpont</span>
              <span>név</span>
              <span>alkalom</span>
              <span>hívás linkje</span>
            </div>

            {todaysConsultations.length === 0 ? (
              <p className="mb-0 text-center" style={{ color: 'var(--color-text-muted)' }}>ma nincs konzultáció.</p>
            ) : (
              todaysConsultations.map((c) => (
                <div key={c.hour} className="consultation-row-grid py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <span className="fw-bold">{c.hour}:{String(c.minute).padStart(2, '0')}</span>
                  <span>{c.name}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>{c.alkalom ?? '—'}</span>
                  {c.meetLink ? (
                    <a href={`https://${c.meetLink}`} target="_blank" rel="noreferrer" className="small text-truncate" style={{ color: 'var(--color-primary)' }}>
                      {c.meetLink}
                    </a>
                  ) : (
                    <span className="small" style={{ color: 'var(--color-text-muted)' }}>—</span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {view === 'naptar' && (
          <div className="card-fyb">
            <div className="d-flex align-items-center justify-content-end gap-2 mb-3">
              <button type="button" className="btn-fyb btn-fyb-ghost" disabled={weekOffset === 0} onClick={() => setWeekOffset(0)}>
                ‹ ez a hét
              </button>
              <span className="small fw-bold">
                {formatDateOnly(weekStart)} – {formatDateOnly(addDays(weekStart, 6))}
              </span>
              <button type="button" className="btn-fyb btn-fyb-ghost" disabled={weekOffset === 1} onClick={() => setWeekOffset(1)}>
                következő hét ›
              </button>
            </div>

            <GytWeeklyCalendar
              weekStart={weekStart}
              today={today}
              gytList={OWN_LIST}
              selectedGytId={OWN_ID}
              getSlot={(_id, dateISO, hour) => getEffectiveSlot(OWN_ID, dateISO, hour)}
              getSlotColor={(_id, dateISO, hour) => {
                // saját naptár-színkód (2026.08.31., Marci kérésére) — MINDEN gyt
                // ugyanígy látja a sajátját, függetlenül a SALES-oldali kolléga-
                // színétől: szabad halvány narancssárga, tervezett (terv) MINDIG
                // világos menta (a típus dönt, nem az alkalom-szám — 2026.09.01.,
                // Marci hibajelzésére: korábban egy lime, 1. alkalmú bejegyzés
                // terv-re váltva is lime maradt, mert az alkalom===1 ellenőrzés
                // megelőzte a "terv"-ellenőrzést), lefoglalt (konzultáció) 1.
                // alkalma lime, minden más konzultáció mentett menta.
                const meta = getBookingMeta(OWN_ID, dateISO, hour)
                if (meta.kind === 'szabad') {
                  return { solid: 'var(--pale-orange)', tint: 'var(--pale-orange)', textSolid: 'var(--navy)', textTint: 'var(--navy)' }
                }
                if (meta.kind === 'terv') {
                  const c = 'rgba(var(--mint-rgb), 0.35)'
                  return { solid: c, tint: c, textSolid: 'var(--navy)', textTint: 'var(--navy)' }
                }
                if (meta.alkalom === 1) {
                  return { solid: 'var(--lime)', tint: 'var(--lime)', textSolid: 'var(--navy)', textTint: 'var(--navy)' }
                }
                const mint = 'var(--mint)'
                return { solid: mint, tint: mint, textSolid: 'var(--navy)', textTint: 'var(--navy)' }
              }}
              onFreeSlotClick={(_gytId, _gytName, dateISO, hour) => handleSlotClick(dateISO, hour)}
              onBookedSlotClick={(_gytId, dateISO, hour) => handleSlotClick(dateISO, hour)}
              onEmptySlotClick={(_gytId, _gytName, dateISO, hour) => handleSlotClick(dateISO, hour)}
            />
          </div>
        )}

        {editingSlot && (
          <GytAppointmentModal
            // kulcs a cél sávhoz kötve — ha valamiért egyik célról a másikra
            // váltana a modal (elméletileg nem fordulhat elő, mert a backdrop
            // lezárja az előzőt, de védekező jelleggel), React friss
            // példányt hoz létre, nem viszi át az előző mező-értékeket
            key={`${editingSlot.dateISO}-${editingSlot.hour}-${editingSlot.isNew}`}
            isEditing={isEditingExisting}
            clientOptions={clientOptions}
            initial={{
              dateISO: editingSlot.dateISO,
              hour: editingSlot.hour,
              minute: editingMeta?.minute,
              type: editingMeta?.kind ?? undefined,
              clientId: editingMeta?.clientId,
              meetLink: editingMeta?.meetLink,
              alkalom: editingMeta?.alkalom,
            }}
            checkConflict={checkConflict}
            previewAlkalom={(clientId) => nextAlkalomForClient(clients.find((c) => c.id === clientId)?.name ?? '')}
            onSave={handleSaveAppointment}
            onDelete={isEditingExisting ? handleDeleteAppointment : undefined}
            onClose={() => setEditingSlot(null)}
          />
        )}
      </div>
    </section>
  )
}

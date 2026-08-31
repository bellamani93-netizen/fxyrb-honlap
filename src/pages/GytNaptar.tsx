import { useState } from 'react'
import { BUSINESS_HOURS, addDays, formatDateOnly, formatHour, formatISODate, generateMeetLink, getMondayOf } from '../data/calendarData'
import { clients } from '../data/gytClients'
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
const OWN_ID = 'kollegabor'
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
  const [view, setView] = useState<SubView>('mai')
  const [weekOffset, setWeekOffset] = useState<0 | 1>(0)
  // isNew: a modal EGY ÚJ időpont felvételére nyílt-e (pl. "+" gomb, üres/szabad
  // sávra kattintás), szemben egy MEGLÉVŐ bejegyzés szerkesztésével — ezt
  // KÜLÖN kell jelölni (nem a dateISO/hour-ból visszafejteni), mert a "+" gomb
  // mindig ugyanazt az alapértelmezett dátum/órát ajánlja fel, ami olykor
  // ÉPP egybeesik egy már meglévő bejegyzéssel.
  const [editingSlot, setEditingSlot] = useState<{ dateISO: string; hour: number; isNew: boolean } | null>(null)
  // egy meglévő "terv" sávra kattintva előbb egy kis 2-gombos popup jelenik
  // meg (meet link rögzítése / módosítás), nem rögtön a teljes szerkesztő
  const [tervActionsSlot, setTervActionsSlot] = useState<{ dateISO: string; hour: number } | null>(null)
  const [confirmingTervDelete, setConfirmingTervDelete] = useState(false)

  const weekStart = addDays(getMondayOf(today), weekOffset * 7)
  const todayISO = formatISODate(today)

  // "lezárt" ügyfél fogalma még nincs az adatmodellben (ld. Design jegyzet) —
  // amíg nincs ilyen jelző, minden ügyfél "aktívnak" számít a terv/konzultáció
  // névválasztójában.
  const clientOptions = clients.map((c) => ({ id: c.id, name: c.name, email: c.email, phone: c.phone }))

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
    if (raw?.type === 'terv') {
      setTervActionsSlot({ dateISO, hour })
      return
    }
    // egy overlay-ben LÉTREHOZOTT bejegyzés (akár "szabad", akár "konzultáció")
    // mindig szerkeszthető/törölhető — a GYT saját maga vette fel, van mit
    // szerkeszteni/törölni rajta (2026.09.01., Marci kérésére: a "szabad"
    // időpont is legyen törölhető).
    if (raw) {
      setEditingSlot({ dateISO, hour, isNew: false })
      return
    }
    const meta = getBookingMeta(OWN_ID, dateISO, hour)
    if (meta.kind === 'konzultacio') {
      // demo-generált bejegyzés — nincs mögötte overlay, de a névből fel tudtuk
      // oldani az ügyfelet, tehát ez is szerkeszthető (ld. getBookingMeta).
      setEditingSlot({ dateISO, hour, isNew: false })
      return
    }
    // demo-generált "szabad" óra vagy teljesen üres/meghirdetetlen óra — itt
    // nincs semmi, amit törölni lehetne, tehát ez mindig ÚJ felvétel.
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
      setBooking(OWN_ID, data.dateISO, data.hour, { type: 'szabad' })
    } else {
      const client = clients.find((c) => c.id === data.clientId)
      const alkalom =
        editingMeta?.clientId === data.clientId && editingMeta?.alkalom
          ? editingMeta.alkalom
          : nextAlkalomForClient(client?.name ?? '')
      setBooking(OWN_ID, data.dateISO, data.hour, { type: data.type, clientId: data.clientId, name: client?.name, alkalom, meetLink: data.meetLink })
    }
    setEditingSlot(null)
  }

  function handleDeleteAppointment() {
    if (!editingSlot) return
    removeBooking(OWN_ID, editingSlot.dateISO, editingSlot.hour)
    setEditingSlot(null)
  }

  // a "meet link létrehozása és rögzítése" a tervet RÖGZÍTI — vagyis a színe
  // is átvált a "konzultáció" (mentett menta) színére, nem marad "tervezett"
  // (világos menta) (2026.08.31., Marci kérésére).
  function handleGenerateMeetLinkForTerv() {
    if (!tervActionsSlot) return
    // getBookingMeta-t használjuk (nem a nyers getBooking-ot), mert az a
    // clientId-t már a GYT-oldal saját (nem névtér-előtaggal ellátott)
    // formájában adja vissza — ha a nyers, már előtaggal tárolt clientId-t
    // adnánk vissza a setBooking-nak, az duplán prefixelné (ld. Design
    // jegyzet 48. pont, névtér-ütközés SALES/GYT ügyfél-azonosítók között).
    const meta = getBookingMeta(OWN_ID, tervActionsSlot.dateISO, tervActionsSlot.hour)
    setBooking(OWN_ID, tervActionsSlot.dateISO, tervActionsSlot.hour, {
      type: 'konzultacio',
      clientId: meta.clientId,
      name: meta.name,
      alkalom: meta.alkalom,
      meetLink: generateMeetLink(`${tervActionsSlot.dateISO}-${tervActionsSlot.hour}-${meta.clientId}-${Date.now()}`),
    })
    setTervActionsSlot(null)
  }

  function handleDeleteTerv() {
    if (!tervActionsSlot) return
    removeBooking(OWN_ID, tervActionsSlot.dateISO, tervActionsSlot.hour)
    setTervActionsSlot(null)
    setConfirmingTervDelete(false)
  }

  const tervActionsEntry = tervActionsSlot ? getBooking(OWN_ID, tervActionsSlot.dateISO, tervActionsSlot.hour) : undefined

  const todaysConsultations = BUSINESS_HOURS.map((hour) => ({ hour, meta: getBookingMeta(OWN_ID, todayISO, hour) }))
    .filter((entry): entry is { hour: number; meta: typeof entry.meta & { name: string } } => (entry.meta.kind === 'terv' || entry.meta.kind === 'konzultacio') && !!entry.meta.name)
    .map(({ hour, meta }) => ({ hour, name: meta.name, alkalom: meta.alkalom, meetLink: meta.meetLink }))

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
                  <span className="fw-bold">{formatHour(c.hour)}</span>
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
                // színétől: 1. alkalom mindig lime, lefoglalt (konzultáció)
                // mentett menta, tervezett (terv) világos menta, szabad halvány
                // narancssárga.
                const meta = getBookingMeta(OWN_ID, dateISO, hour)
                if (meta.kind === 'szabad') {
                  return { solid: 'var(--pale-orange)', tint: 'var(--pale-orange)', textSolid: 'var(--navy)', textTint: 'var(--navy)' }
                }
                if (meta.alkalom === 1) {
                  return { solid: 'var(--lime)', tint: 'var(--lime)', textSolid: 'var(--navy)', textTint: 'var(--navy)' }
                }
                if (meta.kind === 'terv') {
                  const c = 'rgba(var(--mint-rgb), 0.35)'
                  return { solid: c, tint: c, textSolid: 'var(--navy)', textTint: 'var(--navy)' }
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

        {tervActionsSlot && tervActionsEntry && !confirmingTervDelete && (
          <div className="modal-backdrop-fyb" onClick={() => setTervActionsSlot(null)}>
            <div className="modal-fyb card-fyb" onClick={(e) => e.stopPropagation()}>
              <div className="d-flex justify-content-between align-items-start mb-1 gap-2">
                <h2 className="h6 mb-0">{tervActionsEntry.name} — {formatHour(tervActionsSlot.hour)}</h2>
                <button
                  type="button"
                  onClick={() => setConfirmingTervDelete(true)}
                  aria-label="időpont törlése"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}
                >
                  <Icon src="/icons/ikon_kuka.svg" style={{ width: '1.3rem', height: '1.3rem', color: 'var(--color-danger)' }} />
                </button>
              </div>
              <p className="small mb-3" style={{ color: 'var(--color-text-muted)' }}>
                tervezett időpont{tervActionsEntry.alkalom ? `, ${tervActionsEntry.alkalom}. alkalom` : ''}
              </p>
              <div className="d-flex flex-column gap-2 mb-2">
                {tervActionsEntry.alkalom === 1 ? (
                  <p className="small fst-italic mb-0" style={{ color: 'var(--color-text-muted)' }}>
                    az 1. alkalom hívás-linkjét már elküldte a sales.
                  </p>
                ) : (
                  <button type="button" className="btn-fyb btn-fyb-outline" onClick={handleGenerateMeetLinkForTerv}>
                    meet link létrehozása és rögzítése
                  </button>
                )}
                <button
                  type="button"
                  className="btn-fyb btn-fyb-primary"
                  onClick={() => {
                    setEditingSlot({ ...tervActionsSlot!, isNew: false })
                    setTervActionsSlot(null)
                  }}
                >
                  módosítás
                </button>
              </div>
              <button type="button" className="btn-fyb btn-fyb-ghost" onClick={() => setTervActionsSlot(null)}>mégse</button>
            </div>
          </div>
        )}

        {tervActionsSlot && confirmingTervDelete && (
          <div className="modal-backdrop-fyb" onClick={() => setConfirmingTervDelete(false)}>
            <div className="modal-fyb card-fyb" onClick={(e) => e.stopPropagation()}>
              <p className="mb-3">biztos, hogy törlöd az időpontot?</p>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn-fyb btn-fyb-ghost" onClick={() => setConfirmingTervDelete(false)}>nem</button>
                <button type="button" className="btn-fyb btn-fyb-danger" onClick={handleDeleteTerv}>igen</button>
              </div>
            </div>
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

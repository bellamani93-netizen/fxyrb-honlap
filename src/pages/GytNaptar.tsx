import { useState } from 'react'
import {
  BUSINESS_HOURS,
  addDays,
  formatDateOnly,
  formatHour,
  formatISODate,
  generateMeetLink,
  getBaseDaySlots,
  getMondayOf,
  parseISODateLocal,
  type TimeSlot,
} from '../data/calendarData'
import { clients } from '../data/gytClients'
import GytWeeklyCalendar from '../components/GytWeeklyCalendar'
import GytAppointmentModal, {
  type GytAppointmentResult,
  type GytConflictInfo,
  type GytSlotType,
} from '../components/GytAppointmentModal'
import Icon from '../components/Icon'

// A demóban a bejelentkezett GYT mindig "Kollé Gábor" (kollega@kollega.hu) —
// ugyanaz az azonosító, amit a SALES oldal "gyt naptárak" nézete is használ
// (ld. calendarData.ts DEMO_CLIENTS_BY_GYT), így a két oldal UGYANAZT a
// demo-beosztást mutatja, anélkül hogy valódi, szerepkörök közötti adatmegosztást
// kellene építeni ehhez a UI-tervhez (2026.08.31., Marci kérésére).
const OWN_ID = 'kollegabor'
const OWN_LIST = [{ id: OWN_ID, name: 'Kollé Gábor' }]

type OverlayEntry = { type: GytSlotType; clientId?: string; name?: string; alkalom?: number; meetLink?: string }
type SubView = 'mai' | 'naptar'
type EntryMeta = { kind: GytSlotType | null; alkalom?: number; name?: string; meetLink?: string; clientId?: string }

function slotKey(dateISO: string, hour: number) {
  return `${dateISO}__${hour}`
}

// a demó-címkék "Név szám" alakúak (pl. "Kovács Gábor 4") — az "alkalom" a
// végén álló szám, ld. Marci kérése: "Az alkalom: ide kerül az a szám, ami a
// nevek mellett áll."
function parseLabel(label: string): { name: string; alkalom?: number } {
  const m = label.match(/^(.*?)\s+(\d+)$/)
  if (m) return { name: m[1], alkalom: Number(m[2]) }
  return { name: label }
}

export default function GytNaptar() {
  const [today] = useState(() => new Date())
  const [view, setView] = useState<SubView>('mai')
  const [weekOffset, setWeekOffset] = useState<0 | 1>(0)
  // a GYT saját maga is felvehet/módosíthat konzultációt (2026.08.31., Marci
  // kérésére) — ez az overlay a SALES SalesDataContext bookings-mintáját
  // követi, csak ennek az egy oldalnak a helyi állapotaként (nincs még másik
  // GYT-oldal, aminek meg kellene osztania).
  const [overlay, setOverlay] = useState<Record<string, OverlayEntry>>({})
  // isNew: a modal EGY ÚJ időpont felvételére nyílt-e (pl. "+" gomb, üres/szabad
  // sávra kattintás), szemben egy MEGLÉVŐ bejegyzés szerkesztésével — ezt
  // KÜLÖN kell jelölni (nem a dateISO/hour-ból visszafejteni), mert a "+" gomb
  // mindig ugyanazt az alapértelmezett dátum/órát ajánlja fel, ami olykor
  // ÉPP egybeesik egy már meglévő bejegyzéssel — enélkül a jelölés nélkül ez
  // tévesen "szerkesztésnek" tűnne, és a mentés csendben felülírná a más
  // időpontját (böngészős teszt közben derült ki).
  const [editingSlot, setEditingSlot] = useState<{ dateISO: string; hour: number; isNew: boolean } | null>(null)
  // egy meglévő "terv" sávra kattintva előbb egy kis 2-gombos popup jelenik
  // meg (meet link rögzítése / módosítás), nem rögtön a teljes szerkesztő
  const [tervActionsSlot, setTervActionsSlot] = useState<{ dateISO: string; hour: number } | null>(null)

  const weekStart = addDays(getMondayOf(today), weekOffset * 7)
  const todayISO = formatISODate(today)

  // "lezárt" ügyfél fogalma még nincs az adatmodellben (ld. Design jegyzet) —
  // amíg nincs ilyen jelző, minden ügyfél "aktívnak" számít a terv/konzultáció
  // névválasztójában.
  const clientOptions = clients.map((c) => ({ id: c.id, name: c.name, email: c.email, phone: c.phone }))

  function getEntryMeta(dateISO: string, hour: number): EntryMeta {
    const o = overlay[slotKey(dateISO, hour)]
    if (o) return { kind: o.type, alkalom: o.alkalom, name: o.name, meetLink: o.meetLink, clientId: o.clientId }
    const base = getBaseDaySlots(OWN_ID, parseISODateLocal(dateISO), today).find((s) => s.hour === hour)
    if (!base?.status) return { kind: null }
    if (base.status === 'szabad') return { kind: 'szabad' }
    const { name, alkalom } = parseLabel(base.label ?? '')
    return { kind: 'konzultacio', alkalom, name }
  }

  function getEffectiveSlot(dateISO: string, hour: number): TimeSlot {
    const meta = getEntryMeta(dateISO, hour)
    if (meta.kind === null) return { hour }
    if (meta.kind === 'szabad') return { hour, status: 'szabad' }
    const label = meta.name ? (meta.alkalom ? `${meta.name} ${meta.alkalom}` : meta.name) : undefined
    return { hour, status: 'foglalt', label }
  }

  // saját naptár-színkód (2026.08.31., Marci kérésére) — MINDEN gyt ugyanígy
  // látja a sajátját, függetlenül a SALES-oldali kolléga-színétől:
  // 1. alkalom mindig lime (a legerősebb jelzés, mindent felülír),
  // lefoglalt (konzultáció) mentett menta, tervezett (terv) világos menta,
  // szabad halvány narancssárga.
  function getOwnSlotColor(_id: string, dateISO: string, hour: number) {
    const meta = getEntryMeta(dateISO, hour)
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
  }

  function nextAlkalomForClient(clientName: string): number {
    let max = 0
    for (const entry of Object.values(overlay)) {
      if (entry.name === clientName && entry.alkalom) max = Math.max(max, entry.alkalom)
    }
    for (let w = 0; w <= 1; w++) {
      for (let d = 0; d < 7; d++) {
        const date = addDays(addDays(getMondayOf(today), w * 7), d)
        for (const slot of getBaseDaySlots(OWN_ID, date, today)) {
          if (slot.status === 'foglalt' && slot.label) {
            const parsed = parseLabel(slot.label)
            if (parsed.name === clientName && parsed.alkalom) max = Math.max(max, parsed.alkalom)
          }
        }
      }
    }
    return max + 1
  }

  // csak akkor van "eredeti" overlay-bejegyzés, ha TÉNYLEG szerkesztünk
  // (isNew===false) — új felvételnél a form alapértelmezett dátuma/órája
  // sosem számít "meglévőnek", még ha épp egybe is esik egy másik bejegyzéssel
  const editingOverlay = editingSlot && !editingSlot.isNew ? overlay[slotKey(editingSlot.dateISO, editingSlot.hour)] : undefined
  const isEditingExisting = !!editingOverlay

  // a GYT saját naptárában egy ütközés MINDIG valódi blokk (fizikai
  // időbeosztás — nem lehet két dolgot csinálni ugyanabban az órában). A
  // "saját magával" kivétel csak szerkesztésnél érvényes (ld. editingOverlay
  // fenti megjegyzése) — új felvételnél soha.
  function checkConflict(dateISO: string, hour: number): GytConflictInfo | null {
    if (isEditingExisting && editingSlot && editingSlot.dateISO === dateISO && editingSlot.hour === hour) return null
    const meta = getEntryMeta(dateISO, hour)
    if (meta.kind === 'szabad' || meta.kind === null) return null
    return meta.name ? { name: meta.name, hour } : null
  }

  function handleSlotClick(dateISO: string, hour: number) {
    const o = overlay[slotKey(dateISO, hour)]
    if (o?.type === 'terv') {
      setTervActionsSlot({ dateISO, hour })
      return
    }
    if (o) {
      setEditingSlot({ dateISO, hour, isNew: false })
      return
    }
    const meta = getEntryMeta(dateISO, hour)
    // demo-generált (nem overlay) konzultáció mögött nincs valódi adat — nem szerkeszthető
    if (meta.kind === 'konzultacio') return
    setEditingSlot({ dateISO, hour, isNew: true })
  }

  function handleCreateNew() {
    setEditingSlot({ dateISO: todayISO, hour: BUSINESS_HOURS[0], isNew: true })
  }

  function handleSaveAppointment(data: GytAppointmentResult) {
    const key = slotKey(data.dateISO, data.hour)
    setOverlay((prev) => {
      const next = { ...prev }
      // a régi kulcsot csak akkor töröljük, ha TÉNYLEG egy meglévő bejegyzést
      // mozgatunk máshova — új felvételnél nincs "régi hely", amit törölni kéne
      // (a "+" gomb alapértelmezett dátuma/órája nem számít annak, még ha épp
      // egybe is esik egy másik, TŐLE FÜGGETLEN bejegyzéssel).
      if (editingSlot && !editingSlot.isNew) {
        const oldKey = slotKey(editingSlot.dateISO, editingSlot.hour)
        if (oldKey !== key) delete next[oldKey]
      }
      if (data.type === 'szabad') {
        next[key] = { type: 'szabad' }
      } else {
        const client = clients.find((c) => c.id === data.clientId)
        const alkalom =
          editingOverlay?.clientId === data.clientId && editingOverlay?.alkalom
            ? editingOverlay.alkalom
            : nextAlkalomForClient(client?.name ?? '')
        next[key] = { type: data.type, clientId: data.clientId, name: client?.name, alkalom, meetLink: data.meetLink }
      }
      return next
    })
    setEditingSlot(null)
  }

  function handleDeleteAppointment() {
    if (!editingSlot) return
    setOverlay((prev) => {
      const next = { ...prev }
      delete next[slotKey(editingSlot.dateISO, editingSlot.hour)]
      return next
    })
    setEditingSlot(null)
  }

  function handleGenerateMeetLinkForTerv() {
    if (!tervActionsSlot) return
    const key = slotKey(tervActionsSlot.dateISO, tervActionsSlot.hour)
    setOverlay((prev) => {
      const entry = prev[key]
      if (!entry) return prev
      return { ...prev, [key]: { ...entry, meetLink: generateMeetLink(`${key}-${entry.clientId}-${Date.now()}`) } }
    })
    setTervActionsSlot(null)
  }

  const tervActionsEntry = tervActionsSlot ? overlay[slotKey(tervActionsSlot.dateISO, tervActionsSlot.hour)] : undefined

  const todaysConsultations = BUSINESS_HOURS.map((hour) => ({ hour, meta: getEntryMeta(todayISO, hour) }))
    .filter((entry): entry is { hour: number; meta: EntryMeta & { name: string } } => (entry.meta.kind === 'terv' || entry.meta.kind === 'konzultacio') && !!entry.meta.name)
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
              getSlot={(_id, dateISO, hour) => getEffectiveSlot(dateISO, hour)}
              getSlotColor={getOwnSlotColor}
              onFreeSlotClick={(_gytId, _gytName, dateISO, hour) => handleSlotClick(dateISO, hour)}
              onBookedSlotClick={(_gytId, dateISO, hour) => handleSlotClick(dateISO, hour)}
              onEmptySlotClick={(_gytId, _gytName, dateISO, hour) => handleSlotClick(dateISO, hour)}
            />
          </div>
        )}

        {tervActionsSlot && tervActionsEntry && (
          <div className="modal-backdrop-fyb" onClick={() => setTervActionsSlot(null)}>
            <div className="modal-fyb card-fyb" onClick={(e) => e.stopPropagation()}>
              <h2 className="h6 mb-1">{tervActionsEntry.name} — {formatHour(tervActionsSlot.hour)}</h2>
              <p className="small mb-3" style={{ color: 'var(--color-text-muted)' }}>
                tervezett időpont{tervActionsEntry.alkalom ? `, ${tervActionsEntry.alkalom}. alkalom` : ''}
              </p>
              <div className="d-flex flex-column gap-2 mb-2">
                <button type="button" className="btn-fyb btn-fyb-outline" onClick={handleGenerateMeetLinkForTerv}>
                  meet link létrehozása és rögzítése
                </button>
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
              type: editingOverlay?.type,
              clientId: editingOverlay?.clientId,
              meetLink: editingOverlay?.meetLink,
            }}
            checkConflict={checkConflict}
            onSave={handleSaveAppointment}
            onDelete={isEditingExisting ? handleDeleteAppointment : undefined}
            onClose={() => setEditingSlot(null)}
          />
        )}
      </div>
    </section>
  )
}

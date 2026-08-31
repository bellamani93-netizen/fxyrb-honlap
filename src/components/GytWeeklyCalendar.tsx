import { Fragment } from 'react'
import { BUSINESS_HOURS, addDays, formatDayHeader, formatHour, formatISODate, gytColorVar, type TimeSlot } from '../data/calendarData'

type GytOption = { id: string; name: string }

type GytWeeklyCalendarProps = {
  weekStart: Date
  today: Date
  gytList: GytOption[]
  selectedGytId: string | null // null = összesített (minden kolléga egyben)
  getSlot: (gytId: string, dateISO: string, hour: number) => TimeSlot
  // opcionális: ha nincs megadva, a rács csak KAPACITÁS-áttekintő, egyetlen
  // sáv sem kattintható (pl. a "gyt naptárak" fülön, ahol a tényleges
  // foglalás mindig a saját-naptár hívás-kártyáról vagy az űrlapról indul)
  onFreeSlotClick?: (gytId: string, gytName: string, dateISO: string, hour: number) => void
  // opcionális: FOGLALT sávok kattinthatóvá tétele (pl. a "hívásaim" saját
  // naptár-nézetén, ahol minden foglalt sáv egy saját hívás — rákattintva egy
  // gyors előnézet nyílik) — a "gyt naptárak" kapacitás-áttekintőn nincs átadva
  onBookedSlotClick?: (gytId: string, dateISO: string, hour: number) => void
  // opcionális: felülírja az alapértelmezett, kolléganként fix gytColorVar()
  // színt egy sávonként eltérő színnel (pl. a "hívásaim" saját naptárán, ahol
  // a szín a hívás kimenetétől és attól függ, hogy múltbeli vagy jövőbeli
  // időpontról van-e szó) — ha nincs átadva, a megszokott kolléga-szín marad
  getSlotColor?: (gytId: string, dateISO: string, hour: number, slot: TimeSlot) => { solid: string; tint: string }
}

function SlotBlock({
  status,
  label,
  color,
  onClick,
}: {
  status: TimeSlot['status']
  label?: string
  color: { solid: string; tint: string }
  onClick?: () => void
}) {
  if (!status) return null
  const isFree = status === 'szabad'
  return (
    <button
      type="button"
      className="gyt-cal-slot"
      disabled={!onClick}
      onClick={onClick}
      style={{
        backgroundColor: isFree ? color.tint : color.solid,
        color: isFree ? 'var(--color-text)' : 'var(--offwhite)',
        cursor: onClick ? 'pointer' : 'default',
      }}
      title={label ?? (isFree ? 'szabad' : 'foglalt')}
    >
      {!isFree && label ? <span className="gyt-cal-slot-label">{label}</span> : null}
    </button>
  )
}

export default function GytWeeklyCalendar({ weekStart, today, gytList, selectedGytId, getSlot, onFreeSlotClick, onBookedSlotClick, getSlotColor }: GytWeeklyCalendarProps) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const todayISO = formatISODate(today)
  const singleGyt = selectedGytId ? gytList.find((g) => g.id === selectedGytId) : null

  return (
    <div className="gyt-cal-wrap">
      <div className="gyt-cal-grid">
        <div className="gyt-cal-corner" />
        {days.map((d) => {
          const { weekday, day } = formatDayHeader(d)
          const isToday = formatISODate(d) === todayISO
          return (
            <div key={d.toISOString()} className={`gyt-cal-day-header ${isToday ? 'is-today' : ''}`}>
              <span className="gyt-cal-weekday">{weekday}</span>
              <span className="gyt-cal-daynum">{day}</span>
            </div>
          )
        })}

        {BUSINESS_HOURS.map((hour) => (
          <Fragment key={hour}>
            <div className="gyt-cal-hour">{formatHour(hour)}</div>
            {days.map((d) => {
              const dateISO = formatISODate(d)
              if (selectedGytId) {
                const slot = getSlot(selectedGytId, dateISO, hour)
                return (
                  <div key={`${dateISO}-${hour}`} className="gyt-cal-cell">
                    <SlotBlock
                      status={slot.status}
                      label={slot.label}
                      color={
                        getSlotColor
                          ? getSlotColor(selectedGytId, dateISO, hour, slot)
                          : { solid: gytColorVar(selectedGytId), tint: gytColorVar(selectedGytId, 0.22) }
                      }
                      onClick={
                        slot.status === 'szabad' && onFreeSlotClick
                          ? () => onFreeSlotClick(selectedGytId, singleGyt?.name ?? '', dateISO, hour)
                          : slot.status === 'foglalt' && onBookedSlotClick
                            ? () => onBookedSlotClick(selectedGytId, dateISO, hour)
                            : undefined
                      }
                    />
                  </div>
                )
              }
              // összesített nézet: MINDIG annyi sáv, ahány GYT van összesen
              // (2026.08.28., 6. kör, Marci kérésére — korábban csak azoknak
              // a kollégáknak volt sávjuk, akiknek volt állapotuk az adott
              // órában, ami cellánként eltérő sáv-számot adott, összezavaró
              // volt) — akinek nincs állapota, annak egy üres, láthatatlan
              // helykitöltő sávja van, hogy az oszlop-igazítás mindig azonos
              // maradjon minden cellában
              return (
                <div key={`${dateISO}-${hour}`} className="gyt-cal-cell gyt-cal-cell--lanes">
                  {gytList.map((g) => {
                    const slot = getSlot(g.id, dateISO, hour)
                    if (!slot.status) return <span key={g.id} className="gyt-cal-slot gyt-cal-slot--empty" />
                    return (
                      <SlotBlock
                        key={g.id}
                        status={slot.status}
                        label={slot.label}
                        color={
                          getSlotColor
                            ? getSlotColor(g.id, dateISO, hour, slot)
                            : { solid: gytColorVar(g.id), tint: gytColorVar(g.id, 0.3) }
                        }
                        onClick={
                          slot.status === 'szabad' && onFreeSlotClick
                            ? () => onFreeSlotClick(g.id, g.name, dateISO, hour)
                            : slot.status === 'foglalt' && onBookedSlotClick
                              ? () => onBookedSlotClick(g.id, dateISO, hour)
                              : undefined
                        }
                      />
                    )
                  })}
                </div>
              )
            })}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

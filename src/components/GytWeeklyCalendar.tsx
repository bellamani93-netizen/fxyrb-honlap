import { Fragment, type CSSProperties } from 'react'
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
  // opcionális: a TELJESEN üres (nincs meghirdetve, `slot.status` sincs) órákat is
  // kattinthatóvá teszi (pl. a GYT saját "naptáram" nézetén, ahol bármelyik üres
  // helyre fel lehet venni új időpontot, nem csak a már meghirdetett "szabad"
  // sávokra) — ha nincs átadva, egy üres óra változatlanul nem kattintható (null).
  onEmptySlotClick?: (gytId: string, gytName: string, dateISO: string, hour: number) => void
  // opcionális: felülírja az alapértelmezett, kolléganként fix gytColorVar()
  // színt egy sávonként eltérő színnel (pl. a "hívásaim" saját naptárán, ahol
  // a szín a hívás kimenetétől és attól függ, hogy múltbeli vagy jövőbeli
  // időpontról van-e szó) — ha nincs átadva, a megszokott kolléga-szín marad
  getSlotColor?: (gytId: string, dateISO: string, hour: number, slot: TimeSlot) => { solid: string; tint: string; textSolid?: string; textTint?: string }
}

// ha egy sáv NEM kerek egész órakor kezdődik (pl. 9:30), a felirat elé
// kerül a pontos idő — a vizuális elcsúszás (ld. verticalOffsetPct) sokszor
// csak néhány pixelnyi különbséget okoz egy ilyen apró sávnál, a pontos idő
// szövegesen is egyértelművé teszi (2026.09.01., Marci kérésére). Az
// ellipszis-vágás (ld. .gyt-cal-slot-label) a felirat VÉGÉT vágja, ezért a
// legelső, legfontosabb infó (a pontos idő) még a legszűkebb, "összesített"
// nézet sávjaiban is látszik.
function slotLabelWithTime(label: string | undefined, hour: number, minute: number | undefined) {
  if (!label || !minute) return label
  return `${hour}:${String(minute).padStart(2, '0')} ${label}`
}

// Egy sáv függőleges elhelyezkedése a SAJÁT órás cellájában — kerek egész
// óránál (minute=0) pontosan kitölti a cellát, mint eddig. Ha nem kerek
// órakor kezdődik, a cella alsó, "perc/60" arányú részétől indul, és
// TOVÁBBRA IS pontosan 1 cellányi magas marad — vagyis a teteje a cella
// alján túllóg, át a KÖVETKEZŐ órás cellába, pont annyi arányban, amennyi a
// kezdő perc (pl. 9:30 → a 9-es cella alsó feléből indul, átlóg a 10-es
// cella felső feléig; 9:15 → a cella alsó negyedéből indul). Ez váltja ki a
// korábbi, csak szöveges/kereten alapuló jelzést (2026.09.01., Marci
// kérésére: "a naptárban ne töltse ki a kockát, hanem a kocka felétől
// átlógjon a másik kocka feléig").
function verticalOffsetPct(minute: number | undefined) {
  return minute ? (minute / 60) * 100 : 0
}

function SlotBlock({
  status,
  label,
  minute,
  color,
  onClick,
  onEmptyClick,
  horizontalStyle,
}: {
  status: TimeSlot['status']
  label?: string
  minute?: number
  // textSolid/textTint opcionális felülírás (alapértelmezés a GYT-kapacitás-
  // nézethez illik: fehér szöveg az élénk "szabad" háttéren, normál
  // szövegszín a fakó "foglalt" háttéren) — a "saját naptár" (más szemantikájú
  // színezés, ld. SalesHivasaim.tsx getOwnSlotColor) mindkettőt felülírja
  color: { solid: string; tint: string; textSolid?: string; textTint?: string }
  onClick?: () => void
  onEmptyClick?: () => void
  // az "összesített" (több-sávos) nézetben a sáv vízszintes helyét/szélességét
  // adja meg (ld. lentebb) — egyetlen GYT nézetében nincs rá szükség, a sáv a
  // teljes cellaszélességet kapja
  horizontalStyle?: CSSProperties
}) {
  const offset = verticalOffsetPct(minute)
  const positionStyle: CSSProperties = {
    position: 'absolute',
    top: `${offset}%`,
    height: '100%',
    left: 0,
    right: 0,
    zIndex: offset ? 2 : 1,
    ...horizontalStyle,
  }

  if (!status) {
    // ha a hívó kattinthatóvá tette az üres órákat is (ld. onEmptySlotClick),
    // egy láthatatlan, de kattintható sáv jelenik meg — egyébként (a legtöbb
    // helyen, pl. SALES kapacitás-áttekintő) változatlanul nincs itt semmi
    if (!onEmptyClick) return null
    return (
      <button
        type="button"
        className="gyt-cal-slot gyt-cal-slot--empty-clickable"
        onClick={onEmptyClick}
        title="új időpont létrehozása"
        style={{ position: 'absolute', top: 0, height: '100%', left: 0, right: 0, ...horizontalStyle }}
      />
    )
  }
  const isFree = status === 'szabad'
  // 2026.08.28., 7. kör, Marci kérésére MEGFORDÍTVA: a SZABAD sáv kapja a
  // tömör, élénk színt (hogy azonnal kitűnjön, hol van hely), a FOGLALT sáv
  // a fakóbb, áttetsző tint-et (kevésbé versenyez a figyelemért) — a korábbi
  // logika pont fordítva volt
  return (
    <button
      type="button"
      className="gyt-cal-slot"
      disabled={!onClick}
      onClick={onClick}
      style={{
        ...positionStyle,
        backgroundColor: isFree ? color.solid : color.tint,
        color: isFree ? (color.textSolid ?? 'var(--offwhite)') : (color.textTint ?? 'var(--color-text)'),
        cursor: onClick ? 'pointer' : 'default',
      }}
      title={label ?? (isFree ? 'szabad' : 'foglalt')}
    >
      {!isFree && label ? <span className="gyt-cal-slot-label">{label}</span> : null}
    </button>
  )
}

export default function GytWeeklyCalendar({ weekStart, today, gytList, selectedGytId, getSlot, onFreeSlotClick, onBookedSlotClick, onEmptySlotClick, getSlotColor }: GytWeeklyCalendarProps) {
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
                      label={slotLabelWithTime(slot.label, hour, slot.minute)}
                      minute={slot.minute}
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
                      onEmptyClick={onEmptySlotClick ? () => onEmptySlotClick(selectedGytId, singleGyt?.name ?? '', dateISO, hour) : undefined}
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
              // maradjon minden cellában. A sávok mindegyike (a nem kerek
              // órakor kezdődők függőleges átlógása miatt, ld. SlotBlock)
              // abszolút pozicionált, fix index/n szélességgel — ez felváltja
              // a korábbi flex-elrendezést, mert egy abszolút pozicionált
              // gyereknél a flex "gap"/arányos-szélesség logika már nem
              // működne (2026.09.01., Marci kérésére).
              return (
                <div key={`${dateISO}-${hour}`} className="gyt-cal-cell gyt-cal-cell--lanes">
                  {gytList.map((g, i) => {
                    const laneStyle: CSSProperties = { left: `${(i / gytList.length) * 100}%`, right: 'auto', width: `${100 / gytList.length}%` }
                    const slot = getSlot(g.id, dateISO, hour)
                    if (!slot.status) {
                      return <span key={g.id} className="gyt-cal-slot gyt-cal-slot--empty" style={{ position: 'absolute', top: 0, height: '100%', ...laneStyle }} />
                    }
                    return (
                      <SlotBlock
                        key={g.id}
                        status={slot.status}
                        label={slotLabelWithTime(slot.label, hour, slot.minute)}
                        minute={slot.minute}
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
                        horizontalStyle={laneStyle}
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

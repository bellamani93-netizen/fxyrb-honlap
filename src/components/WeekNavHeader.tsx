import { addDays, formatDateOnly, formatYearMonth } from '../data/calendarData'

// egységes heti naptár-fejléc — a GYT saját naptárán (`GytNaptar.tsx`)
// bevezetett mobil-korrekció (2026.09.02.) mostantól MINDEN heti naptár-
// nézeten (SALES "hívásaim" saját naptára, SALES "gyt naptárak" kapacitás-
// áttekintője) egységesen megjelenik, Marci kérésére ("az összes gyt-
// naptárban alkalmazott telefonos korrekciót alkalmazd az összes többi fiók
// összes naptárjára az egységes kép érdekében") — egy közös komponensben,
// hogy a 3 hívóhely ne csúszhasson el egymástól.
//
// Asztalon (lg+) változatlan: "‹ ez a hét" mindig a 0. hétre ugrik, a dátum-
// tartomány (pl. "2026.08.31. – 2026.09.06.") középen, "következő hét ›"
// eggyel léptet előre (NEM fix 1-re ugrik — enélkül egy mobilon elért,
// 1-nél távolabbi hétről asztalra váltva a gomb VISSZAFELÉ ugrana).
// Mobilon egysoros fejléc: bal/jobb kör-nyilak tetszőleges számú hetet
// léptetnek, középen "{év}. {hónap}" (vagy hónapváltás esetén "{év}
// {hó1}/{hó2}") felirat.
export default function WeekNavHeader({
  weekOffset,
  setWeekOffset,
  weekStart,
}: {
  weekOffset: number
  setWeekOffset: (updater: number | ((w: number) => number)) => void
  weekStart: Date
}) {
  return (
    <>
      <div className="d-none d-lg-flex align-items-center justify-content-end gap-2 mb-3">
        <button type="button" className="btn-fyb btn-fyb-ghost" disabled={weekOffset === 0} onClick={() => setWeekOffset(0)}>
          ‹ ez a hét
        </button>
        <span className="small fw-bold">
          {formatDateOnly(weekStart)} – {formatDateOnly(addDays(weekStart, 6))}
        </span>
        <button type="button" className="btn-fyb btn-fyb-ghost" onClick={() => setWeekOffset((w) => w + 1)}>
          következő hét ›
        </button>
      </div>

      <div className="d-flex d-lg-none align-items-center justify-content-between mb-3">
        <button type="button" className="circle-icon-btn circle-icon-btn--add" aria-label="előző hét" onClick={() => setWeekOffset((w) => w - 1)}>
          ‹
        </button>
        <span className="fw-bold">{formatYearMonth(weekStart)}</span>
        <button type="button" className="circle-icon-btn circle-icon-btn--add" aria-label="következő hét" onClick={() => setWeekOffset((w) => w + 1)}>
          ›
        </button>
      </div>
    </>
  )
}

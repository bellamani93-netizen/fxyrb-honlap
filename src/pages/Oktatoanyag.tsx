import { useOktatoanyag, type Lecke } from '../context/OktatoanyagContext'

// "oktatóanyag" (2026.09.18., Marci kérésére, 3. fázis — újraegyeztetett
// terv, ld. OktatoanyagContext.tsx jegyzete). A leckéket/fejezeteket az
// admin veszi fel (AdminAnyagok.tsx), itt csak megjelennek — ez a legelső
// hely a projektben, ahol egy ÜF-oldali tartalomlista teljes egészében
// admin-szerkesztett, session-szintű adatból épül fel (nem kódba írt
// konstansból). A fejezetek egyelőre placeholder videók (ld. Marci
// kérése: "most csak egy placeholder UI kell, ahol látszódik, mintha ott
// videók lennének").

function FejezetRow({ title }: { title: string }) {
  return (
    <div className="lecke-fejezet-row">
      <span className="play-btn play-btn-sm">▶</span>
      <span>{title}</span>
    </div>
  )
}

function LeckeCard({ lecke }: { lecke: Lecke }) {
  const { completedLeckeIds, markLeckeCompleted } = useOktatoanyag()
  const completed = completedLeckeIds.has(lecke.id)

  return (
    <div className="card-fyb mb-3">
      <h2 className="h5 mb-3">{lecke.title}</h2>

      {lecke.fejezetek.length === 0 ? (
        <p className="small mb-0" style={{ color: 'var(--color-text-muted)' }}>ehhez a leckéhez még nincs feltöltött fejezet.</p>
      ) : (
        <div className="d-flex flex-column mb-3">
          {lecke.fejezetek.map((f) => (
            <FejezetRow key={f.id} title={f.title} />
          ))}
        </div>
      )}

      <div className="d-flex align-items-center gap-3 mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
        <span className="fw-bold small">tudáscheck</span>
        {completed ? (
          <span className="badge-fyb">✓ teljesítve</span>
        ) : (
          <button type="button" className="btn-fyb btn-fyb-outline btn-fyb-sm" onClick={() => markLeckeCompleted(lecke.id)}>
            tudáscheck teljesítése
          </button>
        )}
      </div>
    </div>
  )
}

export default function Oktatoanyag() {
  const { leckek, allChecksCompleted } = useOktatoanyag()

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 860 }}>
        <div className="app-page-header mb-3 mobile-sticky-header">
          <h1 className="app-page-title mb-0">oktatóanyag</h1>
        </div>

        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          nézd végig mindkét lecke fejezeteit, majd teljesítsd a tudáscheck-et — ha mindkettővel végeztél, megnyílik a munkafüzet.
        </p>

        {leckek.map((l) => (
          <LeckeCard key={l.id} lecke={l} />
        ))}

        {!allChecksCompleted && (
          <p className="small mb-0" style={{ color: 'var(--color-text-muted)' }}>
            a munkafüzet a fenti tudáscheck-ek teljesítése után nyílik meg.
          </p>
        )}
      </div>
    </section>
  )
}

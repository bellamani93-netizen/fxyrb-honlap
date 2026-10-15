import { useState } from 'react'
import { useMaterials, isBuiltInCode } from '../context/MaterialsContext'
import { useOktatoanyag } from '../context/OktatoanyagContext'
import { EXERCISES, SEQUENCES, type ExerciseCode } from '../data/tornaSzintek'

const ALL_CODES = Object.keys(EXERCISES) as ExerciseCode[]

// hányadik szintként szerepel a gyakorlat az egyes sorrendekben (LOO, LON, …) —
// a GYT így látja, melyik videó melyik szinthez tartozik
function levelNumbers(code: ExerciseCode): string {
  const parts = (Object.entries(SEQUENCES) as [string, ExerciseCode[]][])
    .map(([key, seq]) => {
      const nums = seq.map((c, i) => (c === code ? i + 1 : 0)).filter(Boolean)
      return nums.length ? `${key}: ${nums.join(', ')}. szint` : null
    })
    .filter(Boolean)
  return parts.join(' · ')
}

function VideoCard({ title, subtitle, url }: { title: string; subtitle?: string; url?: string }) {
  return (
    <div className="card-fyb h-100">
      <div className="video-thumb mb-2">
        {url ? <video src={url} controls /> : <span className="play-btn">▶</span>}
      </div>
      <h3 className="h6 mb-1">{title}</h3>
      {subtitle && <p className="small mb-0" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</p>}
      {!url && <p className="small mb-0 mt-1" style={{ color: 'var(--color-text-muted)' }}>a videó még nincs feltöltve</p>}
    </div>
  )
}

type Tab = 'oktatoanyag' | 'szintek'

// GYT "oktatóanyag": az összes videó egy helyen — az oktatóanyag leckéi és
// fejezetei, valamint az összes szint (gyakorlat) videója, plusz az admin által
// létrehozott egyedi videók. Csak olvasható nézet, nem ügyfélhez kötött.
export default function GytOktatoanyag() {
  const { leckek } = useOktatoanyag()
  const { materials, getMaterialByCode } = useMaterials()
  const [tab, setTab] = useState<Tab>('oktatoanyag')
  const custom = materials.filter((m) => !isBuiltInCode(m.code))

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 1000 }}>
        <div className="app-page-header mb-3 mobile-sticky-header">
          <h1 className="app-page-title mb-0">oktatóanyag</h1>
        </div>

        <div className="auth-tabs mb-4">
          <button type="button" className={`auth-tab ${tab === 'oktatoanyag' ? 'active' : ''}`} onClick={() => setTab('oktatoanyag')}>
            oktatóanyag videói
          </button>
          <button type="button" className={`auth-tab ${tab === 'szintek' ? 'active' : ''}`} onClick={() => setTab('szintek')}>
            szintek videói
          </button>
        </div>

        {tab === 'oktatoanyag' && (
          <div className="d-flex flex-column gap-3">
            {leckek.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>Még nincs lecke felvéve.</p>}
            {leckek.map((l) => (
              <div className="card-fyb" key={l.id}>
                <h2 className="h5 mb-3">{l.title}</h2>
                {l.fejezetek.length === 0 ? (
                  <p className="small mb-0" style={{ color: 'var(--color-text-muted)' }}>ehhez a leckéhez még nincs feltöltött fejezet.</p>
                ) : (
                  <div className="d-flex flex-column">
                    {l.fejezetek.map((f) => (
                      <div className="lecke-fejezet-row" key={f.id}>
                        <span className="play-btn play-btn-sm">▶</span>
                        <span>{f.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'szintek' && (
          <>
            <p className="small mb-3" style={{ color: 'var(--color-text-muted)' }}>
              Az összes szint (gyakorlat) videója. A szint-szám a különböző sorrendekben (pl. LOO, LON) eltérhet — a kártyákon látszik, melyik sorrendben hányadik szint.
            </p>
            <div className="row g-3">
              {ALL_CODES.map((code) => (
                <div className="col-12 col-md-6 col-xl-4" key={code}>
                  <VideoCard
                    title={`${code} ${EXERCISES[code].name}`}
                    subtitle={levelNumbers(code)}
                    url={getMaterialByCode(code)?.videoUrl}
                  />
                </div>
              ))}
            </div>

            {custom.length > 0 && (
              <>
                <h2 className="h6 mt-5 mb-3">egyedi videók ({custom.length})</h2>
                <div className="row g-3">
                  {custom.map((m) => (
                    <div className="col-12 col-md-6 col-xl-4" key={m.id}>
                      <VideoCard title={`${m.code} ${m.title}`} url={m.videoUrl} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  )
}

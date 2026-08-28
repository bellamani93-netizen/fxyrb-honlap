import { useSalesData } from '../context/SalesDataContext'

// A 2 elutasító-üzenet sablon szerkesztő felülete — a hívás-módosító popup
// piros ("törlés") gombja innen választ, amikor egy foglalást elutasítva
// automata üzenetet küld az ügyfélnek (ld. CallDetailModal.tsx). A "{Név}"
// jelölő a küldéskor az ügyfél nevére cserélődik.
export default function SalesUzenetek() {
  const { messageTemplates, setMessageTemplates } = useSalesData()

  function updateTemplate(index: 0 | 1, value: string) {
    setMessageTemplates((prev) => {
      const next: [string, string] = [...prev]
      next[index] = value
      return next
    })
  }

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 900 }}>
        <div className="app-page-header mb-3">
          <h1 className="app-page-title mb-0">üzenetek</h1>
        </div>

        <p className="mb-3" style={{ color: 'var(--color-text-muted)' }}>
          ez a 2 elutasító-üzenet szöveg jelenik meg választható sablonként, amikor egy hívást törölsz és értesítőt küldesz — a "{'{Név}'}" jelölő a küldéskor az ügyfél nevére cserélődik.
        </p>

        <div className="row g-3">
          {messageTemplates.map((tpl, i) => (
            <div className="col-12 col-lg-6" key={i}>
              <div className="card-fyb h-100">
                <h2 className="h6 mb-3">{i + 1}. változat</h2>
                <textarea
                  className="form-control"
                  rows={6}
                  value={tpl}
                  onChange={(e) => updateTemplate(i as 0 | 1, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

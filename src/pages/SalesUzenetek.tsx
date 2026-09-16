import { useSalesData, type MessageTemplate } from '../context/SalesDataContext'

// A 2 elutasító-üzenet sablon szerkesztő felülete — a hívás-módosító popup
// piros ("törlés") gombja innen választ, amikor egy foglalást elutasítva
// automata üzenetet küld az ügyfélnek (ld. CallDetailModal.tsx). A "{Név}"
// jelölő a küldéskor az ügyfél nevére cserélődik. A "name" mező rövid,
// elnevezés-jellegű szöveg — CSAK ez jelenik meg a törlés-popup gombján,
// nem a teljes üzenetszöveg (2026.08.28., 4. kör, Marci kérésére).
export default function SalesUzenetek() {
  const { messageTemplates, setMessageTemplates, positiveTemplate, setPositiveTemplate } = useSalesData()

  function updateTemplate(index: 0 | 1, field: 'name' | 'body', value: string) {
    setMessageTemplates((prev) => {
      const next: [MessageTemplate, MessageTemplate] = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  function updatePositiveTemplate(field: 'name' | 'subject' | 'body', value: string) {
    setPositiveTemplate((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 900 }}>
        <div className="app-page-header mb-3 mobile-sticky-header">
          <h1 className="app-page-title mb-0">üzenetek</h1>
        </div>

        {/* "Pozitív elbírálás" — a 2 elutasító sablontól elkülönítve, saját
           szekcióban (2026.09.16., Marci kérésére) — a hívás-módosító popup
           "email küldése" szekciójában ez zöld/lime gombként jelenik meg a 2
           piros elutasító mellett, elküldése törli a hívás lime "új" jelzőjét. */}
        <h2 className="h6 mb-2">elfogadás</h2>
        <p className="mb-3" style={{ color: 'var(--color-text-muted)' }}>
          ezt az üzenetet küldi a hívás-módosító popup "Pozitív elbírálás" gombja — elküldése eltünteti a lime "új" jelzőt a hívás mellől. A "{'{Név}'}" jelölő az ügyfél nevére, a "{'{Hónap}'}"/"{'{Nap}'}"/"{'{Időpont}'}" jelölők a hívás saját, lefoglalt időpontjára cserélődnek a küldéskor.
        </p>
        <div className="card-fyb card-fyb--lime-border mb-4">
          <label className="form-label small fw-bold" htmlFor="tpl-positive-name">elnevezés</label>
          <input
            id="tpl-positive-name"
            type="text"
            className="form-control mb-3"
            placeholder="pl. Pozitív elbírálás"
            value={positiveTemplate.name}
            onChange={(e) => updatePositiveTemplate('name', e.target.value)}
          />
          <label className="form-label small fw-bold" htmlFor="tpl-positive-subject">tárgy</label>
          <input
            id="tpl-positive-subject"
            type="text"
            className="form-control mb-3"
            placeholder="pl. Pozitív elbírálás: hívni foglak {Hónap} {Nap}-n!"
            value={positiveTemplate.subject ?? ''}
            onChange={(e) => updatePositiveTemplate('subject', e.target.value)}
          />
          <label className="form-label small fw-bold" htmlFor="tpl-positive-body">üzenet szövege</label>
          <textarea
            id="tpl-positive-body"
            className="form-control"
            rows={8}
            value={positiveTemplate.body}
            onChange={(e) => updatePositiveTemplate('body', e.target.value)}
          />
        </div>

        <h2 className="h6 mb-2">elutasítás</h2>
        <p className="mb-3" style={{ color: 'var(--color-text-muted)' }}>
          ez a 2 elutasító-üzenet szolgál választható sablonként, amikor egy hívást törölsz és értesítőt küldesz — a törlés-popup gombján csak az elnevezés látszik, a "{'{Név}'}" jelölő pedig a küldéskor az ügyfél nevére cserélődik.
        </p>

        <div className="row g-3">
          {messageTemplates.map((tpl, i) => (
            <div className="col-12 col-lg-6" key={i}>
              <div className="card-fyb h-100">
                <h2 className="h6 mb-3">{i + 1}. változat</h2>
                <label className="form-label small fw-bold" htmlFor={`tpl-name-${i}`}>elnevezés</label>
                <input
                  id={`tpl-name-${i}`}
                  type="text"
                  className="form-control mb-3"
                  placeholder="pl. lemondás — kapacitáshiány"
                  value={tpl.name}
                  onChange={(e) => updateTemplate(i as 0 | 1, 'name', e.target.value)}
                />
                <label className="form-label small fw-bold" htmlFor={`tpl-body-${i}`}>üzenet szövege</label>
                <textarea
                  id={`tpl-body-${i}`}
                  className="form-control"
                  rows={6}
                  value={tpl.body}
                  onChange={(e) => updateTemplate(i as 0 | 1, 'body', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

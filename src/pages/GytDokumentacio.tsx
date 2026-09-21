import { useEffect, useState } from 'react'
import { useClients } from '../context/ClientsContext'
import { getSelectedClientId } from '../data/initialClients'
import {
  useDokumentacio,
  ALKALOM_COUNT,
  EDIT_WINDOW_WEEKS,
  type DokumentacioEntry,
} from '../context/DokumentacioContext'
import Eredmenyeim from './Eredmenyeim'
import Icon from '../components/Icon'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('hu-HU')
}

function editableUntil(savedAtISO: string) {
  const d = new Date(savedAtISO)
  d.setDate(d.getDate() + EDIT_WINDOW_WEEKS * 7)
  return d
}

// gyorsgombok kezelése + beszúrása (2026.09.21., Marci kérésére) — a GYT
// saját, KÖZÖS (nem ügyfelenkénti) listája tipikus/ismétlődő
// megfogalmazásokhoz. Kattintásra a szöveg a mező VÉGÉHEZ fűződik (nem a
// kurzorpozícióhoz — session-szintű prototípusban elegendő egyszerűsítés).
function QuickButtons({ onInsert }: { onInsert: (text: string) => void }) {
  const { quickButtons, addQuickButton, removeQuickButton } = useDokumentacio()
  const [newText, setNewText] = useState('')

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newText.trim()
    if (!trimmed) return
    addQuickButton(trimmed)
    setNewText('')
  }

  return (
    <div className="mb-3">
      <span className="small fw-bold d-block mb-2">gyorsgombok</span>
      {quickButtons.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-2">
          {quickButtons.map((b) => (
            <span key={b.id} className="d-inline-flex align-items-center gap-1">
              <button
                type="button"
                className="btn-fyb btn-fyb-outline btn-fyb-sm"
                onClick={() => onInsert(b.text)}
              >
                {b.text}
              </button>
              <button
                type="button"
                onClick={() => removeQuickButton(b.id)}
                aria-label="gyorsgomb törlése"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
              >
                <Icon src="/icons/ikon_kuka.svg" style={{ width: '1rem', height: '1rem' }} />
              </button>
            </span>
          ))}
        </div>
      )}
      <form onSubmit={handleAdd} className="d-flex gap-2 flex-wrap">
        <input
          type="text"
          className="form-control form-control-sm"
          style={{ maxWidth: 260 }}
          placeholder="új gyorsgomb szövege"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
        />
        <button type="submit" className="btn-fyb btn-fyb-outline btn-fyb-sm" disabled={!newText.trim()}>+ gyorsgomb</button>
      </form>
    </div>
  )
}

// egy alkalom dokumentációs blokkja — a munkafüzet mentés/readOnly/
// szerkesztés mintáját követi (ld. Munkafuzet.tsx), kiegészítve az
// időkorlátos szerkeszthetőséggel (ld. DokumentacioContext.tsx).
function EntryEditor({ clientId, entry }: { clientId: string; entry: DokumentacioEntry }) {
  const { saveEntry, isEntryEditable, isArchived } = useDokumentacio()
  const editableNow = isEntryEditable(clientId, entry)
  const [draft, setDraft] = useState(entry.text)
  const [editing, setEditing] = useState(!entry.savedAt)

  useEffect(() => {
    setDraft(entry.text)
    setEditing(!entry.savedAt)
  }, [entry.alkalom, entry.text, entry.savedAt])

  function handleInsert(text: string) {
    setDraft((d) => (d.trim() ? `${d}\n${text}` : text))
  }

  function handleSave() {
    saveEntry(clientId, entry.alkalom, draft)
    setEditing(false)
  }

  const showEditor = editing && editableNow

  return (
    <div>
      {showEditor ? (
        <>
          <textarea
            className="form-control mb-3"
            rows={6}
            placeholder="dokumentáció szövege…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <QuickButtons onInsert={handleInsert} />
        </>
      ) : (
        <p className="mb-3" style={{ whiteSpace: 'pre-wrap' }}>
          {entry.text || <span style={{ color: 'var(--color-text-muted)' }}>még nincs dokumentáció rögzítve.</span>}
        </p>
      )}

      <div className="d-flex align-items-center flex-wrap gap-3 no-print">
        {showEditor ? (
          <button type="button" className="btn-fyb btn-fyb-primary" onClick={handleSave} disabled={!draft.trim()}>
            Rögzítés
          </button>
        ) : entry.savedAt ? (
          <>
            <span className="badge-fyb">✓ rögzítve</span>
            {editableNow ? (
              <button type="button" className="btn-fyb btn-fyb-outline btn-fyb-sm" onClick={() => setEditing(true)}>
                szerkesztés
              </button>
            ) : (
              <span className="small" style={{ color: 'var(--color-text-muted)' }}>
                {isArchived(clientId) ? 'az együttműködés lezárva — nem szerkeszthető' : 'a szerkesztési határidő lejárt'}
              </span>
            )}
          </>
        ) : null}
        {entry.savedAt && (
          <span className="small" style={{ color: 'var(--color-text-muted)' }}>
            rögzítve: {formatDate(entry.savedAt)}
            {editableNow && ` — szerkeszthető: ${formatDate(editableUntil(entry.savedAt).toISOString())}-ig`}
          </span>
        )}
      </div>
    </div>
  )
}

export default function GytDokumentacio() {
  const { clients } = useClients()
  const client = clients.find((c) => c.id === getSelectedClientId())!
  const { getEntries, isArchived } = useDokumentacio()
  const [selected, setSelected] = useState(1)
  const entries = getEntries(client.id)
  const activeEntry = entries.find((e) => e.alkalom === selected)!
  const archived = isArchived(client.id)

  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 900 }}>
        <div className="app-page-header mb-3 mobile-sticky-header d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h1 className="app-page-title mb-0">dokumentáció — {client.name}</h1>
          <button type="button" className="btn-fyb btn-fyb-outline btn-fyb-sm no-print" onClick={() => window.print()}>
            nyomtatás / PDF
          </button>
        </div>

        {archived && (
          <div className="select-client-notice mb-3 no-print">
            <Icon src="/icons/ikon_lakat.svg" style={{ width: '1.4rem', height: '1.4rem', flexShrink: 0 }} />
            <span>az együttműködés lezárva — a dokumentáció archívumba került, nem szerkeszthető.</span>
          </div>
        )}

        <div className="auth-tabs mb-3 no-print" style={{ flexWrap: 'wrap', height: 'auto' }}>
          {entries.map((e) => (
            <button
              key={e.alkalom}
              type="button"
              className={`auth-tab ${selected === e.alkalom ? 'active' : ''}`}
              onClick={() => setSelected(e.alkalom)}
            >
              {e.alkalom}. alkalom{e.alkalom === ALKALOM_COUNT ? ' (záró)' : ''}
            </button>
          ))}
        </div>

        <div className="card-fyb mb-4 no-print">
          {selected === 1 && (
            <div className="mb-4">
              <Eredmenyeim displayName={client.name} />
            </div>
          )}
          <h2 className="h6 mb-3">{selected}. alkalom dokumentációja</h2>
          <EntryEditor clientId={client.id} entry={activeEntry} />
        </div>

        {/* nyomtatáskor (PDF-export) az ÖSSZES alkalom egyben, egymás után
           jelenik meg — ld. Projekt specifikáció: "Egyben PDF generálható:
           1. oldal Állapotfelmérő eredménylap, 2. oldal 1. konzultáció
           dok., stb." A JSX mindig rendereli, a láthatóságot a
           `.dokumentacio-print-only` CSS-szabály dönti el (components.css),
           ugyanaz a minta, mint az Eredmenyeim.tsx `eredmeny-print-only`-ja. */}
        <div className="dokumentacio-print-only">
          <Eredmenyeim displayName={client.name} />
          {entries.map((e) => (
            <div className="card-fyb mb-4" key={e.alkalom}>
              <h2 className="h6 mb-3">{e.alkalom}. alkalom dokumentációja</h2>
              <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                {e.text || 'még nincs dokumentáció rögzítve.'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

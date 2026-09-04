import { memo, useEffect, useRef } from 'react'

// Az állapotfelmérő utolsó (görgethető) lapja — Marci a "kalkulator.odt"
// fájlban adta át a kész, működő gerincterhelés-kalkulátort (2026.09.04.).
// KIFEJEZETT KÉRÉSE: "Minden logikája maradjon az eredeti, de a design
// alkalmazkodjon a design szabályainkhoz." Ennek megfelelően:
// - a HTML-szerkezet és a <script> teljes SZÁMÍTÁSI LOGIKÁJA (activities
//   tömb, load/akt. zóna-határok, snapUp/snapDown, recalc, óra-limit stb.)
//   szó szerint, változtatás nélkül átemelve (csak a `document.getElementById`
//   globális kereséseket cseréltük `container`-en belüli kereséssé, hogy egy
//   SPA-ban ne ütközhessen más oldal azonos id-jével — ez NEM a logikát,
//   csak a DOM-elérés módját érinti);
// - a <style> változott: a korábbi, önálló (Elementor-beágyazásra szánt)
//   színpaletta/betűtípus helyett a `.gt-calc-container` MINDEN CSS-változója
//   a projekt saját design-tokenjeire mutat (--color-primary, --color-surface,
//   --radius-card stb.) — így világos/sötét módban is automatikusan a
//   projekt palettáját követi, nem kellett külön sötét-mód szabályt írni. A
//   terhelési/aktivitási ZÓNASZÍNEK (--z1..z6, --a1..a5) szándékosan
//   VÁLTOZATLANOK maradtak — ez egy saját, jelentéssel bíró (piros→zöld)
//   skála, ugyanúgy elkülönítve a márkaszínektől, mint pl. a GYT-naptár
//   kolléga-színei vagy a macOS-szerű gombszínek (ld. theme.css).
const CALCULATOR_HTML = `
<div class="gt-calc-container">
  <div class="wrap">
    <header>
      <div>
        <h1>Gerincterhelés kalkulátor</h1>
        <p>Add meg egy átlagos napod tevékenységeit óránként — a kalkulátor kiszámolja a napi gerincterhelést és aktivitási szintet.</p>
      </div>
      <div class="actions">
        <button type="button" id="btnExample">Példa nap</button>
        <button type="button" id="btnReset" class="primary">Új számítás</button>
      </div>
    </header>
    <div class="sticky-panel">
      <div class="summary">
        <div class="card">
          <div class="card-head">
            <svg width="26" height="24" viewBox="0 0 28 24" fill="none" id="weightIcon">
              <circle class="wpart-stroke" cx="14" cy="4.6" r="2.4" fill="none" stroke="var(--z4)" stroke-width="2"/>
              <path class="wpart-stroke" d="M14 7 L14 8.6" stroke="var(--z4)" stroke-width="2" stroke-linecap="round"/>
              <path class="wpart-fill" d="M8 8.6 H20 L23.5 19.5 A2.6 2.6 0 0 1 20.9 22.4 H7.1 A2.6 2.6 0 0 1 4.5 19.5 Z" fill="var(--z4)"/>
              <text x="14" y="17.5" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="6.5" font-weight="800" fill="#fff">KG</text>
            </svg>
            <span class="card-title">Gerincterhelés</span>
          </div>
          <div class="dial-wrap">
            <svg viewBox="-16 -8 232 124" id="loadDial"></svg>
            <div><span class="score" id="loadScore">0,0</span><span class="score-unit">pont</span></div>
            <div class="category" id="loadCategory">Átlagos gerincterhelés</div>
          </div>
        </div>
        <div class="card">
          <div class="card-head">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" id="heartIcon">
              <path class="hpart-fill" d="M12 21 C12 21 3 14.5 3 8.5 C3 5.5 5.5 3 8.5 3 C10.5 3 12 4.3 12 4.3 C12 4.3 13.5 3 15.5 3 C18.5 3 21 5.5 21 8.5 C21 14.5 12 21 12 21 Z" fill="var(--a3)"/>
              <path d="M4.6 12 H8 L9.6 8.4 L12.2 15.6 L14.2 9.6 L15.7 12 H19.2" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
            <span class="card-title">Aktivitás</span>
          </div>
          <div class="dial-wrap">
            <svg viewBox="-16 -8 232 124" id="actDial"></svg>
            <div><span class="score" id="actScore">0,0</span><span class="score-unit">pont</span></div>
            <div class="category" id="actCategory">Inaktív életmód</div>
          </div>
        </div>
      </div>
      <div class="totalbar-card">
        <div class="totalbar-top">
          <span class="label">Összes idő</span>
          <span class="value"><span id="totalHours">0,0</span> / 24 óra</span>
        </div>
        <div class="totalbar"><div class="totalbar-fill" id="totalFill"></div></div>
        <div class="overtime-msg" id="overtimeMsg">Túllépted a 24 órát! Módosíts!</div>
      </div>
    </div>
    <div class="groups" id="groups"></div>
    <footer>A számítás logikája az eredeti Excel-kalkulátor gerincterhelési és aktivitási szorzóit követi.</footer>
  </div>
</div>
<style>
.gt-calc-container {
  --bg: var(--color-bg-alt);
  --surface: var(--color-surface);
  --ink: var(--color-text);
  --ink-soft: var(--color-text-muted);
  --ink-faint: var(--color-text-muted);
  --accent: var(--color-primary);
  --accent-soft: rgba(var(--color-primary-rgb), 0.15);
  --line: var(--color-border);
  --radius: var(--radius-card);
  --warn: var(--color-danger);
  --shadow: var(--shadow-card);
  --shadow-sm: var(--shadow-card);
  --grad-start: var(--teal);
  --grad-end: var(--mint);
  /* terhelési/aktivitási zóna-skála — szándékosan fix, nem a projekt
     márkaszíneiből jön (ld. a fájl tetején lévő megjegyzést) */
  --z1: #C0392B; --z2: #E07A3F; --z3: #E8B94A; --z4: #8FC2B8; --z5: #3FA79B; --z6: #28B463;
  --a1: #C0392B; --a2: #E07A3F; --a3: #E8B94A; --a4: #8FC2B8; --a5: #28B463;
  background: var(--bg) !important;
  color: var(--ink) !important;
  padding: 28px 20px 60px !important;
  font-family: var(--font-body), system-ui, -apple-system, sans-serif !important;
  border-radius: var(--radius) !important;
  box-sizing: border-box !important;
  width: 100% !important;
}
.gt-calc-container * {
  box-sizing: border-box !important;
  font-family: var(--font-body), system-ui, -apple-system, sans-serif !important;
}
.gt-calc-container .wrap {
  max-width: 940px !important;
  margin: 0 auto !important;
}
.gt-calc-container header {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  text-align: center !important;
  gap: 14px !important;
  margin-bottom: 22px !important;
}
.gt-calc-container h1 {
  font-family: var(--font-heading), sans-serif !important;
  font-weight: 700 !important;
  font-size: clamp(24px, 4vw, 32px) !important;
  margin: 0 0 4px !important;
  letter-spacing: -0.01em !important;
  color: var(--ink) !important;
  line-height: 1.2 !important;
  background: transparent !important;
}
.gt-calc-container header p {
  margin: 0 !important;
  color: var(--ink-soft) !important;
  font-size: 14.5px !important;
  max-width: 52ch !important;
  line-height: 1.5 !important;
}
.gt-calc-container .actions {
  display: flex !important;
  gap: 10px !important;
  justify-content: center !important;
  flex-wrap: wrap !important;
}
.gt-calc-container button {
  font-size: 13.5px !important;
  font-weight: 600 !important;
  padding: 10px 18px !important;
  border-radius: 999px !important;
  border: 1px solid var(--line) !important;
  background: var(--surface) !important;
  color: var(--ink) !important;
  cursor: pointer !important;
  white-space: nowrap !important;
  transition: background .15s ease, border-color .15s ease, color .15s ease !important;
  box-shadow: none !important;
  text-transform: none !important;
}
.gt-calc-container button:hover {
  border-color: var(--accent) !important;
  color: var(--accent) !important;
  background: var(--surface) !important;
}
.gt-calc-container button.primary {
  background: var(--accent) !important;
  color: var(--color-primary-contrast) !important;
  border-color: var(--accent) !important;
}
.gt-calc-container button.primary:hover {
  background: var(--accent) !important;
  color: var(--color-primary-contrast) !important;
  opacity: 0.85 !important;
}
@media (max-width: 400px) {
  .gt-calc-container .actions {
    flex-direction: column !important;
    align-items: stretch !important;
    width: 100% !important;
    max-width: 240px !important;
  }
  .gt-calc-container button {
    width: 100% !important;
    text-align: center !important;
    font-size: 13px !important;
    padding: 10px 14px !important;
  }
}
.gt-calc-container .sticky-panel {
  position: sticky !important;
  top: 0 !important;
  z-index: 30 !important;
  background: var(--bg) !important;
  padding: 16px 0 14px !important;
  border-top: 6px solid var(--accent-soft) !important;
  border-bottom: 6px solid var(--accent-soft) !important;
  margin-bottom: 16px !important;
}
.gt-calc-container .summary {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 10px !important;
  margin: 0 0 12px !important;
}
.gt-calc-container .card {
  background: var(--surface) !important;
  border: 1px solid var(--line) !important;
  border-radius: var(--radius) !important;
  padding: 20px 22px 18px !important;
  box-shadow: var(--shadow) !important;
  min-width: 0 !important;
}
.gt-calc-container .card-head {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  margin-bottom: 6px !important;
}
.gt-calc-container .card-title {
  font-size: 13px !important;
  font-weight: 700 !important;
  color: var(--ink-soft) !important;
  text-transform: uppercase !important;
  letter-spacing: .08em !important;
}
.gt-calc-container .dial-wrap {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  text-align: center !important;
}
.gt-calc-container .dial-wrap svg {
  width: 100% !important;
  max-width: 260px !important;
  height: auto !important;
  overflow: visible !important;
}
.gt-calc-container .score {
  font-size: 34px !important;
  font-weight: 800 !important;
  line-height: 1 !important;
  margin-top: 2px !important;
  display: inline-block !important;
}
.gt-calc-container .score-unit {
  font-size: 13px !important;
  color: var(--ink-faint) !important;
  font-weight: 600 !important;
  margin-left: 4px !important;
}
.gt-calc-container .category {
  font-size: 14.5px !important;
  font-weight: 700 !important;
  margin-top: 4px !important;
}
.gt-calc-container .totalbar-card {
  background: var(--surface) !important;
  border: 1px solid var(--line) !important;
  border-radius: var(--radius) !important;
  padding: 14px 18px !important;
  margin: 0 !important;
  box-shadow: var(--shadow-sm) !important;
}
.gt-calc-container .totalbar-top {
  display: flex !important;
  justify-content: space-between !important;
  align-items: baseline !important;
  margin-bottom: 10px !important;
  gap: 8px !important;
}
.gt-calc-container .totalbar-top .label {
  font-size: clamp(10.5px, 3vw, 13px) !important;
  color: var(--ink-soft) !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: .04em !important;
}
.gt-calc-container .totalbar-top .value {
  font-size: clamp(13px, 4vw, 19px) !important;
  font-weight: 800 !important;
}
.gt-calc-container .totalbar {
  height: 10px !important;
  background: var(--accent-soft) !important;
  border-radius: 999px !important;
  overflow: hidden !important;
}
.gt-calc-container .totalbar-fill {
  height: 100% !important;
  background: var(--accent) !important;
  border-radius: 999px !important;
  transition: width .2s ease, background .3s ease !important;
  width: 0%;
}
.gt-calc-container .totalbar-fill.over {
  background: var(--warn) !important;
}
.gt-calc-container .totalbar-fill.full {
  background: var(--mint) !important;
}
.gt-calc-container .totalbar-fill.full.over {
  background: var(--warn) !important;
}
.gt-calc-container .overtime-msg {
  margin-top: 10px !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  color: var(--warn) !important;
  display: none !important;
}
.gt-calc-container .overtime-msg.show {
  display: block !important;
}
.gt-calc-container .groups {
  display: flex !important;
  flex-direction: column !important;
  gap: 14px !important;
}
.gt-calc-container .group {
  background: var(--surface) !important;
  border: 1px solid var(--line) !important;
  border-radius: var(--radius) !important;
  overflow: hidden !important;
  box-shadow: var(--shadow-sm) !important;
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
}
.gt-calc-container .group-title {
  grid-column: 1 / -1 !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  font-size: 14px !important;
  font-weight: 800 !important;
  padding: 14px 20px !important;
  border-bottom: 1px solid var(--line) !important;
  background: var(--color-bg-alt) !important;
  text-transform: uppercase !important;
  letter-spacing: .04em !important;
  color: var(--ink) !important;
}
.gt-calc-container .row {
  padding: 13px 16px !important;
  border-bottom: 1px solid var(--line) !important;
}
.gt-calc-container .group > .row:nth-child(even) {
  border-right: 1px solid var(--line) !important;
}
.gt-calc-container .group > .row:last-child {
  border-bottom: none !important;
}
.gt-calc-container .col-block {
  display: flex !important;
  flex-direction: column !important;
}
.gt-calc-container .col-block:first-child {
  border-right: 1px solid var(--line) !important;
}
.gt-calc-container .col-block .row:last-child {
  border-bottom: none !important;
}
.gt-calc-container .row-top {
  display: flex !important;
  justify-content: space-between !important;
  align-items: baseline !important;
  margin-bottom: 8px !important;
  gap: 8px !important;
}
.gt-calc-container .row-labels {
  display: flex !important;
  flex-direction: column !important;
  min-width: 0 !important;
}
.gt-calc-container .row-eyebrow {
  font-size: 11px !important;
  color: var(--ink-faint) !important;
  font-weight: 500 !important;
}
.gt-calc-container .row-main {
  font-size: 14px !important;
  color: var(--ink) !important;
  font-weight: 700 !important;
}
.gt-calc-container .row-value {
  font-size: 12.5px !important;
  font-weight: 700 !important;
  color: var(--accent) !important;
  white-space: nowrap !important;
}
@media (max-width: 640px) {
  .gt-calc-container .group {
    grid-template-columns: 1fr !important;
  }
  .gt-calc-container .group > .row:nth-child(even) {
    border-right: none !important;
  }
  .gt-calc-container .col-block:first-child {
    border-right: none !important;
    border-bottom: 1px solid var(--line) !important;
  }
}
@media (max-width: 420px) {
  .gt-calc-container .row {
    padding: 11px 10px !important;
  }
  .gt-calc-container .row-main {
    font-size: 12.5px !important;
  }
  .gt-calc-container .row-eyebrow {
    font-size: 9.5px !important;
  }
  .gt-calc-container .row-value {
    font-size: 11px !important;
  }
  .gt-calc-container {
    padding: 18px 10px 50px !important;
  }
  .gt-calc-container .sticky-panel {
    padding: 10px 0 12px !important;
  }
  .gt-calc-container .summary {
    gap: 6px !important;
    margin-bottom: 8px !important;
  }
  .gt-calc-container .card {
    aspect-ratio: 1/1 !important;
    padding: 6px 6px !important;
    border-radius: 12px !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    align-items: center !important;
  }
  .gt-calc-container .card-head {
    gap: 4px !important;
    margin-bottom: 0 !important;
    justify-content: center !important;
  }
  .gt-calc-container .card-head svg {
    width: 13px !important;
    height: 13px !important;
  }
  .gt-calc-container .card-title {
    font-size: 7.5px !important;
    letter-spacing: .02em !important;
  }
  .gt-calc-container .dial-wrap svg {
    max-width: 72px !important;
  }
  .gt-calc-container .score {
    font-size: 15px !important;
  }
  .gt-calc-container .score-unit {
    font-size: 7.5px !important;
    margin-left: 2px !important;
  }
  .gt-calc-container .category {
    font-size: 7px !important;
    margin-top: 1px !important;
    line-height: 1.1 !important;
  }
  .gt-calc-container .totalbar-card {
    padding: 10px 12px !important;
  }
  .gt-calc-container .totalbar-top .label {
    font-size: 10px !important;
  }
  .gt-calc-container .totalbar-top .value {
    font-size: 13px !important;
  }
}
.gt-calc-container input[type=range] {
  -webkit-appearance: none !important;
  appearance: none !important;
  width: 100% !important;
  height: 8px !important;
  border-radius: 999px !important;
  outline: none !important;
  cursor: pointer !important;
  box-shadow: var(--shadow-sm) !important;
  margin: 8px 0 !important;
  border: none !important;
  padding: 0 !important;
}
.gt-calc-container input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none !important;
  appearance: none !important;
  width: 18px !important;
  height: 18px !important;
  border-radius: 50% !important;
  background: var(--accent) !important;
  border: 3px solid var(--surface) !important;
  box-shadow: 0 0 0 1px var(--line), 0 1px 3px rgba(11,61,98,.25) !important;
  cursor: pointer !important;
  margin-top: -5px !important;
}
.gt-calc-container input[type=range]::-moz-range-thumb {
  width: 18px !important;
  height: 18px !important;
  border-radius: 50% !important;
  background: var(--accent) !important;
  border: 3px solid var(--surface) !important;
  box-shadow: 0 0 0 1px var(--line), 0 1px 3px rgba(11,61,98,.25) !important;
  cursor: pointer !important;
}
.gt-calc-container input[type=range]::-webkit-slider-runnable-track {
  height: 8px !important;
  border-radius: 999px !important;
  background: transparent !important;
  border: none !important;
}
.gt-calc-container input[type=range]::-moz-range-track {
  height: 8px !important;
  border-radius: 999px !important;
  background: transparent !important;
  border: none !important;
}
.gt-calc-container footer {
  margin-top: 20px !important;
  font-size: 12px !important;
  color: var(--ink-faint) !important;
  text-align: center !important;
  line-height: 1.4 !important;
}
</style>
`

type GerincterhelesKalkulatorProps = {
  /** minden újraszámoláskor meghívva az aktuális "összes idő" (óra) értékkel
   * — az állapotfelmérő ezzel dönti el, mikor jelenjen meg a továbblépés
   * lehetősége (2026.09.04., Marci kérésére: csak 24/24 óránál). */
  onHoursChange?: (hours: number) => void
}

// React.memo: az onHoursChange (a szülő állandó setCalcHours-referenciája)
// kivételével nincs propja, és MINDEN saját állapotát nyers DOM-on/refeken
// tartja — ha a szülő mégis újrarenderelne (pl. a calcHours state-je miatt),
// react.memo nélkül ez a dangerouslySetInnerHTML-t is újra "diffelné", ami
// (React 19-es kísérlet alapján) VISSZAÁLLÍTOTTA a kalkulátor DOM-ját az
// üres kiinduló sablonra — törölve a mount-effektus által felépített
// sorokat/csúszkákat. A memo garantálja, hogy a szülő re-renderje ezt a
// komponenst egyáltalán ne érintse (2026.09.04., hibajavítás).
export default memo(function GerincterhelesKalkulator({ onHoursChange }: GerincterhelesKalkulatorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onHoursChangeRef = useRef(onHoursChange)
  onHoursChangeRef.current = onHoursChange

  // A <script> EREDETI logikája — szó szerint átemelve (Marci kifejezett
  // kérése: "minden logikája maradjon az eredeti"). Az egyetlen eltérés a
  // DOM-elérés: `document.getElementById` helyett a `container`-en belüli
  // keresés, hogy több, azonos id-jű elem esetén (pl. ha ez az oldal többször
  // renderelődne) ne ütközzön semmivel — ez a DOM-elérés MÓDJA, nem a logika.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const byId = (id: string) => container.querySelector<HTMLElement>(`#${id}`)

    const activities = [
      { group: 'Alvás', items: [
        { id: 's1', label: '', sub: 'Alvásidő', t: 2, a: 0 },
      ] },
      { group: 'Munka', columns: [
        [
          { id: 'w1', label: 'Szellemi/ülőmunka', sub: 'ülés', t: -2, a: 0 },
          { id: 'w2', label: 'Szellemi/ülőmunka', sub: 'járás', t: 2, a: 2 },
        ],
        [
          { id: 'w6', label: 'Fizikai munka', sub: 'állás', t: 1, a: 1 },
          { id: 'w7', label: 'Fizikai munka', sub: 'hajolás', t: -4, a: 3 },
          { id: 'w8', label: 'Fizikai munka', sub: 'emelgetés', t: -6, a: 3 },
          { id: 'w9', label: 'Fizikai munka', sub: 'cipelés', t: -2, a: 3 },
        ],
      ] },
      { group: 'Utazás', items: [
        { id: 't1', label: 'Aktív utazás', sub: 'gyaloglás', t: 4, a: 2 },
        { id: 't2', label: 'Aktív utazás', sub: 'biciklizés', t: -1, a: 3 },
        { id: 't3', label: 'Aktív utazás', sub: 'egyéb', t: 1, a: 2 },
        { id: 't4', label: 'Aktív, stabil utazás', sub: 'állás tömegközlekedésen', t: 1.5, a: 2 },
        { id: 't5', label: 'Passzív utazás', sub: 'ülés autóban', t: -4, a: 0 },
        { id: 't6', label: 'Passzív utazás', sub: 'ülés tömegközlekedésen', t: -2, a: 0 },
        { id: 't7', label: 'Passzív utazás', sub: 'ülés motoron', t: -2, a: 1 },
      ] },
      { group: 'Szabadidős tevékenység', items: [
        { id: 'f1', label: 'Aktív/sport', sub: 'laza, frissítő', t: 4, a: 3 },
        { id: 'f2', label: 'Aktív/sport', sub: 'intenzív, fárasztó', t: 1, a: 5 },
        { id: 'f3', label: 'Passzív, ülve', sub: 'széken', t: -2, a: 0 },
        { id: 'f4', label: 'Passzív, ülve', sub: 'felhúzott lábbal', t: -4, a: 0 },
        { id: 'f5', label: 'Passzív, ülve', sub: 'fotelben/kanapén', t: -2, a: 0 },
        { id: 'f6', label: 'Passzív, ülve', sub: 'földön', t: -3, a: 0 },
        { id: 'f7', label: 'Passzív', sub: 'állva', t: 1, a: 1 },
        { id: 'f8', label: 'Passzív, fekve', sub: 'ágyban', t: 3, a: 0 },
      ] },
      { group: 'Kompenzáció', items: [
        { id: 'k1', label: 'Kompenzáció', sub: 'aktív elongáció', t: 7, a: 0.5 },
      ] },
    ]
    const exampleValues: Record<string, number> = {
      w1: 8, w2: 1, t1: 0.5, t5: 1, f1: 1, f3: 1, f5: 3, f7: 0.5, k1: 0, s1: 8,
    }
    const loadZones = [
      { min: -20, max: -15, label: 'Gerincgyilkos terhelés', color: 'var(--z1)' },
      { min: -15, max: -5, label: 'Fokozottan terhelő', color: 'var(--z2)' },
      { min: -5, max: 0, label: 'Terhelő', color: 'var(--z3)' },
      { min: 0, max: 10, label: 'Átlagos gerincterhelés', color: 'var(--z4)' },
      { min: 10, max: 15, label: 'Mérsékelten kímélő', color: 'var(--z5)' },
      { min: 15, max: 20, label: 'Gerinckímélő', color: 'var(--z6)' },
    ]
    const LOAD_MIN = -20, LOAD_MAX = 20
    const actZones = [
      { min: 0, max: 5, label: 'Inaktív életmód', color: 'var(--a1)' },
      { min: 5, max: 10, label: 'Kényelmes életmód', color: 'var(--a2)' },
      { min: 10, max: 15, label: 'Aktív életmód', color: 'var(--a3)' },
      { min: 15, max: 20, label: 'Mozgalmas életmód', color: 'var(--a4)' },
      { min: 20, max: 25, label: 'Sportos életmód', color: 'var(--a5)' },
    ]
    const ACT_MIN = 0, ACT_MAX = 25
    function loadCategory(v: number) {
      if (v < -15) return loadZones[0]
      if (v < -5) return loadZones[1]
      if (v < 0) return loadZones[2]
      if (v < 10) return loadZones[3]
      if (v < 15) return loadZones[4]
      return loadZones[5]
    }
    function actCategory(v: number) {
      if (v < 5) return actZones[0]
      if (v < 10) return actZones[1]
      if (v < 15) return actZones[2]
      if (v < 20) return actZones[3]
      return actZones[4]
    }
    function fmt(n: number) {
      n = Math.round(n * 100) / 100
      if (Number.isInteger(n)) return n.toFixed(0).replace('.', ',')
      let s = n.toFixed(2)
      if (s.endsWith('0')) s = s.slice(0, -1)
      return s.replace('.', ',')
    }
    const CX = 100, CY = 100, R_ARC = 82, R_NEEDLE = 64
    function polar(r: number, angleDeg: number) {
      const rad = (angleDeg * Math.PI) / 180
      return { x: CX + r * Math.cos(rad), y: CY - r * Math.sin(rad) }
    }
    function angleForValue(v: number, min: number, max: number) {
      const pct = Math.min(1, Math.max(0, (v - min) / (max - min)))
      return 180 - pct * 180
    }
    function buildDial(svg: SVGSVGElement, zones: typeof loadZones, min: number, max: number) {
      svg.innerHTML = ''
      const ns = 'http://www.w3.org/2000/svg'
      zones.forEach((z) => {
        const zmin = Math.max(z.min, min), zmax = Math.min(z.max, max)
        const a1 = angleForValue(zmin, min, max)
        const a2 = angleForValue(zmax, min, max)
        const p1 = polar(R_ARC, a1), p2 = polar(R_ARC, a2)
        const path = document.createElementNS(ns, 'path')
        path.setAttribute('d', `M ${p1.x} ${p1.y} A ${R_ARC} ${R_ARC} 0 0 1 ${p2.x} ${p2.y}`)
        path.setAttribute('stroke', z.color)
        path.setAttribute('stroke-width', '15')
        path.setAttribute('fill', 'none')
        svg.appendChild(path)
      })
      ;[min, (min + max) / 2, max].forEach((v) => {
        const a = angleForValue(v, min, max)
        const p = polar(R_ARC + 20, a)
        const t = document.createElementNS(ns, 'text')
        t.setAttribute('x', String(p.x)); t.setAttribute('y', String(p.y + 4))
        t.setAttribute('text-anchor', 'middle')
        t.setAttribute('font-size', '10')
        t.setAttribute('font-weight', '600')
        t.setAttribute('fill', 'var(--ink-faint)')
        t.textContent = String(Math.round(v))
        svg.appendChild(t)
      })
      const needle = document.createElementNS(ns, 'line')
      needle.setAttribute('id', svg.id + '_needle')
      needle.setAttribute('x1', String(CX)); needle.setAttribute('y1', String(CY))
      needle.setAttribute('x2', String(CX)); needle.setAttribute('y2', String(CY - R_NEEDLE))
      needle.setAttribute('stroke', 'var(--ink)')
      needle.setAttribute('stroke-width', '3.5')
      needle.setAttribute('stroke-linecap', 'round')
      svg.appendChild(needle)
      const hub = document.createElementNS(ns, 'circle')
      hub.setAttribute('cx', String(CX)); hub.setAttribute('cy', String(CY)); hub.setAttribute('r', '7')
      hub.setAttribute('fill', 'var(--ink)')
      svg.appendChild(hub)
    }
    function setNeedle(svgId: string, value: number, min: number, max: number) {
      const needle = container!.querySelector<SVGLineElement>(`#${svgId}_needle`)
      if (!needle) return
      const angle = angleForValue(value, min, max)
      needle.style.transformOrigin = `${CX}px ${CY}px`
      needle.style.transform = `rotate(${90 - angle}deg)`
    }
    const loadDialSvg = byId('loadDial') as unknown as SVGSVGElement
    const actDialSvg = byId('actDial') as unknown as SVGSVGElement
    buildDial(loadDialSvg, loadZones, LOAD_MIN, LOAD_MAX)
    buildDial(actDialSvg, actZones, ACT_MIN, ACT_MAX)
    const groupsEl = byId('groups')!
    type ItemDef = { id: string; label: string; sub: string; t: number; a: number }
    const inputs: Record<string, { slider: HTMLInputElement; valueBadge: HTMLElement; t: number; a: number }> = {}
    function buildRow(item: ItemDef) {
      const row = document.createElement('div')
      row.className = 'row'
      const top = document.createElement('div')
      top.className = 'row-top'
      const labels = document.createElement('div')
      labels.className = 'row-labels'
      labels.innerHTML = item.label
        ? `<span class="row-eyebrow">${item.label}</span><span class="row-main">${item.sub}</span>`
        : `<span class="row-main">${item.sub}</span>`
      top.appendChild(labels)
      const valueBadge = document.createElement('div')
      valueBadge.className = 'row-value'
      valueBadge.textContent = '0 óra'
      top.appendChild(valueBadge)
      row.appendChild(top)
      const slider = document.createElement('input')
      slider.type = 'range'; slider.min = '0'; slider.max = '12'; slider.step = '0.05'; slider.value = '0'
      slider.setAttribute('aria-label', (item.label + ' ' + item.sub).trim() + ' órák száma')
      row.appendChild(slider)
      slider.addEventListener('input', () => onSliderInput(item.id))
      inputs[item.id] = { slider, valueBadge, t: item.t, a: item.a }
      return row
    }
    const groupIcons: Record<string, string> = {
      'Alvás': `<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" fill="var(--accent)"/>`,
      'Munka': `<rect x="3" y="8" width="18" height="12" rx="2" fill="none" stroke="var(--accent)" stroke-width="2"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" fill="none" stroke="var(--accent)" stroke-width="2"/><line x1="3" y1="13" x2="21" y2="13" stroke="var(--accent)" stroke-width="2"/>`,
      'Utazás': `<path d="M5 13 L6.6 9 A2 2 0 0 1 8.4 7.7 H15.6 A2 2 0 0 1 17.4 9 L19 13" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><rect x="3" y="13" width="18" height="4" rx="2" fill="none" stroke="var(--accent)" stroke-width="1.8"/><line x1="9" y1="9.3" x2="9" y2="13" stroke="var(--accent)" stroke-width="1.3"/><circle cx="7.5" cy="17" r="1.8" fill="var(--surface)" stroke="var(--accent)" stroke-width="1.6"/><circle cx="16.5" cy="17" r="1.8" fill="var(--surface)" stroke="var(--accent)" stroke-width="1.6"/>`,
      'Szabadidős tevékenység': `<circle cx="12" cy="12" r="4.2" fill="var(--accent)"/><g stroke="var(--accent)" stroke-width="2" stroke-linecap="round"><line x1="12" y1="2.5" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="21.5"/><line x1="2.5" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="21.5" y2="12"/><line x1="5.2" y1="5.2" x2="7" y2="7"/><line x1="17" y1="17" x2="18.8" y2="18.8"/><line x1="18.8" y1="5.2" x2="17" y2="7"/><line x1="7" y1="17" x2="5.2" y2="18.8"/></g>`,
      'Kompenzáció': `<circle cx="12" cy="4" r="2" fill="var(--accent)"/><path d="M12 6 L12 13 M12 8 L7 5 M12 8 L17 5 M12 13 L8 20 M12 13 L16 20" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
    }
    activities.forEach((g) => {
      const gEl = document.createElement('div')
      gEl.className = 'group'
      const title = document.createElement('div')
      title.className = 'group-title'
      const icon = groupIcons[g.group] || ''
      title.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none">${icon}</svg><span>${g.group}</span>`
      gEl.appendChild(title)
      if ('columns' in g && g.columns) {
        g.columns.forEach((colItems) => {
          const col = document.createElement('div')
          col.className = 'col-block'
          colItems.forEach((item) => {
            col.appendChild(buildRow(item))
          })
          gEl.appendChild(col)
        })
      } else if ('items' in g && g.items) {
        g.items.forEach((item, idx) => {
          const row = buildRow(item)
          const isSingle = g.items!.length === 1
          const isLastOdd = g.items!.length % 2 === 1 && idx === g.items!.length - 1
          if (isSingle) {
            row.style.gridColumn = '1 / -1'
            row.style.borderRight = 'none'
          } else if (isLastOdd) {
            row.style.borderRight = 'none'
          }
          gEl.appendChild(row)
        })
      }
      groupsEl.appendChild(gEl)
    })
    function totalHoursExcept(exceptId: string) {
      let sum = 0
      Object.entries(inputs).forEach(([id, { slider }]) => {
        if (id !== exceptId) sum += parseFloat(slider.value) || 0
      })
      return sum
    }
    function snapUp(v: number) {
      v = Math.max(0, Math.min(12, v))
      if (v <= 1) return Math.round(v / 0.25) * 0.25
      return Math.round(v / 0.5) * 0.5
    }
    function snapDown(v: number) {
      v = Math.max(0, Math.min(12, v))
      if (v <= 1) return Math.floor(v / 0.25) * 0.25
      return Math.floor(v / 0.5) * 0.5
    }
    function updateSliderGradient(slider: HTMLInputElement) {
      const val = parseFloat(slider.value) || 0
      const pct = Math.min(100, Math.max(0, (val / 12) * 100))
      slider.style.setProperty('background', `linear-gradient(to right, var(--grad-start) 0%, var(--grad-end) ${pct}%, var(--line) ${pct}%, var(--line) 100%)`, 'important')
    }
    function onSliderInput(id: string) {
      const { slider } = inputs[id]
      let val = parseFloat(slider.value) || 0
      val = snapUp(val)
      const others = totalHoursExcept(id)
      const capMax = Math.min(12, Math.max(0, 24 - others))
      if (val > capMax + 0.001) {
        val = snapDown(capMax)
      }
      slider.value = String(val)
      updateSliderGradient(slider)
      recalc()
    }
    function recalc() {
      let totalHours = 0, totalLoad = 0, totalAct = 0
      Object.values(inputs).forEach(({ slider, valueBadge, t, a }) => {
        const h = parseFloat(slider.value) || 0
        totalHours += h
        valueBadge.textContent = fmt(h) + ' óra'
        updateSliderGradient(slider)
        if (h > 0) { totalLoad += h * t; totalAct += h * a }
      })
      onHoursChangeRef.current?.(totalHours)
      byId('loadScore')!.textContent = fmt(totalLoad)
      byId('actScore')!.textContent = fmt(totalAct)
      const lc = loadCategory(totalLoad)
      const ac = actCategory(totalAct)
      byId('loadCategory')!.textContent = lc.label
      byId('loadCategory')!.style.color = lc.color
      byId('actCategory')!.textContent = ac.label
      byId('actCategory')!.style.color = ac.color
      setNeedle('loadDial', totalLoad, LOAD_MIN, LOAD_MAX)
      setNeedle('actDial', totalAct, ACT_MIN, ACT_MAX)
      byId('totalHours')!.textContent = fmt(totalHours)
      const fill = byId('totalFill')!
      const over = totalHours > 24.001
      const full = totalHours >= 23.999
      fill.style.width = Math.min(100, (totalHours / 24) * 100) + '%'
      fill.classList.toggle('over', over)
      fill.classList.toggle('full', full)
      byId('overtimeMsg')!.classList.toggle('show', over)
      container!.querySelectorAll('#weightIcon .wpart-fill').forEach((el) => el.setAttribute('fill', lc.color))
      container!.querySelectorAll('#weightIcon .wpart-stroke').forEach((el) => el.setAttribute('stroke', lc.color))
      container!.querySelectorAll('#heartIcon .hpart-fill').forEach((el) => el.setAttribute('fill', ac.color))
    }
    byId('btnReset')!.addEventListener('click', () => {
      Object.values(inputs).forEach(({ slider }) => { slider.value = '0' })
      recalc()
    })
    byId('btnExample')!.addEventListener('click', () => {
      Object.entries(inputs).forEach(([id, { slider }]) => {
        slider.value = String(exampleValues[id] !== undefined ? exampleValues[id] : 0)
      })
      recalc()
    })
    recalc()
  }, [])

  return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: CALCULATOR_HTML }} />
})

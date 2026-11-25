// Jogi dokumentumok és hozzájárulások (2026.11.25.).
//
// A szövegek EGYETLEN forrása az `ÁSZF/` mappa Markdown-fájlja — a honlap
// ezeket importálja (Vite `?raw`), így egy szövegmódosításhoz csak a .md-t
// kell átírni. Új változat élesítésekor a LEGAL_VERSION-t is át kell írni,
// hogy a regisztrációkor mentett elfogadás a helyes változatra mutasson.
import aszfMd from '../../ÁSZF/FixYourBack_ASZF_2026.md?raw'
import adatkezelesMd from '../../ÁSZF/FixYourBack_Adatkezelesi_tajekoztato_2026.md?raw'
import { useEffect, useState } from 'react'

export const LEGAL_VERSION = '2026-11-25'
export { aszfMd, adatkezelesMd }

/** a cookie-oldal az Adatkezelési tájékoztató 5. pontja (sütik) */
export const cookieMd = (() => {
  const start = adatkezelesMd.indexOf('## 5.')
  const end = adatkezelesMd.indexOf('## 6.')
  if (start < 0) return ''
  return adatkezelesMd.slice(start, end < 0 ? undefined : end).replace(/^## 5\. .*\n/, '')
})()

// --- ÁSZF-elfogadás (regisztráció) -------------------------------------
// Prototípus: a böngészőben tárolódik; élesben a backend menti a fiókhoz.
export function recordLegalAcceptance() {
  localStorage.setItem('fyb-legal-acceptance', JSON.stringify({
    acceptedAt: new Date().toISOString(),
    aszfVersion: LEGAL_VERSION,
    adatkezelesVersion: LEGAL_VERSION,
  }))
}

// --- sütihozzájárulás ---------------------------------------------------
export type CookieConsent = {
  /** harmadik féltől beágyazott tartalom: Calendly, YouTube */
  functional: boolean
  /** lejátszásmérés (Mux Data) */
  measurement: boolean
  decidedAt: string
  version: string
}

const CONSENT_KEY = 'fyb-cookie-consent'
const CHANGE_EVENT = 'fyb-consent-change'
const OPEN_EVENT = 'fyb-open-cookie-settings'

export function getCookieConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    return raw ? (JSON.parse(raw) as CookieConsent) : null
  } catch {
    return null
  }
}

export function setCookieConsent(c: { functional: boolean; measurement: boolean }) {
  const value: CookieConsent = { ...c, decidedAt: new Date().toISOString(), version: LEGAL_VERSION }
  localStorage.setItem(CONSENT_KEY, JSON.stringify(value))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

/** a lábléc „sütibeállítások" linkje ezzel nyitja meg újra a panelt */
export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT))
}

export function onOpenCookieSettings(cb: () => void) {
  window.addEventListener(OPEN_EVENT, cb)
  return () => window.removeEventListener(OPEN_EVENT, cb)
}

export function useCookieConsent(): CookieConsent | null {
  const [consent, setConsent] = useState(getCookieConsent)
  useEffect(() => {
    const update = () => setConsent(getCookieConsent())
    window.addEventListener(CHANGE_EVENT, update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener(CHANGE_EVENT, update)
      window.removeEventListener('storage', update)
    }
  }, [])
  return consent
}

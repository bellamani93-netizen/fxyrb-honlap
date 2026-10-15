import { useEffect, useState } from 'react'

// A fájdalom/tünet-intenzitás (0-10) színskálája — eredetileg az
// Allapotfelmero.tsx-ben (2026.09.15., Marci kérésére: "a csúszka színe
// folyamatosan változzon a 0-nál még zöld, aztán átmenet sárga - narancs -
// piros - sötétvörös. Ugyanezt a színt veszi fel a szám is"), majd a
// checklist "tünet napi intenzitása" csúszkájához is átvéve (2026.09.24.,
// 172. pont: "Tünet napi intenzitása csúszka legyen olyan, mint az
// állapotfelmérőben a tünet intenzitása csúszka") — ezért ide, egy közös
// modulba emelve, hogy mindkét hely UGYANABBÓL a függvényből kapja a
// színt/derengést, ne két külön (idővel szétdriftelő) másolatból.
//
// 5 rögzített színpont (0/2,5/5/7,5/10) közötti FOLYTONOS RGB-interpoláció —
// a csúszka kitöltött szakasza ÉS a fölötte álló szám EGYETLEN, közös
// függvényből kapja a színét. KÉT KÜLÖN színpont-készlet világos/sötét
// módra (2026.09.15., Marci kérésére: "sötét módban sokkal kontrasztosabb
// kell 9 és 10-re") — 0/2,5/5 (zöld/sárga/narancs) változatlan marad
// mindkét módban.
const INTENSITY_COLOR_STOPS_LIGHT: { at: number; rgb: [number, number, number] }[] = [
  { at: 0, rgb: [0, 201, 122] }, // zöld (--z6)
  { at: 2.5, rgb: [255, 213, 0] }, // sárga (--z3)
  { at: 5, rgb: [255, 106, 0] }, // narancs (--z2)
  { at: 7.5, rgb: [230, 57, 70] }, // piros (--symptom-red)
  { at: 10, rgb: [122, 20, 26] }, // sötétvörös
]
const INTENSITY_COLOR_STOPS_DARK: { at: number; rgb: [number, number, number] }[] = [
  { at: 0, rgb: [0, 201, 122] }, // zöld (--z6)
  { at: 2.5, rgb: [255, 213, 0] }, // sárga (--z3)
  { at: 5, rgb: [255, 106, 0] }, // narancs (--z2)
  { at: 7.5, rgb: [255, 45, 85] }, // élénk piros (--z1)
  { at: 10, rgb: [255, 0, 90] }, // élénk magenta-vörös
]

export function intensityColor(value: number, dark: boolean): string {
  const stops = dark ? INTENSITY_COLOR_STOPS_DARK : INTENSITY_COLOR_STOPS_LIGHT
  const v = Math.min(10, Math.max(0, value))
  let lo = stops[0]
  let hi = stops[stops.length - 1]
  for (let i = 0; i < stops.length - 1; i++) {
    if (v >= stops[i].at && v <= stops[i + 1].at) {
      lo = stops[i]
      hi = stops[i + 1]
      break
    }
  }
  const t = hi.at === lo.at ? 0 : (v - lo.at) / (hi.at - lo.at)
  const r = Math.round(lo.rgb[0] + (hi.rgb[0] - lo.rgb[0]) * t)
  const g = Math.round(lo.rgb[1] + (hi.rgb[1] - lo.rgb[1]) * t)
  const b = Math.round(lo.rgb[2] + (hi.rgb[2] - lo.rgb[2]) * t)
  return `rgb(${r}, ${g}, ${b})`
}

function relLum(c: number[]): number {
  const f = (v: number) => {
    const x = v / 255
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2])
}

/** A csúszka színével azonos árnyalatú, de SZÖVEGKÉNT is olvasható szín
 * (végső kontraszt-átvizsgálás, 2026.10.15.): világos módban a skála sárga/
 * halványzöld szakasza fehér háttéren 1,3–2:1 kontrasztot adna a számnak —
 * ezért itt ugyanabból az árnyalatból annyira sötétítünk, hogy a nagy,
 * félkövér szám ≥3,3:1 legyen. Sötét módban az eredeti szín marad. A
 * csúszka kitöltése továbbra is a tiszta `intensityColor`. */
export function intensityTextColor(value: number, dark: boolean): string {
  const base = intensityColor(value, dark)
  if (dark) return base
  const m = (base.match(/\d+/g) ?? []).map(Number)
  if (m.length < 3) return base
  const whiteLum = 1
  for (let f = 1; f > 0.3; f -= 0.04) {
    const c = m.map((v) => Math.round(v * f))
    const ratio = (whiteLum + 0.05) / (relLum(c) + 0.05)
    if (ratio >= 3.3) return `rgb(${c[0]}, ${c[1]}, ${c[2]})`
  }
  return base
}

/** Marci kérésére (2026.09.15.: "a 9, 10-es értékek túl sötétek. jelenjen meg
 * egy piros derengés a csík körül 9-nél, 10-nél ez a derengés legyen
 * nagyobb"). */
export function intensityGlow(value: number, dark: boolean): string | undefined {
  const rgb = dark ? '255, 0, 90' : '230, 57, 70'
  if (value >= 10) return `0 0 26px 8px rgba(${rgb}, 0.65)`
  if (value >= 9) return `0 0 14px 4px rgba(${rgb}, 0.45)`
  return undefined
}

/** a lap témája (világos/sötét) nem React state-ből jön (ld. ThemeToggle.tsx
 * — a váltás egyedül a `<html data-theme>` attribútumot írja, nincs
 * megosztott Context), ezért egy `MutationObserver` figyeli az attribútum
 * változását, hogy az `intensityColor`/`intensityGlow` élő váltáskor is
 * azonnal frissülhessen (nem csak új lapbetöltéskor). */
export function useDarkMode(): boolean {
  const [dark, setDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark')
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.getAttribute('data-theme') === 'dark')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])
  return dark
}

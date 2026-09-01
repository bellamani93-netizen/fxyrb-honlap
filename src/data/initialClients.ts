import { codeLabel, type ClientVariables } from './tornaSzintek'

// Az ügyfél-nyilvántartás EGYETLEN, közös forrása — korábban a SALES
// (salesClients.ts) és a GYT (gytClients.ts) szerepkör KÜLÖN, egymástól
// független listát vezetett ugyanazokról a valós emberekről, saját,
// véletlenül ütköző azonosítókkal (ld. Design jegyzet 48. pont) — emiatt egy
// SALES által frissen felvett/hozzárendelt ügyfél nem jelent meg a GYT
// "ügyfeleim" listájában "új"-ként. Ez az összevont modell mindkét szerepkör
// mezőit hordozza egyetlen rekordban (2026.09.01., Marci kérésére).

export type LevelState = 'lezart' | 'nyitva' | 'zarolt'

export type GytLevel = {
  num: number
  state: LevelState
  video?: string
  note?: string
}

export type Client = {
  id: string
  name: string
  email: string
  phone: string
  note?: string
  // --- SALES-oldali mezők ---
  /** befizette-e a csomagot. */
  paid: boolean
  /** dátum+idő az első konzultációhoz (datetime-local). */
  startTime?: string
  /** melyik GYT-hez van rendelve (initialColleagues id-je, pl. 'kollegabor') — null/undefined, ha még nincs hozzárendelve senkihez. */
  assignedGytId?: string
  // --- GYT-oldali mezők ---
  /** a SALES épp most rendelte ehhez a GYT-hez, a GYT még nem kezdte el vele a video-kiosztást. */
  isNew?: boolean
  /** csak akkor van értéke, ha a GYT már ténylegesen elkezdte a videókiosztást ennél az ügyfélnél. */
  mode?: 'kozben' | 'utana'
  levels?: GytLevel[]
  history?: { num: number; video: string }[]
  bulkLevels?: { num: number; video: string | null; note?: string }[]
  /** az állapotfelmérő ("limitációk") panel értékei — korábban egy külön, id szerint kulcsolt map volt (initialVariables), most a rekord része, hogy sose maradhasson hiányzó bejegyzés. */
  variables: ClientVariables
}

export const DEFAULT_VARIABLES: ClientVariables = {
  painLocation: 'also',
  proneOk: true,
  shoulderOk: true,
  kneePain: false,
  highBloodPressure: false,
}

export const initialClients: Client[] = [
  {
    id: 'peter',
    name: 'Péter',
    email: 'peter.demo@pelda.hu',
    phone: '+36 30 123 4567',
    paid: true,
    startTime: '2026-06-30T09:00',
    assignedGytId: 'kollegabor',
    mode: 'utana',
    variables: { painLocation: 'also', proneOk: true, shoulderOk: true, kneePain: false, highBloodPressure: false },
    history: [
      { num: 1, video: codeLabel('S01') },
      { num: 2, video: codeLabel('S02') },
      { num: 3, video: codeLabel('S03') },
      { num: 4, video: codeLabel('S04') },
      { num: 5, video: codeLabel('S05') },
    ],
    bulkLevels: [
      { num: 6, video: codeLabel('S06') },
      { num: 7, video: codeLabel('S07') },
      { num: 8, video: null },
      { num: 9, video: null },
      { num: 10, video: null },
      { num: 11, video: null },
      { num: 12, video: null },
      { num: 13, video: null },
    ],
  },
  {
    id: 'gabor',
    name: 'Kovács Gábor',
    email: 'kovacs.gabor@pelda.hu',
    phone: '+36 30 234 5678',
    paid: true,
    startTime: '2026-08-04T14:00',
    assignedGytId: 'kollegabor',
    mode: 'kozben',
    variables: { painLocation: 'felso', proneOk: true, shoulderOk: false, kneePain: false, highBloodPressure: false },
    levels: [
      { num: 1, state: 'lezart', video: codeLabel('S03'), note: 'csak az első 2 gyakorlat ebből a szintből.' },
      { num: 2, state: 'lezart', video: codeLabel('A01') },
      { num: 3, state: 'nyitva' },
      { num: 4, state: 'zarolt' },
      { num: 5, state: 'zarolt' },
    ],
  },
  {
    id: 'daniel',
    name: 'Varga Dániel',
    email: 'varga.daniel@pelda.hu',
    phone: '+36 30 345 6789',
    paid: false,
    startTime: '2026-08-25T11:00',
    assignedGytId: 'kollegabor',
    isNew: true,
    mode: 'kozben',
    variables: { painLocation: 'also', proneOk: true, shoulderOk: true, kneePain: false, highBloodPressure: false },
    levels: [
      { num: 1, state: 'nyitva' },
      { num: 2, state: 'zarolt' },
      { num: 3, state: 'zarolt' },
      { num: 4, state: 'zarolt' },
      { num: 5, state: 'zarolt' },
    ],
  },
  {
    id: 'nora',
    name: 'Fekete Nóra',
    email: 'fekete.nora@pelda.hu',
    phone: '+36 30 444 5566',
    paid: false,
    startTime: '2026-09-01T09:00',
    assignedGytId: 'kollegabor',
    isNew: true,
    mode: 'kozben',
    variables: { painLocation: 'also', proneOk: true, shoulderOk: true, kneePain: false, highBloodPressure: false },
    levels: [
      { num: 1, state: 'nyitva' },
      { num: 2, state: 'zarolt' },
      { num: 3, state: 'zarolt' },
      { num: 4, state: 'zarolt' },
      { num: 5, state: 'zarolt' },
    ],
  },
  // a SALES-oldali listából — MÉG NINCSENEK hozzárendelve egyik GYT-hez sem,
  // ezért egyik GYT "ügyfeleim" listájában sem jelennek meg (assignedGytId hiányzik)
  {
    id: 'eszter',
    name: 'Tóth Eszter',
    email: 'toth.eszter@pelda.hu',
    phone: '+36 30 456 7890',
    paid: false,
    startTime: '2026-09-01T10:00',
    variables: DEFAULT_VARIABLES,
  },
  {
    id: 'mate',
    name: 'Balogh Máté',
    email: 'balogh.mate@pelda.hu',
    phone: '+36 30 567 8901',
    paid: false,
    startTime: '2026-09-02T15:30',
    variables: DEFAULT_VARIABLES,
  },
]

/** a demóban a "Péter" teszt-fiókkal bejelentkezett ÜF mindig ő (ld. AppLayout.tsx
 * alapértelmezett userName-je és Gyakorlatok.tsx) — az ÜF-oldali "konzultációk"
 * lap ezzel szűri, mely foglalások tartoznak "hozzá". */
export const LOGGED_IN_UF_ID = 'peter'

const SELECTED_CLIENT_KEY = 'fyb-gyt-client'

/** csak a nyers, tárolt értéket adja vissza — a hívónak kell ellenőriznie a LIVE ügyfél-listával szemben (ld. useClients()), mert ez a lista futásidőben bővülhet. */
export function getSelectedClientId(): string | null {
  return localStorage.getItem(SELECTED_CLIENT_KEY)
}

export function setSelectedClientId(id: string) {
  localStorage.setItem(SELECTED_CLIENT_KEY, id)
}

import { EXERCISES, type ExerciseCode, type ClientVariables } from './tornaSzintek'

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
  mode: 'kozben' | 'utana'
  levels?: GytLevel[]
  history?: { num: number; video: string }[]
  bulkLevels?: { num: number; video: string | null; note?: string }[]
}

export function codeLabel(code: ExerciseCode) {
  return `${code} ${EXERCISES[code].name}`
}

export const clients: Client[] = [
  {
    id: 'peter',
    name: 'Péter',
    mode: 'utana',
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
    mode: 'kozben',
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
    mode: 'kozben',
    levels: [
      { num: 1, state: 'nyitva' },
      { num: 2, state: 'zarolt' },
      { num: 3, state: 'zarolt' },
      { num: 4, state: 'zarolt' },
      { num: 5, state: 'zarolt' },
    ],
  },
]

export const initialVariables: Record<string, ClientVariables> = {
  peter: { painLocation: 'also', proneOk: true, shoulderOk: true, kneePain: false, highBloodPressure: false },
  gabor: { painLocation: 'felso', proneOk: true, shoulderOk: false, kneePain: false, highBloodPressure: false },
  daniel: { painLocation: 'also', proneOk: true, shoulderOk: true, kneePain: false, highBloodPressure: false },
}

const SELECTED_CLIENT_KEY = 'fyb-gyt-client'

export function getSelectedClientId(): string {
  return localStorage.getItem(SELECTED_CLIENT_KEY) ?? clients[0].id
}

export function setSelectedClientId(id: string) {
  localStorage.setItem(SELECTED_CLIENT_KEY, id)
}

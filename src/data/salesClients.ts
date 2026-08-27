export type SalesClient = {
  id: string
  name: string
  assignedGyt: string | null
}

export const GYT_STAFF = ['Kollé Gábor', 'Nagy Réka', 'Tóth Bence']

export const initialSalesClients: SalesClient[] = [
  { id: 'peter', name: 'Péter', assignedGyt: 'Kollé Gábor' },
  { id: 'gabor', name: 'Kovács Gábor', assignedGyt: 'Kollé Gábor' },
  { id: 'daniel', name: 'Varga Dániel', assignedGyt: 'Kollé Gábor' },
  { id: 'eszter', name: 'Tóth Eszter', assignedGyt: null },
  { id: 'mate', name: 'Balogh Máté', assignedGyt: null },
]

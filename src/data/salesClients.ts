export type SalesClient = {
  id: string
  name: string
  email: string
  phone: string
  startTime: string // datetime-local érték, pl. "2026-09-02T10:00"
  assignedGyt: string | null
  paid: boolean
  note?: string
}

export const initialSalesClients: SalesClient[] = [
  {
    id: 'peter',
    name: 'Péter',
    email: 'peter.demo@pelda.hu',
    phone: '+36 30 123 4567',
    startTime: '2026-06-30T09:00',
    assignedGyt: 'Kollé Gábor',
    paid: true,
  },
  {
    id: 'gabor',
    name: 'Kovács Gábor',
    email: 'kovacs.gabor@pelda.hu',
    phone: '+36 30 234 5678',
    startTime: '2026-08-04T14:00',
    assignedGyt: 'Kollé Gábor',
    paid: true,
  },
  {
    id: 'daniel',
    name: 'Varga Dániel',
    email: 'varga.daniel@pelda.hu',
    phone: '+36 30 345 6789',
    startTime: '2026-08-25T11:00',
    assignedGyt: 'Kollé Gábor',
    paid: false,
  },
  {
    id: 'eszter',
    name: 'Tóth Eszter',
    email: 'toth.eszter@pelda.hu',
    phone: '+36 30 456 7890',
    startTime: '2026-09-01T10:00',
    assignedGyt: null,
    paid: false,
  },
  {
    id: 'mate',
    name: 'Balogh Máté',
    email: 'balogh.mate@pelda.hu',
    phone: '+36 30 567 8901',
    startTime: '2026-09-02T15:30',
    assignedGyt: null,
    paid: false,
  },
]

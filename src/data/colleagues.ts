export type ColleagueRole = 'gyt' | 'sales'

export type Colleague = {
  id: string
  name: string
  email: string
  role: ColleagueRole
}

// a "Kollé Gábor" / "Értékes Eszter" nevek megegyeznek a Belepes.tsx teszt-fiókjaival
// (kollega@kollega.hu, ertekes@ertekes.hu) — ugyanaz a személy, két nézetből
export const initialColleagues: Colleague[] = [
  { id: 'kollegabor', name: 'Kollé Gábor', email: 'kollega@kollega.hu', role: 'gyt' },
  { id: 'nagyreka', name: 'Nagy Réka', email: 'nagy.reka@pelda.hu', role: 'gyt' },
  { id: 'tothbence', name: 'Tóth Bence', email: 'toth.bence@pelda.hu', role: 'gyt' },
  { id: 'ertekeseszter', name: 'Értékes Eszter', email: 'ertekes@ertekes.hu', role: 'sales' },
]

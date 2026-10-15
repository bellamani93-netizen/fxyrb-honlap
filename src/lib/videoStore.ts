// A gyorsítósáv videóinak tárolása.
//
// PROTOTÍPUS: backend nincs, ezért a feltöltött videófájlok a böngésző
// IndexedDB-jében élnek (a localStorage ehhez kicsi) — így az admin
// feltöltése és a látogatói lejátszás ugyanazon a böngészőn működik.
//
// ÉLESBEN ezt a modult kell lecserélni egy valódi videószolgáltatóra
// (pl. Mux: közvetlen feltöltés egy backend által kiadott upload-URL-re, a
// lejátszáshoz a playback ID-ből képzett HLS-URL). A hívó oldalak (admin
// szerkesztő, lejátszó) csak ezt a 3 függvényt használják: `saveVideo`,
// `getVideoUrl`, `deleteVideo`.

const DB_NAME = 'fyb-gyorsitosav-videos'
const STORE = 'videos'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function withStore<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb()
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode)
      const req = run(tx.objectStore(STORE))
      tx.oncomplete = () => resolve(req.result)
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  } finally {
    db.close()
  }
}

export async function saveVideo(id: string, file: Blob): Promise<void> {
  await withStore('readwrite', (s) => s.put(file, id))
}

export async function deleteVideo(id: string): Promise<void> {
  await withStore('readwrite', (s) => s.delete(id))
}

/** a videó lejátszható URL-je (object URL), vagy null, ha nincs ilyen videó;
 * a hívó felelős a `URL.revokeObjectURL`-ért */
export async function getVideoUrl(id: string): Promise<string | null> {
  const blob = await withStore<Blob | undefined>('readonly', (s) => s.get(id))
  return blob ? URL.createObjectURL(blob) : null
}

import Icon from '../components/Icon'

export default function AdminAttekintes() {
  return (
    <section className="py-3 py-lg-5">
      <div className="container-fluid" style={{ maxWidth: 900 }}>
        <div className="app-page-header mb-3">
          <h1 className="app-page-title mb-0">áttekintés</h1>
        </div>

        <div className="locked-card">
          <div className="locked-header">
            <Icon src="/icons/ikon_naptar.svg" />
            hamarosan
          </div>
          <p className="mb-0">
            Itt fogod látni egy helyen az összes ügyfelet, gyógytornászt és értékesítőt. Ez a funkció egy következő fejlesztési körben készül el.
          </p>
        </div>
      </div>
    </section>
  )
}

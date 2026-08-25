export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row gy-4">
          <div className="col-md-4">
            <div className="brand-logo mb-2" style={{ color: 'var(--offwhite)' }}>
              <span className="chevron-fyb">«</span>
              FIX YOUR BACK
            </div>
            <p className="text-white-50 small mb-0">
              gerincbarát gyógytorna program — szakértő útmutatással, saját tempódban
            </p>
          </div>

          <div className="col-md-4">
            <div className="fw-bold mb-2">oldal</div>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><a href="/">főoldal</a></li>
              <li><a href="/blog">blog</a></li>
              <li><a href="/mini-kurzus">mini-kurzus</a></li>
              <li><a href="/idopontfoglalas">időpontfoglalás</a></li>
            </ul>
          </div>

          <div className="col-md-4">
            <div className="fw-bold mb-2">kapcsolat</div>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li>hello@fixyourback.hu</li>
              <li>Bella Márton, gyógytornász</li>
            </ul>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <span className="small text-white-50">© {new Date().getFullYear()} Fix Your Back</span>
          <span className="footer-chevrons">«««</span>
        </div>
      </div>
    </footer>
  )
}

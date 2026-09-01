import { Link } from 'react-router-dom'
import { withBase } from '../lib/assetUrl'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-chevron-strip" />
      <div className="container">
        <div className="row gy-4">
          <div className="col-md-4">
            <img src={withBase("/images/logo-dark-bg.png")} alt="Fix Your Back" className="brand-logo-img mb-2" />
            <p className="text-white-50 small mb-0">
              gerincbarát gyógytorna program — szakértő útmutatással, saját tempódban
            </p>
          </div>

          <div className="col-md-4">
            <div className="fw-bold mb-2">oldal</div>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/">főoldal</Link></li>
              <li><Link to="/blog">blog</Link></li>
              <li><Link to="/mini-kurzus">mini-kurzus</Link></li>
              <li><Link to="/idopontfoglalas">időpontfoglalás</Link></li>
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
        </div>
      </div>
    </footer>
  )
}

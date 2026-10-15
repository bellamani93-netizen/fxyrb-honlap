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
              győzd le a derékfájást hosszú távra
            </p>
          </div>

          <div className="col-md-4">
            <div className="fw-bold mb-2">oldal</div>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/">főoldal</Link></li>
              <li><Link to="/melyedukacio">mélyedukáció</Link></li>
              <li><Link to="/gyorsitosav">gyorsítósáv</Link></li>
              <li><Link to="/idopontfoglalas">időpontfoglalás</Link></li>
            </ul>
          </div>

          <div className="col-md-4">
            <div className="fw-bold mb-2">kapcsolat</div>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li>email: <a href="mailto:info@fixyourback.hu">info@fixyourback.hu</a></li>
              <li><a href="https://www.instagram.com/bellamarton_official/" target="_blank" rel="noreferrer">instagram</a></li>
              <li><a href="https://www.facebook.com/profile.php?id=100089450116040" target="_blank" rel="noreferrer">facebook</a></li>
              <li><a href="https://www.facebook.com/groups/784800570255595" target="_blank" rel="noreferrer">edukációs facebook csoport</a></li>
            </ul>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <span className="small text-white-50">© {new Date().getFullYear()} Fix Your Back</span>
          <ul className="list-unstyled d-flex flex-wrap justify-content-end gap-3 mb-0 small">
            <li><Link to="/aszf">ÁSZF</Link></li>
            <li><Link to="/adatvedelem">Adatvédelmi tájékoztató</Link></li>
            <li><Link to="/cookie">cookie</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}

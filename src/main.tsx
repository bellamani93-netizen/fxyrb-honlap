import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/theme.css'
import './styles/components.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* GitHub Pages ezt a repót "/fxyrb-honlap/" alútvonalon szolgálja ki
       (ld. vite.config.ts `base`) — enélkül a react-router MINDEN belső
       navigációja (Link/NavLink/navigate) a domain gyökeréhez képest
       próbálna útvonalat építeni, ami a valódi (alútvonalas) deploy-on
       rossz helyre vinne (2026.09.01., GitHub Pages deploy előkészítése). */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages ezen a repón belül, egy "/fxyrb-honlap/" alútvonalon
  // szolgálja ki az oldalt (nem a domain gyökeréből) — enélkül minden
  // asset/route-hivatkozás rossz helyre mutatna éles deploy után.
  base: '/fxyrb-honlap/',
})

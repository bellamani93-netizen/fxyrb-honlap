import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('fyb-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('fyb-theme', theme)
  }, [theme])

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
      aria-label="sötét/világos mód váltása"
      title="sötét/világos mód váltása"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}

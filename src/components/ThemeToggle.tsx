import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('fyb-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon-fyb" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2.5 V5 M12 19 V21.5 M21.5 12 H19 M5 12 H2.5 M18.5 5.5 L16.8 7.2 M7.2 16.8 L5.5 18.5 M18.5 18.5 L16.8 16.8 M7.2 7.2 L5.5 5.5" />
      </g>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="icon-fyb" aria-hidden="true">
      <path
        d="M20 14.5 A8.5 8.5 0 1 1 9.5 4 A7 7 0 0 0 20 14.5 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
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
      {theme === 'light' ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}

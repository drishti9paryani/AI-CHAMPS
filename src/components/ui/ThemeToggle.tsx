'use client'

import { useTheme } from '@/lib/theme'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition text-sm font-medium
        dark-mode-btn"
      title={theme === 'dark' ? 'Day mode' : 'Night mode'}
    >
      <span className="text-base">{theme === 'dark' ? '☀️' : '🌙'}</span>
      <span className="hidden sm:inline">{theme === 'dark' ? 'Day' : 'Night'}</span>
    </button>
  )
}

'use client'

import { useState } from 'react'

const NAV_ITEMS = [
  { id: 'profile', label: 'Profile', icon: '👤', mobileLabel: 'Profile' },
  { id: 'tarot', label: 'Guide', icon: '✨', mobileLabel: 'Guide' },
  { id: 'submissions', label: 'Submissions', icon: '📝', mobileLabel: 'Forms' },
  { id: 'roadmap', label: 'Roadmap', icon: '🗺️', mobileLabel: 'Roadmap' },
  { id: 'announcements', label: 'News', icon: '📢', mobileLabel: 'News' },
  { id: 'resources', label: 'Resources', icon: '📚', mobileLabel: 'Tools' },
]

const BOOK_SLOT_URL = 'https://calendly.com/ai-champs'

interface DashboardLayoutProps {
  userName: string
  isAdmin?: boolean
  children: React.ReactNode
}

export default function DashboardLayout({ userName, isAdmin, children }: DashboardLayoutProps) {
  const [activeSection, setActiveSection] = useState('profile')

  function scrollToSection(id: string) {
    setActiveSection(id)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'radial-gradient(ellipse at top, #1a0533 0%, #0d0d1a 60%)' }}
    >
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 border-r border-white/10 bg-black/20 backdrop-blur-xl fixed inset-y-0 left-0 z-30">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold gradient-text">AI Champs</h1>
          <p className="text-slate-500 text-xs mt-1 truncate">Welcome, {userName.split(' ')[0]}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
                ${activeSection === item.id
                  ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          {isAdmin && (
            <a
              href="/admin"
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-medium bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition"
            >
              <span>⚡</span>
              Switch to Admin
            </a>
          )}
          <p className="text-slate-600 text-xs text-center">White Rivers Media</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-8">
        <div className="max-w-3xl mx-auto px-4 py-6 md:py-8 space-y-6">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-white/10 bg-[#0d0d1a]/95 backdrop-blur-xl safe-area-pb">
        <div className="flex items-stretch justify-around px-1 py-2">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg min-w-0 flex-1 transition
                ${activeSection === item.id ? 'text-purple-400' : 'text-slate-500'}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-medium truncate">{item.mobileLabel}</span>
            </button>
          ))}
          <a
            href={BOOK_SLOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg min-w-0 flex-1 text-purple-400"
          >
            <span className="text-lg">📅</span>
            <span className="text-[10px] font-medium truncate">Book</span>
          </a>
        </div>
      </nav>
    </div>
  )
}

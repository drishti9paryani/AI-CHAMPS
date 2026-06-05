'use client'

interface Tab {
  id: string
  label: string
  icon: string
}

interface AdminSidebarProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (id: string) => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export default function AdminSidebar({ tabs, activeTab, onTabChange, mobileOpen, onMobileClose }: AdminSidebarProps) {
  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => { onTabChange(t.id); onMobileClose() }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition text-left w-full
            ${activeTab === t.id
              ? 'bg-gradient-to-r from-purple-600/90 to-blue-600/90 text-white shadow-lg shadow-purple-900/30'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
        >
          <span className="text-lg">{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 border-r border-white/10 bg-black/20 backdrop-blur-xl min-h-screen">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-lg font-bold gradient-text">Admin</h2>
          <p className="text-slate-500 text-xs mt-1">AI Champs Control</p>
        </div>
        {nav}
        <div className="mt-auto p-4 border-t border-white/10">
          <a
            href="/dashboard"
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <span>👤</span>
            Switch to Champ View
          </a>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onMobileClose} />
      )}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-[#0d0d1a] border-r border-white/10 transform transition-transform duration-200
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold gradient-text">Admin</h2>
          <button onClick={onMobileClose} className="text-slate-400 hover:text-white text-xl">×</button>
        </div>
        {nav}
      </aside>
    </>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { AdminOverviewSkeleton } from '@/components/ui/skeletons/AdminSkeletons'
import Overview from '@/components/admin/tabs/Overview'
import AllUsers from '@/components/admin/tabs/AllUsers'
import AIInsights from '@/components/admin/tabs/AIInsights'
import RiskFlags from '@/components/admin/tabs/RiskFlags'
import Export from '@/components/admin/tabs/Export'
import ManageRoadmap from '@/components/admin/tabs/ManageRoadmap'
import TeamView from '@/components/admin/tabs/TeamView'
import Projects from '@/components/admin/tabs/Projects'
import BulkTarot from '@/components/admin/tabs/BulkTarot'
import UserDashboard from '@/components/dashboard/UserDashboard'
import ThemeToggle from '@/components/ui/ThemeToggle'

function ViewToggle({ viewMode, onChange }: { viewMode: 'admin' | 'user'; onChange: (v: 'admin' | 'user') => void }) {
  return (
    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
      {(['admin', 'user'] as const).map(v => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
            viewMode === v
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {v === 'admin' ? '🛡 Admin View' : '👤 Champ View'}
        </button>
      ))}
    </div>
  )
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'champions', label: 'Champions', icon: '👥' },
  { id: 'teams', label: 'Team View', icon: '🏢' },
  { id: 'risk', label: 'Risk Centre', icon: '🚨' },
  { id: 'projects', label: 'Projects', icon: '🚀' },
  { id: 'insights', label: 'AI Insights', icon: '🤖' },
  { id: 'tarot', label: 'Bulk Tarot', icon: '✨' },
  { id: 'export', label: 'Export', icon: '📤' },
  { id: 'roadmap', label: 'Roadmap Editor', icon: '🗺️' },
]

export default function AdminPage() {
  const [ready, setReady] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'admin' | 'user'>('admin')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setReady(true); setUserId(user.id) }
    })
  }, [])

  if (!ready) return (
    <div className="min-h-screen page-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <AdminOverviewSkeleton />
      </div>
    </div>
  )

  if (viewMode === 'user' && userId) {
    return (
      <div className="page-bg">
        <div className="flex justify-center items-center gap-2 pt-4 pb-2">
          <ViewToggle viewMode={viewMode} onChange={setViewMode} />
        </div>
        <UserDashboard userId={userId} />
      </div>
    )
  }

  const TabContent = () => {
    switch (activeTab) {
      case 'overview': return <Overview />
      case 'champions': return <AllUsers />
      case 'teams': return <TeamView />
      case 'risk': return <RiskFlags />
      case 'projects': return <Projects />
      case 'insights': return <AIInsights />
      case 'tarot': return <BulkTarot />
      case 'export': return <Export />
      case 'roadmap': return <ManageRoadmap />
      default: return null
    }
  }

  return (
    <div className="flex min-h-screen page-bg">
      <AdminSidebar
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-4 py-6 lg:py-8">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white"
                aria-label="Open menu"
              >
                ☰
              </button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Admin Dashboard</h1>
                <p className="text-slate-400 text-sm">White Rivers Media · AI Champs Program</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ViewToggle viewMode={viewMode} onChange={setViewMode} />
              <ThemeToggle />
            </div>
          </div>

          <div style={{ perspective: '1200px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, rotateX: 12, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, rotateX: 0,  y: 0,  scale: 1   }}
              exit={{    opacity: 0, rotateX: -8,  y: -16, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformStyle: 'preserve-3d', transformOrigin: 'center top' }}
            >
              <TabContent />
            </motion.div>
          </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}

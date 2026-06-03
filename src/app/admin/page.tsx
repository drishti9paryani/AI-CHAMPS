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

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'users', label: 'All Users', icon: '👥' },
  { id: 'insights', label: 'AI Insights', icon: '🤖' },
  { id: 'risk', label: 'Risk Flags', icon: '🚨' },
  { id: 'export', label: 'Export', icon: '📤' },
  { id: 'roadmap', label: 'Roadmap Editor', icon: '🗺️' },
]

export default function AdminPage() {
  const [ready, setReady] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    // Middleware already enforces admin role — this just waits for auth to settle
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setReady(true)
    })
  }, [])

  if (!ready) return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at top, #1a0533 0%, #0d0d1a 60%)' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <AdminOverviewSkeleton />
      </div>
    </div>
  )

  const TabContent = () => {
    switch (activeTab) {
      case 'overview': return <Overview />
      case 'users': return <AllUsers />
      case 'insights': return <AIInsights />
      case 'risk': return <RiskFlags />
      case 'export': return <Export />
      case 'roadmap': return <ManageRoadmap />
      default: return null
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'radial-gradient(ellipse at top, #1a0533 0%, #0d0d1a 60%)' }}>
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
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <TabContent />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

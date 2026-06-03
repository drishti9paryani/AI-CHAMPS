'use client'

import Skeleton from '@/components/ui/Skeleton'
import GlassCard from '@/components/ui/GlassCard'

export default function DashboardSkeleton() {
  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'radial-gradient(ellipse at top, #1a0533 0%, #0d0d1a 60%)' }}
    >
      <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-white/10 p-6 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-24" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </aside>
      <main className="flex-1 lg:ml-0 pb-20 lg:pb-8">
        <div className="max-w-3xl mx-auto px-4 py-6 md:py-8 space-y-6">
          <GlassCard>
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </GlassCard>
          <GlassCard>
            <Skeleton className="h-48 w-full md:h-56" />
          </GlassCard>
          <GlassCard>
            <Skeleton className="h-6 w-36 mb-4" />
            <Skeleton className="h-24 w-full" />
          </GlassCard>
          <GlassCard>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  )
}

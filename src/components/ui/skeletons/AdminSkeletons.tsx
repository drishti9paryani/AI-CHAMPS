'use client'

import Skeleton from '@/components/ui/Skeleton'
import GlassCard from '@/components/ui/GlassCard'

export function AdminOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <GlassCard key={i} className="text-center space-y-3">
            <Skeleton className="h-10 w-10 mx-auto rounded-full" />
            <Skeleton className="h-8 w-16 mx-auto" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </GlassCard>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard>
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-[220px] w-full" />
        </GlassCard>
        <GlassCard>
          <Skeleton className="h-6 w-44 mb-4" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full mb-3" />
          ))}
        </GlassCard>
      </div>
      <GlassCard>
        <Skeleton className="h-6 w-36 mb-4" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full mb-3" />
        ))}
      </GlassCard>
    </div>
  )
}

export function AdminUsersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <Skeleton className="h-10 flex-1 min-w-[200px]" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <Skeleton className="h-12 w-full rounded-none" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-none border-t border-white/5" />
        ))}
      </div>
    </div>
  )
}

export function AdminRoadmapSkeleton() {
  return (
    <div className="space-y-6">
      <GlassCard>
        <Skeleton className="h-6 w-36 mb-2" />
        <Skeleton className="h-4 w-full max-w-md" />
      </GlassCard>
      {Array.from({ length: 4 }).map((_, i) => (
        <GlassCard key={i} className="space-y-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-full" />
        </GlassCard>
      ))}
    </div>
  )
}

export function AdminRiskSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-48" />
      <div className="flex gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-32" />
        ))}
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  )
}

export function OnboardingPageSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <Skeleton className="h-10 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        <GlassCard className="space-y-4">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </GlassCard>
      </div>
    </div>
  )
}

export function TarotCardSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-56 mx-auto" />
          <Skeleton className="h-4 w-40 mx-auto" />
        </div>
        <Skeleton className="w-full aspect-[2/3]" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}

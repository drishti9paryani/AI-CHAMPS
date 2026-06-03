'use client'

import GlassCard from '@/components/ui/GlassCard'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  className?: string
}

export default function EmptyState({ icon, title, description, className = '' }: EmptyStateProps) {
  return (
    <GlassCard className={`text-center py-8 sm:py-10 ${className}`}>
      <div className="text-4xl mb-3">{icon}</div>
      <h4 className="text-white font-semibold mb-1">{title}</h4>
      <p className="text-slate-400 text-sm max-w-sm mx-auto">{description}</p>
    </GlassCard>
  )
}

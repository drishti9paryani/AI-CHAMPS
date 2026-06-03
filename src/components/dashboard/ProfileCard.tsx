'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import GradientBadge from '@/components/ui/GradientBadge'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from '@/lib/toast'

interface ProfileCardProps {
  name: string
  department: string
  email: string
  aiScore: number
}

export default function ProfileCard({ name, department, email, aiScore }: ProfileCardProps) {
  const router = useRouter()
  const [resetting, setResetting] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  async function handleReset() {
    if (!confirm) { setConfirm(true); return }
    setResetting(true)
    const res = await fetch('/api/reset-onboarding', { method: 'POST' })
    if (res.ok) {
      toast.success('Onboarding reset. Starting fresh!')
      router.push('/onboarding/register')
    } else {
      toast.error('Reset failed. Try again.')
      setResetting(false)
      setConfirm(false)
    }
  }

  return (
    <motion.div
      id="profile"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <GlassCard>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-white truncate">{name}</h2>
              <GradientBadge>
                {'★'.repeat(Math.floor(aiScore))}{'☆'.repeat(Math.max(0, 5 - Math.floor(aiScore)))} {aiScore}/5
              </GradientBadge>
            </div>
            <p className="text-purple-300 text-sm font-medium mb-3">{department}</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 w-20 flex-shrink-0">Email</span>
                <span className="text-slate-300 truncate">{email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 w-20 flex-shrink-0">Program</span>
                <span className="text-slate-300">AI Champs · White Rivers Media</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reset onboarding */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <p className="text-slate-500 text-xs">
            {confirm ? 'This will clear your card, answers and roadmap.' : 'Want to redo your onboarding?'}
          </p>
          <button
            onClick={handleReset}
            disabled={resetting}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
              confirm
                ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
                : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
            }`}
          >
            {resetting ? 'Resetting...' : confirm ? 'Yes, reset everything' : '🔄 Reset Onboarding'}
          </button>
        </div>
      </GlassCard>
    </motion.div>
  )
}

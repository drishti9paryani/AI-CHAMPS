'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from '@/lib/toast'

interface ProfileCardProps {
  name: string
  department: string
  email: string
  aiScore: number
}

// ── Animated SVG score ring ───────────────────────────────────────────────────
function ScoreRing({ score, max = 5 }: { score: number; max?: number }) {
  const pct = Math.min(score / max, 1)
  const size = 88
  const strokeW = 7
  const r = (size - strokeW) / 2
  const circ = 2 * Math.PI * r
  const dash = pct * circ

  const color =
    pct >= 0.8 ? '#a855f7' :
    pct >= 0.6 ? '#3b82f6' :
    pct >= 0.4 ? '#06b6d4' :
    '#f59e0b'

  const label =
    pct >= 0.8 ? 'Expert' :
    pct >= 0.6 ? 'Advanced' :
    pct >= 0.4 ? 'Developing' :
    'Beginner'

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={strokeW} />
        {/* Progress */}
        <motion.circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 6px ${color}99)` }}
        />
      </svg>
      {/* Centre text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-xl font-extrabold text-white leading-none"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4, type: 'spring' }}
        >
          {score}
        </motion.span>
        <span className="text-[9px] text-slate-500 font-medium mt-0.5">/ {max}</span>
      </div>
      {/* Label below ring */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.4 }}
        className="absolute -bottom-5 left-0 right-0 text-center"
        style={{ color }}
      >
        <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
      </motion.div>
    </div>
  )
}

export default function ProfileCard({ name, department, email, aiScore }: ProfileCardProps) {
  const router = useRouter()
  const [resetting, setResetting] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

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
      initial={{ opacity: 0, y: 24, rotateX: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  rotateX: 0,  scale: 1   }}
      transition={{ duration: 0.4 }}
    >
      <GlassCard>
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600
            flex items-center justify-center text-white font-bold text-lg flex-shrink-0
            shadow-lg shadow-purple-900/40">
            {initials}
          </div>

          {/* Name + dept + details */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white truncate">{name}</h2>
            <p className="text-purple-300 text-sm font-medium mb-2">{department}</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 w-14 flex-shrink-0">Email</span>
                <span className="text-slate-400 truncate">{email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 w-14 flex-shrink-0">Program</span>
                <span className="text-slate-400">AI Champs · WRM</span>
              </div>
            </div>
          </div>

          {/* Score ring */}
          <div className="flex-shrink-0 mb-4">
            <ScoreRing score={aiScore} />
          </div>
        </div>

        {/* Reset — tucked away */}
        <div className="mt-4 pt-3 border-t border-white/5">
          <details className="group">
            <summary className="text-xs text-slate-600 cursor-pointer hover:text-slate-400 transition list-none select-none">
              ▸ Advanced options
            </summary>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-slate-500 text-xs">
                {confirm ? '⚠️ This will clear your card, answers and roadmap — irreversible.' : 'Redo your onboarding from scratch.'}
              </p>
              <button
                onClick={handleReset}
                disabled={resetting}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ml-3 flex-shrink-0 ${
                  confirm
                    ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
                    : 'bg-white/5 border border-white/10 text-slate-500 hover:text-slate-300 hover:bg-white/10'
                }`}
              >
                {resetting ? 'Resetting...' : confirm ? 'Yes, reset everything' : 'Reset Onboarding'}
              </button>
            </div>
          </details>
        </div>
      </GlassCard>
    </motion.div>
  )
}

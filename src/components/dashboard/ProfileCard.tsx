'use client'

import { motion } from 'framer-motion'
import GradientBadge from '@/components/ui/GradientBadge'
import GlassCard from '@/components/ui/GlassCard'

interface ProfileCardProps {
  name: string
  department: string
  email: string
  aiScore: number
}

export default function ProfileCard({ name, department, email, aiScore }: ProfileCardProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

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
              <GradientBadge>AI Score {aiScore}/10</GradientBadge>
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
      </GlassCard>
    </motion.div>
  )
}

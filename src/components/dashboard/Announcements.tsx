'use client'

import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'

const ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'Week 1 Kickoff Session',
    body: 'Join us this Monday at 11 AM for the AI Landscape & Tool Discovery kickoff. Bring your questions and tool wishlist!',
    date: 'May 28, 2026',
    tag: 'Event',
  },
  {
    id: '2',
    title: 'New Resource Hub Live',
    body: 'We\'ve added curated guides for Gemini, Claude, and n8n to help you get started faster. Check Learning Resources below.',
    date: 'May 25, 2026',
    tag: 'Update',
  },
  {
    id: '3',
    title: 'Office Hours This Week',
    body: 'Drop in every Wednesday 3–4 PM for open Q&A with the AI Champs team. No agenda required — just show up with blockers.',
    date: 'May 22, 2026',
    tag: 'Support',
  },
]

const TAG_COLORS: Record<string, string> = {
  Event: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Update: 'bg-green-500/20 text-green-300 border-green-500/30',
  Support: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
}

export default function Announcements() {
  return (
    <motion.div
      id="announcements"
      initial={{ opacity: 0, y: 24, rotateX: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  rotateX: 0, scale: 1   }}
      transition={{ duration: 0.4, delay: 0.25 }}
    >
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-1">Announcements</h3>
        <p className="text-slate-400 text-sm mb-5">Latest updates from the AI Champs program</p>

        <div className="space-y-3">
          {ANNOUNCEMENTS.map(a => (
            <div
              key={a.id}
              className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="font-medium text-white text-sm">{a.title}</h4>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 ${TAG_COLORS[a.tag]}`}>
                  {a.tag}
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{a.body}</p>
              <p className="text-slate-600 text-xs mt-2">{a.date}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  )
}

'use client'

import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'

const AI_TEAM_BOOKING_URL =
  'https://calendar.google.com/calendar/render?action=TEMPLATE&text=AI+Champs+Check-in&add=siddhantsethi@wrd.co.in&add=drishtiparyani@wrd.co.in'

const CONTACTS = [
  { name: 'Siddhant Sethi',  email: 'siddhantsethi@wrd.co.in' },
  { name: 'Drishti Paryani', email: 'drishtiparyani@wrd.co.in' },
]

export default function BookingSection() {
  return (
    <motion.div
      id="booking"
      initial={{ opacity: 0, y: 24, rotateX: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  rotateX: 0, scale: 1   }}
      transition={{ duration: 0.4, delay: 0.28 }}
    >
      <GlassCard>
        <h3 className="text-lg font-bold text-white mb-1">Book a Session</h3>
        <p className="text-slate-400 text-sm mb-5">
          Need help, have questions, or want to show off something you built? Book time with the AI team.
        </p>

        {/* Single team booking CTA */}
        <a
          href={AI_TEAM_BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30
            hover:bg-purple-500/20 hover:border-purple-400/50 transition mb-6 group"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600
            flex items-center justify-center text-white text-xl flex-shrink-0 shadow-lg shadow-purple-900/40">
            📅
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">Book with the AI Team</p>
            <p className="text-slate-400 text-xs mt-0.5">Pick a slot — 30 min, no agenda required</p>
          </div>
          <span className="text-purple-400 group-hover:translate-x-1 transition-transform text-lg flex-shrink-0">→</span>
        </a>

        {/* Contact the team */}
        <div className="border-t border-white/10 pt-5">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Contact the Team</p>
          <div className="space-y-2.5">
            {CONTACTS.map(c => (
              <div key={c.email} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-white text-sm font-medium">{c.name}</span>
                </div>
                <a
                  href={`mailto:${c.email}`}
                  className="text-purple-400 text-xs hover:text-purple-300 transition flex-shrink-0"
                >
                  {c.email}
                </a>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

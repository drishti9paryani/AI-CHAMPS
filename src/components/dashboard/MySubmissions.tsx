'use client'

import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'

interface Submission {
  current_project: string
  biggest_challenge: string
  support_needed: string
}

interface MySubmissionsProps {
  submission: Submission | null
}

export default function MySubmissions({ submission }: MySubmissionsProps) {
  return (
    <motion.div
      id="submissions"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-1">My Submissions</h3>
        <p className="text-slate-400 text-sm mb-5">Your champ form responses from onboarding</p>

        {!submission ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">📝</div>
            <p className="text-white font-medium text-sm mb-1">No submissions yet</p>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              Complete onboarding to share your AI journey with the team.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-purple-400 text-xs uppercase tracking-wider mb-2">Current Project</p>
              <p className="text-white bg-white/5 rounded-xl p-4 text-sm leading-relaxed border border-white/5">
                {submission.current_project}
              </p>
            </div>
            <div>
              <p className="text-purple-400 text-xs uppercase tracking-wider mb-2">Biggest Challenge</p>
              <p className="text-white bg-white/5 rounded-xl p-4 text-sm leading-relaxed border border-white/5">
                {submission.biggest_challenge}
              </p>
            </div>
            <div>
              <p className="text-purple-400 text-xs uppercase tracking-wider mb-2">Support Needed</p>
              <p className="text-white bg-white/5 rounded-xl p-4 text-sm leading-relaxed border border-white/5">
                {submission.support_needed}
              </p>
            </div>
          </div>
        )}
      </GlassCard>
    </motion.div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { computeRiskFlag, worstFlag } from '@/lib/riskFlag'
import GlassCard from '@/components/ui/GlassCard'
import { useOnboardingUser } from '@/lib/useOnboardingUser'
import { toast } from '@/lib/toast'
import { OnboardingPageSkeleton } from '@/components/ui/skeletons/AdminSkeletons'

export default function Screen3Form() {
  const router = useRouter()
  const { userId, loading: authLoading } = useOnboardingUser()
  const [form, setForm] = useState({ current_project: '', challenge: '', support_needed: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !userId) router.replace('/onboarding/register')
  }, [authLoading, userId, router])

  useEffect(() => {
    if (!userId) return
    supabase.from('users').select('tarot_card_type').eq('id', userId).single()
      .then(({ data }) => {
        if (data && !data.tarot_card_type) router.replace('/onboarding/tarot')
      })
  }, [userId, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setLoading(true)
    setError('')

    const risk_flag = worstFlag([
      computeRiskFlag(form.current_project),
      computeRiskFlag(form.challenge),
      computeRiskFlag(form.support_needed),
    ])

    const { error: submissionErr } = await supabase.from('champ_forms').insert({
      user_id: userId,
      current_project: form.current_project,
      biggest_challenge: form.challenge,
      support_needed: form.support_needed,
    })

    if (submissionErr) {
      setError(submissionErr.message)
      toast.error(submissionErr.message)
      setLoading(false)
      return
    }

    await supabase.from('users').update({ risk_flag }).eq('id', userId)

    toast.success('Submission saved')

    setLoading(false)
    router.push('/onboarding/roadmap')
  }

  if (authLoading || !userId) return <OnboardingPageSkeleton />

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-screen px-4 py-12"
    >
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">Tell us about your AI journey</h2>
          <p className="text-slate-400">Help us understand where you are and what you need</p>
        </div>

        <GlassCard>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                What AI project are you currently working on?
              </label>
              <textarea
                required
                rows={3}
                value={form.current_project}
                onChange={e => setForm({ ...form, current_project: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition resize-none"
                placeholder="Describe your current AI project or experiments..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                What is your biggest AI-related challenge or pain point?
              </label>
              <textarea
                required
                rows={3}
                value={form.challenge}
                onChange={e => setForm({ ...form, challenge: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition resize-none"
                placeholder="What's been difficult or frustrating?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                What support, resource or training would help you most?
              </label>
              <textarea
                required
                rows={3}
                value={form.support_needed}
                onChange={e => setForm({ ...form, support_needed: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition resize-none"
                placeholder="Workshops, tools, mentorship, documentation..."
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Submit & Continue →'}
            </button>
          </form>
        </GlassCard>
      </div>
    </motion.div>
  )
}

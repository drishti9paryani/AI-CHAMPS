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

interface FormState {
  current_project: string
  challenge: string
  support_needed: string
}

export default function Screen3Form({ editMode = false }: { editMode?: boolean }) {
  const router = useRouter()
  const { userId, loading: authLoading } = useOnboardingUser()
  const [form, setForm] = useState<FormState>({ current_project: '', challenge: '', support_needed: '' })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [existingId, setExistingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !userId) router.replace('/onboarding/register')
  }, [authLoading, userId, router])

  // Load existing answers so users can edit them
  useEffect(() => {
    if (!userId) return
    supabase
      .from('champ_forms')
      .select('id, current_project, biggest_challenge, support_needed')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setExistingId(data.id)
          setForm({
            current_project: data.current_project ?? '',
            challenge: data.biggest_challenge ?? '',
            support_needed: data.support_needed ?? '',
          })
        }
        setFetching(false)
      })
  }, [userId])

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

    let submissionErr: { message: string } | null = null

    if (existingId) {
      // Update existing answers — users can always edit
      const { error } = await supabase
        .from('champ_forms')
        .update({
          current_project: form.current_project,
          biggest_challenge: form.challenge,
          support_needed: form.support_needed,
        })
        .eq('id', existingId)
      submissionErr = error
    } else {
      const { error } = await supabase.from('champ_forms').insert({
        user_id: userId,
        current_project: form.current_project,
        biggest_challenge: form.challenge,
        support_needed: form.support_needed,
      })
      submissionErr = error
    }

    if (submissionErr) {
      setError(submissionErr.message)
      toast.error(submissionErr.message)
      setLoading(false)
      return
    }

    await supabase.from('users').update({ risk_flag }).eq('id', userId)

    toast.success(existingId ? 'Updated! You\'re on it. ✅' : 'Spilled the tea. Let\'s go! ☕')
    setLoading(false)

    if (editMode) {
      router.push('/dashboard')
    } else {
      router.push('/onboarding/roadmap')
    }
  }

  if (authLoading || fetching) return <OnboardingPageSkeleton />

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
          <h2 className="text-2xl sm:text-3xl font-extrabold gradient-text mb-2 tracking-tight">
            {existingId ? 'Update your answers 📝' : 'Spill the tea ☕'}
          </h2>
          <p className="text-slate-400 text-sm">
            {existingId
              ? 'Changed your mind? Things moved? Update away — we won\'t judge.'
              : 'Three questions. No right answers. Just be honest (we can handle it).'}
          </p>
        </div>

        <GlassCard>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">
                What AI thing are you actually working on right now?
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Doesn't have to be a 6-month project. Even "I've been using ChatGPT to reply to emails" counts.
              </p>
              <textarea
                required
                rows={3}
                value={form.current_project}
                onChange={e => setForm({ ...form, current_project: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition resize-none"
                placeholder="Tell us what you're up to..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">
                What's the one thing making you want to flip a table?
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Your biggest AI-related challenge or pain point. Be specific — vague answers get vague help.
              </p>
              <textarea
                required
                rows={3}
                value={form.challenge}
                onChange={e => setForm({ ...form, challenge: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition resize-none"
                placeholder="What's been hard or frustrating?"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">
                If we could hand you one thing tomorrow, what would it be?
              </label>
              <p className="text-xs text-slate-500 mb-2">
                A workshop? A tool subscription? Someone to just sit with you for an hour? Say it.
              </p>
              <textarea
                required
                rows={3}
                value={form.support_needed}
                onChange={e => setForm({ ...form, support_needed: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition resize-none"
                placeholder="Workshops, tools, mentorship, someone to just vibe with..."
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-3">
              {editMode && (
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 py-3 rounded-xl font-semibold text-slate-300 border border-white/10 hover:bg-white/5 transition"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : existingId ? 'Save Changes →' : 'Submit & Continue →'}
              </button>
            </div>
          </form>
        </GlassCard>
      </div>
    </motion.div>
  )
}

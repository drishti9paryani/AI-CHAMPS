'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/client'
import GlassCard from '@/components/ui/GlassCard'
import { useOnboardingUser } from '@/lib/useOnboardingUser'
import { toast } from '@/lib/toast'
import { OnboardingPageSkeleton } from '@/components/ui/skeletons/AdminSkeletons'

const DEPARTMENTS = [
  'Admin & Support',
  'Business Development',
  'Capital Z',
  'Client Servicing - Brands',
  'Client Servicing - Entertainment',
  'Copy & Content',
  'Corporate Communications',
  'Design',
  'Digital Media',
  'Finance',
  "Founder's Office",
  'Influencer Marketing',
  'Management',
  'Partnerships',
  'People & Culture',
  'Planning',
  'SEO',
  'Strategy',
  'Video',
  'Video Production',
  'Web & Tech',
]

export default function Screen1Registration() {
  const router = useRouter()
  const { userId, email, loading: authLoading, isAuthenticated } = useOnboardingUser()
  const [form, setForm] = useState({ name: '', email: '', department: '', ai_score: 5 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (email) setForm(prev => ({ ...prev, email }))
  }, [email])

  useEffect(() => {
    if (authLoading || !userId) return

    supabase
      .from('users')
      .select('name, department, ai_score, tarot_card_type')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return
        setForm(prev => ({
          ...prev,
          name: data.name || prev.name,
          department: data.department || prev.department,
          ai_score: data.ai_score ?? prev.ai_score,
        }))
        if (data.tarot_card_type) {
          router.replace('/onboarding/tarot')
        }
      })
  }, [authLoading, userId, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const authClient = createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user?.email) {
      setError('You must be signed in to continue.')
      setLoading(false)
      return
    }

    const { error: upsertErr } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        name: form.name,
        email: user.email,
        department: form.department,
        ai_score: form.ai_score,
      })

    if (upsertErr) {
      setError(upsertErr.message)
      toast.error(upsertErr.message)
      setLoading(false)
      return
    }

    toast.success('Profile saved')
    router.push('/onboarding/tarot')
    setLoading(false)
  }

  if (authLoading) return <OnboardingPageSkeleton />

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <GlassCard className="max-w-md text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Sign in required</h2>
          <p className="text-slate-400 text-sm">
            Please sign in with your @whiteriversmedia.com Google account to start onboarding.
          </p>
        </GlassCard>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-screen px-4 py-12"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">AI Champs</h1>
          <p className="text-slate-400">White Rivers Media · AI Champions Program</p>
        </div>

        <GlassCard>
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-6">Create your profile</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Department</label>
              <select
                required
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
                className="w-full bg-[#0d0d1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input
                type="email"
                required
                readOnly
                value={form.email}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Self-Rated AI Score:{' '}
                <span className="text-purple-400 font-bold text-lg">{form.ai_score}</span>/10
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={form.ai_score}
                onChange={e => setForm({ ...form, ai_score: Number(e.target.value) })}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Beginner</span>
                <span>Expert</span>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Continue →'}
            </button>
          </form>
        </GlassCard>
      </div>
    </motion.div>
  )
}

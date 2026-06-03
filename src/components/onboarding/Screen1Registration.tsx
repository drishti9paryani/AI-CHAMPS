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

const TEAMS = [
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

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState<number | null>(null)

  const display = hovered ?? value

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex gap-1.5 items-center"
        onMouseLeave={() => setHovered(null)}
      >
        {[1, 2, 3, 4, 5].map(star => {
          const full = display >= star
          const half = !full && display >= star - 0.5

          return (
            <div key={star} className="relative w-9 h-9 flex-shrink-0 cursor-pointer select-none">
              {/* half-star zone (left) */}
              <div
                className="absolute inset-y-0 left-0 w-1/2 z-10"
                onMouseEnter={() => setHovered(star - 0.5)}
                onClick={() => onChange(star - 0.5)}
              />
              {/* full-star zone (right) */}
              <div
                className="absolute inset-y-0 right-0 w-1/2 z-10"
                onMouseEnter={() => setHovered(star)}
                onClick={() => onChange(star)}
              />
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full drop-shadow-sm"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id={`star-grad-${star}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset={half ? '50%' : full ? '100%' : '0%'} stopColor="#a855f7" />
                    <stop offset={half ? '50%' : full ? '100%' : '0%'} stopColor="#374151" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill={full ? '#a855f7' : half ? `url(#star-grad-${star})` : '#374151'}
                  stroke={full || half ? '#a855f7' : '#4b5563'}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>Just vibing 🫠</span>
        <span className="text-purple-400 font-semibold">
          {value > 0 ? `${value}/5` : 'tap to rate'}
        </span>
        <span>Basically AI 🤖</span>
      </div>
    </div>
  )
}

export default function Screen1Registration() {
  const router = useRouter()
  const { userId, email, loading: authLoading, isAuthenticated } = useOnboardingUser()
  const [form, setForm] = useState({ name: '', email: '', department: '', ai_score: 0 })
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
    if (form.ai_score === 0) {
      setError('Give yourself a star rating — even 0.5 counts!')
      return
    }
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

    toast.success('Looking good. Let\'s go! 🚀')
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
            Sign in with your Google account to start the onboarding flow.
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
          <h1 className="text-3xl sm:text-4xl font-extrabold gradient-text mb-2 tracking-tight">AI Champs</h1>
          <p className="text-slate-500 text-sm">White Rivers Media · Where boring workflows come to die.</p>
        </div>

        <GlassCard>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
            First things first. 👋
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Tell us who you are. No bios needed — just the basics.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Full Name <span className="text-purple-400">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                placeholder="Your actual name, not your Slack alias"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Team <span className="text-purple-400">*</span>
              </label>
              <select
                required
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
                className="w-full bg-[#0d0d1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
              >
                <option value="">Which squad are you on?</option>
                {TEAMS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                readOnly
                value={form.email}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                How AI-brained are you, honestly?
              </label>
              <StarRating
                value={form.ai_score}
                onChange={v => setForm({ ...form, ai_score: v })}
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Let\'s go →'}
            </button>
          </form>
        </GlassCard>
      </div>
    </motion.div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import { supabase } from '@/lib/supabase'
import { computeRiskFlag, worstFlag } from '@/lib/riskFlag'
import { toast } from '@/lib/toast'

interface Submission {
  id?: string
  current_project: string
  biggest_challenge: string
  support_needed: string
}

interface MySubmissionsProps {
  submission: Submission | null
  userId: string
}

export default function MySubmissions({ submission: initialSubmission, userId }: MySubmissionsProps) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [submission, setSubmission] = useState<Submission | null>(initialSubmission)
  const [form, setForm] = useState({
    current_project: initialSubmission?.current_project ?? '',
    challenge: initialSubmission?.biggest_challenge ?? '',
    support_needed: initialSubmission?.support_needed ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [existingId, setExistingId] = useState<string | null>(initialSubmission?.id ?? null)

  // fetch the row id if not passed
  useEffect(() => {
    if (existingId || !userId) return
    supabase
      .from('champ_forms')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { if (data?.id) setExistingId(data.id) })
  }, [userId, existingId])

  function startEdit() {
    setForm({
      current_project: submission?.current_project ?? '',
      challenge: submission?.biggest_challenge ?? '',
      support_needed: submission?.support_needed ?? '',
    })
    setEditing(true)
  }

  async function handleSave() {
    setSaving(true)
    const risk_flag = worstFlag([
      computeRiskFlag(form.current_project),
      computeRiskFlag(form.challenge),
      computeRiskFlag(form.support_needed),
    ])

    let err = null
    if (existingId) {
      const { error } = await supabase.from('champ_forms').update({
        current_project: form.current_project,
        biggest_challenge: form.challenge,
        support_needed: form.support_needed,
      }).eq('id', existingId)
      err = error
    } else {
      const { data, error } = await supabase.from('champ_forms').insert({
        user_id: userId,
        current_project: form.current_project,
        biggest_challenge: form.challenge,
        support_needed: form.support_needed,
      }).select('id').single()
      err = error
      if (data?.id) setExistingId(data.id)
    }

    if (err) { toast.error(err.message); setSaving(false); return }

    await supabase.from('users').update({ risk_flag }).eq('id', userId)

    setSubmission({
      current_project: form.current_project,
      biggest_challenge: form.challenge,
      support_needed: form.support_needed,
    })
    toast.success(existingId ? 'Updated! ✅' : 'Saved! ✅')
    setSaving(false)
    setEditing(false)
  }

  return (
    <motion.div
      id="submissions"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      <GlassCard className="p-0 overflow-hidden">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition"
        >
          <div className="text-left">
            <h3 className="text-lg font-bold text-white">My Answers</h3>
            <p className="text-slate-400 text-sm">The tea you spilled during onboarding.</p>
          </div>
          <span className={`text-slate-400 text-lg transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>⌄</span>
        </button>

        <AnimatePresence initial={false}>
        {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
        <div className="px-6 pb-6 border-t border-white/10 pt-4">
          {!editing && (
            <div className="flex justify-end mb-3">
              <button
                onClick={startEdit}
                className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition"
              >
                {submission ? '✏️ Edit' : '+ Add'}
              </button>
            </div>
          )}

        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 mt-4"
            >
              {[
                { key: 'support_needed', label: 'If we could hand you one thing tomorrow — what?', hint: 'A workshop, tool, mentorship session, or resource — tell us exactly what would move the needle for you.' },
                { key: 'current_project', label: 'What AI thing are you working on?', hint: "Doesn't have to be big. Even \"I'm using ChatGPT for emails\" counts." },
                { key: 'challenge', label: "What's making you want to flip a table?", hint: 'Biggest AI-related challenge or pain point.' },
              ].map(({ key, label, hint }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-slate-300 mb-0.5">{label}</label>
                  <p className="text-xs text-slate-500 mb-1.5">{hint}</p>
                  <textarea
                    rows={3}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition resize-none text-sm"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-300 border border-white/10 hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:scale-95 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          ) : !submission ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <div className="text-3xl mb-3">📝</div>
              <p className="text-white font-semibold text-sm mb-1">Nothing here yet</p>
              <p className="text-slate-500 text-sm max-w-xs mx-auto mb-4">
                You haven't shared your AI journey yet. Takes 2 minutes.
              </p>
              <button
                onClick={startEdit}
                className="text-sm px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-500 hover:to-blue-500 transition"
              >
                Add your answers →
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 mt-4"
            >
              <div>
                <p className="text-purple-400 text-xs uppercase tracking-wider mb-2">Support Requested</p>
                <p className="text-white bg-white/5 rounded-xl p-4 text-sm leading-relaxed border border-white/5">
                  {submission.support_needed}
                </p>
              </div>
              <div>
                <p className="text-purple-400 text-xs uppercase tracking-wider mb-2">Current AI Initiative</p>
                <p className="text-white bg-white/5 rounded-xl p-4 text-sm leading-relaxed border border-white/5">
                  {submission.current_project}
                </p>
              </div>
              <div>
                <p className="text-purple-400 text-xs uppercase tracking-wider mb-2">Primary Blocker</p>
                <p className="text-white bg-white/5 rounded-xl p-4 text-sm leading-relaxed border border-white/5">
                  {submission.biggest_challenge}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
        </motion.div>
        )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  )
}

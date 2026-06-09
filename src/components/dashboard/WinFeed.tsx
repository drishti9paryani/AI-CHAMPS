'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

interface Win {
  id: string
  user_id: string
  content: string
  tool_used: string | null
  time_saved_minutes: number
  created_at: string
  userName: string
  userDept: string
  reactions: Record<string, string[]>
}

const EMOJIS = ['🔥', '💡', '🚀', '❤️'] as const
type Emoji = (typeof EMOJIS)[number]

const EMOJI_LABELS: Record<Emoji, string> = {
  '🔥': 'Fire',
  '💡': 'Insightful',
  '🚀': 'Inspiring',
  '❤️': 'Love it',
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function initials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function WinFeed({ userId }: { userId: string }) {
  const [wins, setWins] = useState<Win[]>([])
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ content: '', tool_used: '', time_saved_minutes: 0 })

  async function loadWins() {
    const { data } = await supabase
      .from('ai_wins')
      .select('*, users(name, department), win_reactions(user_id, emoji)')
      .order('created_at', { ascending: false })
      .limit(30)

    if (!data) { setLoading(false); return }

    const mapped: Win[] = (data as any[]).map(w => {
      const reacts: Record<string, string[]> = { '🔥': [], '💡': [], '🚀': [], '❤️': [] }
      ;(w.win_reactions ?? []).forEach((r: { user_id: string; emoji: string }) => {
        if (reacts[r.emoji]) reacts[r.emoji].push(r.user_id)
      })
      return {
        id: w.id,
        user_id: w.user_id,
        content: w.content,
        tool_used: w.tool_used,
        time_saved_minutes: w.time_saved_minutes ?? 0,
        created_at: w.created_at,
        userName: (w.users as any)?.name ?? 'Champion',
        userDept: (w.users as any)?.department ?? '',
        reactions: reacts,
      }
    })

    setWins(mapped)
    setLoading(false)
  }

  useEffect(() => { loadWins() }, [])

  async function toggleReaction(winId: string, emoji: Emoji) {
    const win = wins.find(w => w.id === winId)
    if (!win) return
    const alreadyReacted = win.reactions[emoji]?.includes(userId)

    // Optimistic UI
    setWins(prev =>
      prev.map(w => {
        if (w.id !== winId) return w
        return {
          ...w,
          reactions: {
            ...w.reactions,
            [emoji]: alreadyReacted
              ? w.reactions[emoji].filter(id => id !== userId)
              : [...(w.reactions[emoji] ?? []), userId],
          },
        }
      })
    )

    if (alreadyReacted) {
      await supabase
        .from('win_reactions')
        .delete()
        .eq('win_id', winId)
        .eq('user_id', userId)
        .eq('emoji', emoji)
    } else {
      await supabase.from('win_reactions').insert({ win_id: winId, user_id: userId, emoji })
    }
  }

  async function postWin() {
    if (!form.content.trim()) return
    setSubmitting(true)
    const { error } = await supabase.from('ai_wins').insert({
      user_id: userId,
      content: form.content.trim(),
      tool_used: form.tool_used.trim() || null,
      time_saved_minutes: form.time_saved_minutes,
    })
    setSubmitting(false)
    if (!error) {
      setForm({ content: '', tool_used: '', time_saved_minutes: 0 })
      setPosting(false)
      await loadWins()
    }
  }

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">AI Win Board ✨</h2>
          <p className="text-slate-500 text-xs mt-0.5">Share what's working. Celebrate and inspire your team.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setPosting(p => !p)}
          className="px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all"
          style={{
            background: posting
              ? 'rgba(255,255,255,0.06)'
              : 'linear-gradient(135deg, #7c3aed, #2563eb)',
            boxShadow: posting ? 'none' : '0 4px 20px rgba(124,58,237,0.3)',
            border: posting ? '1px solid rgba(255,255,255,0.1)' : 'none',
            color: posting ? '#94a3b8' : '#fff',
          }}
        >
          {posting ? '✕ Cancel' : '+ Share a Win'}
        </motion.button>
      </div>

      {/* Post form — 3D flip in */}
      <AnimatePresence>
        {posting && (
          <motion.div
            initial={{ opacity: 0, rotateX: -14, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, rotateX: 0, scale: 1, y: 0 }}
            exit={{ opacity: 0, rotateX: 10, scale: 0.97, y: -6 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            style={{ perspective: '800px', transformStyle: 'preserve-3d' }}
            className="relative rounded-2xl overflow-hidden"
          >
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                padding: '1px',
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                opacity: 0.65,
              }}
            >
              <div className="absolute inset-0 rounded-2xl bg-[#0d0d1a]" />
            </div>
            <div className="relative z-10 p-5 space-y-3">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Share your win 🏆</p>
              <textarea
                value={form.content}
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                placeholder="What did you try, build, or save time on with AI? Even small wins count!"
                rows={3}
                autoFocus
                className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 text-sm resize-none"
              />
              <div className="flex gap-3 items-center">
                <input
                  value={form.tool_used}
                  onChange={e => setForm(p => ({ ...p, tool_used: e.target.value }))}
                  placeholder="🛠️ Tool used (optional)"
                  className="flex-1 bg-white/5 border border-white/12 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 text-sm"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-500 text-xs">⏱</span>
                  <input
                    type="number"
                    min="0"
                    value={form.time_saved_minutes}
                    onChange={e => setForm(p => ({ ...p, time_saved_minutes: Number(e.target.value) }))}
                    className="w-16 bg-white/5 border border-white/12 rounded-xl px-2 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 text-center"
                  />
                  <span className="text-slate-500 text-xs">min</span>
                </div>
              </div>
              <button
                onClick={postWin}
                disabled={submitting || !form.content.trim()}
                className="w-full py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
              >
                {submitting ? 'Posting…' : '🚀 Post Win'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feed */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl bg-white/5 border border-white/8 p-5 animate-pulse h-32" />
          ))}
        </div>
      ) : wins.length === 0 ? (
        <div style={{ perspective: '800px' }}>
          <motion.div
            whileHover={{ rotateX: -3, rotateY: 4, scale: 1.01 }}
            style={{ transformStyle: 'preserve-3d' }}
            className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center"
          >
            <div className="text-5xl mb-3">🏆</div>
            <p className="text-slate-400 text-sm">No wins yet. Be the first to share one!</p>
          </motion.div>
        </div>
      ) : (
        <div className="space-y-3">
          {wins.map((win, i) => (
            <WinCard
              key={win.id}
              win={win}
              currentUserId={userId}
              onReact={toggleReaction}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Individual win card ────────────────────────────────────────────────────────

function WinCard({
  win,
  currentUserId,
  onReact,
  index,
}: {
  win: Win
  currentUserId: string
  onReact: (id: string, emoji: Emoji) => void
  index: number
}) {
  const isOwn = win.user_id === currentUserId

  return (
    <div style={{ perspective: '800px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ delay: index * 0.055, type: 'spring', stiffness: 260, damping: 22 }}
        whileHover={{ rotateX: -3, rotateY: 4, scale: 1.01 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="rounded-2xl border border-white/8 bg-white/[0.03] hover:border-white/15 transition-colors p-5"
      >
        {/* Author row */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
              boxShadow: '0 0 14px rgba(124,58,237,0.4)',
            }}
          >
            {initials(win.userName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-semibold text-sm">{win.userName}</span>
              {isOwn && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  you
                </span>
              )}
              {win.userDept && (
                <>
                  <span className="text-slate-600 text-xs">·</span>
                  <span className="text-slate-500 text-xs">{win.userDept}</span>
                </>
              )}
              <span className="text-slate-600 text-xs ml-auto shrink-0">{timeAgo(win.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="text-slate-200 text-sm leading-relaxed mb-3">{win.content}</p>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {win.tool_used && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/12 text-blue-300 border border-blue-500/25">
              🛠 {win.tool_used}
            </span>
          )}
          {win.time_saved_minutes > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-teal-500/12 text-teal-300 border border-teal-500/25">
              ⏱{' '}
              {win.time_saved_minutes >= 60
                ? `${(win.time_saved_minutes / 60).toFixed(1)}h saved`
                : `${win.time_saved_minutes}min saved`}
            </span>
          )}
        </div>

        {/* Reactions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {EMOJIS.map(emoji => {
            const count = win.reactions[emoji]?.length ?? 0
            const hasReacted = win.reactions[emoji]?.includes(currentUserId) ?? false
            return (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.18 }}
                whileTap={{ scale: 0.82 }}
                onClick={() => onReact(win.id, emoji)}
                title={EMOJI_LABELS[emoji]}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-all ${
                  hasReacted
                    ? 'bg-violet-500/20 border-violet-500/40 text-white'
                    : 'bg-white/[0.04] border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                <span className="leading-none">{emoji}</span>
                {count > 0 && <span className="font-medium tabular-nums">{count}</span>}
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

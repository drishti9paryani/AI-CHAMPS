'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import GlassCard from '@/components/ui/GlassCard'

export default function BulkTarot() {
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [total, setTotal] = useState(0)
  const [done, setDone] = useState(false)
  const [log, setLog] = useState<string[]>([])

  async function run() {
    setRunning(true)
    setDone(false)
    setLog([])
    setProgress(0)

    const { data: users } = await supabase
      .from('users')
      .select('id, name, department, ai_score')
      .is('tarot_card_type', null)

    if (!users || users.length === 0) {
      setLog(['All users already have tarot cards.'])
      setRunning(false)
      setDone(true)
      return
    }

    setTotal(users.length)
    setLog([`Found ${users.length} users without tarot cards. Starting...`])

    for (let i = 0; i < users.length; i++) {
      const u = users[i]
      try {
        const res = await fetch('/api/tarot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: u.name, department: u.department, ai_score: u.ai_score }),
        })
        if (res.ok) {
          const card = await res.json()
          await supabase.from('users').update({ tarot_card_type: card.title, tarot_card_data: card }).eq('id', u.id)
          setLog(l => [...l, `✓ ${u.name} → ${card.title}`])
        } else {
          setLog(l => [...l, `✗ ${u.name} — API error`])
        }
      } catch {
        setLog(l => [...l, `✗ ${u.name} — failed`])
      }
      setProgress(i + 1)
    }

    setRunning(false)
    setDone(true)
  }

  const pct = total > 0 ? Math.round((progress / total) * 100) : 0

  return (
    <div className="space-y-6">
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-2">Bulk Tarot Generation</h3>
        <p className="text-slate-400 text-sm mb-5">
          Generate AI tarot cards for all users who don't have one yet. Runs sequentially to avoid rate limits.
        </p>
        <button
          onClick={run}
          disabled={running}
          className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition disabled:opacity-50"
        >
          {running ? 'Generating...' : '✨ Generate Missing Tarot Cards'}
        </button>
      </GlassCard>

      {(running || done) && (
        <GlassCard>
          {total > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Progress</span>
                <span>{progress}/{total} ({pct}%)</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {log.map((line, i) => (
              <p key={i} className={`text-sm ${line.startsWith('✓') ? 'text-green-400' : line.startsWith('✗') ? 'text-red-400' : 'text-slate-300'}`}>
                {line}
              </p>
            ))}
          </div>
          {done && <p className="text-purple-300 font-medium mt-3">Done!</p>}
        </GlassCard>
      )}
    </div>
  )
}

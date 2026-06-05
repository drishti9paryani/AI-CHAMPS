'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import GlassCard from '@/components/ui/GlassCard'
import { AdminRoadmapSkeleton } from '@/components/ui/skeletons/AdminSkeletons'
import { toast } from '@/lib/toast'
import { ROADMAP_WEEKS, type RoadmapConfigRow, seedRoadmapIfEmpty } from '@/lib/admin'

export default function ManageRoadmap() {
  const [weeks, setWeeks] = useState<RoadmapConfigRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  async function load() {
    setLoading(true)
    const data = await seedRoadmapIfEmpty(supabase)
    setWeeks(data.filter(w => w.week_number <= 4).sort((a, b) => a.week_number - b.week_number))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function updateWeek(weekNumber: number, field: 'title' | 'description', value: string) {
    setWeeks(prev => prev.map(w => w.week_number === weekNumber ? { ...w, [field]: value } : w))
  }

  function updateTools(weekNumber: number, value: string) {
    const tools = value.split(',').map(t => t.trim()).filter(Boolean)
    setWeeks(prev => prev.map(w => w.week_number === weekNumber ? { ...w, tools } : w))
  }

  async function saveWeek(week: RoadmapConfigRow) {
    setSaving(week.week_number)
    setMessage('')
    const { error } = await supabase
      .from('roadmap_config')
      .update({ title: week.title, description: week.description, tools: week.tools })
      .eq('id', week.id)
    setSaving(null)
    if (error) {
      toast.error(`Failed to save week ${week.week_number}`)
    } else {
      toast.success(`Week ${week.week_number} saved`)
    }
    setMessage(error ? `Failed to save week ${week.week_number}` : `Week ${week.week_number} saved`)
    setTimeout(() => setMessage(''), 3000)
  }

  if (loading) return <AdminRoadmapSkeleton />

  return (
    <div className="space-y-6">
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-2">Roadmap Editor</h3>
        <p className="text-slate-400 text-sm">
          Edit week titles and descriptions. Changes appear on the user dashboard roadmap. {weeks.length} weeks configured.
        </p>
        {message && <p className="text-purple-300 text-sm mt-3">{message}</p>}
      </GlassCard>

      <div className="space-y-4">
        {weeks.map(week => {
          const icon = ROADMAP_WEEKS.find(w => w.week === week.week_number)?.icon ?? '📅'
          return (
            <GlassCard key={week.id}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{icon}</span>
                <h4 className="text-white font-semibold">Week {week.week_number}</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Title</label>
                  <input
                    value={week.title}
                    onChange={e => updateWeek(week.week_number, 'title', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Description</label>
                  <textarea
                    value={week.description}
                    onChange={e => updateWeek(week.week_number, 'description', e.target.value)}
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Tools (comma-separated)</label>
                  <input
                    value={week.tools.join(', ')}
                    onChange={e => updateTools(week.week_number, e.target.value)}
                    placeholder="ChatGPT, Claude, Midjourney"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button
                  onClick={() => saveWeek(week)}
                  disabled={saving === week.week_number}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 transition disabled:opacity-50"
                >
                  {saving === week.week_number ? 'Saving...' : 'Save Week'}
                </button>
              </div>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}

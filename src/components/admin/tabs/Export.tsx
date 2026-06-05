'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from '@/lib/toast'

interface Row {
  Name: string
  Department: string
  Email: string
  'AI Score': number
  'Tarot Card Type': string
  Project: string
  'Biggest Challenge': string
  'Support Requested': string
  'Risk Flag': string
}

async function fetchRows(): Promise<Row[]> {
  const { data: users } = await supabase.from('users').select('id,name,department,email,ai_score,tarot_card_type,risk_flag')
  if (!users) return []

  return Promise.all(users.map(async u => {
    const { data: sub } = await supabase
      .from('champ_forms')
      .select('current_project, biggest_challenge, support_needed')
      .eq('user_id', u.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    return {
      Name: u.name,
      Department: u.department,
      Email: u.email,
      'AI Score': u.ai_score,
      'Tarot Card Type': u.tarot_card_type || '',
      Project: sub?.current_project || '',
      'Biggest Challenge': sub?.biggest_challenge || '',
      'Support Requested': sub?.support_needed || '',
      'Risk Flag': u.risk_flag,
    }
  }))
}

export default function Export() {
  const [loading, setLoading] = useState<'csv' | 'xlsx' | null>(null)

  async function downloadCSV() {
    setLoading('csv')
    const rows = await fetchRows()
    const { unparse } = await import('papaparse')
    const csv = unparse(rows)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'ai-champs-export.csv'; a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV downloaded')
    setLoading(null)
  }

  async function downloadXLSX() {
    setLoading('xlsx')
    const rows = await fetchRows()
    const XLSX = await import('xlsx')
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'AI Champs')
    XLSX.writeFile(wb, 'ai-champs-export.xlsx')
    toast.success('XLSX downloaded')
    setLoading(null)
  }

  return (
    <div className="space-y-6">
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-2">Export Data</h3>
        <p className="text-slate-400 text-sm mb-6">
          Download all AI Champs data including profiles, submissions, and risk flags.
        </p>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={downloadCSV}
            disabled={!!loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition disabled:opacity-50"
          >
            {loading === 'csv' ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '📄'}
            Download CSV
          </button>
          <button
            onClick={downloadXLSX}
            disabled={!!loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 transition disabled:opacity-50"
          >
            {loading === 'xlsx' ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '📊'}
            Download XLSX
          </button>
        </div>
      </GlassCard>

      <GlassCard>
        <h4 className="text-sm font-medium text-slate-400 mb-3">Fields included in export</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {['Name', 'Department', 'Email', 'AI Score', 'Tarot Card Type', 'Project', 'Biggest Challenge', 'Support Requested', 'Risk Flag'].map(f => (
            <div key={f} className="bg-white/5 rounded-lg px-3 py-2 text-slate-300 text-sm">{f}</div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

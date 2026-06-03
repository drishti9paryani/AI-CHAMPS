import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

interface RiskResult {
  flag_color: 'red' | 'amber' | 'green'
  reason: string
}

async function analyzeUser(user: {
  id: string
  name: string
  challenge: string
  support_needed: string
}): Promise<RiskResult> {
  const prompt = `You are an HR risk analyst for an AI upskilling program. Assess this employee's risk level based on their form responses.

Employee: ${user.name}
Biggest Challenge: ${user.challenge || 'Not provided'}
Support Needed: ${user.support_needed || 'Not provided'}

Return ONLY valid JSON (no markdown fences):
{
  "flag_color": "red" | "amber" | "green",
  "reason": "One concise sentence explaining the flag"
}

Guidelines:
- red: urgent distress, blocked, at risk of disengagement, critical unmet needs
- amber: struggling, confused, needs proactive support
- green: progressing well, manageable challenges`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 256,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return { flag_color: 'green', reason: 'Analysis inconclusive' }
  }

  const parsed = JSON.parse(jsonMatch[0]) as RiskResult
  const color = ['red', 'amber', 'green'].includes(parsed.flag_color) ? parsed.flag_color : 'green'
  return { flag_color: color, reason: parsed.reason || 'No reason provided' }
}

export async function POST() {
  try {
    const admin = getSupabaseAdmin()

    const { data: users } = await admin.from('users').select('id, name')
    if (!users?.length) {
      return NextResponse.json({ error: 'No users found' }, { status: 400 })
    }

    const usersWithSubs = await Promise.all(
      users.map(async u => {
        const { data: sub } = await admin
          .from('submissions')
          .select('challenge, support_needed')
          .eq('user_id', u.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        return {
          id: u.id,
          name: u.name,
          challenge: sub?.challenge ?? '',
          support_needed: sub?.support_needed ?? '',
        }
      })
    )

    const toAnalyze = usersWithSubs.filter(u => u.challenge || u.support_needed)
    let processed = 0

    for (const user of toAnalyze) {
      const result = await analyzeUser(user)

      await admin.from('risk_flags').delete().eq('user_id', user.id)
      await admin.from('risk_flags').insert({
        user_id: user.id,
        flag_color: result.flag_color,
        reason: result.reason,
        auto_generated: true,
      })
      await admin.from('users').update({ risk_flag: result.flag_color }).eq('id', user.id)
      processed++
    }

    return NextResponse.json({ processed, total: toAnalyze.length })
  } catch (err) {
    console.error('Risk analysis API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

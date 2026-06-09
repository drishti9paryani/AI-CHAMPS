import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

const DIGEST_EMAIL = 'drishtiparyani@wrd.co.in'
const ADMIN_URL    = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ai-champs.vercel.app'

type Urgency       = 'critical' | 'high' | 'medium' | 'low'
type ProblemStatus = 'open' | 'in_progress' | 'resolved'

interface ChampFlag {
  id: string
  biggest_challenge: string | null
  support_needed: string | null
  urgency: Urgency
  problem_status: ProblemStatus
  status_updated_at: string | null
  created_at: string
  users: { name: string; email: string; department: string } | null
}

const URGENCY_META: Record<Urgency, { emoji: string; label: string; color: string }> = {
  critical: { emoji: '🔴', label: 'Critical', color: '#ef4444' },
  high:     { emoji: '🟠', label: 'High',     color: '#f97316' },
  medium:   { emoji: '🟡', label: 'Medium',   color: '#eab308' },
  low:      { emoji: '🟢', label: 'Low',      color: '#22c55e' },
}

// Vercel cron requests carry a Bearer token matching CRON_SECRET
function isAuthorised(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return true                    // dev — no secret set
  const auth = req.headers.get('authorization') ?? ''
  return auth === `Bearer ${cronSecret}`
}

export async function GET(req: NextRequest) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db   = getSupabaseAdmin()
  const now  = new Date()
  const week = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Fetch open + in-progress flags
  const { data: openFlags } = await db
    .from('champ_forms')
    .select('id, biggest_challenge, support_needed, urgency, problem_status, status_updated_at, created_at, users(name, email, department)')
    .not('urgency', 'is', null)
    .in('problem_status', ['open', 'in_progress'])
    .order('created_at', { ascending: false })

  // Fetch resolved in the past 7 days
  const { data: resolvedFlags } = await db
    .from('champ_forms')
    .select('id, biggest_challenge, support_needed, urgency, problem_status, status_updated_at, created_at, users(name, email, department)')
    .not('urgency', 'is', null)
    .eq('problem_status', 'resolved')
    .gte('status_updated_at', week.toISOString())
    .order('status_updated_at', { ascending: false })

  // Deduplicate — keep most recent per user
  function dedup(rows: ChampFlag[]): ChampFlag[] {
    const seen = new Set<string>()
    return rows.filter(r => {
      const uid = (r.users as unknown as { name: string })?.name ?? r.id
      if (seen.has(uid)) return false
      seen.add(uid)
      return true
    })
  }

  const open     = dedup((openFlags     ?? []) as unknown as ChampFlag[])
  const resolved = dedup((resolvedFlags ?? []) as unknown as ChampFlag[])

  const dateStr  = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  // Group open flags by urgency
  const grouped: Record<Urgency, ChampFlag[]> = { critical: [], high: [], medium: [], low: [] }
  open.forEach(f => grouped[f.urgency].push(f))

  // ── Build HTML ──────────────────────────────────────────────────────────────
  function flagRow(f: ChampFlag, showStatus = true) {
    const u    = f.users
    const meta = URGENCY_META[f.urgency]
    const desc = f.biggest_challenge ?? f.support_needed ?? '—'
    const since = f.status_updated_at
      ? `Updated ${new Date(f.status_updated_at).toLocaleDateString('en-GB')}`
      : `Since ${new Date(f.created_at).toLocaleDateString('en-GB')}`
    const statusLabel = f.problem_status === 'in_progress' ? '⏳ In Progress' : ''
    return `
      <tr style="border-bottom:1px solid #1e1e2e">
        <td style="padding:12px 8px;color:#e2e8f0;font-weight:500">${u?.name ?? '—'}</td>
        <td style="padding:12px 8px;color:#94a3b8;font-size:13px">${u?.department ?? '—'}</td>
        <td style="padding:12px 8px;color:#cbd5e1;font-size:13px;max-width:280px">${desc}</td>
        ${showStatus ? `<td style="padding:12px 8px;font-size:12px;color:#64748b">${statusLabel}</td>` : ''}
        <td style="padding:12px 8px;font-size:12px;color:#475569">${since}</td>
      </tr>`
  }

  function urgencySection(u: Urgency) {
    const meta  = URGENCY_META[u]
    const flags = grouped[u]
    if (flags.length === 0) return ''
    return `
      <h3 style="margin:28px 0 10px;color:${meta.color};font-size:16px">${meta.emoji} ${meta.label} (${flags.length})</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#0f0f1a;border-radius:10px;overflow:hidden">
        <thead>
          <tr style="background:#1a1a2e">
            <th style="padding:10px 8px;text-align:left;color:#64748b;font-size:12px;font-weight:600">NAME</th>
            <th style="padding:10px 8px;text-align:left;color:#64748b;font-size:12px;font-weight:600">DEPT</th>
            <th style="padding:10px 8px;text-align:left;color:#64748b;font-size:12px;font-weight:600">ISSUE</th>
            <th style="padding:10px 8px;text-align:left;color:#64748b;font-size:12px;font-weight:600">STATUS</th>
            <th style="padding:10px 8px;text-align:left;color:#64748b;font-size:12px;font-weight:600">DATE</th>
          </tr>
        </thead>
        <tbody>${flags.map(f => flagRow(f)).join('')}</tbody>
      </table>`
  }

  const resolvedSection = resolved.length === 0 ? '' : `
    <h3 style="margin:28px 0 10px;color:#22c55e;font-size:16px">✅ Resolved This Week (${resolved.length})</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#0f0f1a;border-radius:10px;overflow:hidden">
      <thead>
        <tr style="background:#1a1a2e">
          <th style="padding:10px 8px;text-align:left;color:#64748b;font-size:12px;font-weight:600">NAME</th>
          <th style="padding:10px 8px;text-align:left;color:#64748b;font-size:12px;font-weight:600">DEPT</th>
          <th style="padding:10px 8px;text-align:left;color:#64748b;font-size:12px;font-weight:600">ISSUE</th>
          <th style="padding:10px 8px;text-align:left;color:#64748b;font-size:12px;font-weight:600">RESOLVED ON</th>
        </tr>
      </thead>
      <tbody>${resolved.map(f => flagRow(f, false)).join('')}</tbody>
    </table>`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#06060f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:700px;margin:0 auto;padding:32px 24px">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:32px;margin-bottom:8px">⚡</div>
      <h1 style="margin:0;font-size:24px;font-weight:700;background:linear-gradient(135deg,#a855f7,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent">
        AI Champs — Weekly Flag Digest
      </h1>
      <p style="color:#64748b;margin:8px 0 0;font-size:14px">Week of ${dateStr} · White Rivers Media</p>
    </div>

    <!-- Summary pills -->
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:28px">
      <div style="background:#1a0a0a;border:1px solid #7f1d1d;border-radius:10px;padding:12px 20px;flex:1;min-width:120px;text-align:center">
        <div style="font-size:22px;font-weight:700;color:#ef4444">${grouped.critical.length}</div>
        <div style="font-size:12px;color:#64748b;margin-top:2px">Critical</div>
      </div>
      <div style="background:#1a0d00;border:1px solid #7c2d12;border-radius:10px;padding:12px 20px;flex:1;min-width:120px;text-align:center">
        <div style="font-size:22px;font-weight:700;color:#f97316">${grouped.high.length}</div>
        <div style="font-size:12px;color:#64748b;margin-top:2px">High</div>
      </div>
      <div style="background:#0f0f00;border:1px solid #713f12;border-radius:10px;padding:12px 20px;flex:1;min-width:120px;text-align:center">
        <div style="font-size:22px;font-weight:700;color:#eab308">${grouped.medium.length}</div>
        <div style="font-size:12px;color:#64748b;margin-top:2px">Medium</div>
      </div>
      <div style="background:#001a04;border:1px solid #14532d;border-radius:10px;padding:12px 20px;flex:1;min-width:120px;text-align:center">
        <div style="font-size:22px;font-weight:700;color:#22c55e">${grouped.low.length}</div>
        <div style="font-size:12px;color:#64748b;margin-top:2px">Low</div>
      </div>
    </div>

    ${open.length === 0
      ? '<p style="color:#64748b;text-align:center;padding:24px">🎉 No open flags this week — all clear!</p>'
      : urgencySection('critical') + urgencySection('high') + urgencySection('medium') + urgencySection('low')
    }

    ${resolvedSection}

    <!-- CTA -->
    <div style="margin-top:36px;padding:20px;background:#0f0f1a;border:1px solid #1e1e2e;border-radius:14px;text-align:center">
      <p style="margin:0 0 14px;color:#94a3b8;font-size:14px">Update statuses or follow up directly in the admin dashboard</p>
      <a href="${ADMIN_URL}/admin"
         style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">
        Open Admin Dashboard →
      </a>
    </div>

    <p style="color:#334155;font-size:12px;text-align:center;margin-top:24px">
      AI Champs Programme · White Rivers Media · Auto-sent every Monday 9 AM IST
    </p>
  </div>
</body>
</html>`

  // ── Send or log ─────────────────────────────────────────────────────────────
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    // No key configured — log and return success (dev mode)
    console.log('[weekly-digest] RESEND_API_KEY not set. Would have sent digest:', {
      open: open.length,
      resolved: resolved.length,
    })
    return NextResponse.json({
      ok: true,
      message: 'Digest generated (email skipped — RESEND_API_KEY not configured)',
      open: open.length,
      resolved: resolved.length,
    })
  }

  const resend  = new Resend(resendKey)
  const subject = `AI Champs — Weekly Flag Digest · ${dateStr} (${open.length} open, ${resolved.length} resolved)`

  const { error } = await resend.emails.send({
    from:    'AI Champs <noreply@wrm.ai>',
    to:      [DIGEST_EMAIL],
    subject,
    html,
  })

  if (error) {
    console.error('[weekly-digest] Resend error:', error)
    return NextResponse.json({ ok: false, error }, { status: 500 })
  }

  return NextResponse.json({ ok: true, sent_to: DIGEST_EMAIL, open: open.length, resolved: resolved.length })
}

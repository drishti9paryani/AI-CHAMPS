import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  // Wipe all onboarding data so the user can start fresh
  const { error } = await supabase
    .from('users')
    .update({
      tarot_card_type: null,
      tarot_card_data: null,
      onboarding_complete: false,
      chosen_roadmap_path: null,
      roadmap_mode: null,
    })
    .eq('id', user.id)

  // Also delete their champ_form answers
  await supabase.from('champ_forms').delete().eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

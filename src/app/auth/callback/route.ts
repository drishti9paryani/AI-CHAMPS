import { NextResponse } from 'next/server'

import { getPostLoginRedirect } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirectTo')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const path =
          redirectTo && redirectTo.startsWith('/')
            ? redirectTo
            : await getPostLoginRedirect(supabase, user.id)

        return NextResponse.redirect(`${origin}${path}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}

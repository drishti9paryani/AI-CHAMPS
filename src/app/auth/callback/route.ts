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
        // Only WRM accounts are allowed
        const allowedDomains = ['@whiteriversmedia.com', '@wrd.co.in']
        if (!allowedDomains.some(domain => user.email?.endsWith(domain))) {
          await supabase.auth.signOut()
          return NextResponse.redirect(`${origin}/login?error=unauthorized_domain`)
        }

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

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    async function redirect() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('onboarding_complete, role')
        .eq('id', user.id)
        .maybeSingle()

      if (!profile?.onboarding_complete) {
        router.replace('/onboarding/register')
      } else if (profile.role === 'admin') {
        router.replace('/admin')
      } else {
        router.replace('/dashboard')
      }
    }

    redirect()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#0d0d1a' }}>
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

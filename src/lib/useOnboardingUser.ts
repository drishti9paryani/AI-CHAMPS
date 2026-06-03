'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface OnboardingUserState {
  userId: string | null
  email: string | null
  loading: boolean
  isAuthenticated: boolean
}

export function useOnboardingUser(): OnboardingUserState {
  const [state, setState] = useState<OnboardingUserState>({
    userId: null,
    email: null,
    loading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user ?? null

      setState({
        userId: user?.id ?? null,
        email: user?.email ?? null,
        loading: false,
        isAuthenticated: !!user,
      })
    }

    init()

    // Also listen for auth state changes (catches post-OAuth redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      setState({
        userId: user?.id ?? null,
        email: user?.email ?? null,
        loading: false,
        isAuthenticated: !!user,
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  return state
}

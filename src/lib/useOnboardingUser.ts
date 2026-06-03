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
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user?.email) {
        setState({ userId: null, email: null, loading: false, isAuthenticated: false })
        return
      }

      setState({
        userId: user.id,
        email: user.email,
        loading: false,
        isAuthenticated: true,
      })
    }

    init()
  }, [])

  return state
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import UserDashboard from '@/components/dashboard/UserDashboard'
import DashboardSkeleton from '@/components/ui/skeletons/DashboardSkeleton'

export default function DashboardPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('onboarding_complete')
        .eq('id', user.id)
        .maybeSingle()

      if (!profile?.onboarding_complete) {
        router.replace('/onboarding/register')
        return
      }

      setUserId(user.id)
      setChecking(false)
    }

    check()
  }, [router])

  if (checking || !userId) return <DashboardSkeleton />

  return <UserDashboard userId={userId} />
}

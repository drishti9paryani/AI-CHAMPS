'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/lib/toast'
import type { TarotCardData } from '@/lib/tarotConstants'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ProfileCard from '@/components/dashboard/ProfileCard'
import ArchetypeDrawer from '@/components/dashboard/ArchetypeDrawer'
import MySubmissions from '@/components/dashboard/MySubmissions'
import RoadmapProgress from '@/components/dashboard/RoadmapProgress'
import LearningResources from '@/components/dashboard/LearningResources'
import BookingSection from '@/components/dashboard/BookingSection'
import DashboardSkeleton from '@/components/ui/skeletons/DashboardSkeleton'
import StreakCard from '@/components/dashboard/StreakCard'
import WeeklyChallenge from '@/components/dashboard/WeeklyChallenge'
import WinFeed from '@/components/dashboard/WinFeed'
import ImpactCounter from '@/components/dashboard/ImpactCounter'

interface UserData {
  name: string
  department: string
  email: string
  ai_score: number
  current_week: number
  tarot_card_type: string | null
  tarot_card_data: TarotCardData | null
  roadmap_mode: string | null
  chosen_roadmap_path: string[] | null
  role: string
}

interface Submission {
  current_project: string
  biggest_challenge: string
  support_needed: string
}

export default function UserDashboard({ userId }: { userId: string }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [{ data: u, error: userErr }, { data: s }] = await Promise.all([
          supabase
            .from('users')
            .select('name, department, email, ai_score, current_week, tarot_card_type, tarot_card_data, roadmap_mode, chosen_roadmap_path, role')
            .eq('id', userId)
            .single(),
          supabase
            .from('champ_forms')
            .select('current_project, biggest_challenge, support_needed')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
        ])
        if (userErr) {
          toast.error('Could not load your profile. Please refresh.')
          return
        }
        if (u) setUser(u)
        if (s) setSubmission(s)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  if (loading) return <DashboardSkeleton />

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 page-bg">
        <p className="text-slate-400 text-sm text-center">Unable to load dashboard. Please try signing in again.</p>
      </div>
    )
  }

  return (
    <>
      <ArchetypeDrawer card={user.tarot_card_data} cardType={user.tarot_card_type} />
      <DashboardLayout userName={user.name} isAdmin={user.role === 'admin'}>
      <ProfileCard
        name={user.name}
        department={user.department}
        email={user.email}
        aiScore={user.ai_score}
      />

      {/* 3D action row: streak + impact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StreakCard userId={userId} />
        <ImpactCounter userId={userId} team={user.department} />
      </div>

      {/* Team's weekly challenge */}
      <WeeklyChallenge userId={userId} team={user.department} />

      <MySubmissions submission={submission} userId={userId} />
      <RoadmapProgress
        currentWeek={user.current_week ?? 1}
        roadmapMode={user.roadmap_mode}
        chosenPath={user.chosen_roadmap_path}
      />

      {/* AI Win Feed — social proof + habit loop */}
      <WinFeed userId={userId} />

      <BookingSection />
      <LearningResources />
    </DashboardLayout>
    </>
  )
}

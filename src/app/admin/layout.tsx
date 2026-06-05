import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Admin',
  description: 'AI Champs admin analytics, user management, insights, and roadmap editor.',
}

const ADMIN_EMAILS = [
  's@wrd.co.in',
  'mitchelle@wrd.co.in',
  'siddhantsethi@wrd.co.in',
  'yashvigotecha@wrd.co.in',
  'drishtiparyani@wrd.co.in',
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    redirect('/dashboard')
  }

  return <>{children}</>
}

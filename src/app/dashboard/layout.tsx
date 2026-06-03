import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your AI Champs profile, tarot card, submissions, and program roadmap.',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}

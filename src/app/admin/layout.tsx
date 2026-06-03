import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin',
  description: 'AI Champs admin analytics, user management, insights, and roadmap editor.',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}

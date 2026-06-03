import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ToasterProvider from '@/components/ui/ToasterProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'AI Champs',
    template: '%s · AI Champs',
  },
  description: 'White Rivers Media AI Champions Program — identify and nurture AI-forward employees.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.className} h-full`}>
      <body className="min-h-full antialiased">
        {children}
        <ToasterProvider />
      </body>
    </html>
  )
}

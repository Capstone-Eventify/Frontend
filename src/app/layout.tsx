import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { AuthProvider } from '@/contexts/AuthContext'
import AuthModalWrapper from '@/components/auth/AuthModalWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Eventify - Professional Event Management Made Simple',
  description: 'Create, manage, and sell tickets for events of any size. From intimate gatherings to large conferences, Eventify provides all the tools you need.',
  keywords: ['event management', 'ticketing', 'event planning', 'ticket sales', 'event platform'],
  authors: [{ name: 'Eventify Team' }],
  openGraph: {
    title: 'Eventify - Professional Event Management Made Simple',
    description: 'Create, manage, and sell tickets for events of any size. From intimate gatherings to large conferences, Eventify provides all the tools you need.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eventify - Professional Event Management Made Simple',
    description: 'Create, manage, and sell tickets for events of any size. From intimate gatherings to large conferences, Eventify provides all the tools you need.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <AuthModalWrapper />
        </AuthProvider>
      </body>
    </html>
  )
}

'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

const ConditionalLayout: React.FC<ConditionalLayoutProps> = ({ children }) => {
  const pathname = usePathname()
  
  // Pages that should NOT have navigation (onboarding, dashboard, admin, etc.)
  const noNavigationPages = [
    '/onboarding',
    '/dashboard',
    '/admin'
  ]
  
  const shouldShowNavigation = !noNavigationPages.includes(pathname)

  return (
    <>
      {shouldShowNavigation && <Header />}
      <main className="min-h-screen">
        {children}
      </main>
      {shouldShowNavigation && <Footer />}
    </>
  )
}

export default ConditionalLayout

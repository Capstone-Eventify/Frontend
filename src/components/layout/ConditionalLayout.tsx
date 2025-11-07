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
  
  // Only show navigation on home page
  const shouldShowNavigation = pathname === '/'

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

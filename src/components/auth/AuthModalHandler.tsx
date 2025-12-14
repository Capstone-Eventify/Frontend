'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

const AuthModalHandler = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { openAuthModal } = useAuth()

  useEffect(() => {
    const signin = searchParams.get('signin')
    const signup = searchParams.get('signup')
    
    if (signin === 'true') {
      // Open sign-in modal
      openAuthModal('signin')
      
      // Clean up the URL by removing the query parameter
      const url = new URL(window.location.href)
      url.searchParams.delete('signin')
      router.replace(url.pathname + url.search, { scroll: false })
    } else if (signup === 'true') {
      // Open sign-up modal
      openAuthModal('signup')
      
      // Clean up the URL by removing the query parameter
      const url = new URL(window.location.href)
      url.searchParams.delete('signup')
      router.replace(url.pathname + url.search, { scroll: false })
    }
  }, [searchParams, openAuthModal, router])

  return null // This component doesn't render anything
}

export default AuthModalHandler
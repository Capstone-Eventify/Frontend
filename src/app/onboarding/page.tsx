'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingFlow from '@/components/auth/OnboardingFlow'
import { useUser } from '@/contexts/UserContext'
import { useAuth } from '@/contexts/AuthContext'

export default function OnboardingPage() {
  const router = useRouter()
  const { isAuthenticated, user, updateUser, isLoaded } = useUser()
  const { openAuthModal } = useAuth()

  useEffect(() => {
    // Wait for user context to load before checking authentication
    if (!isLoaded) {
      return // Still loading, don't redirect yet
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.replace('/')
      setTimeout(() => {
        openAuthModal('signin', '/onboarding')
      }, 100)
      return
    }

    // If user has already completed onboarding, redirect to dashboard
    if (user?.hasCompletedOnboarding) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, user, router, openAuthModal, isLoaded])

  const handleComplete = async (onboardingData?: { avatar?: string; phone?: string; street?: string; city?: string; state?: string; zipCode?: string; country?: string }) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      if (!token) {
        router.replace('/')
        return
      }

      // Always try to update profile with onboarding data if provided
      // This ensures avatar is saved even if user skips other fields
      if (onboardingData && (onboardingData.avatar || onboardingData.phone || onboardingData.street || onboardingData.city || onboardingData.state || onboardingData.zipCode || onboardingData.country)) {
        try {
          const profilePayload: any = {}
          
          // Only include fields that have values
          if (onboardingData.avatar) {
            profilePayload.avatar = onboardingData.avatar
            console.log('Including avatar in profile update, length:', onboardingData.avatar.length)
          }
          if (onboardingData.phone) profilePayload.phone = onboardingData.phone
          if (onboardingData.street) profilePayload.street = onboardingData.street
          if (onboardingData.city) profilePayload.city = onboardingData.city
          if (onboardingData.state) profilePayload.state = onboardingData.state
          if (onboardingData.zipCode) profilePayload.zipCode = onboardingData.zipCode
          if (onboardingData.country) profilePayload.country = onboardingData.country
          
          console.log('Updating profile with onboarding data...', {
            hasAvatar: !!profilePayload.avatar,
            avatarLength: profilePayload.avatar?.length || 0,
            fields: Object.keys(profilePayload)
          })
          
          const profileResponse = await fetch(`${apiUrl}/api/users/profile`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(profilePayload)
          })

          if (profileResponse.ok) {
            const profileResult = await profileResponse.json()
            console.log('Profile updated successfully:', {
              success: profileResult.success,
              hasAvatar: !!profileResult.data?.avatar,
              avatarUrl: profileResult.data?.avatar
            })
            
            // Update user context with all profile data including avatar
            if (profileResult.data) {
              updateUser({ 
                avatar: profileResult.data.avatar || onboardingData.avatar || undefined,
                name: `${profileResult.data.firstName} ${profileResult.data.lastName}`,
                email: profileResult.data.email
              })
              console.log('User context updated with avatar:', profileResult.data.avatar)
            }
          } else {
            const errorText = await profileResponse.text()
            console.error('Failed to update profile:', {
              status: profileResponse.status,
              statusText: profileResponse.statusText,
              error: errorText
            })
          }
        } catch (error) {
          console.error('Error updating profile:', error)
          // Continue even if profile update fails
        }
      } else {
        console.log('No onboarding data to save')
      }

      // Mark onboarding as complete
      const response = await fetch(`${apiUrl}/api/users/onboarding/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        // Update user context
        updateUser({ hasCompletedOnboarding: true })
        
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        console.error('Failed to complete onboarding')
        // Still redirect to dashboard even if API call fails
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      // Still redirect to dashboard even if API call fails
      router.push('/dashboard')
    }
  }

  const handleSkip = async () => {
    // Same as complete - mark as done and redirect
    await handleComplete()
  }

  // Show loading state while user context is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.hasCompletedOnboarding) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100/30 flex items-center justify-center p-4">
      <OnboardingFlow onComplete={handleComplete} onSkip={handleSkip} />
    </div>
  )
}


'use client'

import React from 'react'
import OnboardingFlow from '@/components/auth/OnboardingFlow'

export default function OnboardingPage() {
  const handleOnboardingComplete = () => {
    console.log('Onboarding completed')
    // Redirect to dashboard or home page
    window.location.href = '/'
  }

  const handleSkipOnboarding = () => {
    console.log('Onboarding skipped')
    // Redirect to dashboard or home page
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <OnboardingFlow 
        onComplete={handleOnboardingComplete}
        onSkip={handleSkipOnboarding}
      />
    </div>
  )
}

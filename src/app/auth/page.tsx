'use client'

import React from 'react'
import AuthForm from '@/components/auth/AuthForm'

export default function AuthPage() {
  const handleAuth = (mode: 'signin' | 'signup', userType: 'attendee' | 'organizer', data: any) => {
    console.log('Auth data:', { mode, userType, data })
    // Here you would typically handle the authentication logic
    alert(`${mode === 'signin' ? 'Sign In' : 'Sign Up'} as ${userType} with email: ${data.email}`)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <AuthForm onAuth={handleAuth} />
    </div>
  )
}

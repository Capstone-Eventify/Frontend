'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import AuthForm from './AuthForm'
import { useUser } from '@/contexts/UserContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'signin' | 'signup'
  redirectUrl?: string | null
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'signin',
  redirectUrl = null
}) => {
  const router = useRouter()
  const { login } = useUser()

  const handleAuth = async (mode: 'signin' | 'signup', data: any) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const endpoint = mode === 'signup' ? '/api/auth/register' : '/api/auth/login'
      
      // Call real API for authentication
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mode === 'signup' ? {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          role: 'ATTENDEE'
        } : {
          email: data.email,
          password: data.password
        })
      })

      const result = await response.json()

      if (result.success && result.data) {
        // Store token
        if (result.data.token) {
          localStorage.setItem('token', result.data.token)
        }

        // Format user data to match frontend User interface
        const userData = {
          id: result.data.user.id,
          name: result.data.user.name || `${result.data.user.firstName} ${result.data.user.lastName}`,
          email: result.data.user.email,
          role: result.data.user.role?.toLowerCase() || 'attendee',
          isAdmin: result.data.user.role === 'admin',
          joinDate: result.data.user.joinDate || result.data.user.createdAt || new Date().toISOString(),
          hasCompletedOnboarding: result.data.user.hasCompletedOnboarding || false
        }

        // Set user in context (this will also save to localStorage)
        login(userData)
        
        onClose()
        
        // For new signups, redirect to onboarding if not completed
        // For sign-ins, go directly to dashboard or redirectUrl
        if (mode === 'signup' && result.data.isNewUser && !result.data.user.hasCompletedOnboarding) {
          router.push('/onboarding')
        } else if (redirectUrl) {
          router.push(redirectUrl)
        } else {
          router.push('/dashboard')
        }
      } else {
        // Show error message
        alert(result.message || 'Authentication failed. Please try again.')
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      alert('Authentication failed. Please check your connection and try again.')
    }

    // COMMENTED OUT: Mock/demo user flow for testing
    // const userData = {
    //   id: `user_${Date.now()}`,
    //   name: mode === 'signup' 
    //     ? `${data.firstName} ${data.lastName}` 
    //     : data.email.split('@')[0],
    //   email: data.email,
    //   role: 'attendee' as const,
    //   isAdmin: false,
    //   joinDate: new Date().toISOString(),
    // }
    // login(userData)
    // onClose()
    // if (redirectUrl) {
    //   router.push(redirectUrl)
    // } else {
    //   router.push('/dashboard')
    // }
  }


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary-900/30 via-primary-800/40 to-primary-700/50 backdrop-blur-lg"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ 
              duration: 0.4, 
              ease: "easeOut",
              type: "spring",
              bounce: 0.1
            }}
            className="relative w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Auth Form */}
            <AuthForm 
              onAuth={handleAuth}
              initialMode={initialMode}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AuthModal

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

  const handleAuth = (mode: 'signin' | 'signup', data: any) => {
    // Create demo user data from form data
    const userData = {
      id: `user_${Date.now()}`,
      name: mode === 'signup' 
        ? `${data.firstName} ${data.lastName}` 
        : data.email.split('@')[0], // Use email prefix as name for login
      email: data.email,
      role: 'attendee' as const,
      isAdmin: false,
      joinDate: new Date().toISOString(),
    }

    // Set user in context (this will also save to localStorage)
    login(userData)
    
    onClose()
    
    // Redirect to the specified URL or dashboard
    if (redirectUrl) {
      router.push(redirectUrl)
    } else {
      router.push('/dashboard')
    }
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

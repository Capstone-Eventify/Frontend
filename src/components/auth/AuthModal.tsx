'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AuthForm from './AuthForm'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'signin' | 'signup'
  initialUserType?: 'attendee' | 'organizer'
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'signin',
  initialUserType = 'attendee'
}) => {
  const handleAuth = (mode: 'signin' | 'signup', userType: 'attendee' | 'organizer', data: any) => {
    console.log('Auth data:', { mode, userType, data })
    // Here you would typically handle the authentication logic
    alert(`${mode === 'signin' ? 'Sign In' : 'Sign Up'} as ${userType} with email: ${data.email}`)
    // Close modal after successful auth
    onClose()
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
              initialUserType={initialUserType}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AuthModal

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import ForgotPasswordForm from './ForgotPasswordForm'

type AuthMode = 'signin' | 'signup' | 'forgot-password'

interface AuthFormProps {
  onAuth?: (mode: 'signin' | 'signup', data: any) => void
  className?: string
  initialMode?: 'signin' | 'signup'
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuth, className, initialMode = 'signin' }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode)

  const handleLogin = (data: any) => {
    onAuth?.('signin', data)
  }

  const handleSignup = (data: any) => {
    onAuth?.('signup', data)
  }

  const switchToSignup = () => {
    setMode('signup')
  }

  const switchToLogin = () => {
    setMode('signin')
  }

  const switchToForgotPassword = () => {
    setMode('forgot-password')
  }

  const handleForgotPassword = async (email: string) => {
    try {
      // API call commented out for now
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/forgotpassword`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ email }),
      // })
      // const data = await response.json()
      // if (!response.ok) {
      //   console.error('Password reset error:', data.message)
      // }
      console.log('Password reset requested for:', email)
    } catch (error) {
      console.error('Password reset request failed:', error)
    }
  }


  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {mode === 'signin' ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            <LoginForm 
              onLogin={handleLogin}
              onSwitchToSignup={switchToSignup}
              onForgotPassword={switchToForgotPassword}
            />
          </motion.div>
        ) : mode === 'signup' ? (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            <SignupForm 
              onSignup={handleSignup}
              onSwitchToLogin={switchToLogin}
            />
          </motion.div>
        ) : (
          <motion.div
            key="forgot-password"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            <ForgotPasswordForm 
              onBackToLogin={switchToLogin}
              onResetPassword={handleForgotPassword}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AuthForm

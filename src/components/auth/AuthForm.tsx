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

  const handleForgotPassword = (email: string) => {
    console.log('Password reset requested for:', email)
    // Here you would typically make an API call to your backend
    // to send the password reset email
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

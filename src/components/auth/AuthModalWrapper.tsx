'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AuthModal from './AuthModal'

const AuthModalWrapper: React.FC = () => {
  const { isAuthModalOpen, authMode, redirectUrl, closeAuthModal } = useAuth()

  return (
    <AuthModal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      initialMode={authMode}
      redirectUrl={redirectUrl}
    />
  )
}

export default AuthModalWrapper

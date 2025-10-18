'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AuthModal from './AuthModal'

const AuthModalWrapper: React.FC = () => {
  const { isAuthModalOpen, authMode, userType, closeAuthModal } = useAuth()

  return (
    <AuthModal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      initialMode={authMode}
      initialUserType={userType}
    />
  )
}

export default AuthModalWrapper

'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

type AuthMode = 'signin' | 'signup'

interface AuthContextType {
  isAuthModalOpen: boolean
  authMode: AuthMode
  openAuthModal: (mode: AuthMode) => void
  closeAuthModal: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('signin')

  const openAuthModal = (mode: AuthMode) => {
    setAuthMode(mode)
    setIsAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
  }

  const value = {
    isAuthModalOpen,
    authMode,
    openAuthModal,
    closeAuthModal
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

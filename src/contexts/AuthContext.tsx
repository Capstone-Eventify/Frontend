'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

type AuthMode = 'signin' | 'signup'

interface AuthContextType {
  isAuthModalOpen: boolean
  authMode: AuthMode
  redirectUrl: string | null
  openAuthModal: (mode: AuthMode, redirectUrl?: string) => void
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
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)

  const openAuthModal = (mode: AuthMode, redirectUrl?: string) => {
    setAuthMode(mode)
    setRedirectUrl(redirectUrl || null)
    setIsAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
    setRedirectUrl(null)
  }

  const value = {
    isAuthModalOpen,
    authMode,
    redirectUrl,
    openAuthModal,
    closeAuthModal
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

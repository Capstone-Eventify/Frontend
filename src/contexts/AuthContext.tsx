'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

type AuthMode = 'signin' | 'signup'
type UserType = 'attendee' | 'organizer'

interface AuthContextType {
  isAuthModalOpen: boolean
  authMode: AuthMode
  userType: UserType
  openAuthModal: (mode: AuthMode, userType?: UserType) => void
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
  const [userType, setUserType] = useState<UserType>('attendee')

  const openAuthModal = (mode: AuthMode, userType: UserType = 'attendee') => {
    setAuthMode(mode)
    setUserType(userType)
    setIsAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
  }

  const value = {
    isAuthModalOpen,
    authMode,
    userType,
    openAuthModal,
    closeAuthModal
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

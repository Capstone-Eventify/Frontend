'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export type UserRole = 'attendee' | 'organizer' | 'admin'
export type OrganizerStatus = 'pending' | 'approved' | 'rejected'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  organizerStatus?: OrganizerStatus
  isAdmin: boolean
  avatar?: string
  joinDate: string
}

interface UserContextType {
  user: User | null
  isAuthenticated: boolean
  isOrganizer: boolean
  isAdmin: boolean
  canCreateEvents: boolean
  canManageEvents: boolean
  canAccessAdmin: boolean
  login: (userData: User) => void
  logout: () => void
  updateUserRole: (role: UserRole, organizerStatus?: OrganizerStatus) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  const isAuthenticated = !!user
  const isOrganizer = user?.role === 'organizer' && user?.organizerStatus === 'approved'
  const isAdmin = user?.isAdmin === true
  const canCreateEvents = isOrganizer || isAdmin
  const canManageEvents = isOrganizer || isAdmin
  const canAccessAdmin = isAdmin

  const login = (userData: User) => {
    setUser(userData)
  }

  const logout = () => {
    setUser(null)
  }

  const updateUserRole = (role: UserRole, organizerStatus?: OrganizerStatus) => {
    if (user) {
      setUser({
        ...user,
        role,
        organizerStatus
      })
    }
  }

  const value = {
    user,
    isAuthenticated,
    isOrganizer,
    isAdmin,
    canCreateEvents,
    canManageEvents,
    canAccessAdmin,
    login,
    logout,
    updateUserRole
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

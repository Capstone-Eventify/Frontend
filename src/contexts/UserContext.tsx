'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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
  updateUser: (updates: Partial<User>) => void
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

const STORAGE_KEY = 'eventify_user'

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load user from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem(STORAGE_KEY)
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          // Check if user has been approved as organizer
          const approvedUsers = JSON.parse(localStorage.getItem('eventify_approved_organizers') || '{}')
          if (approvedUsers[parsedUser.id]) {
            parsedUser.role = 'organizer'
            parsedUser.organizerStatus = 'approved'
          }
          setUser(parsedUser)
        } catch (error) {
          console.error('Error parsing stored user data:', error)
          localStorage.removeItem(STORAGE_KEY)
        }
      }
      setIsLoaded(true)
    }
  }, [])

  const isAuthenticated = !!user
  const isOrganizer = user?.role === 'organizer' && user?.organizerStatus === 'approved'
  const isAdmin = user?.isAdmin === true
  const canCreateEvents = isOrganizer || isAdmin
  const canManageEvents = isOrganizer || isAdmin
  const canAccessAdmin = isAdmin

  const login = (userData: User) => {
    setUser(userData)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    }
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const updateUserRole = (role: UserRole, organizerStatus?: OrganizerStatus) => {
    if (user) {
      const updatedUser = {
        ...user,
        role,
        organizerStatus
      }
      setUser(updatedUser)
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser))
      }
    }
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = {
        ...user,
        ...updates
      }
      setUser(updatedUser)
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser))
      }
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
    updateUserRole,
    updateUser
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

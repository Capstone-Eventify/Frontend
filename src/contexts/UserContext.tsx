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
  hasCompletedOnboarding?: boolean
}

interface UserContextType {
  user: User | null
  isAuthenticated: boolean
  isOrganizer: boolean
  isAdmin: boolean
  canCreateEvents: boolean
  canManageEvents: boolean
  canAccessAdmin: boolean
  isLoaded: boolean
  login: (userData: User) => void
  logout: () => void
  updateUserRole: (role: UserRole, organizerStatus?: OrganizerStatus) => void
  updateUser: (updates: Partial<User>) => void
  refreshUser: () => Promise<void>
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

  const refreshUser = async () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
          const response = await fetch(`${apiUrl}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (response.ok) {
            const userData = await response.json()
            if (userData.success && userData.data) {
              const updatedUser: User = {
                id: userData.data.id,
                name: userData.data.name || `${userData.data.firstName} ${userData.data.lastName}`,
                email: userData.data.email,
                role: userData.data.role?.toLowerCase() || 'attendee',
                organizerStatus: userData.data.organizerStatus?.toLowerCase(),
                isAdmin: userData.data.role === 'ADMIN',
                avatar: userData.data.avatar,
                joinDate: userData.data.createdAt || userData.data.joinDate || new Date().toISOString(),
                hasCompletedOnboarding: userData.data.hasCompletedOnboarding || false
              }
              setUser(updatedUser)
            }
          }
        } catch (error) {
          console.error('Error refreshing user:', error)
        }
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
    isLoaded,
    login,
    logout,
    updateUserRole,
    updateUser,
    refreshUser
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

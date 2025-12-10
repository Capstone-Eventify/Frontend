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

  // Refresh user from API
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
              const role = userData.data.role?.toLowerCase() || 'attendee'
              const updatedUser: User = {
                id: userData.data.id,
                name: userData.data.name || `${userData.data.firstName} ${userData.data.lastName}`,
                email: userData.data.email,
                role: role as UserRole,
                organizerStatus: userData.data.organizerStatus?.toLowerCase() as OrganizerStatus | undefined,
                isAdmin: userData.data.role === 'ADMIN' || role === 'admin',
                avatar: userData.data.avatar,
                joinDate: userData.data.createdAt || userData.data.joinDate || new Date().toISOString(),
                hasCompletedOnboarding: userData.data.hasCompletedOnboarding || false
              }
              setUser(updatedUser)
              // Save updated user to localStorage
              localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser))
            }
          }
        } catch (error) {
          console.error('Error refreshing user:', error)
        }
      }
    }
  }

  // Load user from localStorage on mount and refresh from API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem(STORAGE_KEY)
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
        } catch (error) {
          console.error('Error parsing stored user data:', error)
          localStorage.removeItem(STORAGE_KEY)
        }
      }
      setIsLoaded(true)
      
      // Refresh user data from API to get latest role
      const token = localStorage.getItem('token')
      if (token) {
        refreshUser().catch(err => console.error('Error refreshing user on mount:', err))
      }
    }
  }, [])

  const isAuthenticated = !!user
  // Backend sets role to 'organizer' (lowercase) when application is approved
  const isOrganizer = user?.role === 'organizer'
  const isAdmin = user?.isAdmin === true || user?.role === 'admin'
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

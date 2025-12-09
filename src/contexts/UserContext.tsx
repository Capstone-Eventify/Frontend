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
  isLoaded: boolean
  isOrganizer: boolean
  isAdmin: boolean
  canCreateEvents: boolean
  canManageEvents: boolean
  canAccessAdmin: boolean
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

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load user from API on mount
  useEffect(() => {
    const loadUser = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token')
        
        if (token) {
          try {
            // Always fetch user from backend API
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
            const response = await fetch(`${apiUrl}/api/auth/me`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })
            
            if (response.ok) {
              const userData = await response.json()
              if (userData.success) {
                const backendRole = userData.data.role?.toLowerCase() || 'attendee'
                const updatedUser: User = {
                  id: userData.data.id,
                  name: userData.data.name || `${userData.data.firstName} ${userData.data.lastName}`,
                  email: userData.data.email,
                  role: backendRole as UserRole,
                  avatar: userData.data.avatar,
                  hasCompletedOnboarding: userData.data.hasCompletedOnboarding !== undefined 
                    ? userData.data.hasCompletedOnboarding 
                    : false,
                  joinDate: userData.data.createdAt || new Date().toISOString(),
                  isAdmin: backendRole === 'admin',
                  organizerStatus: backendRole === 'organizer' ? 'approved' : undefined
                }
                
                setUser(updatedUser)
              } else {
                // Token invalid, clear token
                localStorage.removeItem('token')
                setUser(null)
              }
            } else {
              // Token invalid or expired, clear token
              localStorage.removeItem('token')
              setUser(null)
            }
          } catch (error) {
            // Network error - user not authenticated
            console.warn('Could not fetch user from backend:', error)
            setUser(null)
          }
        }
        setIsLoaded(true)
      }
    }
    
    loadUser()
  }, [])

  const isAuthenticated = !!user
  // User is organizer ONLY if backend role is 'organizer'
  // Backend is the source of truth - don't rely on localStorage organizerStatus
  const isOrganizer = user?.role === 'organizer'
  const isAdmin = user?.isAdmin === true || user?.role === 'admin'
  const canCreateEvents = isOrganizer || isAdmin
  const canManageEvents = isOrganizer || isAdmin
  const canAccessAdmin = isAdmin

  const login = (userData: User) => {
    setUser(userData)
    // User data is now always fetched from API, no localStorage needed
  }

  const logout = () => {
    setUser(null)
    // Token is removed by AuthContext
  }

  const updateUserRole = (role: UserRole, organizerStatus?: OrganizerStatus) => {
    if (user) {
      const updatedUser = {
        ...user,
        role,
        organizerStatus
      }
      setUser(updatedUser)
      // User data is now always fetched from API, no localStorage needed
    }
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = {
        ...user,
        ...updates
      }
      setUser(updatedUser)
      // User data is now always fetched from API, no localStorage needed
    }
  }

  const refreshUser = async () => {
    if (typeof window === 'undefined') return
    
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        if (userData.success) {
          const backendRole = userData.data.role?.toLowerCase() || 'attendee'
          const updatedUser: User = {
            id: userData.data.id,
            name: userData.data.name || `${userData.data.firstName} ${userData.data.lastName}`,
            email: userData.data.email,
            role: backendRole as UserRole,
            avatar: userData.data.avatar,
            hasCompletedOnboarding: userData.data.hasCompletedOnboarding !== undefined 
              ? userData.data.hasCompletedOnboarding 
              : false,
            joinDate: userData.data.createdAt || new Date().toISOString(),
            isAdmin: backendRole === 'admin',
            organizerStatus: backendRole === 'organizer' ? 'approved' : undefined
          }
          
          setUser(updatedUser)
        }
      } else {
        // Token invalid, clear token
        localStorage.removeItem('token')
        setUser(null)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }

      const value = {
        user,
        isAuthenticated,
        isLoaded,
        isOrganizer,
        isAdmin,
        canCreateEvents,
        canManageEvents,
        canAccessAdmin,
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

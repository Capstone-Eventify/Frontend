'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useUser } from './UserContext'

interface Notification {
  id?: string
  type: string
  title: string
  message: string
  link?: string
  metadata?: any
  timestamp?: string
}

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  notifications: Notification[]
  sendNotification: (notification: Notification) => void
  clearNotifications: () => void
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  notifications: [],
  sendNotification: () => {},
  clearNotifications: () => {}
})

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

interface SocketProviderProps {
  children: React.ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useUser()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!isAuthenticated) {
      // Disconnect if user is not authenticated
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
        setNotifications([])
      }
      return
    }

    // Get token from localStorage
    const token = localStorage.getItem('token')
    if (!token) return

    // Don't create a new connection if one already exists and is connected
    if (socket && socket.connected) {
      return
    }

    // Create socket connection
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
    const newSocket = io(apiUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Connected to notification server')
      setIsConnected(true)
      
      // Clear any existing reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    })

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from notification server:', reason)
      setIsConnected(false)
      
      // Auto-reconnect after a delay if not a manual disconnect
      if (reason !== 'io client disconnect') {
        reconnectTimeoutRef.current = setTimeout(() => {
          if (newSocket && !newSocket.connected) {
            console.log('🔄 Attempting to reconnect...')
            newSocket.connect()
          }
        }, 3000)
      }
    })

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message)
      setIsConnected(false)
    })

    // Notification handler
    newSocket.on('notification', (notification: Notification) => {
      console.log('📢 New notification received:', notification)
      
      // Add timestamp if not present
      const notificationWithTimestamp = {
        ...notification,
        id: notification.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: notification.timestamp || new Date().toISOString()
      }
      
      setNotifications(prev => [notificationWithTimestamp, ...prev.slice(0, 49)]) // Keep last 50
      
      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            tag: notificationWithTimestamp.id
          })
        } catch (error) {
          console.error('Error showing browser notification:', error)
        }
      }
    })

    setSocket(newSocket)

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      newSocket.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }, [isAuthenticated]) // Removed user dependency to prevent frequent reconnections

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission)
      })
    }
  }, [])

  const sendNotification = (notification: Notification) => {
    if (socket && isConnected) {
      socket.emit('notification', notification)
    }
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const value: SocketContextType = {
    socket,
    isConnected,
    notifications,
    sendNotification,
    clearNotifications
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
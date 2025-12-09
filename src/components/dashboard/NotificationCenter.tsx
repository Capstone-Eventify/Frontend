'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Calendar,
  Ticket,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useUser } from '@/contexts/UserContext'

interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'warning' | 'info' | 'error' | 'event_deleted'
  timestamp?: string
  reason?: string
  eventId?: string
  eventTitle?: string
  isRead: boolean
  read?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

// Removed mock notifications - now fetching from API only

const notificationIcons = {
  success: CheckCircle,
  warning: AlertCircle,
  info: Info,
  error: AlertCircle,
  event_deleted: AlertCircle
}

const notificationColors = {
  success: 'text-green-600 bg-green-50',
  warning: 'text-yellow-600 bg-yellow-50',
  info: 'text-blue-600 bg-blue-50',
  error: 'text-red-600 bg-red-50',
  event_deleted: 'text-red-600 bg-red-50'
}

export default function NotificationCenter() {
  const { user } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Load notifications from API
  React.useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) {
        // No notifications if not logged in
        setNotifications([])
        return
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        const token = localStorage.getItem('token')
        
        if (!token) {
          setNotifications([])
          return
        }

        const response = await fetch(`${apiUrl}/api/notifications`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            const apiNotifications: Notification[] = (data.data || []).map((n: any) => ({
              id: n.id,
              title: n.title,
              message: n.message,
              type: n.type || 'info',
              timestamp: n.createdAt,
              isRead: n.isRead || false,
              link: n.link
            }))
            
            setNotifications(apiNotifications)
          } else {
            setNotifications([])
          }
        } else {
          setNotifications([])
        }
      } catch (error) {
        console.error('Error loading notifications:', error)
        setNotifications([])
      }
    }

    fetchNotifications()
  }, [user?.id])

  const unreadCount = notifications.filter(n => !n.isRead && !n.read).length

  const markAsRead = async (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true, read: true } : n)
    setNotifications(updated)
    
    // Update via API
    if (user?.id) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        const token = localStorage.getItem('token')
        if (token) {
          await fetch(`${apiUrl}/api/notifications/${id}/read`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        }
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    }
  }

  const markAllAsRead = async () => {
    const updated = notifications.map(n => ({ ...n, isRead: true, read: true }))
    setNotifications(updated)
    
    // Update via API
    if (user?.id) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        const token = localStorage.getItem('token')
        if (token) {
          await fetch(`${apiUrl}/api/notifications/read-all`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        }
      } catch (error) {
        console.error('Error marking all notifications as read:', error)
      }
    }
  }

  const removeNotification = async (id: string) => {
    const updated = notifications.filter(n => n.id !== id)
    setNotifications(updated)
    
    // Delete via API
    if (user?.id) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        const token = localStorage.getItem('token')
        if (token) {
          await fetch(`${apiUrl}/api/notifications/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        }
      } catch (error) {
        console.error('Error deleting notification:', error)
      }
    }
  }

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'Just now'
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (minutes < 1) return 'Just now'
      if (minutes < 60) return `${minutes}m ago`
      if (hours < 24) return `${hours}h ago`
      if (days < 7) return `${days}d ago`
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return timestamp
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg border border-gray-200 shadow-lg z-50"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllAsRead}
                      >
                        Mark all read
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell size={48} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {notifications.map((notification) => {
                      const Icon = notificationIcons[notification.type as keyof typeof notificationIcons] || Info
                      const colors = notificationColors[notification.type as keyof typeof notificationColors] || notificationColors.info
                      
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 hover:bg-gray-50 transition-colors ${
                            !notification.isRead ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 ${colors} rounded-full flex items-center justify-center flex-shrink-0`}>
                              <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                  {notification.reason && (
                                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                                      <p className="font-medium text-red-900 mb-1">Reason:</p>
                                      <p className="text-red-700">{notification.reason}</p>
                                    </div>
                                  )}
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatTimestamp(notification.timestamp)}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-1 ml-2">
                                  {(!notification.isRead && !notification.read) && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeNotification(notification.id)}
                                    className="text-gray-400 hover:text-red-600"
                                  >
                                    <X size={14} />
                                  </Button>
                                </div>
                              </div>
                              
                              {notification.action && (
                                <div className="mt-3">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      notification.action?.onClick()
                                      markAsRead(notification.id)
                                    }}
                                  >
                                    {notification.action.label}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-4 border-t border-gray-200">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Notifications
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

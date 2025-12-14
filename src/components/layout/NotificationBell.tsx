'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Calendar,
  Ticket,
  Users,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useUser } from '@/contexts/UserContext'
import { useSocket } from '@/contexts/SocketContext'
import { useRouter } from 'next/navigation'
import NotificationsModal from '@/components/notifications/NotificationsModal'

interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'warning' | 'info' | 'error' | 'event_deleted' | 'ticket_confirmed' | 'refund_requested' | 'waitlist_approved'
  timestamp?: string
  reason?: string
  eventId?: string
  eventTitle?: string
  isRead: boolean
  read?: boolean
  link?: string
  metadata?: any
  action?: {
    label: string
    onClick: () => void
  }
}

const notificationIcons = {
  success: CheckCircle,
  warning: AlertCircle,
  info: Info,
  error: AlertCircle,
  event_deleted: AlertCircle,
  ticket_confirmed: Ticket,
  refund_requested: AlertCircle,
  waitlist_approved: CheckCircle2
}

const notificationColors = {
  success: 'text-green-600 bg-green-50 border-green-200',
  warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  info: 'text-blue-600 bg-blue-50 border-blue-200',
  error: 'text-red-600 bg-red-50 border-red-200',
  event_deleted: 'text-red-600 bg-red-50 border-red-200',
  ticket_confirmed: 'text-green-600 bg-green-50 border-green-200',
  refund_requested: 'text-orange-600 bg-orange-50 border-orange-200',
  waitlist_approved: 'text-blue-600 bg-blue-50 border-blue-200'
}

interface NotificationBellProps {
  onOpen?: () => void
  isProfileOpen?: boolean
}

export default function NotificationBell({ onOpen, isProfileOpen = false }: NotificationBellProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useUser()
  const { notifications: realtimeNotifications, isConnected } = useSocket()
  const [isOpen, setIsOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [apiNotifications, setApiNotifications] = useState<Notification[]>([])
  const notificationRef = useRef<HTMLDivElement>(null)

  // Close notification dropdown when profile dropdown opens
  useEffect(() => {
    if (isProfileOpen && isOpen) {
      setIsOpen(false)
    }
  }, [isProfileOpen, isOpen])

  // Load initial notifications from API only once on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !isAuthenticated) {
      return
    }

    const loadInitialNotifications = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        const token = localStorage.getItem('token')
        
        if (!token) {
          return
        }

        const response = await fetch(`${apiUrl}/api/notifications?limit=5`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            // Format notifications from API
            const apiNotifications: Notification[] = (data.data || []).map((n: any) => ({
              id: n.id,
              title: n.title,
              message: n.message,
              type: (n.type === 'event' ? 'info' : n.type) as Notification['type'],
              timestamp: n.createdAt,
              isRead: n.isRead || false,
              link: n.link
            }))

            setApiNotifications(apiNotifications)
          }
        }
      } catch (error) {
        console.error('Error loading initial notifications:', error)
      }
    }

    loadInitialNotifications()
  }, [isAuthenticated]) // Only run when authentication status changes

  // Function to refresh notifications when needed (e.g., after marking as read)
  const refreshNotifications = async () => {
    if (!isAuthenticated) return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      if (!token) return

      const response = await fetch(`${apiUrl}/api/notifications?limit=5`, {
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
            type: (n.type === 'event' ? 'info' : n.type) as Notification['type'],
            timestamp: n.createdAt,
            isRead: n.isRead || false,
            link: n.link
          }))

          setApiNotifications(apiNotifications)
        }
      }
    } catch (error) {
      console.error('Error refreshing notifications:', error)
    }
  }

  // Merge API and real-time notifications whenever either changes
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([])
      return
    }

    // Merge real-time notifications with API notifications
    const realtimeNotifs = realtimeNotifications.map(n => ({
      ...n,
      id: n.id || `notif_${Date.now()}_${Math.random()}`,
      type: (n.type === 'event' ? 'info' : n.type) as Notification['type'],
      isRead: false // Real-time notifications are always unread initially
    }))

    // Combine all notifications
    const allNotifications = [
      ...realtimeNotifs,
      ...apiNotifications
    ]
    
    // Remove duplicates based on ID and sort
    const uniqueNotifications = allNotifications.filter((notification, index, self) => 
      index === self.findIndex(n => n.id === notification.id)
    )

    // Sort by unread status, then by timestamp
    uniqueNotifications.sort((a: Notification, b: Notification) => {
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1
      }
      const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0
      const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0
      return bTime - aTime
    })
    
    setNotifications(uniqueNotifications)
  }, [isAuthenticated, realtimeNotifications, apiNotifications])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const unreadCount = notifications.filter(n => !n.isRead && !n.read).length

  const markAsRead = async (id: string) => {
    // Skip real-time notifications (they don't exist in database)
    if (id?.startsWith('notif_')) return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      if (!token) return

      await fetch(`${apiUrl}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      // Refresh notifications from API to get updated read status
      await refreshNotifications()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      if (!token) return

      await fetch(`${apiUrl}/api/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      // Refresh notifications from API to get updated read status
      await refreshNotifications()
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const removeNotification = async (id: string) => {
    // For real-time notifications, just remove from local state
    if (id?.startsWith('notif_')) {
      setNotifications(prev => prev.filter(n => n.id !== id))
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      if (!token) return

      await fetch(`${apiUrl}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      // Refresh notifications from API to get updated list
      await refreshNotifications()
    } catch (error) {
      console.error('Error deleting notification:', error)
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

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read when clicked
    markAsRead(notification.id)
    
    // Handle action if present
    if (notification.action) {
      notification.action.onClick()
    } else if (notification.link) {
      router.push(notification.link)
    } else if (notification.eventId) {
      // Navigate to event page if eventId is present
      router.push(`/events/${notification.eventId}`)
    } else if (notification.type === 'ticket_confirmed') {
      // Navigate to tickets section
      router.push('/dashboard?tab=tickets')
    }
    
    setIsOpen(false)
  }

  const clearNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeNotification(id)
  }

  // Don't show if user is not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="relative z-50" ref={notificationRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen && onOpen) {
            onOpen()
          }
        }}
        className="relative p-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label="Notifications"
        title={isConnected ? 'Real-time notifications active' : 'Real-time notifications offline'}
      >
        <Bell size={20} className={`${isConnected ? 'text-gray-700' : 'text-gray-400'}`} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {/* Connection status indicator */}
        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
          isConnected ? 'bg-green-500' : 'bg-gray-400'
        }`} />
      </button>

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
              className="absolute right-0 top-full mt-2 w-[90vw] max-w-[450px] sm:w-[450px] bg-white rounded-lg border border-gray-200 shadow-xl z-[60] max-h-[600px] min-h-[300px] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900 whitespace-nowrap">Recent Notifications</h3>
                  {unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white border-0 whitespace-nowrap">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs whitespace-nowrap"
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 p-0"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto max-h-[500px] min-h-[200px]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Bell size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-700 font-semibold text-base mb-1">No recent notifications</p>
                    <p className="text-sm text-gray-500">You&apos;re all caught up!</p>
                    <p className="text-xs text-gray-400 mt-2">Check &quot;View All&quot; for notification history</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {notifications.slice(0, 5).map((notification) => {
                      const Icon = notificationIcons[notification.type as keyof typeof notificationIcons] || Info
                      const colors = notificationColors[notification.type as keyof typeof notificationColors] || notificationColors.info
                      
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                            !notification.isRead && !notification.read ? 'bg-blue-50/50' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start space-x-3 gap-3">
                            <div className={`w-10 h-10 ${colors} rounded-full flex items-center justify-center flex-shrink-0 border-2`}>
                              <Icon size={18} />
                            </div>
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <p className="text-sm font-semibold text-gray-900 whitespace-normal break-words">
                                      {notification.title}
                                    </p>
                                    {(!notification.isRead && !notification.read) && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1 whitespace-normal break-words leading-relaxed">
                                    {notification.message}
                                  </p>
                                  {notification.reason && (
                                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                                      <p className="font-medium text-red-900 mb-1">Reason:</p>
                                      <p className="text-red-700">{notification.reason}</p>
                                    </div>
                                  )}
                                  {notification.eventTitle && (
                                    <p className="text-xs text-primary-600 mt-1 font-medium">
                                      {notification.eventTitle}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500 mt-2">
                                    {formatTimestamp(notification.timestamp)}
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => clearNotification(notification.id, e)}
                                  className="text-gray-400 hover:text-red-600 w-6 h-6 p-0 flex-shrink-0"
                                  title="Clear notification"
                                >
                                  <X size={12} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>
                    {notifications.length > 0 
                      ? `${Math.min(notifications.length, 5)} recent notifications`
                      : 'No recent notifications'
                    }
                  </span>
                  <span className={`flex items-center space-x-1 ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span>{isConnected ? 'Live' : 'Offline'}</span>
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full whitespace-nowrap"
                  onClick={() => {
                    setIsOpen(false)
                    setIsModalOpen(true)
                  }}
                >
                  View All Notifications
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notifications Modal */}
      <NotificationsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  )
}



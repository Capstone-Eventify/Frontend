'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Ticket,
  CheckCircle2,
  Trash2,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useUser } from '@/contexts/UserContext'
import { useSocket } from '@/contexts/SocketContext'
import { useRouter } from 'next/navigation'

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

interface NotificationsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const router = useRouter()
  const { isAuthenticated } = useUser()
  const { notifications: realtimeNotifications, isConnected } = useSocket()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [apiNotifications, setApiNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Load notifications from API
  const loadNotifications = useCallback(async (page = 1, append = false) => {
    if (!isAuthenticated) return

    const loadingState = page === 1 ? setLoading : setLoadingMore
    loadingState(true)
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      if (!token) {
        setNotifications([])
        return
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filter === 'unread' && { unreadOnly: 'true' }),
        ...(typeFilter !== 'all' && { type: typeFilter })
      })

      const response = await fetch(`${apiUrl}/api/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Format notifications from API
          const newApiNotifications: Notification[] = (data.data || []).map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: (n.type === 'event' ? 'info' : n.type) as Notification['type'],
            timestamp: n.createdAt,
            isRead: n.isRead || false,
            link: n.link,
            metadata: n.metadata || {}
          }))

          if (append && page > 1) {
            setApiNotifications(prev => [...prev, ...newApiNotifications])
          } else {
            setApiNotifications(newApiNotifications)
          }
          
          setCurrentPage(data.currentPage)
          setTotalPages(data.totalPages)
          setHasNextPage(data.hasNextPage)
        }
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      loadingState(false)
    }
  }, [isAuthenticated, filter, typeFilter])

  // Load notifications when modal opens or filters change
  useEffect(() => {
    if (!isOpen || !isAuthenticated) return
    setCurrentPage(1)
    loadNotifications(1, false)
  }, [isOpen, isAuthenticated, filter, typeFilter, loadNotifications])

  // Merge API and real-time notifications
  useEffect(() => {
    // Merge real-time notifications with API notifications
    const realtimeNotifs = realtimeNotifications.map(n => ({
      ...n,
      id: n.id || `notif_${Date.now()}_${Math.random()}`,
      type: (n.type === 'event' ? 'info' : n.type) as Notification['type'],
      isRead: false // Real-time notifications are always unread initially
    }))

    // Combine all notifications
    const allNotifications = [...realtimeNotifs, ...apiNotifications]
    
    // Remove duplicates based on ID
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
  }, [realtimeNotifications, apiNotifications])

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead && !n.read
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead && !n.read).length

  const markAsRead = async (id: string) => {
    // Skip real-time notifications
    if (id?.startsWith('notif_')) {
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ))
      return
    }

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

      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ))
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

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
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

      // Mark as read instead of deleting
      await fetch(`${apiUrl}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      // Update local state to mark as read
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ))
    } catch (error) {
      console.error('Error dismissing notification:', error)
    }
  }

  const clearAllNotifications = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      if (!token) return

      // Mark all notifications as read instead of deleting them
      await fetch(`${apiUrl}/api/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      // Update local state to mark all as read
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (error) {
      console.error('Error clearing all notifications:', error)
    }
  }

  const permanentlyDeleteAll = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      if (!token) return

      // Delete all API notifications permanently
      const apiNotifications = notifications.filter(n => !n.id?.startsWith('notif_'))
      await Promise.all(
        apiNotifications.map(n => 
          fetch(`${apiUrl}/api/notifications/${n.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        )
      )

      // Clear all notifications from local state
      setNotifications([])
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Error permanently deleting notifications:', error)
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
    markAsRead(notification.id)
    
    // Handle action if present
    if (notification.action) {
      notification.action.onClick()
    } else if (notification.link) {
      router.push(notification.link)
    } else if (notification.eventId) {
      router.push(`/events/${notification.eventId}`)
    } else if (notification.type === 'ticket_confirmed') {
      router.push('/dashboard?tab=tickets')
    }
    
    onClose()
  }

  if (!isAuthenticated) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center p-4"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-semibold text-gray-900">All Notifications</h2>
                    {unreadCount > 0 && (
                      <Badge className="bg-red-500 text-white border-0">
                        {unreadCount} unread
                      </Badge>
                    )}
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} 
                         title={isConnected ? 'Real-time connected' : 'Real-time offline'} />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    className="w-8 h-8 p-0"
                  >
                    <X size={16} />
                  </Button>
                </div>
                
                {/* Filter and Actions */}
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button
                        variant={filter === 'all' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('all')}
                      >
                        All
                      </Button>
                      <Button
                        variant={filter === 'unread' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('unread')}
                      >
                        Unread ({unreadCount})
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
                      >
                        <option value="all">All Types</option>
                        <option value="success">Success</option>
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                        <option value="ticket_confirmed">Tickets</option>
                        <option value="event_deleted">Events</option>
                        <option value="refund_requested">Refunds</option>
                        <option value="waitlist_approved">Waitlist</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs"
                      >
                        <Check size={14} className="mr-1" />
                        Mark all read
                      </Button>
                    )}
                    {notifications.length > 0 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearAllNotifications}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          <Check size={14} className="mr-1" />
                          Mark all read
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete all
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading notifications...</p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <CheckCircle size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-700 font-semibold text-base mb-1">
                      {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {filter === 'unread' ? 'All caught up!' : 'We\'ll notify you when there\'s something new'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredNotifications.map((notification) => {
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
                          <div className="flex items-start space-x-3">
                            <div className={`w-10 h-10 ${colors} rounded-full flex items-center justify-center flex-shrink-0 border-2`}>
                              <Icon size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <p className="text-sm font-semibold text-gray-900 break-words">
                                      {notification.title}
                                    </p>
                                    {(!notification.isRead && !notification.read) && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1 break-words leading-relaxed">
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
                                <div className="flex space-x-1">
                                  {!notification.isRead && !notification.read && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        markAsRead(notification.id)
                                      }}
                                      className="text-gray-400 hover:text-blue-600 w-6 h-6 p-0 flex-shrink-0"
                                      title="Mark as read"
                                    >
                                      <CheckCircle size={12} />
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeNotification(notification.id)
                                    }}
                                    className="text-gray-400 hover:text-blue-600 w-6 h-6 p-0 flex-shrink-0"
                                    title="Mark as read"
                                  >
                                    <X size={12} />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
                
                {/* Load More Button */}
                {hasNextPage && !loading && (
                  <div className="p-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadNotifications(currentPage + 1, true)}
                      disabled={loadingMore}
                      className="w-full"
                    >
                      {loadingMore ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full mr-2"></div>
                          Loading more...
                        </>
                      ) : (
                        `Load More (${currentPage}/${totalPages})`
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                    {filter === 'unread' && ' unread'}
                    {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
                  </span>
                  <span className={`flex items-center space-x-1 ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span>{isConnected ? 'Real-time active' : 'Offline'}</span>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete All Notifications?
            </h3>
            <p className="text-gray-600 mb-4">
              This will permanently delete all your notifications. This action cannot be undone.
            </p>
            <div className="flex space-x-3 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={permanentlyDeleteAll}
                className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
              >
                Delete All
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
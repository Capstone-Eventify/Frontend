'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, Bell } from 'lucide-react'
import { useSocket } from '@/contexts/SocketContext'

interface ToastNotification {
  id: string
  type: string
  title: string
  message: string
  timestamp: string
}

export default function NotificationToast() {
  const { notifications } = useSocket()
  const [visibleToasts, setVisibleToasts] = useState<ToastNotification[]>([])

  // Show new notifications as toasts
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0]
      
      // Only show toast for very recent notifications (within last 5 seconds)
      const notificationTime = new Date(latestNotification.timestamp || Date.now()).getTime()
      const now = Date.now()
      const timeDiff = now - notificationTime
      
      if (timeDiff < 5000) { // 5 seconds
        const toast: ToastNotification = {
          id: latestNotification.id || `toast_${Date.now()}`,
          type: latestNotification.type,
          title: latestNotification.title,
          message: latestNotification.message,
          timestamp: latestNotification.timestamp || new Date().toISOString()
        }

        setVisibleToasts(prev => {
          // Avoid duplicates
          if (prev.some(t => t.id === toast.id)) return prev
          
          // Keep only last 3 toasts
          return [toast, ...prev.slice(0, 2)]
        })

        // Auto-remove after 5 seconds
        setTimeout(() => {
          setVisibleToasts(prev => prev.filter(t => t.id !== toast.id))
        }, 5000)
      }
    }
  }, [notifications])

  const removeToast = (id: string) => {
    setVisibleToasts(prev => prev.filter(t => t.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
      case 'ticket_confirmed':
        return CheckCircle
      case 'warning':
      case 'refund_requested':
        return AlertCircle
      case 'error':
      case 'event_deleted':
        return AlertCircle
      case 'info':
      default:
        return Info
    }
  }

  const getColors = (type: string) => {
    switch (type) {
      case 'success':
      case 'ticket_confirmed':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'warning':
      case 'refund_requested':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'error':
      case 'event_deleted':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
      <AnimatePresence>
        {visibleToasts.map((toast) => {
          const Icon = getIcon(toast.type)
          const colors = getColors(toast.type)
          
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`
                max-w-sm w-full bg-white rounded-lg border-2 shadow-lg pointer-events-auto
                ${colors}
              `}
            >
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {toast.title}
                    </p>
                    <p className="text-sm mt-1 line-clamp-2">
                      {toast.message}
                    </p>
                  </div>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              
              {/* Progress bar */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
                className="h-1 bg-current opacity-30 rounded-b-lg"
              />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
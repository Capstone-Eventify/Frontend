'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useSocket } from '@/contexts/SocketContext'
import { useUser } from '@/contexts/UserContext'
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Ticket,
  RefreshCw
} from 'lucide-react'

export default function NotificationTestPanel() {
  const { isConnected } = useSocket()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [lastResponse, setLastResponse] = useState<string>('')

  const sendTestNotification = async (type: string, title: string, message: string) => {
    if (!user || user.role !== 'admin') {
      setLastResponse('Admin access required')
      return
    }

    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${apiUrl}/api/notifications/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type,
          title,
          message
        })
      })

      const data = await response.json()
      setLastResponse(data.success ? 'Test notification sent!' : data.message)
    } catch (error) {
      setLastResponse('Error sending test notification')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const testNotifications = [
    {
      type: 'success',
      title: 'Registration Confirmed',
      message: 'Your registration for "Test Event" has been confirmed!',
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      type: 'warning',
      title: 'Event Reminder',
      message: 'Don\'t forget about "Test Event" starting in 1 hour!',
      icon: AlertCircle,
      color: 'bg-yellow-500'
    },
    {
      type: 'info',
      title: 'System Update',
      message: 'New features have been added to your dashboard.',
      icon: Info,
      color: 'bg-blue-500'
    },
    {
      type: 'ticket_confirmed',
      title: 'Ticket Ready',
      message: 'Your ticket is ready for download.',
      icon: Ticket,
      color: 'bg-green-500'
    }
  ]

  // Only show for admin users
  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Bell size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Notification Testing</h3>
          <Badge className={`${isConnected ? 'bg-green-500' : 'bg-red-500'} text-white border-0`}>
            {isConnected ? 'Connected' : 'Offline'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {testNotifications.map((notif, index) => {
          const Icon = notif.icon
          return (
            <Button
              key={index}
              variant="outline"
              onClick={() => sendTestNotification(notif.type, notif.title, notif.message)}
              disabled={loading || !isConnected}
              className="flex items-center justify-start space-x-2 p-3 h-auto text-left"
            >
              <div className={`w-8 h-8 ${notif.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                <Icon size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">{notif.title}</p>
                <p className="text-xs text-gray-500 truncate">{notif.message}</p>
              </div>
              {loading && <RefreshCw size={16} className="animate-spin text-gray-400" />}
            </Button>
          )
        })}
      </div>

      {lastResponse && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Last Response:</strong> {lastResponse}
          </p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p><strong>Note:</strong> Test notifications are only visible to admin users and will appear in real-time if connected.</p>
        <p><strong>Connection Status:</strong> {isConnected ? '✅ Real-time active' : '❌ Offline - notifications may be delayed'}</p>
      </div>
    </div>
  )
}
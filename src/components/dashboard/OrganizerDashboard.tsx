'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Plus, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Grid3x3,
  List,
  Globe,
  EyeOff,
  Bell,
  Ticket,
  MessageSquare,
  TrendingDown,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import EventFormModal from './EventFormModal'
import AttendeeManagement from './AttendeeManagement'
import EventAnalytics from './EventAnalytics'
import WaitlistManagement from './WaitlistManagement'
import EmailInbox from './EmailInbox'
import { EventDetail } from '@/types/event'
import { getOrganizerEmails } from '@/lib/emailNotifications'

// Mock data for organizer dashboard
const organizerStats = {
  totalEvents: 8,
  totalRevenue: 12500,
  totalAttendees: 2450,
  activeEvents: 3,
  revenueGrowth: 12.5,
  attendeeGrowth: 8.2
}

const recentEvents = [
  {
    id: '1',
    title: 'Tech Innovation Summit 2024',
    date: 'Dec 15, 2024',
    attendees: 2847,
    revenue: 253383,
    status: 'live',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '2',
    title: 'Digital Marketing Masterclass',
    date: 'Dec 20, 2024',
    attendees: 1234,
    revenue: 0,
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '3',
    title: 'Global Design Conference',
    date: 'Jan 5, 2025',
    attendees: 5621,
    revenue: 837429,
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
  }
]

const recentActivity = [
  { action: 'New registration for Tech Innovation Summit', time: '2 hours ago', type: 'registration' },
  { action: 'Payment received for Global Design Conference', time: '4 hours ago', type: 'payment' },
  { action: 'Event "Startup Pitch Competition" published', time: '1 day ago', type: 'publish' },
  { action: 'Analytics report generated', time: '2 days ago', type: 'analytics' }
]

// Mock organizer notifications
const getMockOrganizerNotifications = () => {
  const now = new Date()
  const notifications = [
    {
      id: 'push_notification_summary',
      title: 'Push Notifications Active',
      message: 'Push notifications are now enabled! You will receive instant alerts for new registrations, payments, waitlist entries, and event updates.',
      type: 'success',
      timestamp: new Date().toISOString(),
      isRead: false,
      icon: 'notification'
    },
    {
      id: `notif_${Date.now()}_1`,
      title: 'New Event Posted',
      message: 'Your event "Tech Innovation Summit 2024" has been successfully published and is now live!',
      type: 'success',
      timestamp: new Date(now.getTime() - 30 * 60000).toISOString(), // 30 minutes ago
      isRead: false,
      icon: 'event'
    },
    {
      id: `notif_${Date.now()}_2`,
      title: 'New Registration',
      message: '5 new attendees registered for "Digital Marketing Masterclass" in the last hour.',
      type: 'info',
      timestamp: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
      isRead: false,
      icon: 'registration'
    },
    {
      id: `notif_${Date.now()}_3`,
      title: 'Payment Received',
      message: 'You received $250 from ticket sales for "Global Design Conference".',
      type: 'success',
      timestamp: new Date(now.getTime() - 4 * 3600 * 1000).toISOString(), // 4 hours ago
      isRead: false,
      icon: 'payment'
    },
    {
      id: `notif_${Date.now()}_4`,
      title: 'Event Almost Full',
      message: '"Tech Innovation Summit 2024" has reached 85% capacity. Consider adding more tickets!',
      type: 'warning',
      timestamp: new Date(now.getTime() - 6 * 3600 * 1000).toISOString(), // 6 hours ago
      isRead: false,
      icon: 'capacity'
    },
    {
      id: `notif_${Date.now()}_5`,
      title: 'New Waitlist Entry',
      message: '3 people joined the waitlist for "Startup Pitch Competition".',
      type: 'info',
      timestamp: new Date(now.getTime() - 8 * 3600 * 1000).toISOString(), // 8 hours ago
      isRead: true,
      icon: 'waitlist'
    },
    {
      id: `notif_${Date.now()}_6`,
      title: 'Event Starting Soon',
      message: 'Your event "Digital Marketing Masterclass" starts in 2 days. Time to send reminders!',
      type: 'warning',
      timestamp: new Date(now.getTime() - 12 * 3600 * 1000).toISOString(), // 12 hours ago
      isRead: false,
      icon: 'reminder'
    },
    {
      id: `notif_${Date.now()}_7`,
      title: 'High Engagement',
      message: 'Your event "Tech Innovation Summit 2024" has been viewed 1,234 times this week!',
      type: 'success',
      timestamp: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(), // 1 day ago
      isRead: true,
      icon: 'engagement'
    },
    {
      id: `notif_${Date.now()}_8`,
      title: 'Refund Request',
      message: '1 attendee requested a refund for "Global Design Conference". Review in payments.',
      type: 'error',
      timestamp: new Date(now.getTime() - 2 * 24 * 3600 * 1000).toISOString(), // 2 days ago
      isRead: false,
      icon: 'refund'
    }
  ]
  
  // Initialize notifications in localStorage if not exists
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('eventify_organizer_notifications')
    if (!stored) {
      localStorage.setItem('eventify_organizer_notifications', JSON.stringify(notifications))
    }
  }
  
  return notifications
}

export default function OrganizerDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventDetail | null>(null)
  const [organizerEvents, setOrganizerEvents] = useState<any[]>([])
  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState<string | null>(null)
  const [selectedEventForAnalytics, setSelectedEventForAnalytics] = useState<string | null>(null)
  const [selectedEventForWaitlist, setSelectedEventForWaitlist] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<'events' | 'analytics' | 'emails'>('events')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    // Load events from localStorage
    if (typeof window !== 'undefined') {
      const storedEvents = JSON.parse(localStorage.getItem('eventify_organizer_events') || '[]')
      // Merge with mock data
      const mergedEvents = [...storedEvents, ...recentEvents.filter(e => 
        !storedEvents.some((se: any) => se.id === e.id)
      )]
      setOrganizerEvents(mergedEvents)
      
      // Load organizer notifications
      const storedNotifications = localStorage.getItem('eventify_organizer_notifications')
      let loadedNotifications: any[] = []
      
      if (storedNotifications) {
        try {
          loadedNotifications = JSON.parse(storedNotifications)
        } catch {
          loadedNotifications = getMockOrganizerNotifications()
        }
      } else {
        loadedNotifications = getMockOrganizerNotifications()
      }

      // Ensure push notification summary is always present
      const hasPushNotif = loadedNotifications.some((n: any) => n.id === 'push_notification_summary')
      if (!hasPushNotif) {
        const pushNotif = {
          id: 'push_notification_summary',
          title: 'Push Notifications Active',
          message: 'Push notifications are now enabled! You will receive instant alerts for new registrations, payments, waitlist entries, and event updates.',
          type: 'success',
          timestamp: new Date().toISOString(),
          isRead: false,
          icon: 'notification'
        }
        loadedNotifications = [pushNotif, ...loadedNotifications]
        localStorage.setItem('eventify_organizer_notifications', JSON.stringify(loadedNotifications))
      }
      
      setNotifications(loadedNotifications)

      // Also add email notifications to the notifications list
      const userData = JSON.parse(localStorage.getItem('eventify_user') || '{}')
      if (userData.email) {
        const emails = getOrganizerEmails(userData.email)
        const emailNotifications = emails
          .filter(email => !email.isRead)
          .slice(0, 3) // Show only 3 most recent unread emails
          .map(email => ({
            id: `email_notif_${email.id}`,
            title: email.subject,
            message: email.body.substring(0, 100) + '...',
            type: email.type === 'registration' ? 'success' : email.type === 'waitlist' ? 'info' : 'info',
            timestamp: email.timestamp,
            isRead: email.isRead,
            icon: email.type === 'registration' ? 'registration' : email.type === 'waitlist' ? 'waitlist' : 'info'
          }))
        
        // Merge email notifications with existing notifications
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id))
          const newEmailNotifs = emailNotifications.filter(n => !existingIds.has(n.id))
          return [...newEmailNotifs, ...prev]
        })
      }
    }
  }, [])

  const handleCreateEvent = () => {
    setEditingEvent(null)
    setShowEventForm(true)
  }

  // Check for create parameter in URL
  useEffect(() => {
    const createParam = searchParams?.get('create')
    if (createParam === 'true') {
      setEditingEvent(null)
      setShowEventForm(true)
      // Remove the parameter from URL
      router.replace('/dashboard?tab=organizer')
    }
  }, [searchParams, router])

  const handleEditEvent = (event: any) => {
    setEditingEvent(event as EventDetail)
    setShowEventForm(true)
  }

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      const updatedEvents = organizerEvents.filter(e => e.id !== eventId)
      setOrganizerEvents(updatedEvents)
      
      const storedEvents = JSON.parse(localStorage.getItem('eventify_organizer_events') || '[]')
      const updatedStored = storedEvents.filter((e: any) => e.id !== eventId)
      localStorage.setItem('eventify_organizer_events', JSON.stringify(updatedStored))
    }
  }

  const handleEventSave = (eventData: any) => {
    const storedEvents = JSON.parse(localStorage.getItem('eventify_organizer_events') || '[]')
    if (editingEvent) {
      const updatedEvents = organizerEvents.map(e => e.id === eventData.id ? eventData : e)
      setOrganizerEvents(updatedEvents)
      
      const updatedStored = storedEvents.map((e: any) => 
        e.id === eventData.id ? eventData : e
      )
      localStorage.setItem('eventify_organizer_events', JSON.stringify(updatedStored))
    } else {
      setOrganizerEvents([...organizerEvents, eventData])
      localStorage.setItem('eventify_organizer_events', JSON.stringify([...storedEvents, eventData]))
    }
    setShowEventForm(false)
    setEditingEvent(null)
  }

  const handleViewAttendees = (eventId: string) => {
    setSelectedEventForAttendees(eventId)
  }

  const handleViewWaitlist = (eventId: string) => {
    setSelectedEventForWaitlist(eventId)
  }

  const handleViewAnalytics = (eventId: string) => {
    setSelectedEventForAnalytics(eventId)
    setActiveView('analytics')
  }

  const handleViewEvent = (eventId: string) => {
    router.push(`/events/${eventId}`)
  }

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: AlertCircle },
      live: { color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle },
      upcoming: { color: 'text-blue-600', bgColor: 'bg-blue-50', icon: Clock },
      ended: { color: 'text-gray-600', bgColor: 'bg-gray-50', icon: Calendar }
    }
    const statusConfig = config[status as keyof typeof config] || config.upcoming
    const Icon = statusConfig.icon
    return (
      <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}>
        <Icon size={14} className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const handlePublishEvent = (eventId: string) => {
    const storedEvents = JSON.parse(localStorage.getItem('eventify_organizer_events') || '[]')
    const updatedEvents = storedEvents.map((e: any) => 
      e.id === eventId ? { ...e, status: 'live' } : e
    )
    localStorage.setItem('eventify_organizer_events', JSON.stringify(updatedEvents))
    
    const updatedOrganizerEvents = organizerEvents.map(e => 
      e.id === eventId ? { ...e, status: 'live' } : e
    )
    setOrganizerEvents(updatedOrganizerEvents)
  }

  const handleUnpublishEvent = (eventId: string) => {
    const storedEvents = JSON.parse(localStorage.getItem('eventify_organizer_events') || '[]')
    const updatedEvents = storedEvents.map((e: any) => 
      e.id === eventId ? { ...e, status: 'draft' } : e
    )
    localStorage.setItem('eventify_organizer_events', JSON.stringify(updatedEvents))
    
    const updatedOrganizerEvents = organizerEvents.map(e => 
      e.id === eventId ? { ...e, status: 'draft' } : e
    )
    setOrganizerEvents(updatedOrganizerEvents)
  }

  const formatNotificationTime = (timestamp: string) => {
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
      return 'Recently'
    }
  }

  const getNotificationIcon = (icon: string) => {
    switch (icon) {
      case 'event': return Calendar
      case 'registration': return Users
      case 'payment': return DollarSign
      case 'capacity': return AlertCircle
      case 'waitlist': return Clock
      case 'reminder': return Bell
      case 'engagement': return TrendingUp
      case 'refund': return TrendingDown
      case 'notification': return Bell
      default: return Info
    }
  }

  const markNotificationAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
    setNotifications(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('eventify_organizer_notifications', JSON.stringify(updated))
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">Organizer Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 break-words">Manage your events and track performance</p>
        </div>
        <div className="flex items-center space-x-3">
          {activeView === 'analytics' && (
            <Button variant="outline" size="sm" onClick={() => setActiveView('events')}>
              <Calendar size={16} className="mr-2" />
              Back to Events
          </Button>
          )}
          <Button onClick={handleCreateEvent}>
            <Plus size={16} className="mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative overflow-x-auto">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 inline-flex min-w-0">
          <button
            onClick={() => {
              setActiveView('events')
              setSelectedEventForAnalytics(null)
            }}
            className={`relative px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-md transition-all duration-200 whitespace-nowrap ${
              activeView === 'events'
                ? 'text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {activeView === 'events' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary-600 rounded-md"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">Events</span>
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className={`relative px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-md transition-all duration-200 whitespace-nowrap ${
              activeView === 'analytics'
                ? 'text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {activeView === 'analytics' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary-600 rounded-md"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">Analytics</span>
          </button>
          <button
            onClick={() => setActiveView('emails')}
            className={`relative px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-md transition-all duration-200 whitespace-nowrap ${
              activeView === 'emails'
                ? 'text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {activeView === 'emails' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary-600 rounded-md"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              <Bell size={14} />
              Emails
            </span>
          </button>
        </div>
      </div>

      {/* Emails View */}
      {activeView === 'emails' && (
        <EmailInbox />
      )}

      {/* Analytics View */}
      {activeView === 'analytics' && (
        <div>
          {selectedEventForAnalytics ? (
            <EventAnalytics
              eventId={selectedEventForAnalytics}
              eventTitle={organizerEvents.find(e => e.id === selectedEventForAnalytics)?.title}
            />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 break-words">Select an Event to View Analytics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {organizerEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleViewAnalytics(event.id)}
                  >
                    <img
                      src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}
                      alt={event.title}
                      className="w-full h-24 sm:h-32 object-cover rounded-lg mb-2 sm:mb-3"
                    />
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 break-words line-clamp-2">{event.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 truncate">{event.date}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      <BarChart3 size={14} className="mr-2" />
                      View Analytics
                    </Button>
                  </motion.div>
                ))}
              </div>
              {organizerEvents.length === 0 && (
                <div className="text-center py-12">
                  <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No events to analyze yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Events View */}
      {activeView === 'events' && (
        <>
          {/* Notifications Section */}
          {notifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell size={20} className="text-primary-600" />
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Notifications</h2>
                  {unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white border-0">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.slice(0, 5).map((notification) => {
                  const Icon = getNotificationIcon(notification.icon)
                  const colorConfig = {
                    success: {
                      bg: 'bg-green-50',
                      border: 'border-green-200',
                      text: 'text-green-700',
                      iconBg: 'bg-green-100'
                    },
                    warning: {
                      bg: 'bg-yellow-50',
                      border: 'border-yellow-200',
                      text: 'text-yellow-700',
                      iconBg: 'bg-yellow-100'
                    },
                    info: {
                      bg: 'bg-blue-50',
                      border: 'border-blue-200',
                      text: 'text-blue-700',
                      iconBg: 'bg-blue-100'
                    },
                    error: {
                      bg: 'bg-red-50',
                      border: 'border-red-200',
                      text: 'text-red-700',
                      iconBg: 'bg-red-100'
                    }
                  }
                  const colors = colorConfig[notification.type as keyof typeof colorConfig] || colorConfig.info
                  
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => markNotificationAsRead(notification.id)}
                      className={`p-3 sm:p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        notification.isRead ? 'bg-gray-50' : colors.bg
                      } ${colors.border}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 ${colors.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <Icon size={16} className={colors.text} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className={`text-sm font-semibold ${colors.text} break-words`}>
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 break-words">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatNotificationTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
              {notifications.length > 5 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        // Could navigate to full notifications page
                        console.log('View all notifications')
                      }}
                    >
                      View All Notifications ({notifications.length})
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => setActiveView('emails')}
                    >
                      <Bell size={14} className="mr-2" />
                      View Emails
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Organizer Stats - Calculate from actual events */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">Total Events</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{organizerEvents.length}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <Calendar size={20} className="sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">Total Revenue</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                    ${(() => {
                      // Calculate from tickets
                      if (typeof window !== 'undefined') {
                        const tickets = JSON.parse(localStorage.getItem('eventify_tickets') || '[]')
                        const eventIds = organizerEvents.map(e => e.id)
                        const eventTickets = tickets.filter((t: any) => 
                          eventIds.includes(t.eventId) && t.status === 'confirmed'
                        )
                        const revenue = eventTickets.reduce((sum: number, ticket: any) => {
                          const priceStr = typeof ticket.price === 'string' ? ticket.price : String(ticket.price || '0')
                          const price = parseFloat(priceStr.replace('$', '').replace('FREE', '0') || '0')
                          return sum + price
                        }, 0)
                        return revenue.toLocaleString()
                      }
                      return '0'
                    })()}
                  </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <DollarSign size={20} className="sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">Total Attendees</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                    {(() => {
                      // Calculate from tickets
                      if (typeof window !== 'undefined') {
                        const tickets = JSON.parse(localStorage.getItem('eventify_tickets') || '[]')
                        const eventIds = organizerEvents.map(e => e.id)
                        const eventTickets = tickets.filter((t: any) => 
                          eventIds.includes(t.eventId) && t.status === 'confirmed'
                        )
                        return eventTickets.length.toLocaleString()
                      }
                      return '0'
                    })()}
                  </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <Users size={20} className="sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">Active Events</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                    {organizerEvents.filter((e: any) => {
                      // Check if event hasn't ended
                      try {
                        const dateParts = e.date?.split(', ')
                        if (!dateParts || dateParts.length < 2) return false
                        const year = parseInt(dateParts[1])
                        const monthDay = dateParts[0].split(' ')
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                        const month = monthNames.indexOf(monthDay[0])
                        const day = parseInt(monthDay[1])
                        const eventDate = new Date(year, month, day)
                        return eventDate >= new Date()
                      } catch {
                        return true
                      }
                    }).length}
                  </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <Activity size={20} className="sm:w-6 sm:h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

          {/* My Created Events */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 break-words">My Created Events</h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">Manage and track your events</p>
                </div>
                <div className="flex items-center space-x-2">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="Grid View"
                    >
                      <Grid3x3 size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'list'
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="List View"
                    >
                      <List size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {organizerEvents.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Calendar size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">You haven't created any events yet.</p>
                  <Button onClick={handleCreateEvent}>
                    <Plus size={16} className="mr-2" />
                    Create Your First Event
                  </Button>
          </div>
              ) : viewMode === 'grid' ? (
                // Grid View
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {organizerEvents.map((event, index) => (
              <motion.div
                key={event.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleViewEvent(event.id)}
                    >
                      <div className="relative">
                        <img
                          src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}
                  alt={event.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          {getStatusBadge(event.status || 'upcoming')}
                        </div>
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 line-clamp-2 break-words">{event.title}</h3>
                        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                          <div className="flex items-center">
                            <Calendar size={12} className="sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-2 flex-shrink-0" />
                            <span className="truncate">{event.date}</span>
                          </div>
                          <div className="flex items-center">
                            <Users size={12} className="sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-2 flex-shrink-0" />
                            <span className="truncate">{event.attendees?.toLocaleString() || 0} attendees</span>
                  </div>
                </div>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditEvent(event)
                            }}
                            className="flex-1"
                          >
                            <Edit size={14} className="mr-1" />
                            Edit
                          </Button>
                          {(event.status === 'draft') ? (
                            <Button 
                              variant="primary" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePublishEvent(event.id)
                              }}
                              className="flex-1"
                              title="Publish Event"
                            >
                              <Globe size={14} className="mr-1" />
                              Publish
                            </Button>
                          ) : (event.status === 'live' || event.status === 'upcoming') ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleUnpublishEvent(event.id)
                              }}
                              className="flex-1"
                              title="Unpublish Event"
                            >
                              <EyeOff size={14} className="mr-1" />
                              Unpublish
                            </Button>
                          ) : null}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewAttendees(event.id)
                            }}
                            title="View Attendees"
                          >
                            <Users size={14} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewWaitlist(event.id)
                            }}
                            title="View Waitlist"
                          >
                            <Clock size={14} />
                    </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteEvent(event.id)
                            }}
                            title="Delete Event"
                          >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
              ) : (
                // List View
                <div className="space-y-3 sm:space-y-4">
                  {organizerEvents.map((event, index) => (
              <motion.div
                      key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 cursor-pointer"
                      onClick={() => handleViewEvent(event.id)}
                    >
                      <img
                        src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}
                        alt={event.title}
                        className="w-full sm:w-16 sm:h-16 h-32 sm:h-16 rounded-lg object-cover flex-shrink-0"
                      />
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <h3 className="text-sm sm:text-base font-medium text-gray-900 break-words mb-1 sm:mb-0">{event.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mt-1">
                          <span className="truncate">{event.date}</span>
                          <span className="truncate">{event.attendees?.toLocaleString() || 0} attendees</span>
          </div>
        </div>
                      <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 w-full sm:w-auto">
                        {getStatusBadge(event.status || 'upcoming')}
                        <div className="flex space-x-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditEvent(event)
                            }}
                            title="Edit Event"
                          >
                            <Edit size={14} />
          </Button>
                          {(event.status === 'draft') ? (
                            <Button 
                              variant="primary" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePublishEvent(event.id)
                              }}
                              title="Publish Event"
                            >
                              <Globe size={14} />
          </Button>
                          ) : (event.status === 'live' || event.status === 'upcoming') ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleUnpublishEvent(event.id)
                              }}
                              title="Unpublish Event"
                            >
                              <EyeOff size={14} />
          </Button>
                          ) : null}
            <Button
                            variant="outline" 
              size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewAttendees(event.id)
                            }}
                            title="View Attendees"
                          >
                            <Users size={14} />
            </Button>
            <Button
                            variant="outline" 
              size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewWaitlist(event.id)
                            }}
                            title="View Waitlist"
                          >
                            <Clock size={14} />
            </Button>
            <Button
                            variant="outline" 
              size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteEvent(event.id)
                            }}
                            title="Delete Event"
                          >
                            <Trash2 size={14} />
            </Button>
          </div>
        </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Event Form Modal */}
      {showEventForm && (
        <EventFormModal
          isOpen={showEventForm}
          onClose={() => {
            setShowEventForm(false)
            setEditingEvent(null)
          }}
          mode={editingEvent ? 'edit' : 'create'}
          eventData={editingEvent || undefined}
          onSave={handleEventSave}
        />
      )}

      {/* Attendee Management */}
      {selectedEventForAttendees && (
        <AttendeeManagement
          eventId={selectedEventForAttendees}
          eventTitle={organizerEvents.find(e => e.id === selectedEventForAttendees)?.title || 'Event'}
          onClose={() => setSelectedEventForAttendees(null)}
        />
      )}

      {/* Waitlist Management */}
      {selectedEventForWaitlist && (() => {
        const event = organizerEvents.find(e => e.id === selectedEventForWaitlist)
        if (!event) return null
        
        // Calculate current attendees
        let currentAttendees = event.attendees || 0
        if (typeof window !== 'undefined') {
          const tickets = JSON.parse(localStorage.getItem('eventify_tickets') || '[]')
          const eventTickets = tickets.filter((t: any) => 
            t.eventId === selectedEventForWaitlist && t.status === 'confirmed'
          )
          currentAttendees = eventTickets.length
        }

        return (
          <WaitlistManagement
            eventId={selectedEventForWaitlist}
            eventTitle={event.title || 'Event'}
            maxAttendees={event.maxAttendees || 100}
            currentAttendees={currentAttendees}
            onClose={() => setSelectedEventForWaitlist(null)}
          />
        )
      })()}
    </div>
  )
}

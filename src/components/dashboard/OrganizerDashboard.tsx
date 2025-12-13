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
import { useUser } from '@/contexts/UserContext'
import EventFormModal from './EventFormModal'
import AttendeeManagement from './AttendeeManagement'
import EventAnalytics from './EventAnalytics'
import WaitlistManagement from './WaitlistManagement'
// Removed EmailInbox - emails are handled by backend, use notifications API instead
import { EventDetail } from '@/types/event'
// REMOVED: All mock data - Now fetching from API
// REMOVED: organizerStats - Use /api/analytics/organizer
// REMOVED: recentEvents array - Use /api/events/organizer/my-events
// REMOVED: recentActivity array - Use /api/analytics/organizer

const OrganizerDashboard: React.FC = () => {
  const router = useRouter()
  const { user, isOrganizer, isLoaded } = useUser()
  const [activeView, setActiveView] = useState<'events' | 'analytics'>('events')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [organizerEvents, setOrganizerEvents] = useState<EventDetail[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [showEventForm, setShowEventForm] = useState(false)
  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState<string | null>(null)
  const [selectedEventForWaitlist, setSelectedEventForWaitlist] = useState<string | null>(null)
  const [selectedEventForAnalytics, setSelectedEventForAnalytics] = useState<string | null>(null)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [selectedEventForNotification, setSelectedEventForNotification] = useState<any>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedEventForShare, setSelectedEventForShare] = useState<any>(null)

  // Calculate stats from organizerEvents
  const calculateTotalRevenue = () => {
    // Sum up revenue from all events' currentBookings and price
    return organizerEvents.reduce((total, event: any) => {
      // Use currentBookings * price as revenue estimate
      // Or fetch actual payment data if available
      const eventPrice = typeof event.price === 'number' ? event.price : parseFloat(String(event.price || '0').replace('$', '').replace('FREE', '0'))
      const attendees = (event as any).currentBookings || event.attendees || 0
      return total + (eventPrice * attendees)
    }, 0)
  }

  const calculateTotalAttendees = () => {
    return organizerEvents.reduce((total, event: any) => {
      return total + ((event as any).currentBookings || event.attendees || 0)
    }, 0)
  }

  const calculateActiveEvents = () => {
    const now = new Date()
    return organizerEvents.filter((event: any) => {
      try {
        const startDate = new Date(event.startDate)
        return startDate >= now
      } catch {
        return false
      }
    }).length
  }

  // Fetch events from API
  useEffect(() => {
    // Wait for user context to load
    if (!isLoaded) return
    if (!isOrganizer || !user?.id) return

    let isCancelled = false

    const fetchOrganizerData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        const token = localStorage.getItem('token')
        
        if (!token) {
          return
        }

        // Fetch organizer's events
        const eventsResponse = await fetch(`${apiUrl}/api/events/organizer/my-events`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (isCancelled) return
        
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json()
          if (eventsData.success && !isCancelled) {
            setOrganizerEvents(eventsData.data || [])
          }
        }

        // Set notifications to empty for now (will implement API later)
        if (!isCancelled) {
          setNotifications([])
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching organizer data:', error)
        }
      }
    }

    fetchOrganizerData()
    
    return () => {
      isCancelled = true
    }
  }, [isLoaded, isOrganizer, user?.id]) // Run when user properties change

  const handleCreateEvent = () => {
    setEditingEvent(null)
    setShowEventForm(true)
  }

  const handleEditEvent = (event: EventDetail) => {
    setEditingEvent(event)
    setShowEventForm(true)
  }

  const handleEventSave = async (eventData: any) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      if (!token) return

      // Convert frontend event data to API format
      const apiEventData = {
        title: eventData.title,
        description: eventData.description,
        fullDescription: eventData.fullDescription,
        category: eventData.category,
        eventType: eventData.eventType || 'CONFERENCE',
        startDate: eventData.date,
        endDate: eventData.endDate,
        startTime: eventData.time,
        endTime: eventData.endTime,
        isOnline: eventData.isOnline,
        venueName: eventData.venueName,
        address: eventData.address,
        city: eventData.city,
        state: eventData.state,
        zipCode: eventData.zipCode,
        country: eventData.country,
        meetingLink: eventData.meetingLink,
        price: parseFloat(eventData.price) || 0,
        maxAttendees: parseInt(eventData.maxAttendees) || 100,
        image: eventData.image,
        images: eventData.images || [],
        tags: eventData.tags || [],
        requirements: eventData.requirements,
        refundPolicy: eventData.refundPolicy,
        status: eventData.status || 'DRAFT'
      }

      const url = editingEvent 
        ? `${apiUrl}/api/events/${editingEvent.id}`
        : `${apiUrl}/api/events`
      
      const method = editingEvent ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiEventData)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Refresh events list
          const eventsResponse = await fetch(`${apiUrl}/api/events/organizer/my-events`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (eventsResponse.ok) {
            const eventsData = await eventsResponse.json()
            if (eventsData.success) {
              setOrganizerEvents(eventsData.data || [])
            }
          }
          setShowEventForm(false)
          setEditingEvent(null)
        }
      } else {
        const data = await response.json()
        alert(data.message || 'Failed to save event')
      }
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Error saving event. Please try again.')
    }
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

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      if (!token) {
        alert('Please sign in to delete events')
        return
      }

      const response = await fetch(`${apiUrl}/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        // Remove event from local state
        setOrganizerEvents(organizerEvents.filter(event => event.id !== eventId))
        alert('Event deleted successfully!')
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete event' }))
        alert(errorData.message || 'Failed to delete event.')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Error deleting event. Please try again.')
    }
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

  const handlePublishEvent = async (eventId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      if (!token) return

      const response = await fetch(`${apiUrl}/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'PUBLISHED' })
      })

      if (response.ok) {
        // Refresh events list
        const eventsResponse = await fetch(`${apiUrl}/api/events/organizer/my-events`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json()
          if (eventsData.success) {
            setOrganizerEvents(eventsData.data || [])
          }
        }
      }
    } catch (error) {
      console.error('Error publishing event:', error)
    }
  }

  const handleUnpublishEvent = async (eventId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      if (!token) return

      const response = await fetch(`${apiUrl}/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'DRAFT' })
      })

      if (response.ok) {
        // Refresh events list
        const eventsResponse = await fetch(`${apiUrl}/api/events/organizer/my-events`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json()
          if (eventsData.success) {
            setOrganizerEvents(eventsData.data || [])
          }
        }
      }
    } catch (error) {
      console.error('Error unpublishing event:', error)
    }
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

  const markNotificationAsRead = async (id: string) => {
    // REMOVED: localStorage notification updates - Use /api/notifications when implemented
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
    setNotifications(updated)
    // TODO: Call API to mark notification as read when endpoint is available
    // const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
    // const token = localStorage.getItem('token')
    // await fetch(`${apiUrl}/api/notifications/${id}/read`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } })
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
        </div>
      </div>

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
                    ${calculateTotalRevenue().toLocaleString()}
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
                    {calculateTotalAttendees().toLocaleString()}
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
                    {calculateActiveEvents()}
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
                  <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">You haven&apos;t created any events yet.</p>
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
                          {((event as any).status === 'draft' || (event as any).status === 'upcoming') ? (
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
                          ) : ((event as any).status === 'live' || (event as any).status === 'upcoming' || (event as any).status === 'draft') ? (
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
                          {((event as any).status === 'draft' || (event as any).status === 'upcoming') ? (
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
                          ) : ((event as any).status === 'live' || (event as any).status === 'upcoming' || (event as any).status === 'draft') ? (
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
        
        // Get current attendees from event data (already fetched from API)
        const currentAttendees = (event as any).currentBookings || event.attendees || 0

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

export default OrganizerDashboard

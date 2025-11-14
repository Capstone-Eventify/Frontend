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
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import EventFormModal from './EventFormModal'
import AttendeeManagement from './AttendeeManagement'
import EventAnalytics from './EventAnalytics'
import WaitlistManagement from './WaitlistManagement'
import { EventDetail } from '@/types/event'

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
  const [activeView, setActiveView] = useState<'events' | 'analytics'>('events')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  useEffect(() => {
    // Load events from localStorage
    if (typeof window !== 'undefined') {
      const storedEvents = JSON.parse(localStorage.getItem('eventify_organizer_events') || '[]')
      // Merge with mock data
      const mergedEvents = [...storedEvents, ...recentEvents.filter(e => 
        !storedEvents.some((se: any) => se.id === e.id)
      )]
      setOrganizerEvents(mergedEvents)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizer Dashboard</h1>
          <p className="text-gray-600">Manage your events and track performance</p>
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
      <div className="relative">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 inline-flex">
          <button
            onClick={() => {
              setActiveView('events')
              setSelectedEventForAnalytics(null)
            }}
            className={`relative px-6 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 ${
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
            className={`relative px-6 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 ${
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
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select an Event to View Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {organizerEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleViewAnalytics(event.id)}
                  >
                    <img
                      src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}
                      alt={event.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{event.date}</p>
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
          {/* Organizer Stats - Calculate from actual events */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900">{organizerEvents.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Calendar size={24} className="text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
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
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Attendees</p>
                  <p className="text-2xl font-bold text-gray-900">
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
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active Events</p>
                  <p className="text-2xl font-bold text-gray-900">
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
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Activity size={24} className="text-orange-600" />
            </div>
          </div>
            </motion.div>
      </div>

          {/* My Created Events */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">My Created Events</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage and track your events</p>
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
            <div className="p-6">
              {organizerEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">You haven't created any events yet.</p>
                  <Button onClick={handleCreateEvent}>
                    <Plus size={16} className="mr-2" />
                    Create Your First Event
                  </Button>
          </div>
              ) : viewMode === 'grid' ? (
                // Grid View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-2" />
                            {event.date}
                          </div>
                          <div className="flex items-center">
                            <Users size={14} className="mr-2" />
                            {event.attendees?.toLocaleString() || 0} attendees
                  </div>
                </div>
                        <div className="flex flex-wrap gap-2">
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
                <div className="space-y-4">
                  {organizerEvents.map((event, index) => (
              <motion.div
                      key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 cursor-pointer"
                      onClick={() => handleViewEvent(event.id)}
                    >
                      <img
                        src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}
                        alt={event.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{event.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span>{event.date}</span>
                          <span>{event.attendees?.toLocaleString() || 0} attendees</span>
          </div>
        </div>
                      <div className="flex items-center space-x-2">
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

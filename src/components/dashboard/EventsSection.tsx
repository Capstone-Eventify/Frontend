'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Search,
  Grid,
  List,
  Star,
  Heart,
  Share2,
  ArrowRight,
  Edit,
  Bell,
  Ticket
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useUser } from '@/contexts/UserContext'
import { useAuth } from '@/contexts/AuthContext'
import EventFormModal from './EventFormModal'
import NotificationModal from '@/components/events/NotificationModal'
import { eventDetails } from '@/data/eventDetails'

// Mock data
const mockEvents = [
  {
    id: '1',
    title: 'Tech Innovation Summit 2024',
    description: 'Explore the latest in AI, blockchain, and emerging technologies with industry leaders.',
    date: 'Dec 15, 2024',
    time: '9:00 AM - 5:00 PM',
    location: 'San Francisco, CA',
    price: '$89',
    attendees: 2847,
    maxAttendees: 3000,
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    status: 'upcoming',
    isFavorite: true,
    rating: 4.8
  },
  {
    id: '2',
    title: 'Digital Marketing Masterclass',
    description: 'Learn advanced strategies for social media, SEO, and content marketing from experts.',
    date: 'Dec 20, 2024',
    time: '2:00 PM - 6:00 PM',
    location: 'Online Event',
    price: 'FREE',
    attendees: 1234,
    maxAttendees: 2000,
    category: 'Marketing',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    status: 'upcoming',
    isFavorite: false,
    rating: 4.6
  },
  {
    id: '3',
    title: 'Global Design Conference',
    description: 'Three days of inspiring talks, workshops, and networking with top designers worldwide.',
    date: 'Jan 5, 2025',
    time: '10:00 AM - 6:00 PM',
    location: 'New York, NY',
    price: '$149',
    attendees: 5621,
    maxAttendees: 6000,
    category: 'Design',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    status: 'upcoming',
    isFavorite: true,
    rating: 4.9
  },
  {
    id: '4',
    title: 'Startup Pitch Competition',
    description: 'Watch innovative startups pitch their ideas to a panel of investors and industry experts.',
    date: 'Jan 12, 2025',
    time: '1:00 PM - 4:00 PM',
    location: 'Austin, TX',
    price: '$25',
    attendees: 456,
    maxAttendees: 500,
    category: 'Business',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    status: 'upcoming',
    isFavorite: false,
    rating: 4.7
  }
]

const categories = ['All', 'Technology', 'Marketing', 'Design', 'Business', 'Education']

type TabType = 'all' | 'my-events' | 'my-created-events'

// Helper function to check if event has ended
const isEventEnded = (eventDate: string, eventTime?: string) => {
  try {
    // Parse date string (e.g., "Dec 15, 2024")
    const dateParts = eventDate.split(', ')
    if (dateParts.length < 2) return false
    
    const year = parseInt(dateParts[1])
    const monthDay = dateParts[0].split(' ')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = monthNames.indexOf(monthDay[0])
    const day = parseInt(monthDay[1])
    
    const eventDateTime = new Date(year, month, day)
    const now = new Date()
    
    return eventDateTime < now
  } catch {
    return false
  }
}

export default function EventsSection() {
  const router = useRouter()
  const { isAuthenticated, user, isOrganizer } = useUser()
  const { openAuthModal } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [favorites, setFavorites] = useState<string[]>([])
  const [allEvents, setAllEvents] = useState<any[]>([])
  const [myRegisteredEvents, setMyRegisteredEvents] = useState<any[]>([])
  const [myCreatedEvents, setMyCreatedEvents] = useState<any[]>([])
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [selectedEventForNotification, setSelectedEventForNotification] = useState<any>(null)

  // Load data on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load favorites
      const storedFavorites = localStorage.getItem('eventify_favorites')
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites))
      }

      // Load all events (merge mock events, eventDetails, and organizer events)
      const organizerEvents = JSON.parse(localStorage.getItem('eventify_organizer_events') || '[]')
      
      // Convert eventDetails to the format we need
      const formattedEventDetails = eventDetails.map(ed => ({
        id: ed.id,
        title: ed.title,
        description: ed.description,
        date: ed.date,
        time: ed.time,
        location: ed.location,
        price: ed.price,
        attendees: ed.attendees || 0,
        maxAttendees: ed.maxAttendees || 0,
        category: ed.category || 'Other',
        image: ed.image,
        status: ed.status || 'upcoming',
        isFavorite: false,
        rating: ed.rating || 4.5
      }))

      // Merge all events, avoiding duplicates
      // Filter out draft events for non-organizers (only show drafts to their organizers)
      const mergedEvents = [
        ...mockEvents,
        ...formattedEventDetails.filter(e => !mockEvents.some(me => me.id === e.id)),
        ...organizerEvents.filter((e: any) => {
          // Show draft events only to their organizers
          if (e.status === 'draft') {
            return isOrganizer && (e.organizerId === user?.id || !e.organizerId)
          }
          // Show non-draft events to everyone
          return !mockEvents.some(me => me.id === e.id) && !formattedEventDetails.some(fe => fe.id === e.id)
        })
      ]
      setAllEvents(mergedEvents)

      // Load user's registered events from tickets
      if (user?.id) {
        const tickets = JSON.parse(localStorage.getItem('eventify_tickets') || '[]')
        const userTickets = tickets.filter((t: any) => t.status === 'confirmed')
        
        // Get unique event IDs from tickets
        const registeredEventIds = Array.from(new Set(userTickets.map((t: any) => t.eventId || t.eventTitle))) as string[]
        
        // Find events that match registered event IDs
        const registeredEvents = mergedEvents.filter(e => 
          registeredEventIds.some((id: string) => id === e.id || id === e.title)
        )
        setMyRegisteredEvents(registeredEvents)

        // Load organizer's created events
        if (isOrganizer) {
          const myEvents = organizerEvents.filter((e: any) => e.organizerId === user.id || !e.organizerId)
          setMyCreatedEvents(myEvents)
        }
      }
    }
  }, [user?.id, isOrganizer])

  const toggleFavorite = (eventId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      openAuthModal('signin', `/events/${eventId}`)
      return
    }

    const newFavorites = favorites.includes(eventId)
      ? favorites.filter(id => id !== eventId)
      : [...favorites, eventId]
    
    setFavorites(newFavorites)
    localStorage.setItem('eventify_favorites', JSON.stringify(newFavorites))
  }

  const handleShare = (eventId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/events/${eventId}`
    navigator.clipboard.writeText(url).then(() => {
      alert('Event link copied to clipboard!')
    })
  }

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`)
  }

  const handleEditEvent = (event: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingEvent(event)
    setShowEventForm(true)
  }

  const handleSendNotification = (event: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedEventForNotification(event)
    setShowNotificationModal(true)
  }

  const handleEventSave = (eventData: any) => {
    if (typeof window !== 'undefined') {
      const storedEvents = JSON.parse(localStorage.getItem('eventify_organizer_events') || '[]')
      
      if (editingEvent) {
        // Update existing event
        const updatedEvents = storedEvents.map((e: any) => 
          e.id === editingEvent.id ? { ...eventData, id: editingEvent.id } : e
        )
        localStorage.setItem('eventify_organizer_events', JSON.stringify(updatedEvents))
        setMyCreatedEvents(updatedEvents.filter((e: any) => e.organizerId === user?.id || !e.organizerId))
      } else {
        // Create new event
        const newEvent = { ...eventData, id: `event_${Date.now()}`, organizerId: user?.id }
        localStorage.setItem('eventify_organizer_events', JSON.stringify([...storedEvents, newEvent]))
        setMyCreatedEvents([...myCreatedEvents, newEvent])
      }
      
      // Update all events list
      const updatedAllEvents = allEvents.map(e => 
        e.id === editingEvent?.id ? { ...eventData, id: editingEvent.id } : e
      )
      if (!editingEvent) {
        updatedAllEvents.push({ ...eventData, id: `event_${Date.now()}` })
      }
      setAllEvents(updatedAllEvents)
    }
    
    setShowEventForm(false)
    setEditingEvent(null)
  }

  // Get events based on active tab
  const getEventsForTab = (): any[] => {
    switch (activeTab) {
      case 'my-events':
        return myRegisteredEvents
      case 'my-created-events':
        return myCreatedEvents
      default:
        return allEvents
    }
  }

  // Filter events
  const filteredEvents = useMemo(() => {
    const events = getEventsForTab()
    return events.filter(event => {
      // Category filter only applies to "All Events" tab
      const matchesCategory = activeTab !== 'all' || selectedCategory === 'All' || event.category === selectedCategory
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.location?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [activeTab, selectedCategory, searchQuery, allEvents, myRegisteredEvents, myCreatedEvents])

  const renderEventCard = (event: any, index: number) => {
    const isEnded = isEventEnded(event.date, event.time) || event.status === 'ended' || event.status === 'cancelled'
    const isMyEvent = activeTab === 'my-created-events'
    const isDraft = event.status === 'draft'

    return (
      <motion.div
        key={event.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => handleEventClick(event.id)}
      >
        <div className="relative">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-4 right-4 flex space-x-2">
            {!isMyEvent && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className={`bg-white/90 backdrop-blur-sm ${favorites.includes(event.id) ? 'text-red-500' : ''}`}
                  onClick={(e) => toggleFavorite(event.id, e)}
                >
                  <Heart size={16} className={favorites.includes(event.id) ? 'fill-current' : ''} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/90 backdrop-blur-sm"
                  onClick={(e) => handleShare(event.id, e)}
                >
                  <Share2 size={16} />
                </Button>
              </>
            )}
            {isMyEvent && !isEnded && (
              <Button
                variant="outline"
                size="sm"
                className="bg-white/90 backdrop-blur-sm"
                onClick={(e) => handleEditEvent(event, e)}
              >
                <Edit size={16} />
              </Button>
            )}
            {isMyEvent && isEnded && (
              <Button
                variant="outline"
                size="sm"
                className="bg-white/90 backdrop-blur-sm"
                onClick={(e) => handleSendNotification(event, e)}
              >
                <Bell size={16} />
              </Button>
            )}
          </div>
          <Badge className="absolute top-4 left-4">
            {event.category}
          </Badge>
          {isDraft && (
            <Badge variant="warning" className="absolute top-4 left-32">
              Draft
            </Badge>
          )}
          {isEnded && (
            <Badge variant="error" className="absolute bottom-4 left-4">
              Ended
            </Badge>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{event.title}</h3>
            {event.rating && (
              <div className="flex items-center ml-2">
                <Star size={16} className="text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-700 ml-1">{event.rating}</span>
              </div>
            )}
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar size={16} className="mr-2" />
              {event.date}
            </div>
            {event.time && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock size={16} className="mr-2" />
                {event.time}
              </div>
            )}
            <div className="flex items-center text-sm text-gray-600">
              <MapPin size={16} className="mr-2" />
              {event.location}
            </div>
            {event.attendees !== undefined && (
              <div className="flex items-center text-sm text-gray-600">
                <Users size={16} className="mr-2" />
                {event.attendees.toLocaleString()} / {event.maxAttendees?.toLocaleString() || '∞'} attendees
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-900">{event.price || 'FREE'}</div>
            {!isMyEvent && !isEnded && (
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (isAuthenticated) {
                    router.push(`/events/${event.id}/checkout`)
                  } else {
                    router.push(`/events/${event.id}`)
                  }
                }}
              >
                Register
                <ArrowRight size={16} className="ml-2" />
              </Button>
            )}
            {!isMyEvent && isEnded && (
              <Badge variant="error" className="ml-auto">
                {event.status === 'cancelled' ? 'Cancelled' : 'Ended'}
              </Badge>
            )}
            {isMyEvent && (
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  router.push(`/events/${event.id}`)
                }}
              >
                View Details
                <ArrowRight size={16} className="ml-2" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  const renderEventList = (event: any, index: number) => {
    const isEnded = isEventEnded(event.date, event.time) || event.status === 'ended' || event.status === 'cancelled'
    const isMyEvent = activeTab === 'my-created-events'

    return (
      <motion.div
        key={event.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => handleEventClick(event.id)}
      >
        <div className="flex items-start space-x-4">
          <img
            src={event.image}
            alt={event.title}
            className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{event.description}</p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {!isMyEvent && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={favorites.includes(event.id) ? 'text-red-500' : ''}
                      onClick={(e) => toggleFavorite(event.id, e)}
                    >
                      <Heart size={16} className={favorites.includes(event.id) ? 'fill-current' : ''} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => handleShare(event.id, e)}
                    >
                      <Share2 size={16} />
                    </Button>
                  </>
                )}
                {isMyEvent && !isEnded && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => handleEditEvent(event, e)}
                  >
                    <Edit size={16} />
                  </Button>
                )}
                {isMyEvent && isEnded && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => handleSendNotification(event, e)}
                  >
                    <Bell size={16} />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center">
                <Calendar size={16} className="mr-1" />
                {event.date}
              </div>
              {event.time && (
                <div className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  {event.time}
                </div>
              )}
              <div className="flex items-center">
                <MapPin size={16} className="mr-1" />
                {event.location}
              </div>
              {event.attendees !== undefined && (
                <div className="flex items-center">
                  <Users size={16} className="mr-1" />
                  {event.attendees.toLocaleString()} attendees
                </div>
              )}
              {event.rating && (
                <div className="flex items-center">
                  <Star size={16} className="text-yellow-400 fill-current mr-1" />
                  {event.rating}
                </div>
              )}
              {isEnded && (
                <Badge variant="error">Ended</Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge>{event.category}</Badge>
                <span className="text-2xl font-bold text-gray-900">{event.price || 'FREE'}</span>
              </div>
              {!isMyEvent && !isEnded && (
                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (isAuthenticated) {
                      router.push(`/events/${event.id}/checkout`)
                    } else {
                      router.push(`/events/${event.id}`)
                    }
                  }}
                >
                  Register
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              )}
              {!isMyEvent && isEnded && (
                <Badge variant="error">
                  {event.status === 'cancelled' ? 'Cancelled' : 'Ended'}
                </Badge>
              )}
              {isMyEvent && (
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    router.push(`/events/${event.id}`)
                  }}
                >
                  View Details
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600">Discover and join amazing events</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 inline-flex">
          <button
            onClick={() => setActiveTab('all')}
            className={`relative px-6 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'all'
                ? 'text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {activeTab === 'all' && (
              <motion.div
                layoutId="eventsActiveTab"
                className="absolute inset-0 bg-primary-600 rounded-md"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">All Events</span>
          </button>
          {isAuthenticated && (
            <button
              onClick={() => setActiveTab('my-events')}
              className={`relative px-6 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'my-events'
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {activeTab === 'my-events' && (
                <motion.div
                  layoutId="eventsActiveTab"
                  className="absolute inset-0 bg-primary-600 rounded-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Ticket size={16} className="relative z-10" />
              <span className="relative z-10">My Events</span>
            </button>
          )}
          {isOrganizer && (
            <button
              onClick={() => setActiveTab('my-created-events')}
              className={`relative px-6 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'my-created-events'
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {activeTab === 'my-created-events' && (
                <motion.div
                  layoutId="eventsActiveTab"
                  className="absolute inset-0 bg-primary-600 rounded-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Calendar size={16} className="relative z-10" />
              <span className="relative z-10">My Created Events</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters and Search - Only show for "All Events" tab */}
      {activeTab === 'all' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none border-r-0"
              >
                <Grid size={16} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search only for other tabs */}
      {activeTab !== 'all' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none border-r-0"
              >
                <Grid size={16} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Events Grid/List */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-600">
            {activeTab === 'my-events' 
              ? "You haven't registered for any events yet."
              : activeTab === 'my-created-events'
              ? "You haven't created any events yet."
              : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => renderEventCard(event, index))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event, index) => renderEventList(event, index))}
        </div>
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
          eventData={editingEvent}
          onSave={handleEventSave}
        />
      )}

      {/* Notification Modal */}
      {showNotificationModal && selectedEventForNotification && (
        <NotificationModal
          isOpen={showNotificationModal}
          onClose={() => {
            setShowNotificationModal(false)
            setSelectedEventForNotification(null)
          }}
          eventTitle={selectedEventForNotification.title}
          eventId={selectedEventForNotification.id}
        />
      )}
    </div>
  )
}

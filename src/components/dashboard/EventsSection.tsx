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
import ShareEventModal from '@/components/events/ShareEventModal'
// REMOVED: Mock data - Now fetching from API

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
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedEventForShare, setSelectedEventForShare] = useState<any>(null)

  // Fetch events from API
  useEffect(() => {
    let isCancelled = false
    
    const fetchEvents = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        
        // Fetch all events from API
        let allEventsData: any[] = []
        const eventsResponse = await fetch(`${apiUrl}/api/events`)
        
        if (isCancelled) return
        
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json()
          if (eventsData.success && !isCancelled) {
            allEventsData = eventsData.data || []
            setAllEvents(allEventsData)
          }
        }

        // Fetch user-specific data in parallel if authenticated
        if (user?.id) {
          const token = localStorage.getItem('token')
          console.log('🔍 Fetching events - User:', {
            id: user.id,
            role: user.role,
            isOrganizer: isOrganizer,
            hasToken: !!token
          })
          if (token && !isCancelled) {
            // Parallelize API calls for better performance
            const [favoritesResponse, ticketsResponse, myEventsResponse] = await Promise.all([
              fetch(`${apiUrl}/api/favorites`, {
                headers: { 'Authorization': `Bearer ${token}` }
              }),
              fetch(`${apiUrl}/api/tickets`, {
                headers: { 'Authorization': `Bearer ${token}` }
              }),
              isOrganizer ? fetch(`${apiUrl}/api/events/organizer/my-events`, {
                headers: { 'Authorization': `Bearer ${token}` }
              }).catch(err => {
                console.error('❌ Error fetching organizer events:', err)
                return null
              }) : Promise.resolve(null)
            ])

            if (isCancelled) return

            // Process favorites
            if (favoritesResponse.ok) {
              const favoritesData = await favoritesResponse.json()
              if (favoritesData.success && !isCancelled) {
                const favoriteIds = favoritesData.data.map((e: any) => e.id)
                setFavorites(favoriteIds)
              }
            }

            // Process tickets
            if (ticketsResponse.ok) {
              const ticketsData = await ticketsResponse.json()
              if (ticketsData.success && !isCancelled) {
                const registeredEventIds = Array.from(new Set(ticketsData.data.map((t: any) => t.eventId))) as string[]
                const registeredEvents = allEventsData.filter((e: any) => 
                  registeredEventIds.includes(e.id)
                )
                setMyRegisteredEvents(registeredEvents)
              }
            }

            // Process organizer events
            if (isOrganizer) {
              if (myEventsResponse) {
                if (myEventsResponse.ok) {
              const myEventsData = await myEventsResponse.json()
                  console.log('✅ Organizer events API response:', {
                    success: myEventsData.success,
                    count: myEventsData.count,
                    dataLength: myEventsData.data?.length || 0
                  })
              if (myEventsData.success && !isCancelled) {
                setMyCreatedEvents(myEventsData.data || [])
                    console.log('✅ Set myCreatedEvents:', myEventsData.data?.length || 0, 'events')
                  }
                } else {
                  const errorData = await myEventsResponse.json().catch(() => ({}))
                  console.error('❌ Organizer events API failed:', {
                    status: myEventsResponse.status,
                    statusText: myEventsResponse.statusText,
                    error: errorData
                  })
                }
              } else {
                console.warn('⚠️ myEventsResponse is null - isOrganizer check might have failed')
              }
            } else {
              console.log('ℹ️ User is not an organizer, skipping organizer events fetch. Role:', user?.role)
            }
          }
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching events:', error)
        }
      }
    }

    fetchEvents()
    
    return () => {
      isCancelled = true
    }
  }, [user?.id, isOrganizer])

  const toggleFavorite = async (eventId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      openAuthModal('signin', `/events/${eventId}`)
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      if (!token) {
        openAuthModal('signin', `/events/${eventId}`)
        return
      }

      const isCurrentlyFavorite = favorites.includes(eventId)
      
      if (isCurrentlyFavorite) {
        // Remove from favorites
        const response = await fetch(`${apiUrl}/api/favorites/${eventId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          setFavorites(favorites.filter(id => id !== eventId))
        }
      } else {
        // Add to favorites
        const response = await fetch(`${apiUrl}/api/favorites`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ eventId })
        })
        if (response.ok) {
          setFavorites([...favorites, eventId])
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleShare = async (eventId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      // Find the event from allEvents first
      let eventToShare = allEvents.find(ev => ev.id === eventId)
      
      // If not found in allEvents, fetch from API
      if (!eventToShare) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        const response = await fetch(`${apiUrl}/api/events/${eventId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            eventToShare = data.data
          }
        }
      }
      
      if (eventToShare) {
        // Convert to EventDetail format if needed
        const formattedEvent = {
          id: eventToShare.id,
          title: eventToShare.title,
          description: eventToShare.description || '',
          fullDescription: eventToShare.fullDescription || eventToShare.description || '',
          date: eventToShare.date || (eventToShare.startDate ? new Date(eventToShare.startDate).toISOString().split('T')[0] : ''),
          time: eventToShare.time || eventToShare.startTime || '',
          location: eventToShare.location || (eventToShare.isOnline ? 'Online Event' : `${eventToShare.city || ''}, ${eventToShare.state || ''}`.trim() || 'TBA'),
          isOnline: eventToShare.isOnline || false,
          category: eventToShare.category || '',
          image: eventToShare.image || '',
          price: eventToShare.price || 'FREE',
          ticketTiers: eventToShare.ticketTiers || [],
          maxAttendees: eventToShare.maxAttendees || 0,
          attendees: eventToShare.attendees || (eventToShare as any).currentBookings || 0,
          status: eventToShare.status || 'upcoming',
          organizer: eventToShare.organizer || {
            id: eventToShare.organizerId || 'unknown',
            name: 'Event Organizer',
            email: 'organizer@example.com'
          },
          createdAt: eventToShare.createdAt || new Date().toISOString()
        }
        
        setSelectedEventForShare(formattedEvent)
        setShowShareModal(true)
      }
    } catch (error) {
      console.error('Error fetching event for share:', error)
    }
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

  const handleEventSave = async (eventData: any) => {
    // Events are now managed via API, no localStorage needed
    // This function should be handled by EventFormModal which calls the API
    // Refresh events from API after save
    if (user?.id && isOrganizer) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        const token = localStorage.getItem('token')
        if (token) {
          const response = await fetch(`${apiUrl}/api/events/organizer/my-events`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              setMyCreatedEvents(data.data || [])
            }
          }
        }
      } catch (error) {
        console.error('Error refreshing events:', error)
      }
    }
    
    // Update all events list
    const updatedAllEvents = allEvents.map(e => 
      e.id === editingEvent?.id ? { ...eventData, id: editingEvent.id } : e
    )
    if (!editingEvent) {
      updatedAllEvents.push({ ...eventData, id: `event_${Date.now()}` })
    }
    setAllEvents(updatedAllEvents)
    
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

      {/* Share Event Modal */}
      {showShareModal && selectedEventForShare && (
        <ShareEventModal
          event={selectedEventForShare}
          onClose={() => {
            setShowShareModal(false)
            setSelectedEventForShare(null)
          }}
        />
      )}
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, Users, Heart, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { useUser } from '@/contexts/UserContext'
import { useAuth } from '@/contexts/AuthContext'
import ShareEventModal from '@/components/events/ShareEventModal'
import { EventDetail } from '@/types/event'

const LiveEventsSection = () => {
  const router = useRouter()
  const { isAuthenticated, user } = useUser()
  const { openAuthModal } = useAuth()
  const [liveEvents, setLiveEvents] = useState<any[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedEventForShare, setSelectedEventForShare] = useState<EventDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch live events and favorites from API
  useEffect(() => {
    let isCancelled = false
    
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        
        // Fetch live events (always needed)
        const eventsPromise = fetch(`${apiUrl}/api/events?status=LIVE&limit=3`)
        
        // Fetch favorites in parallel if authenticated
        const token = isAuthenticated && user?.id ? localStorage.getItem('token') : null
        const favoritesPromise = token ? fetch(`${apiUrl}/api/favorites`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }) : null

        // Wait for both requests
        const [eventsResponse, favoritesResponse] = await Promise.all([
          eventsPromise,
          favoritesPromise || Promise.resolve(null)
        ])

        if (isCancelled) return

        // Process events
        if (eventsResponse.ok) {
          const data = await eventsResponse.json()
          if (data.success && !isCancelled) {
            const formattedEvents = (data.data || []).map((event: any) => ({
              id: event.id,
              title: event.title,
              description: event.description,
              location: event.isOnline ? 'Online Event' : (event.venueName || event.location || 'TBA'),
              price: event.price || 'FREE',
              attendees: event.attendees || event._count?.tickets || 0,
              status: 'LIVE NOW',
              timeInfo: event.startTime ? `Started at ${event.startTime}` : 'Happening now',
              image: event.image || '/placeholder-event.jpg',
              buttonText: 'Join Now',
              buttonVariant: 'primary' as const,
              date: event.date || event.startDate,
              time: event.time || event.startTime,
              category: event.category
            }))
            setLiveEvents(formattedEvents)
          }
        }

        // Process favorites
        if (favoritesResponse && favoritesResponse.ok && !isCancelled) {
          const favData = await favoritesResponse.json()
          if (favData.success) {
            const favoriteIds = (favData.data || []).map((fav: any) => fav.eventId)
            setFavorites(favoriteIds)
          }
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching data:', error)
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchData()
    
    return () => {
      isCancelled = true
    }
  }, [isAuthenticated, user?.id]) // Run when authentication state changes

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

  const handleShare = (event: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Convert event to EventDetail format
    const eventToShare: EventDetail = {
      id: event.id,
      title: event.title,
      description: event.description || '',
      fullDescription: event.description || '',
      date: event.date || '',
      time: event.time || '',
      location: event.location || '',
      isOnline: event.location?.toLowerCase().includes('online') || false,
      category: event.category || '',
      image: event.image || '',
      price: event.price || 'FREE',
      ticketTiers: [],
      maxAttendees: event.maxAttendees || 0,
      attendees: event.attendees || 0,
      status: event.status || 'live',
      organizer: {
        id: 'unknown',
        name: 'Event Organizer',
        email: 'organizer@example.com'
      },
      createdAt: new Date().toISOString()
    }
    
    setSelectedEventForShare(eventToShare)
    setShowShareModal(true)
  }

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`)
  }

  return (
    <section id="live-events-section" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="space-y-12"
        >
          {/* Section Header */}
          <motion.div
            variants={fadeInUp}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-600 font-semibold text-sm uppercase tracking-wider">
                Live Events
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 px-4">
              Happening Now
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Join these exciting events currently taking place.
            </p>
          </motion.div>

          {/* Events Grid */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {isLoading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading live events...</p>
              </div>
            ) : liveEvents.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">No live events at the moment. Check back soon!</p>
              </div>
            ) : (
              liveEvents.map((event, index) => {
              const isFavorite = favorites.includes(event.id)
              return (
                <motion.div
                  key={event.id}
                  variants={fadeInUp}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                  onClick={() => handleEventClick(event.id)}
                >
                  {/* Event Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="live">
                        {event.status}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => toggleFavorite(event.id, e)}
                        className={`bg-white/90 backdrop-blur-sm ${isFavorite ? 'text-red-500' : ''}`}
                      >
                        <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleShare(event, e)}
                        className="bg-white/90 backdrop-blur-sm"
                      >
                        <Share2 size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {event.description}
                      </p>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={16} />
                        <span>{event.timeInfo}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users size={16} />
                        <span>{event.attendees.toLocaleString()} attending</span>
                      </div>
                    </div>

                    {/* Price and Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-2xl font-bold text-primary-600">
                        {event.price}
                      </div>
                      <Button
                        variant={event.buttonVariant}
                        size="sm"
                        className="flex-shrink-0"
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
                        {event.buttonText}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            }))}
          </motion.div>

          {/* View All Button */}
          <motion.div
            variants={fadeInUp}
            className="text-center"
          >
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-3"
              onClick={() => {
                if (isAuthenticated) {
                  router.push('/dashboard?tab=events')
                } else {
                  // Scroll to top of events section (already viewing it)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              }}
            >
              View All Live Events
            </Button>
          </motion.div>
        </motion.div>
      </div>

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
    </section>
  )
}

export default LiveEventsSection

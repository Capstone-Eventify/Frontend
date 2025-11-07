'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Heart, 
  Share2, 
  ArrowLeft,
  Star,
  User,
  ExternalLink,
  CheckCircle,
  ArrowUp,
  Ticket,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { getEventById } from '@/data/eventDetails'
import { useUser } from '@/contexts/UserContext'
import { useAuth } from '@/contexts/AuthContext'
import ShareEventModal from '@/components/events/ShareEventModal'
import ImageGallery from '@/components/events/ImageGallery'
import CommunicationBoard from '@/components/events/CommunicationBoard'
import UpgradeTicketModal from '@/components/events/UpgradeTicketModal'
import OrganizerProfileModal from '@/components/events/OrganizerProfileModal'
import AdminDeleteEventModal from '@/components/dashboard/AdminDeleteEventModal'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, isOrganizer, isAdmin, user } = useUser()
  const { openAuthModal } = useAuth()
  const [event, setEvent] = useState<any>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [userTickets, setUserTickets] = useState<any[]>([])
  const [isRegistered, setIsRegistered] = useState(false)
  const [registeredTierIds, setRegisteredTierIds] = useState<string[]>([])
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedTicketForUpgrade, setSelectedTicketForUpgrade] = useState<{
    tierName: string
    tierPrice: number
    tierDescription?: string
    tickets: any[]
  } | null>(null)
  const [showOrganizerModal, setShowOrganizerModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isEventOwner, setIsEventOwner] = useState(false)

  // Scroll to top when route changes - run after component fully renders
  useEffect(() => {
    // Disable Next.js scroll restoration temporarily
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      const originalScrollRestoration = window.history.scrollRestoration
      window.history.scrollRestoration = 'manual'
      
      // Prevent any scroll behavior from smooth scrolling
      const html = document.documentElement
      const body = document.body
      const originalScrollBehavior = html.style.scrollBehavior
      const originalBodyScrollBehavior = body.style.scrollBehavior
      
      html.style.scrollBehavior = 'auto'
      body.style.scrollBehavior = 'auto'
      
      const scrollToTop = () => {
        // Force scroll to top using multiple methods
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
        window.scroll(0, 0)
        html.scrollTop = 0
        body.scrollTop = 0
        
        // Note: Don't reset scrollable containers like CommunicationBoard
        // They should maintain their own scroll position
      }
      
      // Scroll immediately
      scrollToTop()
      
      // Use requestAnimationFrame for immediate execution
      requestAnimationFrame(() => {
        scrollToTop()
      })
      
      // Scroll after render (use multiple timeouts to catch all render cycles)
      const timeout1 = setTimeout(scrollToTop, 0)
      const timeout2 = setTimeout(scrollToTop, 50)
      const timeout3 = setTimeout(scrollToTop, 100)
      const timeout4 = setTimeout(() => {
        scrollToTop()
      }, 200)
      
      // Final check after all components have rendered
      const timeout5 = setTimeout(() => {
        scrollToTop()
        // Restore scroll behavior after we're done
        html.style.scrollBehavior = originalScrollBehavior || ''
        body.style.scrollBehavior = originalBodyScrollBehavior || ''
        window.history.scrollRestoration = originalScrollRestoration
      }, 300)
      
      return () => {
        clearTimeout(timeout1)
        clearTimeout(timeout2)
        clearTimeout(timeout3)
        clearTimeout(timeout4)
        clearTimeout(timeout5)
        html.style.scrollBehavior = originalScrollBehavior || ''
        body.style.scrollBehavior = originalBodyScrollBehavior || ''
        window.history.scrollRestoration = originalScrollRestoration
      }
    } else {
      // Fallback for browsers without scrollRestoration
      const scrollToTop = () => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
        window.scroll(0, 0)
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
      }
      
      scrollToTop()
      const timeout1 = setTimeout(scrollToTop, 0)
      const timeout2 = setTimeout(scrollToTop, 100)
      const timeout3 = setTimeout(scrollToTop, 200)
      
      return () => {
        clearTimeout(timeout1)
        clearTimeout(timeout2)
        clearTimeout(timeout3)
      }
    }
  }, [params.id])

  useEffect(() => {
    // Try to get event from eventDetails first
    let foundEvent = getEventById(params.id as string)
    
    // If not found, check organizer events in localStorage
    if (!foundEvent && typeof window !== 'undefined') {
      const organizerEvents = JSON.parse(localStorage.getItem('eventify_organizer_events') || '[]')
      foundEvent = organizerEvents.find((e: any) => e.id === params.id)
    }
    
    setEvent(foundEvent)
    
    if (foundEvent) {
      // Check if event is in favorites
      const favorites = JSON.parse(localStorage.getItem('eventify_favorites') || '[]')
      setIsFavorite(favorites.includes(foundEvent.id))

      // Check if user is the event owner (organizer)
      if (isAuthenticated && user && typeof window !== 'undefined') {
        // Check organizerId from localStorage events
        const organizerEvents = JSON.parse(localStorage.getItem('eventify_organizer_events') || '[]')
        const eventFromStorage = organizerEvents.find((e: any) => e.id === foundEvent.id)
        const eventOrganizerId = eventFromStorage?.organizerId || foundEvent.organizer?.id
        
        // Check if current user is the organizer
        if (eventOrganizerId === user.id || (foundEvent.organizer?.id && foundEvent.organizer.id === user.id)) {
          setIsEventOwner(true)
        }

        // Check if user has registered for this event
        const tickets = JSON.parse(localStorage.getItem('eventify_tickets') || '[]')
        const eventTickets = tickets.filter((t: any) => 
          t.eventId === foundEvent.id && 
          t.status === 'confirmed'
        )
        
        if (eventTickets.length > 0) {
          setUserTickets(eventTickets)
          setIsRegistered(true)
          // Get unique tier IDs that user has tickets for
          const tierIds = [...new Set(eventTickets.map((t: any) => t.ticketTierId).filter(Boolean))]
          setRegisteredTierIds(tierIds)
        }
      } else {
        setIsEventOwner(false)
      }
    }
  }, [params.id, isAuthenticated, user])

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    )
  }

  // Check if event is draft and user is not the organizer
  if (event.status === 'draft' && !isEventOwner && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Available</h1>
          <p className="text-gray-600 mb-4">This event is not currently available for viewing.</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    )
  }

  const toggleFavorite = () => {
    if (!isAuthenticated) {
      // Open auth modal with redirect URL
      openAuthModal('signin', `/events/${event.id}`)
      return
    }

    const favorites = JSON.parse(localStorage.getItem('eventify_favorites') || '[]')
    let newFavorites: string[]

    if (isFavorite) {
      newFavorites = favorites.filter((id: string) => id !== event.id)
    } else {
      newFavorites = [...favorites, event.id]
    }

    localStorage.setItem('eventify_favorites', JSON.stringify(newFavorites))
    setIsFavorite(!isFavorite)
  }

  const handleRegister = () => {
    // Admins cannot register for events
    if (isAdmin) {
      return
    }
    
    // Organizers cannot register for their own events
    if (isEventOwner) {
      return
    }
    
    if (!isAuthenticated) {
      // Open auth modal with redirect URL to checkout
      openAuthModal('signin', `/events/${event.id}/checkout`)
      return
    }
    router.push(`/events/${event.id}/checkout`)
  }

  const handleViewTickets = () => {
    router.push('/dashboard?tab=tickets')
  }

  const handleUpgradeClick = (tierName: string, tierPrice: number, tierDescription: string | undefined, tickets: any[]) => {
    setSelectedTicketForUpgrade({
      tierName,
      tierPrice,
      tierDescription,
      tickets
    })
    setShowUpgradeModal(true)
  }

  const handleUpgrade = (tierId: string) => {
    // Navigate to checkout with upgrade intent
    router.push(`/events/${event.id}/checkout?upgrade=${tierId}`)
  }

  // Get upgradeable tiers (tiers with higher price than what user currently has)
  const getUpgradeableTiers = () => {
    if (!isRegistered || !event.ticketTiers) return []
    
    // Get the highest price tier user currently has
    const userTierPrices = userTickets
      .map((t: any) => {
        const price = typeof t.price === 'string' ? parseFloat(t.price.replace('$', '')) : (t.price || 0)
        return price
      })
      .filter(price => !isNaN(price))
    
    const maxUserTierPrice = userTierPrices.length > 0 ? Math.max(...userTierPrices) : 0
    
    // Return tiers with price higher than user's current max
    return event.ticketTiers.filter(tier => tier.price > maxUserTierPrice)
  }

  const upgradeableTiers = getUpgradeableTiers()

  const handleShare = () => {
    setShowShareModal(true)
  }

  const handleViewOrganizer = () => {
    setShowOrganizerModal(true)
  }

  const handleDeleteEvent = () => {
    if (!event) return
    // Allow admins and event owners to delete
    if (isAdmin || isEventOwner) {
      setShowDeleteModal(true)
    }
  }

  const confirmDeleteEvent = (reason: string) => {
    if (!event) return

    // Get organizer's user ID from the event
    const organizerEvents = JSON.parse(localStorage.getItem('eventify_organizer_events') || '[]')
    const eventFromStorage = organizerEvents.find((e: any) => e.id === event.id)
    const organizerUserId = eventFromStorage?.organizerId || event.organizer?.id

    // Delete event from localStorage
    const updatedEvents = organizerEvents.filter((e: any) => e.id !== event.id)
    localStorage.setItem('eventify_organizer_events', JSON.stringify(updatedEvents))

    // Only create notification if admin is deleting (not if organizer is deleting their own event)
    if (isAdmin && !isEventOwner && reason) {
      const notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'event_deleted',
        title: 'Event Deleted by Admin',
        message: `Your event "${event.title}" has been deleted by an administrator.`,
        reason: reason,
        eventId: event.id,
        eventTitle: event.title,
        organizerId: organizerUserId,
        isRead: false,
        read: false,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }

      // Store notification for organizer (only if admin deleted it, not if organizer deleted their own)
      const notifications = JSON.parse(localStorage.getItem('eventify_notifications') || '[]')
      notifications.push(notification)
      localStorage.setItem('eventify_notifications', JSON.stringify(notifications))
    }

    // Navigate back to dashboard or events page
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Images */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-2xl overflow-hidden"
            >
              <ImageGallery
                images={event.images || (event.image ? [{ id: 'img_1', url: event.image, isPrimary: true }] : [])}
                displayType={event.imageDisplayType || 'carousel'}
                eventTitle={event.title}
              />
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFavorite}
                  className={`bg-white/90 backdrop-blur-sm ${isFavorite ? 'text-red-500' : ''}`}
                >
                  <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="bg-white/90 backdrop-blur-sm"
                >
                  <Share2 size={16} />
                </Button>
              </div>
            </motion.div>

            {/* Event Title and Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge>{event.category}</Badge>
                    {event.rating && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Star size={16} className="text-yellow-400 fill-current" />
                        <span className="font-medium">{event.rating}</span>
                      </div>
                    )}
                    {isRegistered && (
                      <Badge className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle size={14} className="mr-1" />
                        Registered
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">{event.title}</h1>
                  <p className="text-lg text-gray-600">{event.description}</p>
                  {isRegistered && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle size={16} />
                        <span className="font-medium text-sm">
                          You have {userTickets.length} {userTickets.length === 1 ? 'ticket' : 'tickets'} for this event
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-3">
                  <Calendar size={20} className="text-primary-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium text-gray-900">{event.date}</p>
                    <p className="text-sm text-gray-600">{event.time}</p>
                    {event.endDate && (
                      <p className="text-sm text-gray-600">to {event.endDate} {event.endTime}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-primary-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{event.location}</p>
                    {event.address && (
                      <p className="text-sm text-gray-600">{event.address}</p>
                    )}
                    {event.isOnline && event.meetingLink && (
                      <a
                        href={event.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                      >
                        Join Online <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users size={20} className="text-primary-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Attendees</p>
                    <p className="font-medium text-gray-900">
                      {event.attendees.toLocaleString()} / {event.maxAttendees.toLocaleString()}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-primary-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge
                      variant={event.status === 'upcoming' ? 'success' : event.status === 'live' ? 'live' : 'outline'}
                    >
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Full Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 border border-gray-200"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">About This Event</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {event.fullDescription}
              </p>
            </motion.div>

            {/* Organizer Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 border border-gray-200"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Organizer</h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {event.organizer.avatar ? (
                    <Image
                      src={event.organizer.avatar}
                      alt={event.organizer.name}
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                  ) : (
                    <User size={32} className="text-primary-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.organizer.name}</h3>
                  {event.organizer.bio && (
                    <p className="text-gray-600 mb-3">{event.organizer.bio}</p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewOrganizer}
                  >
                    View Organizer Profile
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Requirements & Policies */}
            {(event.requirements || event.refundPolicy) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl p-6 border border-gray-200 space-y-4"
              >
                {event.requirements && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
                    <p className="text-gray-600">{event.requirements}</p>
                  </div>
                )}
                {event.refundPolicy && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Refund Policy</h3>
                    <p className="text-gray-600">{event.refundPolicy}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Communication Board */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <CommunicationBoard
                eventId={event.id}
                isOrganizer={isOrganizer || false}
              />
            </motion.div>
          </div>

          {/* Sidebar - Pricing & Registration */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 border border-gray-200 sticky top-24"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ticket Pricing</h2>
              
              {/* User's Current Tickets Section - Hide for admins */}
              {isRegistered && !isAdmin && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Your Current Tickets</h3>
                  <div className="space-y-4">
                    {Object.entries(
                      userTickets.reduce((acc: Record<string, any[]>, ticket: any) => {
                        const tierKey = ticket.ticketType || 'General'
                        if (!acc[tierKey]) acc[tierKey] = []
                        acc[tierKey].push(ticket)
                        return acc
                      }, {})
                    ).map(([tierName, tickets]: [string, any[]]) => {
                      const currentTier = event.ticketTiers.find(t => t.name === tierName)
                      const tierPrice = typeof tickets[0].price === 'string' 
                        ? parseFloat(tickets[0].price.replace('$', '')) 
                        : (tickets[0].price || 0)
                      
                      // Get upgrade options for this specific tier (tiers with higher price)
                      const availableUpgrades = event.ticketTiers.filter(tier => tier.price > tierPrice)
                      
                      return (
                        <div
                          key={tierName}
                          className="border border-green-300 bg-green-50 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900">{tierName}</h4>
                                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                  Purchased
                                </Badge>
                              </div>
                              {currentTier?.description && (
                                <p className="text-xs text-gray-600 mb-2">{currentTier.description}</p>
                              )}
                              <div className="space-y-1 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Quantity:</span>
                                  <span className="font-semibold text-gray-900">{tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Price per ticket:</span>
                                  <span className="font-semibold text-gray-900">${tierPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between pt-1 border-t border-green-200">
                                  <span className="text-gray-700 font-medium">Total paid:</span>
                                  <span className="font-bold text-green-700">${(tierPrice * tickets.length).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-700">
                                ${tierPrice.toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">per ticket</p>
                            </div>
                          </div>
                          
                          {/* Upgrade Button */}
                          <div className="pt-3 border-t border-green-200 mt-3">
                            {availableUpgrades.length > 0 ? (
                              <Button
                                variant="primary"
                                size="sm"
                                className="w-full"
                                onClick={() => handleUpgradeClick(
                                  tierName,
                                  tierPrice,
                                  currentTier?.description,
                                  tickets
                                )}
                              >
                                <ArrowUp size={16} className="mr-2" />
                                Upgrade Ticket
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                disabled
                              >
                                <ArrowUp size={16} className="mr-2" />
                                No Upgrades Available
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* All Ticket Tiers */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  {isAdmin ? 'Ticket Pricing' : (isRegistered ? 'Available Tickets' : 'Ticket Pricing')}
                </h3>
                <div className="space-y-4">
                  {event.ticketTiers.map((tier) => {
                    const isUserTier = !isAdmin && registeredTierIds.includes(tier.id)
                    const tierTickets = userTickets.filter((t: any) => t.ticketTierId === tier.id)
                    
                    return (
                      <div
                        key={tier.id}
                        className={`border rounded-lg p-4 transition-colors ${
                          isUserTier 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{tier.name}</h4>
                              {isUserTier && !isAdmin && (
                                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                  Your Ticket
                                </Badge>
                              )}
                            </div>
                            {tier.description && (
                              <p className="text-sm text-gray-600">{tier.description}</p>
                            )}
                            {isUserTier && !isAdmin && tierTickets.length > 0 && (
                              <p className="text-xs text-green-700 mt-1">
                                {tierTickets.length} {tierTickets.length === 1 ? 'ticket' : 'tickets'} purchased
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-primary-600">
                              {tier.price === 0 ? 'FREE' : `$${tier.price}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Registration Actions */}
              {(isAdmin || isEventOwner) ? null : !isRegistered && event.status !== 'ended' && event.status !== 'cancelled' ? (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleRegister}
                >
                  {isAuthenticated ? 'Register Now' : 'Sign In to Register'}
                </Button>
              ) : isRegistered ? (
                <div className="border-t border-gray-200 pt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handleViewTickets}
                  >
                    <Ticket size={18} className="mr-2" />
                    View All My Tickets
                  </Button>
                </div>
              ) : (event.status === 'ended' || event.status === 'cancelled') ? (
                <div className="border-t border-gray-200 pt-4">
                  <div className="text-center py-4">
                    <p className="text-gray-600 font-medium">
                      {event.status === 'ended' ? 'This event has ended' : 'This event has been cancelled'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Registration is no longer available</p>
                  </div>
                </div>
              ) : null}

              {/* Delete Event Button - For Admins and Event Owners */}
              {(isAdmin || isEventOwner) && (
                <div className="border-t border-red-200 pt-4 mt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                    onClick={handleDeleteEvent}
                  >
                    <Trash2 size={18} className="mr-2" />
                    Delete Event
                  </Button>
                  {isEventOwner && !isAdmin && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      You can delete your own event
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareEventModal
          event={event}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Upgrade Ticket Modal */}
      {showUpgradeModal && selectedTicketForUpgrade && (
        <UpgradeTicketModal
          isOpen={showUpgradeModal}
          onClose={() => {
            setShowUpgradeModal(false)
            setSelectedTicketForUpgrade(null)
          }}
          currentTier={{
            name: selectedTicketForUpgrade.tierName,
            price: selectedTicketForUpgrade.tierPrice,
            description: selectedTicketForUpgrade.tierDescription
          }}
          availableUpgrades={event.ticketTiers.filter(tier => tier.price > selectedTicketForUpgrade.tierPrice)}
          ticketQuantity={selectedTicketForUpgrade.tickets.length}
          onUpgrade={handleUpgrade}
        />
      )}

      {/* Organizer Profile Modal */}
      {event && event.organizer && (
        <OrganizerProfileModal
          isOpen={showOrganizerModal}
          onClose={() => setShowOrganizerModal(false)}
          organizerId={event.organizer.id}
        />
      )}

      {/* Delete Event Modal - For Admins and Event Owners */}
      {event && (isAdmin || isEventOwner) && (
        <AdminDeleteEventModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          eventTitle={event.title}
          organizerName={event.organizer?.name || 'Unknown Organizer'}
          organizerEmail={event.organizer?.email || 'No email available'}
          onConfirm={confirmDeleteEvent}
          isOwner={isEventOwner && !isAdmin}
        />
      )}
    </div>
  )
}


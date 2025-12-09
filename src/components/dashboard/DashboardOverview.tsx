'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Ticket, 
  TrendingUp, 
  Users, 
  Clock,
  MapPin,
  Star,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useUser } from '@/contexts/UserContext'

// Calculate total spent from tickets
const calculateTotalSpent = (tickets: any[]) => {
  return tickets.reduce((total, ticket) => {
    if (!ticket) return total
    
    // Try ticketTier price first, then ticket price, then payment amount
    let price = 0
    if (ticket.ticketTier?.price) {
      price = typeof ticket.ticketTier.price === 'number' ? ticket.ticketTier.price : parseFloat(ticket.ticketTier.price || '0')
    } else if (ticket.price) {
      price = typeof ticket.price === 'number' ? ticket.price : parseFloat(String(ticket.price).replace('$', '').replace('FREE', '0') || '0')
    } else if (ticket.payment?.amount) {
      price = typeof ticket.payment.amount === 'number' ? ticket.payment.amount : parseFloat(ticket.payment.amount || '0')
    }
    
    return total + (isNaN(price) ? 0 : price)
  }, 0)
}

// Helper function to calculate networking score
const calculateNetworkingScore = (eventsAttended: number) => {
  // Example: 0 events = 0, 10 events = 5, 20+ events = 10
  if (eventsAttended >= 20) return 10
  return Math.min(10, eventsAttended * 0.5)
}

export default function DashboardOverview() {
  const { user } = useUser()
  const router = useRouter()
  const userName = user?.name || 'User'
  const firstName = userName.split(' ')[0]
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false)
  const [userTickets, setUserTickets] = useState<any[]>([])
  const [eventsAttended, setEventsAttended] = useState(0)
  const [activeTickets, setActiveTickets] = useState(0)
  const [attendedEvents, setAttendedEvents] = useState<any[]>([])

  useEffect(() => {
    let isCancelled = false
    
    const fetchDashboardData = async () => {
      if (!user?.id) return

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        const token = localStorage.getItem('token')
        
        if (!token) return

        // Check if user has seen the welcome banner before
        const hasSeenWelcome = localStorage.getItem(`eventify_welcome_seen_${user.id}`)
        if (!hasSeenWelcome && !isCancelled) {
          setShowWelcomeBanner(true)
          localStorage.setItem(`eventify_welcome_seen_${user.id}`, 'true')
        }

        // Use /api/tickets (more standard endpoint)
        const ticketsResponse = await fetch(`${apiUrl}/api/tickets`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (isCancelled) return // Don't update state if cancelled

        if (ticketsResponse.ok) {
          const ticketsData = await ticketsResponse.json()
          if (ticketsData.success && !isCancelled) {
            const tickets = ticketsData.data || []
            setUserTickets(tickets)

            // Calculate events attended (tickets with checkedIn === true)
            const attendedTickets = tickets.filter((ticket: any) => ticket.checkedIn === true)
            setEventsAttended(attendedTickets.length)

            // Get unique attended events
            const uniqueAttendedEvents = attendedTickets.reduce((acc: any[], ticket: any) => {
              if (!acc.find(e => e.eventId === ticket.eventId)) {
                acc.push(ticket)
              }
              return acc
            }, [])
            setAttendedEvents(uniqueAttendedEvents)

            // Calculate active tickets (confirmed tickets that haven't been checked in)
            const active = tickets.filter((ticket: any) => 
              ticket.status === 'CONFIRMED' && !ticket.checkedIn
            ).length
            setActiveTickets(active)
          }
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching dashboard data:', error)
        }
      }
    }

    fetchDashboardData()
    
    return () => {
      isCancelled = true // Cleanup on unmount or dependency change
    }
  }, [user?.id])

  const handleBrowseEvents = () => {
    router.replace('/dashboard?tab=events')
  }

  const handleActiveTicketsClick = () => {
    router.replace('/dashboard?tab=tickets')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Section - Only for first-time users */}
      {showWelcomeBanner && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-4 sm:p-6 text-white"
        >
          <h1 className="text-xl sm:text-2xl font-bold mb-2 break-words">Welcome back, {firstName}! 👋</h1>
          <p className="text-sm sm:text-base text-primary-100 mb-4">Here&apos;s what&apos;s happening with your events today.</p>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-white border-white hover:bg-white hover:text-primary-600"
              onClick={handleBrowseEvents}
            >
              Browse Events
            </Button>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Events Attended - Clickable */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          onClick={() => {
            // Scroll to attended events section or show modal
            const section = document.getElementById('attended-events-section')
            if (section) {
              section.scrollIntoView({ behavior: 'smooth' })
            }
          }}
          className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">Events Attended</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{eventsAttended}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <Calendar size={20} className="sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        {/* Active Tickets - Clickable */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={handleActiveTicketsClick}
          className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">Active Tickets</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{activeTickets}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <Ticket size={20} className="sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        {/* Total Spent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">Total Spent</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">${calculateTotalSpent(userTickets).toFixed(0)}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <TrendingUp size={20} className="sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        {/* Networking Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">Networking Score</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{calculateNetworkingScore(eventsAttended).toFixed(1)}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <Users size={20} className="sm:w-6 sm:h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Events Attended Section */}
      {attendedEvents.length > 0 && (
        <div id="attended-events-section" className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Events You Attended</h2>
            <p className="text-sm text-gray-600 mt-1">Events you&apos;ve checked in to</p>
          </div>
          <div className="p-6 space-y-4">
            {attendedEvents.map((ticket, index) => {
              const event = ticket.event
              if (!event) return null
              
              return (
                <motion.div
                  key={ticket.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={event.image || 'https://via.placeholder.com/48'}
                    alt={event.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{event.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        {new Date(event.startDate).toLocaleDateString()} {event.startTime}
                      </div>
                      <div className="flex items-center">
                        <MapPin size={14} className="mr-1" />
                        {event.isOnline ? 'Online Event' : (event.venueName || `${event.city}, ${event.state}`)}
                      </div>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">
                    Attended
                  </Badge>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Upcoming Events - Events user registered for */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
              <p className="text-sm text-gray-600 mt-1">Events you&apos;re registered for</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.replace('/dashboard?tab=tickets')}
            >
              View All Tickets
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
        <div className="p-6">
          {userTickets.filter((t: any) => t.status === 'CONFIRMED' && !t.checkedIn).length === 0 ? (
            <div className="text-center py-8">
              <Ticket size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No upcoming events</p>
              <Button 
                variant="outline"
                onClick={() => router.replace('/dashboard?tab=events')}
              >
                Browse Events
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {userTickets
                .filter((t: any) => t.status === 'CONFIRMED' && !t.checkedIn)
                .slice(0, 5)
                .map((ticket: any, index: number) => {
                  const event = ticket.event
                  if (!event) return null
                  
                  return (
                    <motion.div
                      key={ticket.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/events/${event.id}`)}
                    >
                      <img
                        src={event.image || 'https://via.placeholder.com/48'}
                        alt={event.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{event.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <div className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {new Date(event.startDate).toLocaleDateString()} {event.startTime}
                          </div>
                          <div className="flex items-center">
                            <MapPin size={14} className="mr-1" />
                            {event.isOnline ? 'Online Event' : (event.venueName || `${event.city}, ${event.state}`)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {ticket.ticketTier?.price ? `$${ticket.ticketTier.price.toFixed(2)}` : (event.price > 0 ? `$${event.price.toFixed(2)}` : 'FREE')}
                        </p>
                        <Badge variant="success" size="sm">
                          {ticket.ticketTier?.name || 'Confirmed'}
                        </Badge>
                      </div>
                    </motion.div>
                  )
                })}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

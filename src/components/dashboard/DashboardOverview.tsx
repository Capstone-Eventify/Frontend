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
    if (!ticket || !ticket.price) return total
    const priceStr = typeof ticket.price === 'string' ? ticket.price : String(ticket.price || '0')
    const price = parseFloat(priceStr.replace('$', '').replace('FREE', '0') || '0')
    return total + (isNaN(price) ? 0 : price)
  }, 0)
}

const upcomingEvents = [
  {
    id: '1',
    title: 'Tech Innovation Summit 2024',
    date: 'Dec 15, 2024',
    time: '9:00 AM',
    location: 'San Francisco, CA',
    price: '$89',
    status: 'confirmed',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '2',
    title: 'Digital Marketing Masterclass',
    date: 'Dec 20, 2024',
    time: '2:00 PM',
    location: 'Online Event',
    price: 'FREE',
    status: 'confirmed',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '3',
    title: 'Global Design Conference',
    date: 'Jan 5, 2025',
    time: '10:00 AM',
    location: 'New York, NY',
    price: '$149',
    status: 'pending',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
  }
]

const recentActivity = [
  { action: 'Registered for Tech Innovation Summit', time: '2 hours ago', type: 'registration' },
  { action: 'Downloaded ticket for Digital Marketing Masterclass', time: '1 day ago', type: 'download' },
  { action: 'Left review for Global Design Conference', time: '3 days ago', type: 'review' },
  { action: 'Added event to favorites', time: '1 week ago', type: 'favorite' },
]

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
    if (typeof window !== 'undefined' && user?.id) {
      // Check if user has seen the welcome banner before
      const hasSeenWelcome = localStorage.getItem(`eventify_welcome_seen_${user.id}`)
      if (!hasSeenWelcome) {
        setShowWelcomeBanner(true)
        // Mark as seen
        localStorage.setItem(`eventify_welcome_seen_${user.id}`, 'true')
      }

      // Load user tickets
      const storedTickets = JSON.parse(localStorage.getItem('eventify_tickets') || '[]')
      setUserTickets(storedTickets)

      // Calculate events attended (tickets with checkInStatus === 'checked_in')
      const attendedTickets = storedTickets.filter((ticket: any) => 
        ticket.checkInStatus === 'checked_in'
      )
      setEventsAttended(attendedTickets.length)
      
      // Get unique attended events (by eventId or eventTitle)
      const uniqueAttendedEvents = attendedTickets.reduce((acc: any[], ticket: any) => {
        const eventId = ticket.eventId || ticket.eventTitle
        if (!acc.find(e => (e.eventId || e.eventTitle) === eventId)) {
          acc.push(ticket)
        }
        return acc
      }, [])
      setAttendedEvents(uniqueAttendedEvents)

      // Calculate active tickets (confirmed tickets that haven't been checked in or are upcoming)
      const active = storedTickets.filter((ticket: any) => 
        ticket.status === 'confirmed' && ticket.checkInStatus !== 'checked_in'
      ).length
      setActiveTickets(active)
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
          <p className="text-sm sm:text-base text-primary-100 mb-4">Here's what's happening with your events today.</p>
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
              <p className="text-xl sm:text-2xl font-bold text-gray-900">8.5</p>
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
            <p className="text-sm text-gray-600 mt-1">Events you've checked in to</p>
          </div>
          <div className="p-6 space-y-4">
            {attendedEvents.map((event, index) => (
              <motion.div
                key={event.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <img
                  src={event.image}
                  alt={event.eventTitle}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{event.eventTitle}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {event.eventDate} {event.eventTime ? `at ${event.eventTime}` : ''}
                    </div>
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-1" />
                      {event.eventLocation}
                    </div>
                  </div>
                </div>
                <Badge variant="success" size="sm">
                  Attended
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events - Events user registered for */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
              <p className="text-sm text-gray-600 mt-1">Events you're registered for</p>
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
          {userTickets.filter((t: any) => t.status === 'confirmed' && t.checkInStatus !== 'checked_in').length === 0 ? (
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
                .filter((t: any) => t.status === 'confirmed' && t.checkInStatus !== 'checked_in')
                .slice(0, 5)
                .map((ticket: any, index: number) => (
                  <motion.div
                    key={ticket.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/events/${ticket.eventId}`)}
                  >
                    <img
                      src={ticket.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}
                      alt={ticket.eventTitle}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{ticket.eventTitle}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          {ticket.eventDate} {ticket.eventTime ? `at ${ticket.eventTime}` : ''}
                        </div>
                        <div className="flex items-center">
                          <MapPin size={14} className="mr-1" />
                          {ticket.eventLocation}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{ticket.price}</p>
                      <Badge variant="success" size="sm">
                        {ticket.ticketType || 'Confirmed'}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  MapPin,
  Star,
  Users,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default function OrganizerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const organizerId = params.id as string
  const [organizer, setOrganizer] = useState<any>(null)
  const [organizerEvents, setOrganizerEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrganizerData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        
        // Fetch events by organizer - this will include organizer info
        const response = await fetch(`${apiUrl}/api/events/organizer/${organizerId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data && data.data.length > 0) {
            // Get organizer info from first event
            const firstEvent = data.data[0]
            if (firstEvent.organizer) {
              setOrganizer({
                id: firstEvent.organizer.id,
                name: firstEvent.organizer.name,
                email: firstEvent.organizer.email,
                avatar: firstEvent.organizer.avatar,
                bio: firstEvent.organizer.bio,
                totalEvents: data.data.length,
                totalAttendees: data.data.reduce((sum: number, e: any) => sum + (e.attendees || 0), 0),
                joinDate: data.data[data.data.length - 1]?.createdAt || new Date().toISOString(),
                categories: Array.from(new Set(data.data.map((e: any) => e.category).filter(Boolean)))
              })
            }
            setOrganizerEvents(data.data)
          } else {
            // Organizer exists but has no events - try to get user info
            // Note: This would require a user endpoint, for now show not found
            setOrganizer(null)
          }
        } else {
          setOrganizer(null)
        }
      } catch (error) {
        console.error('Error fetching organizer data:', error)
        setOrganizer(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (organizerId) {
      fetchOrganizerData()
    }
  }, [organizerId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organizer profile...</p>
        </div>
      </div>
    )
  }

  if (!organizer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Organizer Not Found</h1>
          <p className="text-gray-600 mb-4">This organizer does not exist or has no events.</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
          {/* Sidebar - Organizer Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 border border-gray-200 sticky top-24"
            >
              <div className="text-center mb-6">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  {organizer.avatar ? (
                    <Image
                      src={organizer.avatar}
                      alt={organizer.name}
                      fill
                      sizes="128px"
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary-100 rounded-full flex items-center justify-center">
                      <User size={48} className="text-primary-600" />
                    </div>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{organizer.name}</h1>
                <div className="flex items-center justify-center gap-1 mb-4">
                  <span className="text-gray-600">({organizer.totalEvents} {organizer.totalEvents === 1 ? 'event' : 'events'})</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-gray-600">{organizer.email}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Events</span>
                  <span className="font-semibold text-gray-900">{organizer.totalEvents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Attendees</span>
                  <span className="font-semibold text-gray-900">
                    {organizer.totalAttendees.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Categories */}
              {organizer.categories && organizer.categories.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Event Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {organizer.categories.map((category: string, index: number) => (
                      <Badge key={index} variant="outline" size="sm">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 border border-gray-200"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">{organizer.bio}</p>
            </motion.div>

            {/* Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Events by {organizer.name}
                </h2>
                <Badge>{organizerEvents.length} {organizerEvents.length === 1 ? 'event' : 'events'}</Badge>
              </div>

              {organizerEvents.length > 0 ? (
                <div className="space-y-4">
                  {organizerEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/events/${event.id}`)}
                    >
                      <img
                        src={event.image || '/placeholder-event.jpg'}
                        alt={event.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            {event.date ? new Date(event.date).toLocaleDateString() : 'TBA'}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            {event.location || 'TBA'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            {event.attendees?.toLocaleString() || 0} attending
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary-600 mb-1">{event.price || 'FREE'}</p>
                        {event.category && (
                          <Badge variant="outline" size="sm">{event.category}</Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No events available at the moment.</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}


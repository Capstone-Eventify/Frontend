'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { 
  X, 
  User, 
  Mail, 
  Calendar, 
  MapPin,
  Star,
  Users,
  TrendingUp,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface OrganizerProfileModalProps {
  isOpen: boolean
  onClose: () => void
  organizerId: string
}

export default function OrganizerProfileModal({
  isOpen,
  onClose,
  organizerId
}: OrganizerProfileModalProps) {
  const router = useRouter()
  const [organizer, setOrganizer] = useState<any>(null)
  const [organizerEvents, setOrganizerEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

  useEffect(() => {
    const fetchOrganizerData = async () => {
      if (!isOpen || !organizerId) return

      setLoading(true)
      setError(null)

      try {
        // Fetch organizer user data
        const userResponse = await fetch(`${apiUrl}/api/users/${organizerId}`)
        if (!userResponse.ok) {
          throw new Error('Failed to fetch organizer data')
        }

        const userData = await userResponse.json()
        if (!userData.success) {
          throw new Error(userData.message || 'Failed to fetch organizer data')
        }

        const organizerData = userData.data
        setOrganizer({
          id: organizerData.id,
          name: `${organizerData.firstName} ${organizerData.lastName}`,
          email: organizerData.email,
          avatar: organizerData.avatar,
          bio: organizerData.bio || 'No bio available',
          location: organizerData.city && organizerData.state 
            ? `${organizerData.city}, ${organizerData.state}`
            : organizerData.city || organizerData.state || 'Location not specified',
          joinDate: organizerData.createdAt || new Date().toISOString()
        })

        // Fetch events by this organizer
        const eventsResponse = await fetch(`${apiUrl}/api/events/organizer/${organizerId}`)
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json()
          if (eventsData.success) {
            setOrganizerEvents(eventsData.data || [])
          }
        }
      } catch (err: any) {
        console.error('Error fetching organizer data:', err)
        setError(err.message || 'Failed to load organizer profile')
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizerData()
  }, [isOpen, organizerId, apiUrl])

  const handleViewEvent = (eventId: string) => {
    onClose()
    router.push(`/events/${eventId}`)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Organizer Profile</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="rounded-full"
              >
                <X size={18} />
              </Button>
            </div>

            {/* Content - Scrollable */}
            <div className="overflow-y-auto flex-1 p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-primary-600" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={onClose}>Close</Button>
                </div>
              ) : !organizer ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">Organizer not found</p>
                  <Button onClick={onClose}>Close</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Sidebar - Organizer Info */}
                  <div className="lg:col-span-1">
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="text-center mb-6">
                        <div className="relative w-24 h-24 mx-auto mb-4">
                          {organizer.avatar ? (
                            <Image
                              src={organizer.avatar}
                              alt={organizer.name}
                              fill
                              sizes="96px"
                              className="rounded-full object-cover"
                              unoptimized={organizer.avatar?.includes('s3')}
                            />
                          ) : (
                            <div className="w-full h-full bg-primary-100 rounded-full flex items-center justify-center">
                              <User size={40} className="text-primary-600" />
                            </div>
                          )}
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 mb-2">{organizer.name}</h1>
                        {organizerEvents.length > 0 && (
                          <div className="flex items-center justify-center gap-1 mb-4">
                            <Star size={16} className="text-yellow-400 fill-current" />
                            <span className="text-gray-600 text-sm">({organizerEvents.length} {organizerEvents.length === 1 ? 'event' : 'events'})</span>
                          </div>
                        )}
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                        <div className="flex items-center gap-3 text-sm">
                          <Mail size={16} className="text-gray-400" />
                          <span className="text-gray-600">{organizer.email}</span>
                        </div>
                        {organizer.location && (
                          <div className="flex items-center gap-3 text-sm">
                            <MapPin size={16} className="text-gray-400" />
                            <span className="text-gray-600">{organizer.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Total Events</span>
                          <span className="font-semibold text-gray-900">{organizerEvents.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Member Since</span>
                          <span className="font-semibold text-gray-900">
                            {new Date(organizer.joinDate).getFullYear()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Bio */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                      <p className="text-gray-700 leading-relaxed">{organizer.bio}</p>
                    </div>

                    {/* Events */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                          Events by {organizer.name}
                        </h2>
                        <Badge>{organizerEvents.length} {organizerEvents.length === 1 ? 'event' : 'events'}</Badge>
                      </div>

                      {organizerEvents.length > 0 ? (
                        <div className="space-y-4">
                          {organizerEvents.slice(0, 5).map((event) => (
                            <div
                              key={event.id}
                              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-white cursor-pointer transition-colors"
                              onClick={() => handleViewEvent(event.id)}
                            >
                              {event.image ? (
                                <Image
                                  src={event.image}
                                  alt={event.title}
                                  width={64}
                                  height={64}
                                  className="rounded-lg object-cover flex-shrink-0"
                                  unoptimized={event.image?.includes('s3')}
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Calendar size={24} className="text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  {event.startDate && (
                                    <div className="flex items-center gap-1">
                                      <Calendar size={14} />
                                      {new Date(event.startDate).toLocaleDateString()}
                                    </div>
                                  )}
                                  {(event.city || event.venueName) && (
                                    <div className="flex items-center gap-1">
                                      <MapPin size={14} />
                                      {event.venueName || `${event.city}${event.state ? `, ${event.state}` : ''}`}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-primary-600 mb-1">
                                  {event.price === 0 || !event.price ? 'FREE' : `$${event.price}`}
                                </p>
                                {event.category && (
                                  <Badge variant="outline" size="sm">{event.category}</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                          {organizerEvents.length > 5 && (
                            <p className="text-center text-sm text-gray-600 pt-2">
                              And {organizerEvents.length - 5} more events...
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-600">No events available at the moment.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}


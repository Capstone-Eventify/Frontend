'use client'

import React from 'react'
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
import { eventDetails } from '@/data/eventDetails'

// Mock organizer data
const organizers: Record<string, any> = {
  'org1': {
    id: 'org1',
    name: 'Tech Events Inc.',
    email: 'contact@techevents.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    bio: 'Leading technology event organizer with 10+ years of experience in bringing together innovators, entrepreneurs, and industry leaders. We specialize in creating transformative experiences that drive technological advancement and networking opportunities.',
    location: 'San Francisco, CA',
    website: 'https://techevents.com',
    rating: 4.8,
    totalEvents: 45,
    totalAttendees: 125000,
    joinDate: '2014-01-15',
    categories: ['Technology', 'Innovation', 'Startups']
  },
  'org2': {
    id: 'org2',
    name: 'Marketing Pro',
    email: 'hello@marketingpro.com',
    bio: 'Digital marketing experts helping businesses grow online through comprehensive training and masterclasses.',
    location: 'New York, NY',
    rating: 4.6,
    totalEvents: 28,
    totalAttendees: 35000,
    joinDate: '2018-03-20',
    categories: ['Marketing', 'Digital', 'Business']
  },
  'org3': {
    id: 'org3',
    name: 'Design Collective',
    email: 'info@designcollective.com',
    bio: 'Celebrating design excellence worldwide. We bring together creative professionals to inspire and innovate.',
    location: 'New York, NY',
    rating: 4.9,
    totalEvents: 62,
    totalAttendees: 180000,
    joinDate: '2012-06-10',
    categories: ['Design', 'Creative', 'UX/UI']
  },
  'org4': {
    id: 'org4',
    name: 'Startup Hub',
    email: 'contact@startuphub.com',
    bio: 'Supporting the next generation of entrepreneurs through pitch competitions, networking events, and mentorship programs.',
    location: 'Austin, TX',
    rating: 4.7,
    totalEvents: 35,
    totalAttendees: 12000,
    joinDate: '2019-04-05',
    categories: ['Startup', 'Entrepreneurship', 'Investment']
  }
}

export default function OrganizerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const organizerId = params.id as string
  const organizer = organizers[organizerId]

  if (!organizer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Organizer Not Found</h1>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    )
  }

  // Get events by this organizer
  const organizerEvents = eventDetails.filter(event => event.organizer.id === organizerId)

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
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary-100 rounded-full flex items-center justify-center">
                      <User size={48} className="text-primary-600" />
                    </div>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{organizer.name}</h1>
                {organizer.rating && (
                  <div className="flex items-center justify-center gap-1 mb-4">
                    <Star size={18} className="text-yellow-400 fill-current" />
                    <span className="font-semibold text-gray-900">{organizer.rating}</span>
                    <span className="text-gray-600">({organizer.totalEvents} events)</span>
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
                {organizer.website && (
                  <div className="flex items-center gap-3 text-sm">
                    <TrendingUp size={16} className="text-gray-400" />
                    <a
                      href={organizer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
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
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(organizer.joinDate).getFullYear()}
                  </span>
                </div>
              </div>

              {/* Categories */}
              {organizer.categories && organizer.categories.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Specialties</p>
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
                        src={event.image}
                        alt={event.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            {event.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            {event.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            {event.attendees.toLocaleString()} attending
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary-600 mb-1">{event.price}</p>
                        <Badge variant="outline" size="sm">{event.category}</Badge>
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


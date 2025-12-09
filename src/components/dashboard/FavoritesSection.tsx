'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Heart,
  Star,
  ArrowRight,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useUser } from '@/contexts/UserContext'

export default function FavoritesSection() {
  const router = useRouter()
  const { isAuthenticated, user } = useUser()
  const [favoriteEvents, setFavoriteEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && user) {
      loadFavorites()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  const loadFavorites = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await fetch(`${apiUrl}/api/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setFavoriteEvents(data.data || [])
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const removeFavorite = async (eventId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      if (!token) return

      const response = await fetch(`${apiUrl}/api/favorites/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        // Reload favorites
        loadFavorites()
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`)
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please sign in to view your favorites.</p>
      </div>
    )
  }

  if (favoriteEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
        <p className="text-gray-600 mb-6">
          Start exploring events and save your favorites to see them here.
        </p>
        <Button onClick={() => router.push('/')}>
          Browse Events
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-600">Events you&apos;ve saved for later</p>
        </div>
        <Badge className="bg-red-50 text-red-700 border-red-200">
          {favoriteEvents.length} {favoriteEvents.length === 1 ? 'event' : 'events'}
        </Badge>
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteEvents.map((event, index) => (
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
              <div className="absolute top-4 right-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/90 backdrop-blur-sm text-red-500"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    removeFavorite(event.id)
                  }}
                >
                  <Heart size={16} className="fill-current" />
                </Button>
              </div>
              <Badge className="absolute top-4 left-4">
                {event.category}
              </Badge>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">{event.title}</h3>
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
                <div className="flex items-center text-sm text-gray-600">
                  <Clock size={16} className="mr-2" />
                  {event.time}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={16} className="mr-2" />
                  {event.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users size={16} className="mr-2" />
                  {event.attendees.toLocaleString()} attending
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-2xl font-bold text-primary-600">
                  {event.price}
                </div>
                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    router.push(`/events/${event.id}`)
                  }}
                >
                  View Details
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}


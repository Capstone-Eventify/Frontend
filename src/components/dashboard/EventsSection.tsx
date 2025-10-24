'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Search,
  Filter,
  Grid,
  List,
  Star,
  Heart,
  Share2,
  Plus,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

// Mock data
const events = [
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

export default function EventsSection() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600">Discover and join amazing events</p>
        </div>
        <Button>
          <Plus size={16} className="mr-2" />
          Create Event
        </Button>
      </div>

      {/* Filters and Search */}
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

      {/* Events Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/90 backdrop-blur-sm"
                  >
                    <Heart size={16} className={event.isFavorite ? 'text-red-500 fill-current' : ''} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/90 backdrop-blur-sm"
                  >
                    <Share2 size={16} />
                  </Button>
                </div>
                <Badge className="absolute top-4 left-4">
                  {event.category}
                </Badge>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{event.title}</h3>
                  <div className="flex items-center ml-2">
                    <Star size={16} className="text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-700 ml-1">{event.rating}</span>
                  </div>
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
                    {event.attendees.toLocaleString()} / {event.maxAttendees.toLocaleString()} attendees
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-gray-900">{event.price}</div>
                  <Button>
                    Register
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
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
                      <Button variant="outline" size="sm">
                        <Heart size={16} className={event.isFavorite ? 'text-red-500 fill-current' : ''} />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-1" />
                      {event.date}
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      {event.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-1" />
                      {event.location}
                    </div>
                    <div className="flex items-center">
                      <Users size={16} className="mr-1" />
                      {event.attendees.toLocaleString()} attendees
                    </div>
                    <div className="flex items-center">
                      <Star size={16} className="text-yellow-400 fill-current mr-1" />
                      {event.rating}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge>{event.category}</Badge>
                      <span className="text-2xl font-bold text-gray-900">{event.price}</span>
                    </div>
                    <Button>
                      Register
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Load More */}
      {filteredEvents.length > 0 && (
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load More Events
          </Button>
        </div>
      )}
    </div>
  )
}

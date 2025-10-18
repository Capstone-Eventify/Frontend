'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit3, Calendar, Users } from 'lucide-react'
import EventForm from '@/components/events/EventForm'
import { Button } from '@/components/ui/Button'

interface EventData {
  title: string
  description: string
  category: string
  eventType: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  location: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  maxAttendees: number
  price: number
  currency: string
  image: string
  tags: string[]
  isOnline: boolean
  meetingLink?: string
  requirements?: string
  refundPolicy?: string
}

export default function EventsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null)

  // Sample event data for demonstration
  const sampleEvent: EventData = {
    title: 'Tech Conference 2024',
    description: 'Join us for the biggest technology conference of the year featuring industry leaders, innovative workshops, and networking opportunities.',
    category: 'Technology',
    eventType: 'Conference',
    startDate: '2024-06-15',
    endDate: '2024-06-17',
    startTime: '09:00',
    endTime: '18:00',
    location: 'Convention Center',
    address: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'USA',
    maxAttendees: 500,
    price: 299.99,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    tags: ['Technology', 'Conference', 'Networking', 'Innovation'],
    isOnline: false,
    requirements: 'Laptop recommended for workshops',
    refundPolicy: 'Full refund available up to 7 days before the event'
  }

  const handleCreateEvent = (data: EventData) => {
    console.log('Creating event:', data)
    alert('Event created successfully!')
    setShowCreateForm(false)
  }

  const handleEditEvent = (data: EventData) => {
    console.log('Updating event:', data)
    alert('Event updated successfully!')
    setShowEditForm(false)
    setEditingEvent(null)
  }

  const handleEditClick = () => {
    setEditingEvent(sampleEvent)
    setShowEditForm(true)
  }

  const handleCancel = () => {
    setShowCreateForm(false)
    setShowEditForm(false)
    setEditingEvent(null)
  }

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100/30 py-8 px-4">
        <EventForm
          mode="create"
          onSubmit={handleCreateEvent}
          onCancel={handleCancel}
        />
      </div>
    )
  }

  if (showEditForm && editingEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100/30 py-8 px-4">
        <EventForm
          mode="edit"
          initialData={editingEvent}
          onSubmit={handleEditEvent}
          onCancel={handleCancel}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Event Management
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-primary-100 max-w-2xl mx-auto"
          >
            Create, manage, and organize your events with our comprehensive event management tools
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => setShowCreateForm(true)}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-4 px-8 rounded-xl shadow-lg shadow-primary-600/25 transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Event
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleEditClick}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold py-4 px-8 rounded-xl transition-all duration-300"
            >
              <Edit3 className="w-5 h-5 mr-2" />
              Edit Sample Event
            </Button>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-primary-200/50"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Events</h3>
            <p className="text-gray-600">
              Design and set up your events with detailed information, pricing, and location details.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-primary-200/50"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
              <Edit3 className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Edit Events</h3>
            <p className="text-gray-600">
              Update event details, manage attendees, and modify settings as needed.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-primary-200/50"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Schedule Management</h3>
            <p className="text-gray-600">
              Set dates, times, and manage your event calendar efficiently.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-primary-200/50"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Attendee Management</h3>
            <p className="text-gray-600">
              Track registrations, manage capacity, and communicate with attendees.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-primary-200/50"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Online & In-Person</h3>
            <p className="text-gray-600">
              Support both virtual and physical events with appropriate settings.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-primary-200/50"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Customization</h3>
            <p className="text-gray-600">
              Add tags, requirements, and policies to customize your event experience.
            </p>
          </motion.div>
        </div>

        {/* Sample Event Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-primary-200/50"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sample Event Preview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{sampleEvent.title}</h3>
              <p className="text-gray-600 mb-4">{sampleEvent.description}</p>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Category:</strong> {sampleEvent.category}</p>
                <p><strong>Type:</strong> {sampleEvent.eventType}</p>
                <p><strong>Date:</strong> {sampleEvent.startDate} - {sampleEvent.endDate}</p>
                <p><strong>Time:</strong> {sampleEvent.startTime} - {sampleEvent.endTime}</p>
                <p><strong>Location:</strong> {sampleEvent.location}, {sampleEvent.city}</p>
                <p><strong>Max Attendees:</strong> {sampleEvent.maxAttendees}</p>
                <p><strong>Price:</strong> ${sampleEvent.price} {sampleEvent.currency}</p>
              </div>
            </div>
            <div>
              <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center mb-4">
                <Calendar className="w-12 h-12 text-gray-400" />
              </div>
              <div className="flex flex-wrap gap-2">
                {sampleEvent.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

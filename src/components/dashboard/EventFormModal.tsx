'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, MapPin, Image as ImageIcon, Tag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EventDetail, TicketTier } from '@/types/event'
import TicketTierBuilder from './TicketTierBuilder'
import ImageManager from '@/components/events/ImageManager'
import SeatingArrangementBuilder, { SeatingArrangement } from './SeatingArrangementBuilder'
import { useUser } from '@/contexts/UserContext'

interface EventFormModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  eventData?: EventDetail
  onSave: (eventData: any) => void
}

const categories = ['Technology', 'Marketing', 'Design', 'Business', 'Education', 'Entertainment', 'Sports', 'Other']
const eventTypes = ['Conference', 'Workshop', 'Seminar', 'Networking', 'Webinar', 'Festival', 'Concert', 'Other']

export default function EventFormModal({
  isOpen,
  onClose,
  mode,
  eventData,
  onSave
}: EventFormModalProps) {
  const { user } = useUser()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fullDescription: '',
    category: '',
    date: '',
    time: '',
    endDate: '',
    endTime: '',
    location: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    isOnline: false,
    meetingLink: '',
    image: '', // Keep for backward compatibility
    images: [] as Array<{ id: string; url: string; isPrimary: boolean }>,
    imageDisplayType: 'carousel' as 'carousel' | 'static',
    tags: [] as string[],
    requirements: '',
    refundPolicy: '',
    maxAttendees: 0,
    hasSeating: false,
    seatingArrangement: null as SeatingArrangement | null
  })
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([])
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (eventData && mode === 'edit') {
      // Convert old image format to new images array if needed
      let images = eventData.images || []
      if (!images.length && eventData.image) {
        images = [{ id: 'img_1', url: eventData.image, isPrimary: true }]
      }
      
      setFormData({
        title: eventData.title,
        description: eventData.description,
        fullDescription: eventData.fullDescription,
        category: eventData.category,
        date: eventData.date,
        time: eventData.time,
        endDate: eventData.endDate || '',
        endTime: eventData.endTime || '',
        location: eventData.location,
        address: eventData.address || '',
        city: eventData.city || '',
        state: eventData.state || '',
        zipCode: eventData.zipCode || '',
        country: eventData.country || 'USA',
        isOnline: eventData.isOnline,
        meetingLink: eventData.meetingLink || '',
        image: eventData.image || '',
        images: images,
        imageDisplayType: eventData.imageDisplayType || 'carousel',
        tags: eventData.tags || [],
        requirements: eventData.requirements || '',
        refundPolicy: eventData.refundPolicy || '',
        maxAttendees: eventData.maxAttendees,
        hasSeating: eventData.hasSeating || false,
        seatingArrangement: eventData.seatingArrangement || null
      })
      setTicketTiers(eventData.ticketTiers || [])
    } else {
      // Reset form for create mode
      setFormData({
        title: '',
        description: '',
        fullDescription: '',
        category: '',
        date: '',
        time: '',
        endDate: '',
        endTime: '',
        location: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
        isOnline: false,
        meetingLink: '',
        image: '',
        images: [],
        imageDisplayType: 'carousel',
        tags: [],
        requirements: '',
        refundPolicy: '',
        maxAttendees: 0,
        hasSeating: false,
        seatingArrangement: null,
        status: 'draft' // New events are drafts by default
      })
      setTicketTiers([])
    }
  }, [eventData, mode, isOpen])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }))
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.fullDescription.trim()) newErrors.fullDescription = 'Full description is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.date) newErrors.date = 'Date is required'
    if (!formData.time) newErrors.time = 'Time is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    if (!formData.isOnline && !formData.address.trim()) newErrors.address = 'Address is required for in-person events'
    if (formData.isOnline && !formData.meetingLink.trim()) newErrors.meetingLink = 'Meeting link is required for online events'
    if (formData.images.length === 0 && !formData.image.trim()) newErrors.images = 'At least one image is required'
    if (ticketTiers.length === 0) newErrors.ticketTiers = 'At least one ticket tier is required'
    if (formData.maxAttendees <= 0) newErrors.maxAttendees = 'Max attendees must be greater than 0'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      return
    }

    // Get primary image URL for backward compatibility
    const primaryImage = formData.images.find(img => img.isPrimary)?.url || formData.images[0]?.url || formData.image

      const eventToSave = {
        id: mode === 'edit' && eventData ? eventData.id : `event_${Date.now()}`,
        ...formData,
        image: primaryImage, // Keep for backward compatibility
        ticketTiers,
        seatingArrangement: formData.hasSeating ? formData.seatingArrangement : null,
        attendees: 0,
        status: mode === 'edit' && eventData?.status ? eventData.status : (formData.status || 'draft'), // Keep existing status when editing, default to draft for new events
        organizerId: user?.id || 'org1', // Store organizerId for filtering
        organizer: {
          id: user?.id || 'org1',
          name: user?.name || 'Organizer',
          email: user?.email || 'organizer@example.com'
        },
        createdAt: mode === 'edit' && eventData ? eventData.createdAt : new Date().toISOString(),
        price: ticketTiers.length > 0 ? `$${Math.min(...ticketTiers.map(t => t.price))}` : 'FREE'
      }

    // Save to localStorage
    const storedEvents = JSON.parse(localStorage.getItem('eventify_organizer_events') || '[]')
    if (mode === 'edit' && eventData) {
      const updatedEvents = storedEvents.map((e: any) => 
        e.id === eventData.id ? eventToSave : e
      )
      localStorage.setItem('eventify_organizer_events', JSON.stringify(updatedEvents))
    } else {
      localStorage.setItem('eventify_organizer_events', JSON.stringify([...storedEvents, eventToSave]))
    }

    onSave(eventToSave)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
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
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Create New Event' : 'Edit Event'}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0"
            >
              <X size={16} />
            </Button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter event title"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description (shown in listings)"
                  rows={2}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Description *
                </label>
                <textarea
                  value={formData.fullDescription}
                  onChange={(e) => handleInputChange('fullDescription', e.target.value)}
                  placeholder="Detailed description (shown on event page)"
                  rows={4}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.fullDescription ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.fullDescription && <p className="text-sm text-red-600 mt-1">{errors.fullDescription}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Attendees *
                  </label>
                  <input
                    type="number"
                    value={formData.maxAttendees}
                    onChange={(e) => handleInputChange('maxAttendees', parseInt(e.target.value) || 0)}
                    min="1"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.maxAttendees ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.maxAttendees && <p className="text-sm text-red-600 mt-1">{errors.maxAttendees}</p>}
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Date & Time</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.date ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.time ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.time && <p className="text-sm text-red-600 mt-1">{errors.time}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date (optional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time (optional)
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Location</h3>
              
              <div className="flex items-center gap-3 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isOnline}
                    onChange={(e) => handleInputChange('isOnline', e.target.checked)}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Online Event</span>
                </label>
              </div>

              {/* Has Seating Checkbox - Only for in-person events */}
              {!formData.isOnline && (
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasSeating}
                      onChange={(e) => {
                        const hasSeating = e.target.checked
                        handleInputChange('hasSeating', hasSeating)
                        // Clear seating arrangement if seating is disabled
                        if (!hasSeating) {
                          setFormData(prev => ({ ...prev, seatingArrangement: null }))
                        }
                      }}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Event has assigned seating</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    If checked, attendees will be assigned specific seats. If unchecked, this is a general admission event.
                  </p>
                </div>
              )}

              {/* Seating Arrangement Builder - Only show if hasSeating is true */}
              {!formData.isOnline && formData.hasSeating && (
                <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <SeatingArrangementBuilder
                    arrangement={formData.seatingArrangement}
                    onArrangementChange={(arrangement) => {
                      setFormData({ ...formData, seatingArrangement: arrangement })
                    }}
                  />
                </div>
              )}

              {formData.isOnline ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Link *
                  </label>
                  <input
                    type="url"
                    value={formData.meetingLink}
                    onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                    placeholder="https://zoom.us/j/..."
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.meetingLink ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.meetingLink && <p className="text-sm text-red-600 mt-1">{errors.meetingLink}</p>}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location Name *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., Convention Center"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.location ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.location && <p className="text-sm text-red-600 mt-1">{errors.location}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Main Street"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.address ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="City"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="State"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        placeholder="12345"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        placeholder="Country"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Event Images</h3>
              <ImageManager
                images={formData.images}
                onImagesChange={(images) => handleInputChange('images', images)}
                displayType={formData.imageDisplayType}
                onDisplayTypeChange={(type) => handleInputChange('imageDisplayType', type)}
              />
              {errors.images && <p className="text-sm text-red-600 mt-1">{errors.images}</p>}
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  placeholder="Add a tag and press Enter"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Button variant="outline" onClick={addTag}>
                  <Tag size={16} className="mr-2" />
                  Add
                </Button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-2">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  placeholder="e.g., Laptop recommended for workshops"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Policy
                </label>
                <textarea
                  value={formData.refundPolicy}
                  onChange={(e) => handleInputChange('refundPolicy', e.target.value)}
                  placeholder="e.g., Full refund available up to 7 days before the event"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Ticket Tiers */}
            <div className="space-y-4">
              <TicketTierBuilder
                tiers={ticketTiers}
                onTiersChange={setTicketTiers}
              />
              {errors.ticketTiers && (
                <p className="text-sm text-red-600">{errors.ticketTiers}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {mode === 'create' ? 'Create Event' : 'Save Changes'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}


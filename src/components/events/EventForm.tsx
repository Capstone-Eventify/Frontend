'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Clock, Users, DollarSign, Image, Tag, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface EventFormProps {
  mode: 'create' | 'edit'
  initialData?: EventData
  onSubmit?: (data: EventData) => void
  onCancel?: () => void
  className?: string
}

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

const EventForm: React.FC<EventFormProps> = ({ 
  mode, 
  initialData, 
  onSubmit, 
  onCancel, 
  className 
}) => {
  const [formData, setFormData] = useState<EventData>({
    title: '',
    description: '',
    category: '',
    eventType: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    maxAttendees: 100,
    price: 0,
    currency: 'USD',
    image: '',
    tags: [],
    isOnline: false,
    meetingLink: '',
    requirements: '',
    refundPolicy: '',
    ...initialData
  })

  const [errors, setErrors] = useState<Partial<EventData>>({})
  const [currentTag, setCurrentTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = [
    'Technology', 'Business', 'Education', 'Health & Wellness', 
    'Arts & Culture', 'Sports', 'Food & Drink', 'Travel', 
    'Entertainment', 'Networking', 'Other'
  ]

  const eventTypes = [
    'Conference', 'Workshop', 'Seminar', 'Meetup', 'Webinar', 
    'Training', 'Exhibition', 'Festival', 'Party', 'Other'
  ]

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR']

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear error when user starts typing
    if (errors[name as keyof EventData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }))
      setCurrentTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required'
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category'
    }

    if (!formData.eventType) {
      newErrors.eventType = 'Please select an event type'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required'
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required'
    }

    if (!formData.isOnline) {
      if (!formData.location.trim()) {
        newErrors.location = 'Event location is required'
      }
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required'
      }
      if (!formData.city.trim()) {
        newErrors.city = 'City is required'
      }
    }

    if (formData.isOnline && !formData.meetingLink?.trim()) {
      newErrors.meetingLink = 'Meeting link is required for online events'
    }

    if (formData.maxAttendees < 1) {
      newErrors.maxAttendees = 'Maximum attendees must be at least 1'
    }

    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setIsSubmitting(true)
      try {
        await onSubmit?.(formData)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-white via-primary-50/30 to-primary-100/20 rounded-3xl shadow-2xl overflow-hidden border border-primary-200/50"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gradient-to-r from-primary-600 to-primary-700 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 break-words">
            {mode === 'create' ? 'Create New Event' : 'Edit Event'}
          </h1>
          <p className="text-primary-100 text-xs sm:text-sm break-words">
            {mode === 'create' 
              ? 'Fill in the details to create your event' 
              : 'Update your event information'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          {/* Basic Information */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2 break-words">
              <Tag className="w-5 h-5 text-primary-600" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-semibold text-gray-900">
                  Event Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full px-4 py-3.5 border rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white/80",
                    errors.title ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-gray-300"
                  )}
                  placeholder="Enter event title"
                />
                {errors.title && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs font-medium"
                  >
                    {errors.title}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-semibold text-gray-900">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full px-4 py-3.5 border rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white/80",
                    errors.category ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs font-medium"
                  >
                    {errors.category}
                  </motion.p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-semibold text-gray-900">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={cn(
                  "w-full px-4 py-3.5 border rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white/80 resize-none",
                  errors.description ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-gray-300"
                )}
                placeholder="Describe your event..."
              />
              {errors.description && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs font-medium"
                >
                  {errors.description}
                </motion.p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="eventType" className="block text-sm font-semibold text-gray-900">
                  Event Type *
                </label>
                <select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full px-4 py-3.5 border rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white/80",
                    errors.eventType ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <option value="">Select event type</option>
                  {eventTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.eventType && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs font-medium"
                  >
                    {errors.eventType}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Event Format
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isOnline"
                      checked={!formData.isOnline}
                      onChange={() => setFormData(prev => ({ ...prev, isOnline: false }))}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">In-Person</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isOnline"
                      checked={formData.isOnline}
                      onChange={() => setFormData(prev => ({ ...prev, isOnline: true }))}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Online</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              Date & Time
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="startDate" className="block text-sm font-semibold text-gray-900">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full px-4 py-3.5 border rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white/80",
                    errors.startDate ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-gray-300"
                  )}
                />
                {errors.startDate && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs font-medium"
                  >
                    {errors.startDate}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="endDate" className="block text-sm font-semibold text-gray-900">
                  End Date *
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full px-4 py-3.5 border rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white/80",
                    errors.endDate ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-gray-300"
                  )}
                />
                {errors.endDate && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs font-medium"
                  >
                    {errors.endDate}
                  </motion.p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="startTime" className="block text-sm font-semibold text-gray-900">
                  Start Time *
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full px-4 py-3.5 border rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white/80",
                    errors.startTime ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-gray-300"
                  )}
                />
                {errors.startTime && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs font-medium"
                  >
                    {errors.startTime}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="endTime" className="block text-sm font-semibold text-gray-900">
                  End Time *
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full px-4 py-3.5 border rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white/80",
                    errors.endTime ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-gray-300"
                  )}
                />
                {errors.endTime && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs font-medium"
                  >
                    {errors.endTime}
                  </motion.p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <AnimatePresence mode="wait">
            {!formData.isOnline ? (
              <motion.div
                key="location"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  Location
                </h2>
                
                <div className="space-y-2">
                  <label htmlFor="location" className="block text-sm font-semibold text-gray-900">
                    Venue Name *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full px-4 py-3.5 border rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white/80",
                      errors.location ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-gray-300"
                    )}
                    placeholder="Enter venue name"
                  />
                  {errors.location && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs font-medium"
                    >
                      {errors.location}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="address" className="block text-sm font-semibold text-gray-900">
                    Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full px-4 py-3.5 border rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white/80",
                      errors.address ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-gray-300"
                    )}
                    placeholder="Enter full address"
                  />
                  {errors.address && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs font-medium"
                    >
                      {errors.address}
                    </motion.p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="city" className="block text-sm font-semibold text-gray-900">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={cn(
                        "w-full px-4 py-3.5 border rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white/80",
                        errors.city ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-gray-300"
                      )}
                      placeholder="City"
                    />
                    {errors.city && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-xs font-medium"
                      >
                        {errors.city}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="state" className="block text-sm font-semibold text-gray-900">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white/80 hover:border-gray-300"
                      placeholder="State"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="zipCode" className="block text-sm font-semibold text-gray-900">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white/80 hover:border-gray-300"
                      placeholder="ZIP Code"
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="online"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  Online Event
                </h2>
                
                <div className="space-y-2">
                  <label htmlFor="meetingLink" className="block text-sm font-semibold text-gray-900">
                    Meeting Link *
                  </label>
                  <input
                    type="url"
                    id="meetingLink"
                    name="meetingLink"
                    value={formData.meetingLink}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full px-4 py-3.5 border rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white/80",
                      errors.meetingLink ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-gray-300"
                    )}
                    placeholder="https://zoom.us/j/..."
                  />
                  {errors.meetingLink && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs font-medium"
                    >
                      {errors.meetingLink}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pricing & Capacity */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary-600" />
              Pricing & Capacity
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="maxAttendees" className="block text-sm font-semibold text-gray-900">
                  Max Attendees *
                </label>
                <input
                  type="number"
                  id="maxAttendees"
                  name="maxAttendees"
                  value={formData.maxAttendees}
                  onChange={handleInputChange}
                  min="1"
                  className={cn(
                    "w-full px-4 py-3.5 border rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white/80",
                    errors.maxAttendees ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-gray-300"
                  )}
                />
                {errors.maxAttendees && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs font-medium"
                  >
                    {errors.maxAttendees}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="price" className="block text-sm font-semibold text-gray-900">
                  Price
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={cn(
                    "w-full px-4 py-3.5 border rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white/80",
                    errors.price ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-gray-300"
                  )}
                  placeholder="0.00"
                />
                {errors.price && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs font-medium"
                  >
                    {errors.price}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="currency" className="block text-sm font-semibold text-gray-900">
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white/80 hover:border-gray-300"
                >
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary-600" />
              Additional Information
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="image" className="block text-sm font-semibold text-gray-900">
                  Event Image URL
                </label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white/80 hover:border-gray-300"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Tags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white/80 hover:border-gray-300"
                    placeholder="Add a tag and press Enter"
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    variant="outline"
                    className="px-6"
                  >
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-primary-900"
                        >
                          <X size={14} />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="requirements" className="block text-sm font-semibold text-gray-900">
                  Requirements
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white/80 resize-none hover:border-gray-300"
                  placeholder="Any special requirements for attendees..."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="refundPolicy" className="block text-sm font-semibold text-gray-900">
                  Refund Policy
                </label>
                <textarea
                  id="refundPolicy"
                  name="refundPolicy"
                  value={formData.refundPolicy}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white/80 resize-none hover:border-gray-300"
                  placeholder="Describe your refund policy..."
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-primary-200/30">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary-600/25 transition-all duration-300"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {mode === 'create' ? 'Creating Event...' : 'Updating Event...'}
                  </div>
                ) : (
                  mode === 'create' ? 'Create Event' : 'Update Event'
                )}
              </Button>
            </motion.div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default EventForm

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { Check, Calendar, Users, Ticket, Star, ArrowRight, ArrowLeft, Camera, MapPin, User } from 'lucide-react'

interface OnboardingFlowProps {
  onComplete?: (data?: { avatar?: string; phone?: string; street?: string; city?: string; state?: string; zipCode?: string; country?: string }) => void
  onSkip?: () => void
  className?: string
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onSkip, className }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [onboardingData, setOnboardingData] = useState({
    avatar: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  })

  const steps = [
    {
      title: "Welcome to Eventify!",
      subtitle: "Let's get you started",
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
            <Star className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Eventify!</h3>
            <p className="text-gray-600">
              You&apos;re all set! Let&apos;s take a quick tour to help you get the most out of Eventify.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Discover Amazing Events",
      subtitle: "Find events you love",
      content: (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Browse Events</h4>
              <p className="text-sm text-gray-600">Discover events happening near you</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Ticket className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Easy Booking</h4>
              <p className="text-sm text-gray-600">Book tickets in just a few clicks</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Connect with Others</h4>
              <p className="text-sm text-gray-600">Meet like-minded people at events</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Add Your Photo",
      subtitle: "Let others recognize you",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="relative inline-block">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Profile preview"
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-primary-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center mx-auto border-4 border-primary-200">
                  <User size={48} className="text-primary-600" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center cursor-pointer transition-colors shadow-lg">
                <Camera size={20} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      if (!file.type.startsWith('image/')) {
                        alert('Please select an image file')
                        return
                      }
                      if (file.size > 5 * 1024 * 1024) {
                        alert('Image size should be less than 5MB')
                        return
                      }
                      
                      try {
                        // Create preview immediately
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          setAvatarPreview(reader.result as string)
                        }
                        reader.readAsDataURL(file)
                        
                        // Upload to S3
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
                        const token = localStorage.getItem('token')
                        
                        if (!token) {
                          alert('Please log in to upload images')
                          return
                        }
                        
                        const formData = new FormData()
                        formData.append('image', file)
                        formData.append('folder', 'avatars')
                        
                        const response = await fetch(`${apiUrl}/api/upload/image`, {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`
                          },
                          body: formData
                        })
                        
                        const result = await response.json()
                        if (result.success) {
                          console.log('Image uploaded to S3:', result.data.url)
                          setOnboardingData(prev => {
                            const updated = { ...prev, avatar: result.data.url }
                            console.log('Updated onboarding data with S3 URL:', !!updated.avatar)
                            return updated
                          })
                        } else {
                          alert('Failed to upload image. Please try again.')
                          console.error('Upload error:', result)
                        }
                      } catch (error) {
                        console.error('Error uploading image:', error)
                        alert('Error uploading image. Please try again.')
                      }
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Upload a profile photo to help others recognize you at events
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Your Contact Information",
      subtitle: "Help us connect with you",
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={onboardingData.phone}
              onChange={(e) => setOnboardingData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
            <input
              type="text"
              value={onboardingData.street}
              onChange={(e) => setOnboardingData(prev => ({ ...prev, street: e.target.value }))}
              placeholder="123 Main Street"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={onboardingData.city}
                onChange={(e) => setOnboardingData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="San Francisco"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input
                type="text"
                value={onboardingData.state}
                onChange={(e) => setOnboardingData(prev => ({ ...prev, state: e.target.value }))}
                placeholder="CA"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
              <input
                type="text"
                value={onboardingData.zipCode}
                onChange={(e) => setOnboardingData(prev => ({ ...prev, zipCode: e.target.value }))}
                placeholder="94102"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input
                type="text"
                value={onboardingData.country}
                onChange={(e) => setOnboardingData(prev => ({ ...prev, country: e.target.value }))}
                placeholder="USA"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            This information helps us show you relevant events in your area
          </p>
        </div>
      )
    },
    {
      title: "Want to Create Events?",
      subtitle: "Become an organizer",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-2">Create Your Own Events</h4>
            <p className="text-sm text-gray-600 mb-4">
              Want to host events? You can request organizer access to create and manage your own events.
            </p>
            <div className="flex items-center space-x-2 text-sm text-primary-600">
              <Check className="w-4 h-4" />
              <span>Admin approval required for quality control</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              For now, you can browse and attend events. When you&apos;re ready to create events, just let us know!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "You're All Set!",
      subtitle: "Ready to explore",
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <Check className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re Ready to Go!</h3>
            <p className="text-gray-600">
              Start exploring events and discover amazing experiences. Welcome to the Eventify community!
            </p>
          </div>
        </div>
      )
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Pass onboarding data when completing
      console.log('Completing onboarding with data:', {
        hasAvatar: !!onboardingData.avatar,
        avatarLength: onboardingData.avatar?.length || 0,
        phone: onboardingData.phone,
        city: onboardingData.city
      })
      onComplete?.(onboardingData)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onSkip?.()
  }

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-primary-50 via-white to-primary-100/30 rounded-3xl shadow-2xl overflow-hidden border border-primary-200/50"
      >
        {/* Header */}
        <div className="px-8 py-8 text-center border-b border-primary-200/30 bg-gradient-to-r from-primary-600 to-primary-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent"></div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-white mb-1">{steps[currentStep].title}</h1>
            <p className="text-primary-100 text-sm">{steps[currentStep].subtitle}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-8 py-4 bg-gradient-to-r from-primary-50/80 to-primary-100/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-sm text-gray-500">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-primary-600 to-primary-700 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-8 bg-gradient-to-b from-white to-primary-50/30">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              {steps[currentStep].content}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === currentStep 
                      ? "bg-primary-600 w-8" 
                      : index < currentStep 
                        ? "bg-primary-400" 
                        : "bg-gray-300"
                  )}
                />
              ))}
            </div>

            <div className="flex space-x-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="px-6 py-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={handleSkip}
                className="px-6 py-2 text-gray-600"
              >
                Skip Tour
              </Button>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="primary"
                  onClick={handleNext}
                  className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow-lg shadow-primary-600/25 transition-all duration-300"
                >
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default OnboardingFlow

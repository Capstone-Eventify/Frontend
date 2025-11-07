'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  CreditCard,
  Edit,
  Save,
  Camera,
  CheckCircle,
  AlertCircle,
  Plus,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useUser } from '@/contexts/UserContext'
import OrganizerApplicationModal from './OrganizerApplicationModal'

// Mock stats data (in real app, this would come from API)
const defaultStats = {
  eventsAttended: 12,
  totalSpent: 450,
  favoriteCategories: ['Technology', 'Design', 'Business'],
  networkingScore: 8.5
}


export default function ProfileSection() {
  const { user, isOrganizer, isAdmin, canCreateEvents, canAccessAdmin, updateUser } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [organizerApplication, setOrganizerApplication] = useState<any>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  
  // Use user data from context with fallbacks
  const userData = {
    name: user?.name || 'User',
    email: user?.email || 'user@example.com',
    phone: '+1 (555) 123-4567', // Default demo data
    location: 'San Francisco, CA', // Default demo data
    joinDate: user?.joinDate ? new Date(user.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently',
    avatar: user?.avatar || null, // Use null instead of default image
    bio: 'Passionate about technology and innovation. Love attending tech conferences and networking events.',
    stats: defaultStats
  }

  const [formData, setFormData] = useState({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    location: userData.location,
    bio: userData.bio
  })

  // Update formData when user data changes
  useEffect(() => {
    setFormData({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      location: userData.location,
      bio: userData.bio
    })
    // Reset avatar preview when user changes
    setAvatarPreview(null)
  }, [user?.name, user?.email, user?.avatar])

  // Load organizer application status
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.id) {
      const applications = JSON.parse(localStorage.getItem('eventify_organizer_applications') || '[]')
      const userApplication = applications.find((app: any) => app.userId === user.id)
      if (userApplication) {
        setOrganizerApplication(userApplication)
      }
    }
  }, [user?.id])

  const handleSave = () => {
    // Update user data
    if (user) {
      const updatedAvatar = avatarPreview || user?.avatar || null
      updateUser({
        name: formData.name,
        email: formData.email,
        avatar: updatedAvatar
      })
    }
    setIsEditing(false)
    setAvatarPreview(null)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }

      // Create preview using FileReader
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setAvatarPreview(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setAvatarPreview(null)
    // Reset form data
    setFormData({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      location: userData.location,
      bio: userData.bio
    })
  }


  const handleApplicationSubmitted = () => {
    // Reload application status after submission
    if (typeof window !== 'undefined' && user?.id) {
      const applications = JSON.parse(localStorage.getItem('eventify_organizer_applications') || '[]')
      const userApplication = applications.find((app: any) => app.userId === user.id)
      if (userApplication) {
        setOrganizerApplication(userApplication)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save size={16} className="mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit size={16} className="mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center">
              <div className="relative inline-block">
                {avatarPreview || user?.avatar ? (
                  <img
                    src={avatarPreview || user?.avatar}
                    alt={userData.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4 border-2 border-gray-200">
                    <User size={40} className="text-primary-600" />
                  </div>
                )}
                {isEditing && (
                  <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center cursor-pointer transition-colors shadow-lg">
                    <Camera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">{userData.name}</h2>
              <p className="text-gray-600 mb-4">{userData.email}</p>
              <Badge className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle size={14} className="mr-1" />
                Verified
              </Badge>
            </div>

            {/* Stats */}
            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Events Attended</span>
                <span className="font-semibold text-gray-900">{userData.stats.eventsAttended}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Spent</span>
                <span className="font-semibold text-gray-900">${userData.stats.totalSpent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Networking Score</span>
                <span className="font-semibold text-gray-900">{userData.stats.networkingScore}/10</span>
              </div>
            </div>

            {/* Favorite Categories */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Favorite Categories</h3>
              <div className="flex flex-wrap gap-2">
                {userData.stats.favoriteCategories.map((category) => (
                  <Badge key={category} variant="outline" size="sm">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{userData.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{userData.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{userData.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{userData.location}</p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{userData.bio}</p>
              )}
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Role</p>
                <div className="flex flex-wrap gap-2 items-center">
                  {isAdmin && (
                    <Badge variant="error">
                      Admin
                    </Badge>
                  )}
                  {isOrganizer && !isAdmin && (
                    <Badge variant="success">
                      Organizer
                    </Badge>
                  )}
                      {!isOrganizer && !isAdmin && (
                        <Badge variant="outline">
                          Attendee
                        </Badge>
                      )}
                </div>
              </div>

              {/* Status Messages */}
              {!isOrganizer && !isAdmin && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle size={16} className="text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      To create events, you need to apply for organizer status and get admin approval.
                    </span>
                  </div>
                </div>
              )}

              {isOrganizer && !isAdmin && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-green-600" />
                    <span className="text-sm text-green-800">
                      You are an approved organizer! You can create and manage events.
                    </span>
                  </div>
                </div>
              )}

              {isAdmin && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Shield size={16} className="text-red-600" />
                    <span className="text-sm text-red-800">
                      Admin access detected! You can manage the platform.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Organizer Application - Only show if not already an organizer */}
          {!isOrganizer && !isAdmin && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Plus size={20} className="mr-2 text-primary-600" />
                Become an Organizer
              </h3>
              
              {organizerApplication ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border ${
                    organizerApplication.status === 'approved' 
                      ? 'bg-green-50 border-green-200' 
                      : organizerApplication.status === 'rejected'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {organizerApplication.status === 'approved' && <CheckCircle size={20} className="text-green-600" />}
                        {organizerApplication.status === 'rejected' && <AlertCircle size={20} className="text-red-600" />}
                        {organizerApplication.status === 'pending' && <Clock size={20} className="text-yellow-600" />}
                        <span className={`font-medium ${
                          organizerApplication.status === 'approved' 
                            ? 'text-green-800' 
                            : organizerApplication.status === 'rejected'
                            ? 'text-red-800'
                            : 'text-yellow-800'
                        }`}>
                          Application {organizerApplication.status.charAt(0).toUpperCase() + organizerApplication.status.slice(1)}
                        </span>
                      </div>
                      <Badge 
                        variant={
                          organizerApplication.status === 'approved' ? 'success' :
                          organizerApplication.status === 'rejected' ? 'error' :
                          'warning'
                        }
                      >
                        {organizerApplication.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">
                      {organizerApplication.status === 'pending' && 'Your application is under review. We will notify you once a decision is made.'}
                      {organizerApplication.status === 'approved' && 'Congratulations! Your organizer application has been approved. You can now create and manage events.'}
                      {organizerApplication.status === 'rejected' && 'Your application was not approved at this time. You can submit a new application if you have additional information.'}
                    </p>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600">
                        <strong>Organization:</strong> {organizerApplication.organizationName}
                      </p>
                      <p className="text-xs text-gray-600">
                        <strong>Submitted:</strong> {new Date(organizerApplication.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowApplicationModal(true)}
                    className="w-full"
                  >
                    {organizerApplication.status === 'rejected' ? 'Submit New Application' : 'View Application'}
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Apply to become an organizer and start creating your own events. Once approved, you'll be able to create, manage, and sell tickets for your events.
                  </p>
                  <Button onClick={() => setShowApplicationModal(true)}>
                    <Plus size={16} className="mr-2" />
                    Apply to Become an Organizer
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Organizer Application Modal */}
          <OrganizerApplicationModal
            isOpen={showApplicationModal}
            onClose={() => {
              setShowApplicationModal(false)
            }}
            existingApplication={organizerApplication}
            onApplicationSubmitted={handleApplicationSubmitted}
          />

        </div>
      </div>
    </div>
  )
}

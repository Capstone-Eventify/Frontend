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

export default function ProfileSection() {
  const { user, isOrganizer, isAdmin, canCreateEvents, canAccessAdmin, updateUser } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [organizerApplication, setOrganizerApplication] = useState<any>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [stats, setStats] = useState({
    eventsAttended: 0,
    totalSpent: 0,
    favoriteCategories: [] as string[],
    networkingScore: 0
  })
  const [loading, setLoading] = useState(true)
  
  // Fetch user profile from API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        const token = localStorage.getItem('token')
        
        if (!token || !user?.id) {
          setLoading(false)
          return
        }

        // Fetch user profile
        const profileResponse = await fetch(`${apiUrl}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          if (profileData.success) {
            setUserProfile(profileData.data)
            // Update user context with avatar and other profile data
            updateUser({
              name: `${profileData.data.firstName} ${profileData.data.lastName}`,
              email: profileData.data.email,
              avatar: profileData.data.avatar || undefined
            })
          }
        }

        // Fetch user tickets to calculate stats
        const ticketsResponse = await fetch(`${apiUrl}/api/tickets`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (ticketsResponse.ok) {
          const ticketsData = await ticketsResponse.json()
          if (ticketsData.success) {
            const tickets = ticketsData.data || []
            
            // Calculate events attended (confirmed tickets)
            const eventsAttended = new Set(tickets.filter((t: any) => t.status === 'CONFIRMED').map((t: any) => t.eventId)).size
            
            // Calculate total spent
            const totalSpent = tickets
              .filter((t: any) => t.status === 'CONFIRMED' && t.payment?.status === 'COMPLETED')
              .reduce((sum: number, ticket: any) => {
                const price = typeof ticket.price === 'number' ? ticket.price : parseFloat(ticket.price || 0)
                return sum + (isNaN(price) ? 0 : price)
              }, 0)
            
            // Calculate favorite categories from attended events
            const eventIds = [...new Set(tickets.filter((t: any) => t.status === 'CONFIRMED').map((t: any) => t.eventId))]
            const categoryCounts: { [key: string]: number } = {}
            
            // Fetch events to get categories
            const eventsResponse = await fetch(`${apiUrl}/api/events`)
            if (eventsResponse.ok) {
              const eventsData = await eventsResponse.json()
              if (eventsData.success) {
                const userEvents = eventsData.data.filter((e: any) => eventIds.includes(e.id))
                userEvents.forEach((event: any) => {
                  if (event.category) {
                    categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1
                  }
                })
              }
            }
            
            const favoriteCategories = Object.entries(categoryCounts)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([category]) => category)
            
            // Calculate networking score (simplified: based on events attended)
            const networkingScore = Math.min(10, Math.round((eventsAttended / 10) * 10) / 10)
            
            setStats({
              eventsAttended,
              totalSpent,
              favoriteCategories,
              networkingScore
            })
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchProfile()
    }
  }, [user?.id])

  // Use user data from API with fallbacks
  const userData = {
    name: userProfile?.name || user?.name || 'User',
    email: userProfile?.email || user?.email || 'user@example.com',
    phone: userProfile?.phone || '',
    location: userProfile?.city && userProfile?.state 
      ? `${userProfile.city}, ${userProfile.state}`
      : userProfile?.city || userProfile?.state || '',
    street: userProfile?.street || '',
    city: userProfile?.city || '',
    state: userProfile?.state || '',
    zipCode: userProfile?.zipCode || '',
    country: userProfile?.country || '',
    joinDate: userProfile?.createdAt || user?.joinDate 
      ? new Date(userProfile?.createdAt || user.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : 'Recently',
    avatar: userProfile?.avatar || user?.avatar || null,
    bio: userProfile?.bio || ''
  }

  const [formData, setFormData] = useState({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    street: userData.street,
    city: userData.city,
    state: userData.state,
    zipCode: userData.zipCode,
    country: userData.country,
    bio: userData.bio
  })

  // Update formData when user profile data changes
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        street: userData.street,
        city: userData.city,
        state: userData.state,
        zipCode: userData.zipCode,
        country: userData.country,
        bio: userData.bio
      })
    }
    // Reset avatar preview when user changes
    setAvatarPreview(null)
  }, [userProfile, user?.name, user?.email, user?.avatar])

  // Load organizer application status from API
  useEffect(() => {
    const fetchApplication = async () => {
      if (!user?.id) return

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        const token = localStorage.getItem('token')
        
        if (!token) return

        const response = await fetch(`${apiUrl}/api/organizer-applications/my-application`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            setOrganizerApplication(data.data)
          }
        } else if (response.status === 404) {
          // No application found, which is fine
          setOrganizerApplication(null)
        }
      } catch (error) {
        console.error('Error fetching application:', error)
      }
    }

    fetchApplication()
  }, [user?.id])

  const handleSave = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      if (!token) return

      // Use S3 URL if avatarPreview is a URL (starts with http), otherwise use existing avatar
      const updatedAvatar = avatarPreview?.startsWith('http') 
        ? avatarPreview 
        : (avatarPreview || userProfile?.avatar || null)
      
      // Update profile via API
      const response = await fetch(`${apiUrl}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: formData.name.split(' ')[0],
          lastName: formData.name.split(' ').slice(1).join(' ') || '',
          email: formData.email,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          bio: formData.bio,
          avatar: updatedAvatar
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setUserProfile(result.data)
          updateUser({
            name: formData.name,
            email: formData.email,
            avatar: updatedAvatar
          })
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    }
    
    setIsEditing(false)
    setAvatarPreview(null)
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      // Create preview immediately
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to S3
      try {
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
          console.log('Avatar uploaded to S3:', result.data.url)
          // Update preview with S3 URL
          setAvatarPreview(result.data.url)
        } else {
          alert('Failed to upload image. Please try again.')
          console.error('Upload error:', result)
        }
      } catch (error) {
        console.error('Error uploading avatar:', error)
        alert('Error uploading image. Please try again.')
      }
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
      street: userData.street,
      city: userData.city,
      state: userData.state,
      zipCode: userData.zipCode,
      country: userData.country,
      bio: userData.bio
    })
  }


  const handleApplicationSubmitted = () => {
    // Reload application status after submission - fetch from API
    if (user?.id) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        const token = localStorage.getItem('token')
        if (token) {
          const response = await fetch(`${apiUrl}/api/organizer-applications/my-application`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.data) {
              const userApplication = data.data
              setOrganizerApplication(userApplication)
            }
          }
        } catch (error) {
          console.error('Error fetching organizer application:', error)
        }
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
                {avatarPreview || userProfile?.avatar || user?.avatar ? (
                  <img
                    src={avatarPreview || userProfile?.avatar || user?.avatar}
                    alt={userData.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-2 border-gray-200"
                    onError={(e) => {
                      // If image fails to load (e.g., 403), show placeholder
                      console.error('Failed to load avatar image:', e.currentTarget.src)
                      e.currentTarget.style.display = 'none'
                    }}
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
                <span className="font-semibold text-gray-900">{stats.eventsAttended}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Spent</span>
                <span className="font-semibold text-gray-900">${stats.totalSpent.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Networking Score</span>
                <span className="font-semibold text-gray-900">{stats.networkingScore.toFixed(1)}/10</span>
              </div>
            </div>

            {/* Favorite Categories */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Favorite Categories</h3>
              <div className="flex flex-wrap gap-2">
                {stats.favoriteCategories.length > 0 ? (
                  stats.favoriteCategories.map((category) => (
                    <Badge key={category} variant="outline" size="sm">
                      {category}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Attend events to see your favorite categories</p>
                )}
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
                    placeholder="+1 (555) 123-4567"
                  />
                ) : (
                  <p className="text-gray-900">{userData.phone || 'Not provided'}</p>
                )}
              </div>
              {!isEditing && userData.location && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <p className="text-gray-900">{userData.location}</p>
                </div>
              )}
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="123 Main Street"
                    />
                  ) : (
                    <p className="text-gray-900">{userData.street || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="San Francisco"
                    />
                  ) : (
                    <p className="text-gray-900">{userData.city || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="CA"
                    />
                  ) : (
                    <p className="text-gray-900">{userData.state || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="94102"
                    />
                  ) : (
                    <p className="text-gray-900">{userData.zipCode || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="USA"
                    />
                  ) : (
                    <p className="text-gray-900">{userData.country || 'Not provided'}</p>
                  )}
                </div>
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
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-900">{userData.bio || 'No bio provided'}</p>
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

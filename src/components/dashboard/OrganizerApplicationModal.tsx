'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Plus, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useUser } from '@/contexts/UserContext'

interface OrganizerApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  existingApplication?: any
  onApplicationSubmitted?: () => void
}

export default function OrganizerApplicationModal({
  isOpen,
  onClose,
  existingApplication,
  onApplicationSubmitted
}: OrganizerApplicationModalProps) {
  const { user } = useUser()
  const [applicationFormData, setApplicationFormData] = useState({
    organizationName: '',
    website: '',
    description: '',
    reason: '',
    experience: ''
  })
  const [applicationErrors, setApplicationErrors] = useState<Record<string, string>>({})
  const [application, setApplication] = useState<any>(existingApplication || null)

  useEffect(() => {
    if (existingApplication) {
      setApplication(existingApplication)
    } else {
      setApplication(null)
      setApplicationFormData({
        organizationName: '',
        website: '',
        description: '',
        reason: '',
        experience: ''
      })
      setApplicationErrors({})
    }
  }, [existingApplication, isOpen])

  const handleApplicationInputChange = (field: string, value: string) => {
    setApplicationFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (applicationErrors[field]) {
      setApplicationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateApplication = () => {
    const errors: Record<string, string> = {}
    if (!applicationFormData.organizationName.trim()) {
      errors.organizationName = 'Organization name is required'
    }
    if (!applicationFormData.description.trim()) {
      errors.description = 'Description is required'
    }
    if (!applicationFormData.reason.trim()) {
      errors.reason = 'Reason for applying is required'
    }
    setApplicationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmitApplication = () => {
    if (!validateApplication()) return

    const newApplication = {
      id: `app_${Date.now()}`,
      userId: user?.id,
      userEmail: user?.email,
      userName: user?.name,
      organizationName: applicationFormData.organizationName,
      website: applicationFormData.website,
      description: applicationFormData.description,
      reason: applicationFormData.reason,
      experience: applicationFormData.experience,
      status: 'pending',
      submittedAt: new Date().toISOString()
    }

    // Save to localStorage
    if (typeof window !== 'undefined') {
      const applications = JSON.parse(localStorage.getItem('eventify_organizer_applications') || '[]')
      // Remove old application if resubmitting
      const filteredApplications = applications.filter((app: any) => app.userId !== user?.id)
      localStorage.setItem('eventify_organizer_applications', JSON.stringify([...filteredApplications, newApplication]))
    }

    setApplication(newApplication)
    // Notify parent component
    if (onApplicationSubmitted) {
      onApplicationSubmitted()
    }
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
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Plus size={24} className="mr-2 text-primary-600" />
              Become an Organizer
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {application ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${
                  application.status === 'approved' 
                    ? 'bg-green-50 border-green-200' 
                    : application.status === 'rejected'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {application.status === 'approved' && <CheckCircle size={20} className="text-green-600" />}
                      {application.status === 'rejected' && <AlertCircle size={20} className="text-red-600" />}
                      {application.status === 'pending' && <Clock size={20} className="text-yellow-600" />}
                      <span className={`font-medium ${
                        application.status === 'approved' 
                          ? 'text-green-800' 
                          : application.status === 'rejected'
                          ? 'text-red-800'
                          : 'text-yellow-800'
                      }`}>
                        Application {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                    <Badge 
                      variant={
                        application.status === 'approved' ? 'success' :
                        application.status === 'rejected' ? 'error' :
                        'warning'
                      }
                    >
                      {application.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">
                    {application.status === 'pending' && 'Your application is under review. We will notify you once a decision is made.'}
                    {application.status === 'approved' && 'Congratulations! Your organizer application has been approved. You can now create and manage events.'}
                    {application.status === 'rejected' && 'Your application was not approved at this time. You can submit a new application if you have additional information.'}
                  </p>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      <strong>Organization:</strong> {application.organizationName}
                    </p>
                    <p className="text-xs text-gray-600">
                      <strong>Submitted:</strong> {new Date(application.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {application.status === 'rejected' && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setApplication(null)
                      if (typeof window !== 'undefined' && user?.id) {
                        const applications = JSON.parse(localStorage.getItem('eventify_organizer_applications') || '[]')
                        const updatedApplications = applications.filter((app: any) => app.userId !== user.id)
                        localStorage.setItem('eventify_organizer_applications', JSON.stringify(updatedApplications))
                      }
                    }}
                    className="w-full"
                  >
                    Submit New Application
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Apply to become an organizer and start creating your own events. Once approved, you'll be able to create, manage, and sell tickets for your events.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    value={applicationFormData.organizationName}
                    onChange={(e) => handleApplicationInputChange('organizationName', e.target.value)}
                    placeholder="Enter your organization or company name"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      applicationErrors.organizationName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {applicationErrors.organizationName && (
                    <p className="text-sm text-red-600 mt-1">{applicationErrors.organizationName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={applicationFormData.website}
                    onChange={(e) => handleApplicationInputChange('website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={applicationFormData.description}
                    onChange={(e) => handleApplicationInputChange('description', e.target.value)}
                    placeholder="Describe your organization and the types of events you plan to host"
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      applicationErrors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {applicationErrors.description && (
                    <p className="text-sm text-red-600 mt-1">{applicationErrors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Why do you want to become an organizer? *
                  </label>
                  <textarea
                    value={applicationFormData.reason}
                    onChange={(e) => handleApplicationInputChange('reason', e.target.value)}
                    placeholder="Tell us about your motivation and goals as an event organizer"
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      applicationErrors.reason ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {applicationErrors.reason && (
                    <p className="text-sm text-red-600 mt-1">{applicationErrors.reason}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Organizing Experience (Optional)
                  </label>
                  <textarea
                    value={applicationFormData.experience}
                    onChange={(e) => handleApplicationInputChange('experience', e.target.value)}
                    placeholder="Share any previous experience organizing events"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
            {!application ? (
              <>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitApplication}>
                  <Save size={16} className="mr-2" />
                  Submit Application
                </Button>
              </>
            ) : (
              <Button onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}


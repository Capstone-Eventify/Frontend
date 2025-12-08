'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  User as UserIcon,
  Mail,
  Calendar,
  Globe,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useUser } from '@/contexts/UserContext'

interface OrganizerApplication {
  id: string
  userId: string
  userEmail: string
  userName: string
  organizationName: string
  website?: string
  description: string
  reason: string
  experience?: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
}

export default function AdminDashboard() {
  const { updateUserRole } = useUser()
  const [applications, setApplications] = useState<OrganizerApplication[]>([])
  const [filteredApplications, setFilteredApplications] = useState<OrganizerApplication[]>([])
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Load applications from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('eventify_organizer_applications')
      if (stored) {
        try {
          const apps = JSON.parse(stored)
          setApplications(apps)
          setFilteredApplications(apps)
        } catch (error) {
          console.error('Error loading applications:', error)
        }
      }
    }
  }, [])

  // Filter applications
  useEffect(() => {
    let filtered = applications

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(app => app.status === selectedStatus)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(app =>
        app.userName.toLowerCase().includes(query) ||
        app.userEmail.toLowerCase().includes(query) ||
        app.organizationName.toLowerCase().includes(query)
      )
    }

    // Sort by submitted date (newest first)
    filtered.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

    setFilteredApplications(filtered)
  }, [applications, selectedStatus, searchQuery])

  const handleApprove = (application: OrganizerApplication) => {
    // Update application status
    const updatedApplications = applications.map(app =>
      app.id === application.id
        ? { ...app, status: 'approved' as const }
        : app
    )
    setApplications(updatedApplications)
    localStorage.setItem('eventify_organizer_applications', JSON.stringify(updatedApplications))

    // Update user role in localStorage
    if (typeof window !== 'undefined') {
      // Store approved users mapping
      const approvedUsers = JSON.parse(localStorage.getItem('eventify_approved_organizers') || '{}')
      approvedUsers[application.userId] = {
        role: 'organizer',
        organizerStatus: 'approved',
        approvedAt: new Date().toISOString()
      }
      localStorage.setItem('eventify_approved_organizers', JSON.stringify(approvedUsers))

      // If this is the current user, update their role immediately
      const currentUser = JSON.parse(localStorage.getItem('eventify_user') || 'null')
      if (currentUser && currentUser.id === application.userId) {
        const updatedUser = {
          ...currentUser,
          role: 'organizer' as const,
          organizerStatus: 'approved' as const
        }
        localStorage.setItem('eventify_user', JSON.stringify(updatedUser))
        updateUserRole('organizer', 'approved')
      }
    }
  }

  const handleReject = (application: OrganizerApplication) => {
    const updatedApplications = applications.map(app =>
      app.id === application.id
        ? { ...app, status: 'rejected' as const }
        : app
    )
    setApplications(updatedApplications)
    localStorage.setItem('eventify_organizer_applications', JSON.stringify(updatedApplications))
  }

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield size={28} className="mr-3 text-red-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Review and manage organizer applications</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircle size={24} className="text-red-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Organizer Applications</h2>
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or organization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedStatus === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus('all')}
                >
                  All
                </Button>
                <Button
                  variant={selectedStatus === 'pending' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus('pending')}
                >
                  Pending
                </Button>
                <Button
                  variant={selectedStatus === 'approved' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus('approved')}
                >
                  Approved
                </Button>
                <Button
                  variant={selectedStatus === 'rejected' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus('rejected')}
                >
                  Rejected
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No applications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application, index) => (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Application Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {application.organizationName}
                            </h3>
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
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <UserIcon size={16} />
                              <span>{application.userName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail size={16} />
                              <span>{application.userEmail}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={16} />
                              <span>{new Date(application.submittedAt).toLocaleDateString()}</span>
                            </div>
                            {application.website && (
                              <div className="flex items-center gap-1">
                                <Globe size={16} />
                                <a
                                  href={application.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary-600 hover:underline"
                                >
                                  Website
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                          <p className="text-sm text-gray-600">{application.description}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Reason for Applying</p>
                          <p className="text-sm text-gray-600">{application.reason}</p>
                        </div>
                        {application.experience && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Experience</p>
                            <p className="text-sm text-gray-600">{application.experience}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 lg:w-48">
                      {application.status === 'pending' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(application)}
                            className="w-full"
                          >
                            <CheckCircle size={16} className="mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(application)}
                            className="w-full text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <XCircle size={16} className="mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                      {application.status === 'approved' && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 text-green-800">
                            <CheckCircle size={16} />
                            <span className="text-sm font-medium">Approved</span>
                          </div>
                          <p className="text-xs text-green-700 mt-1">
                            User can now create events
                          </p>
                        </div>
                      )}
                      {application.status === 'rejected' && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2 text-red-800">
                            <XCircle size={16} />
                            <span className="text-sm font-medium">Rejected</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


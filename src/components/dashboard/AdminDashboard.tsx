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
  AlertCircle,
  MessageSquare,
  Send,
  Eye,
  Filter,
  Bell
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useUser } from '@/contexts/UserContext'
import NotificationTestPanel from '@/components/notifications/NotificationTestPanel'
import CommunicationTestPanel from '@/components/admin/CommunicationTestPanel'

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

interface SupportTicket {
  id: string
  userId: string
  subject: string
  description: string
  category: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
  resolvedAt?: string
  resolution?: string
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  replies?: any[]
}

export default function AdminDashboard() {
  const { updateUserRole, refreshUser } = useUser()
  const [activeTab, setActiveTab] = useState<'applications' | 'support' | 'notifications' | 'communications'>('applications')
  const [applications, setApplications] = useState<OrganizerApplication[]>([])
  const [filteredApplications, setFilteredApplications] = useState<OrganizerApplication[]>([])
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Support tickets state
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([])
  const [selectedTicketStatus, setSelectedTicketStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all')
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [replyMessage, setReplyMessage] = useState('')

  // Load applications from API
  useEffect(() => {
    let isCancelled = false
    
    const fetchApplications = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        const token = localStorage.getItem('token')
        
        if (!token) return

        const response = await fetch(`${apiUrl}/api/organizer-applications`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (isCancelled) return

        if (response.ok) {
          const data = await response.json()
          if (data.success && !isCancelled) {
            setApplications(data.data || [])
            setFilteredApplications(data.data || [])
          }
        } else {
          // Handle non-200 responses gracefully
          if (!isCancelled) {
            console.warn('Failed to fetch applications:', response.status)
          }
        }
      } catch (error) {
        // Only log if not cancelled and if it's a real error (not connection refused during dev)
        if (!isCancelled) {
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            console.warn('Backend server may not be running. Please start the backend server.')
          } else {
            console.error('Error fetching applications:', error)
          }
        }
      }
    }

    fetchApplications()
    
    return () => {
      isCancelled = true
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

  const handleApprove = async (application: OrganizerApplication) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      if (!token) {
        alert('Please sign in to approve organizers')
        return
      }

      // Update user role in database
      const response = await fetch(`${apiUrl}/api/users/${application.userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: 'ORGANIZER' })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update user role' }))
        throw new Error(errorData.message || 'Failed to update user role')
      }

      const result = await response.json()
      
      if (result.success) {
        // Update application status via API
        const approveResponse = await fetch(`${apiUrl}/api/organizer-applications/${application.id}/approve`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notes: 'Approved by admin' })
        })

        if (approveResponse.ok) {
          const approveResult = await approveResponse.json()
          
          // Refresh applications list
          const refreshResponse = await fetch(`${apiUrl}/api/organizer-applications`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json()
            if (refreshData.success) {
              setApplications(refreshData.data || [])
            }
          }

          // If this is the current user, refresh their data from backend
          const currentUser = JSON.parse(localStorage.getItem('eventify_user') || 'null')
          if (currentUser && currentUser.id === application.userId) {
            // Refresh user data from backend to get updated role
            await refreshUser()
          }

          alert(`Organizer application approved! User role updated to ORGANIZER.`)
        } else {
          throw new Error('Failed to approve application')
        }
      } else {
        throw new Error(result.message || 'Failed to approve organizer')
      }
    } catch (error: any) {
      console.error('Error approving organizer:', error)
      alert(`Failed to approve organizer: ${error.message}`)
    }
  }

  const handleReject = async (application: OrganizerApplication) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      if (!token) {
        alert('You must be logged in to reject applications')
        return
      }

      // Reject application via API
      const response = await fetch(`${apiUrl}/api/organizer-applications/${application.id}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: 'Application rejected by admin' })
      })

      if (response.ok) {
        // Refresh applications from API
        const refreshResponse = await fetch(`${apiUrl}/api/organizer-applications`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()
          if (refreshData.success) {
            setApplications(refreshData.data || [])
          }
        }
        alert('Organizer application rejected')
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to reject application' }))
        alert(errorData.message || 'Failed to reject application')
      }
    } catch (error: any) {
      console.error('Error rejecting organizer:', error)
      alert(`Failed to reject organizer: ${error.message}`)
    }
  }

  const handleReply = async (ticketId: string) => {
    if (!replyMessage.trim()) {
      alert('Please enter a reply message')
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      if (!token) {
        alert('You must be logged in to reply to tickets')
        return
      }

      // Send reply via API (assuming endpoint exists)
      const response = await fetch(`${apiUrl}/api/support-tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: replyMessage })
      })

      if (response.ok) {
        // Refresh ticket details
        const refreshResponse = await fetch(`${apiUrl}/api/support-tickets/${ticketId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()
          if (refreshData.success) {
            setSelectedTicket(refreshData.data)
            setReplyMessage('')
          }
        }
        // Also refresh tickets list
        const ticketsResponse = await fetch(`${apiUrl}/api/support-tickets`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (ticketsResponse.ok) {
          const ticketsData = await ticketsResponse.json()
          if (ticketsData.success) {
            setSupportTickets(ticketsData.data || [])
          }
        }
        alert('Reply sent successfully')
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to send reply' }))
        alert(errorData.message || 'Failed to send reply')
      }
    } catch (error: any) {
      console.error('Error sending reply:', error)
      alert(`Failed to send reply: ${error.message}`)
    }
  }

  const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      if (!token) {
        alert('You must be logged in to update ticket status')
        return
      }

      // Update ticket status via API
      const response = await fetch(`${apiUrl}/api/support-tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        // Refresh ticket details
        const refreshResponse = await fetch(`${apiUrl}/api/support-tickets/${ticketId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()
          if (refreshData.success) {
            setSelectedTicket(refreshData.data)
          }
        }
        // Also refresh tickets list
        const ticketsResponse = await fetch(`${apiUrl}/api/support-tickets`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (ticketsResponse.ok) {
          const ticketsData = await ticketsResponse.json()
          if (ticketsData.success) {
            setSupportTickets(ticketsData.data || [])
            setFilteredTickets(ticketsData.data || [])
          }
        }
        alert(`Ticket status updated to ${status}`)
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update ticket status' }))
        alert(errorData.message || 'Failed to update ticket status')
      }
    } catch (error: any) {
      console.error('Error updating ticket status:', error)
      alert(`Failed to update ticket status: ${error.message}`)
    }
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
          <p className="text-gray-600 mt-1">Manage organizer applications and support tickets</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
            activeTab === 'applications'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Organizer Applications
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
            activeTab === 'support'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MessageSquare size={16} className="inline mr-2" />
          Support Tickets ({supportTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length})
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
            activeTab === 'notifications'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Bell size={16} className="inline mr-2" />
          Notification Testing
        </button>
        <button
          onClick={() => setActiveTab('communications')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
            activeTab === 'communications'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Mail size={16} className="inline mr-2" />
          SMS & Email Testing
        </button>
      </div>

      {activeTab === 'applications' && (
        <>

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
        </>
      )}

      {activeTab === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedTicketStatus === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTicketStatus('all')}
                >
                  All ({supportTickets.length})
                </Button>
                <Button
                  variant={selectedTicketStatus === 'open' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTicketStatus('open')}
                >
                  Open ({supportTickets.filter(t => t.status === 'open').length})
                </Button>
                <Button
                  variant={selectedTicketStatus === 'in_progress' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTicketStatus('in_progress')}
                >
                  In Progress ({supportTickets.filter(t => t.status === 'in_progress').length})
                </Button>
                <Button
                  variant={selectedTicketStatus === 'resolved' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTicketStatus('resolved')}
                >
                  Resolved ({supportTickets.filter(t => t.status === 'resolved').length})
                </Button>
              </div>
            </div>

            {/* Tickets */}
            <div className="space-y-3">
              {filteredTickets.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No support tickets found</p>
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all ${
                      selectedTicket?.id === ticket.id
                        ? 'border-primary-500 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={async () => {
                      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
                      const token = localStorage.getItem('token')
                      if (token) {
                        try {
                          const response = await fetch(`${apiUrl}/api/support-tickets/${ticket.id}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                          })
                          const data = await response.json()
                          if (data.success) {
                            setSelectedTicket(data.data)
                          }
                        } catch (error) {
                          console.error('Error fetching ticket:', error)
                        }
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                          <Badge
                            variant={
                              ticket.status === 'open' ? 'warning' :
                              ticket.status === 'in_progress' ? 'outline' :
                              ticket.status === 'resolved' ? 'success' : 'outline'
                            }
                          >
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                          <Badge
                            variant={
                              ticket.priority === 'urgent' ? 'error' :
                              ticket.priority === 'high' ? 'warning' :
                              ticket.priority === 'medium' ? 'outline' : 'outline'
                            }
                          >
                            {ticket.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{ticket.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{ticket.user.firstName} {ticket.user.lastName}</span>
                          <span>{ticket.user.email}</span>
                          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {ticket.replies && ticket.replies.length > 0 && (
                        <Badge variant="outline">{ticket.replies.length} replies</Badge>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Ticket Details & Reply */}
          {selectedTicket && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Ticket Details</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTicket(null)}
                  >
                    <XCircle size={16} />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Subject</label>
                    <p className="text-gray-900">{selectedTicket.subject}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">From</label>
                    <p className="text-gray-900">{selectedTicket.user.firstName} {selectedTicket.user.lastName}</p>
                    <p className="text-sm text-gray-600">{selectedTicket.user.email}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <Badge>{selectedTicket.category}</Badge>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedTicket.description}</p>
                  </div>

                  {/* Replies */}
                  {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Replies</label>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {selectedTicket.replies.map((reply: any) => (
                          <div
                            key={reply.id}
                            className={`p-3 rounded-lg ${
                              reply.isAdminReply ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">
                                {reply.user.firstName} {reply.user.lastName}
                                {reply.isAdminReply && <Badge variant="success" className="ml-2">Admin</Badge>}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(reply.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reply Form */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Reply</label>
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={4}
                    />
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleReply(selectedTicket.id)}
                        className="flex-1"
                      >
                        <Send size={16} className="mr-2" />
                        Send Reply
                      </Button>
                      {selectedTicket.status !== 'resolved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'resolved')}
                        >
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="pt-4 border-t border-gray-200">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={selectedTicket.status === 'open' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'open')}
                      >
                        Open
                      </Button>
                      <Button
                        variant={selectedTicket.status === 'in_progress' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'in_progress')}
                      >
                        In Progress
                      </Button>
                      <Button
                        variant={selectedTicket.status === 'resolved' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'resolved')}
                      >
                        Resolved
                      </Button>
                      <Button
                        variant={selectedTicket.status === 'closed' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'closed')}
                      >
                        Closed
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <NotificationTestPanel />
          
          {/* Additional notification management features */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Real-time WebSocket</h4>
                <p className="text-sm text-blue-700">
                  Test real-time notifications using the buttons above. Notifications will appear instantly in the notification bell.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Email Integration</h4>
                <p className="text-sm text-green-700">
                  Email notifications are sent automatically for event registrations, cancellations, and refunds.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'communications' && (
        <div className="space-y-6">
          <CommunicationTestPanel />
        </div>
      )}
    </div>
  )
}


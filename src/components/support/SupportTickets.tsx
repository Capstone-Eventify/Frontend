'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Clock, CheckCircle, XCircle, AlertCircle, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import SupportModal from './SupportModal'

interface SupportTicket {
  id: string
  subject: string
  message: string
  category: string
  priority: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  createdAt: string
  updatedAt: string
}

export default function SupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all')

  useEffect(() => {
    const fetchTickets = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setTickets([])
        return
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        const response = await fetch(`${apiUrl}/api/support-tickets`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            const formattedTickets = (data.data || []).map((ticket: any) => ({
              id: ticket.id,
              subject: ticket.subject,
              message: ticket.description || ticket.message,
              category: ticket.category,
              priority: ticket.priority,
              status: ticket.status,
              createdAt: ticket.createdAt,
              updatedAt: ticket.updatedAt || ticket.createdAt
            }))
            setTickets(formattedTickets)
          }
        }
      } catch (error) {
        console.error('Error fetching support tickets:', error)
        setTickets([])
      }
    }

    fetchTickets()
  }, [])

  const getStatusBadge = (status: string) => {
    const config = {
      open: { color: 'text-blue-600', bgColor: 'bg-blue-50', icon: Clock, label: 'Open' },
      in_progress: { color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: AlertCircle, label: 'In Progress' },
      resolved: { color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle, label: 'Resolved' },
      closed: { color: 'text-gray-600', bgColor: 'bg-gray-50', icon: XCircle, label: 'Closed' }
    }
    const statusConfig = config[status as keyof typeof config] || config.open
    const Icon = statusConfig.icon
    return (
      <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}>
        <Icon size={14} className="mr-1" />
        {statusConfig.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const config = {
      low: { color: 'text-gray-600', bgColor: 'bg-gray-50' },
      medium: { color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
      high: { color: 'text-orange-600', bgColor: 'bg-orange-50' },
      urgent: { color: 'text-red-600', bgColor: 'bg-red-50' }
    }
    const priorityConfig = config[priority as keyof typeof config] || config.medium
    return (
      <Badge className={`${priorityConfig.bgColor} ${priorityConfig.color} border-0`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-600">Manage your support requests</p>
        </div>
        <Button 
          onClick={() => setShowSupportModal(true)}
          variant="primary"
          size="lg"
        >
          <MessageSquare size={18} className="mr-2" />
          Create Support Ticket
        </Button>
      </div>

      {/* Quick Create Form - Always Visible */}
      {!showSupportModal && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Need Help?</h2>
            <Button 
              onClick={() => setShowSupportModal(true)}
              variant="primary"
            >
              <MessageSquare size={16} className="mr-2" />
              Open Support Form
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Click the button above to create a new support ticket. Our team will respond within 24-48 hours.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Tickets</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Open</p>
          <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">In Progress</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Resolved</p>
          <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'open' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('open')}
            >
              Open
            </Button>
            <Button
              variant={filterStatus === 'in_progress' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('in_progress')}
            >
              In Progress
            </Button>
            <Button
              variant={filterStatus === 'resolved' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('resolved')}
            >
              Resolved
            </Button>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets found</h3>
          <p className="text-gray-600 mb-4">
            {tickets.length === 0 
              ? "You haven't created any support tickets yet."
              : "No tickets match your search criteria."}
          </p>
          {tickets.length === 0 && (
            <Button onClick={() => setShowSupportModal(true)}>
              <MessageSquare size={16} className="mr-2" />
              Create Your First Ticket
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{ticket.subject}</h3>
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.message}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="capitalize">{ticket.category.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    {ticket.updatedAt !== ticket.createdAt && (
                      <>
                        <span>•</span>
                        <span>Updated {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Support Modal */}
      <SupportModal
        isOpen={showSupportModal}
        onClose={async () => {
          setShowSupportModal(false)
          // Reload tickets after closing modal
          const token = localStorage.getItem('token')
          if (token) {
            try {
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
              const response = await fetch(`${apiUrl}/api/support-tickets`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              })
              if (response.ok) {
                const data = await response.json()
                if (data.success) {
                  const formattedTickets = (data.data || []).map((ticket: any) => ({
                    id: ticket.id,
                    subject: ticket.subject,
                    message: ticket.description || ticket.message,
                    category: ticket.category,
                    priority: ticket.priority,
                    status: ticket.status,
                    createdAt: ticket.createdAt,
                    updatedAt: ticket.updatedAt || ticket.createdAt
                  }))
                  setTickets(formattedTickets)
                }
              }
            } catch (error) {
              console.error('Error reloading tickets:', error)
            }
          }
        }}
      />
    </div>
  )
}


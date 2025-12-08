'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Mail, 
  Calendar,
  Ticket,
  AlertCircle,
  Filter,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { WaitlistEntry } from '@/types/event'
import { useUser } from '@/contexts/UserContext'

interface WaitlistManagementProps {
  eventId: string
  eventTitle: string
  maxAttendees: number
  currentAttendees: number
  onClose?: () => void
}

export default function WaitlistManagement({
  eventId,
  eventTitle,
  maxAttendees,
  currentAttendees,
  onClose
}: WaitlistManagementProps) {
  const { user } = useUser()
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([])
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    // Load waitlist entries for this event
    if (typeof window !== 'undefined') {
      const allEntries = JSON.parse(localStorage.getItem('eventify_waitlist') || '[]')
      const eventEntries = allEntries.filter((entry: WaitlistEntry) => entry.eventId === eventId)
      setWaitlistEntries(eventEntries)
    }
  }, [eventId])

  const filteredEntries = waitlistEntries.filter(entry => {
    if (filterStatus === 'all') return true
    return entry.status === filterStatus
  })

  const handleApprove = (entryId: string) => {
    const entry = waitlistEntries.find(e => e.id === entryId)
    if (!entry) return

    const remainingCapacity = maxAttendees - currentAttendees
    if (remainingCapacity < entry.quantity) {
      alert(`Not enough capacity. Remaining: ${remainingCapacity}, Requested: ${entry.quantity}`)
      return
    }

    // Update waitlist entry status
    const allEntries = JSON.parse(localStorage.getItem('eventify_waitlist') || '[]')
    const updatedEntries = allEntries.map((e: WaitlistEntry) => 
      e.id === entryId ? { ...e, status: 'approved' as const } : e
    )
    localStorage.setItem('eventify_waitlist', JSON.stringify(updatedEntries))
    setWaitlistEntries(updatedEntries.filter((e: WaitlistEntry) => e.eventId === eventId))

    // Create ticket for approved entry
    const tickets = JSON.parse(localStorage.getItem('eventify_tickets') || '[]')
    const newTicket = {
      id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventId: entry.eventId,
      eventTitle: eventTitle,
      eventDate: new Date().toLocaleDateString(),
      eventTime: new Date().toLocaleTimeString(),
      eventLocation: '',
      ticketType: entry.ticketTierName,
      price: 0, // Will be set based on tier
      purchaseDate: new Date().toISOString(),
      status: 'confirmed',
      attendeeName: entry.userName,
      attendeeEmail: entry.userEmail,
      qrCode: `EVENT-${entry.eventId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderNumber: `ORD-${Date.now()}`,
      image: '',
      checkInStatus: 'pending' as 'pending' | 'checked_in' | 'no_show'
    }
    localStorage.setItem('eventify_tickets', JSON.stringify([...tickets, newTicket]))

    // Update event attendees count
    const organizerEvents = JSON.parse(localStorage.getItem('eventify_organizer_events') || '[]')
    const updatedEvents = organizerEvents.map((e: any) => {
      if (e.id === eventId) {
        return { ...e, attendees: (e.attendees || 0) + entry.quantity }
      }
      return e
    })
    localStorage.setItem('eventify_organizer_events', JSON.stringify(updatedEvents))

    alert(`Approved! Ticket created for ${entry.userName}`)
  }

  const handleReject = (entryId: string) => {
    if (!confirm('Are you sure you want to reject this waitlist request?')) return

    const allEntries = JSON.parse(localStorage.getItem('eventify_waitlist') || '[]')
    const updatedEntries = allEntries.map((e: WaitlistEntry) => 
      e.id === entryId ? { ...e, status: 'rejected' as const } : e
    )
    localStorage.setItem('eventify_waitlist', JSON.stringify(updatedEntries))
    setWaitlistEntries(updatedEntries.filter((e: WaitlistEntry) => e.eventId === eventId))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock size={12} className="mr-1" />Pending</Badge>
      case 'approved':
        return <Badge className="bg-green-50 text-green-700 border-green-200"><CheckCircle size={12} className="mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-50 text-red-700 border-red-200"><XCircle size={12} className="mr-1" />Rejected</Badge>
      default:
        return null
    }
  }

  const pendingCount = waitlistEntries.filter(e => e.status === 'pending').length
  const remainingCapacity = maxAttendees - currentAttendees

  const renderContent = () => (
    <>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Remaining Capacity</p>
              <p className="text-2xl font-bold text-gray-900">{remainingCapacity}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Ticket size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Attendees</p>
              <p className="text-2xl font-bold text-gray-900">{currentAttendees} / {maxAttendees}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <User size={24} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Warning if at capacity */}
      {remainingCapacity === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">Event at Full Capacity</h4>
              <p className="text-sm text-yellow-700">
                This event has reached its maximum capacity. You can only approve waitlist requests if capacity becomes available.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          <Button
            variant={filterStatus === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            All
          </Button>
          <Button
            variant={filterStatus === 'pending' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('pending')}
          >
            Pending
          </Button>
          <Button
            variant={filterStatus === 'approved' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('approved')}
          >
            Approved
          </Button>
          <Button
            variant={filterStatus === 'rejected' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('rejected')}
          >
            Rejected
          </Button>
        </div>
      </div>

      {/* Waitlist Entries */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Clock size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No waitlist entries</h3>
            <p className="text-gray-600">
              {filterStatus === 'all' 
                ? 'No one has requested to join the waitlist yet.'
                : `No ${filterStatus} entries found.`
              }
            </p>
          </div>
        ) : (
          filteredEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{entry.userName}</h3>
                    {getStatusBadge(entry.status)}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail size={14} />
                      {entry.userEmail}
                    </div>
                    <div className="flex items-center gap-2">
                      <Ticket size={14} />
                      {entry.ticketTierName} - Quantity: {entry.quantity}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      Requested: {new Date(entry.requestedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {entry.status === 'pending' && (
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleApprove(entry.id)}
                    disabled={remainingCapacity < entry.quantity}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReject(entry.id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <XCircle size={16} className="mr-2" />
                    Reject
                  </Button>
                  {remainingCapacity < entry.quantity && (
                    <span className="text-xs text-yellow-600">
                      Not enough capacity (need {entry.quantity}, have {remainingCapacity})
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </>
  )

  if (!onClose) {
    // If no onClose, render inline (backward compatibility)
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Waitlist Management</h2>
            <p className="text-gray-600 mt-1">{eventTitle}</p>
          </div>
        </div>
        {renderContent()}
      </div>
    )
  }

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
          className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Waitlist Management</h2>
              <p className="text-gray-600 mt-1">{eventTitle}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-full"
            >
              <X size={18} />
            </Button>
          </div>

          {/* Content - Scrollable */}
          <div className="overflow-y-auto flex-1 p-6">
            {renderContent()}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}


'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Download, CheckCircle, Clock, User, Mail, Calendar, Ticket, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import QRCodeScanner from './QRCodeScanner'

interface Attendee {
  id: string
  name: string
  email: string
  ticketType: string
  purchaseDate: string
  price: number
  checkInStatus: 'pending' | 'checked_in' | 'no_show'
  qrCode: string
  orderNumber: string
}

interface AttendeeManagementProps {
  eventId: string
  eventTitle: string
  onClose: () => void
}

export default function AttendeeManagement({
  eventId,
  eventTitle,
  onClose
}: AttendeeManagementProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'checked_in' | 'pending' | 'no_show'>('all')
  const [showQRScanner, setShowQRScanner] = useState(false)

  useEffect(() => {
    // Load tickets from localStorage and filter by eventId
    if (typeof window !== 'undefined') {
      const allTickets = JSON.parse(localStorage.getItem('eventify_tickets') || '[]')
      const eventTickets = allTickets.filter((ticket: any) => ticket.eventId === eventId)
      
      const attendeeList: Attendee[] = eventTickets.map((ticket: any) => ({
        id: ticket.id,
        name: ticket.attendeeName || 'Guest',
        email: ticket.attendeeEmail || '',
        ticketType: ticket.ticketType,
        purchaseDate: ticket.purchaseDate,
        price: typeof ticket.price === 'string' ? parseFloat(ticket.price.replace('$', '')) : ticket.price || 0,
        checkInStatus: ticket.checkInStatus || 'pending',
        qrCode: ticket.qrCode,
        orderNumber: ticket.orderNumber
      }))
      
      setAttendees(attendeeList)
    }
  }, [eventId])

  const handleCheckIn = async (attendeeId: string, qrCode?: string) => {
    const updatedAttendees = attendees.map(att => 
      att.id === attendeeId 
        ? { ...att, checkInStatus: 'checked_in' as const }
        : att
    )
    setAttendees(updatedAttendees)
    
    // Update in localStorage
    const allTickets = JSON.parse(localStorage.getItem('eventify_tickets') || '[]')
    const updatedTickets = allTickets.map((ticket: any) => 
      ticket.id === attendeeId
        ? { ...ticket, checkInStatus: 'checked_in', checkedInAt: new Date().toISOString() }
        : ticket
    )
    localStorage.setItem('eventify_tickets', JSON.stringify(updatedTickets))

    // API call commented out for now
    // try {
    //   const token = localStorage.getItem('token')
    //   if (token) {
    //     await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/tickets/${attendeeId}/checkin`, {
    //       method: 'POST',
    //       headers: {
    //         'Authorization': `Bearer ${token}`,
    //         'Content-Type': 'application/json'
    //       }
    //     })
    //   }
    // } catch (error) {
    //   console.error('Failed to sync check-in with backend:', error)
    // }
  }

  const handleQRCheckIn = async (ticketId: string, qrCode: string) => {
    await handleCheckIn(ticketId, qrCode)
  }

  const handleExport = () => {
    // Generate CSV
    const headers = ['Name', 'Email', 'Ticket Type', 'Purchase Date', 'Price', 'Status', 'Order Number']
    const rows = filteredAttendees.map(att => [
      att.name,
      att.email,
      att.ticketType,
      new Date(att.purchaseDate).toLocaleDateString(),
      `$${att.price.toFixed(2)}`,
      att.checkInStatus,
      att.orderNumber
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${eventTitle.replace(/\s+/g, '_')}_attendees.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredAttendees = attendees.filter(attendee => {
    const matchesSearch = 
      attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || attendee.checkInStatus === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const config = {
      checked_in: { color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle, label: 'Checked In' },
      pending: { color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: Clock, label: 'Pending' },
      no_show: { color: 'text-red-600', bgColor: 'bg-red-50', icon: X, label: 'No Show' }
    }
    const statusConfig = config[status as keyof typeof config]
    const Icon = statusConfig.icon
    return (
      <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}>
        <Icon size={14} className="mr-1" />
        {statusConfig.label}
      </Badge>
    )
  }

  const stats = {
    total: attendees.length,
    checkedIn: attendees.filter(a => a.checkInStatus === 'checked_in').length,
    pending: attendees.filter(a => a.checkInStatus === 'pending').length,
    revenue: attendees.reduce((sum, a) => sum + a.price, 0)
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
          className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
            <div className="min-w-0 flex-1 pr-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 break-words">Attendee Management</h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1 break-words truncate">{eventTitle}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0"
            >
              <X size={16} />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Total Attendees</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Checked In</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.checkedIn}</p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Pending</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Total Revenue</p>
              <p className="text-xl sm:text-2xl font-bold text-primary-600">${stats.revenue.toFixed(2)}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or order number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'checked_in' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('checked_in')}
                >
                  Checked In
                </Button>
                <Button
                  variant={filterStatus === 'pending' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('pending')}
                >
                  Pending
                </Button>
                <Button
                  variant={filterStatus === 'no_show' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('no_show')}
                >
                  No Show
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowQRScanner(true)}
                >
                  <QrCode size={16} className="mr-2" />
                  Scan QR Code
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                >
                  <Download size={16} className="mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>

          {/* Attendees List - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredAttendees.length === 0 ? (
              <div className="text-center py-12">
                <User size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No attendees found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAttendees.map((attendee, index) => (
                  <motion.div
                    key={attendee.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User size={24} className="text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">{attendee.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Mail size={14} />
                              {attendee.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Ticket size={14} />
                              {attendee.ticketType}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(attendee.purchaseDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${attendee.price.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{attendee.orderNumber}</p>
                        </div>
                        {getStatusBadge(attendee.checkInStatus)}
                        {attendee.checkInStatus === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCheckIn(attendee.id)}
                            className="text-green-600 border-green-300 hover:bg-green-50"
                          >
                            <CheckCircle size={16} className="mr-2" />
                            Check In
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* QR Code Scanner */}
      {showQRScanner && (
        <QRCodeScanner
          isOpen={showQRScanner}
          onClose={() => {
            setShowQRScanner(false)
            // Reload attendees after scanning
            const allTickets = JSON.parse(localStorage.getItem('eventify_tickets') || '[]')
            const eventTickets = allTickets.filter((ticket: any) => ticket.eventId === eventId)
            const attendeeList: Attendee[] = eventTickets.map((ticket: any) => ({
              id: ticket.id,
              name: ticket.attendeeName || 'Guest',
              email: ticket.attendeeEmail || '',
              ticketType: ticket.ticketType,
              purchaseDate: ticket.purchaseDate,
              price: typeof ticket.price === 'string' ? parseFloat(ticket.price.replace('$', '')) : ticket.price || 0,
              checkInStatus: ticket.checkInStatus || 'pending',
              qrCode: ticket.qrCode,
              orderNumber: ticket.orderNumber
            }))
            setAttendees(attendeeList)
          }}
          eventId={eventId}
          onCheckIn={handleQRCheckIn}
        />
      )}
    </AnimatePresence>
  )
}


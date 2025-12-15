'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Download, CheckCircle, Clock, User, Mail, Calendar, Ticket, QrCode, UserX, RotateCcw } from 'lucide-react'
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
  status: 'CONFIRMED' | 'CANCELLED' | 'PENDING'
  isNoShow?: boolean
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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAttendees = async () => {
      setIsLoading(true)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        const token = localStorage.getItem('token')
        
        if (!token) {
          setAttendees([])
          setIsLoading(false)
          return
        }

        const response = await fetch(`${apiUrl}/api/tickets/event/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            const attendeeList: Attendee[] = (data.data || []).map((ticket: any) => {
              const isNoShow = ticket.metadata && ticket.metadata.noShow === true;
              const isCancelled = ticket.status === 'CANCELLED';
              
              let checkInStatus: 'pending' | 'checked_in' | 'no_show' = 'pending';
              if (ticket.checkedIn) {
                checkInStatus = 'checked_in';
              } else if (isNoShow && isCancelled) {
                checkInStatus = 'no_show';
              }

              return {
                id: ticket.id,
                name: ticket.attendee ? `${ticket.attendee.firstName} ${ticket.attendee.lastName}` : 'Guest',
                email: ticket.attendee?.email || '',
                ticketType: ticket.ticketTier?.name || ticket.ticketType || 'General',
                purchaseDate: ticket.createdAt,
                price: ticket.price || 0,
                checkInStatus,
                qrCode: ticket.qrCode || ticket.id,
                orderNumber: ticket.orderNumber,
                status: ticket.status,
                isNoShow: isNoShow
              };
            })
            setAttendees(attendeeList)
          }
        }
      } catch (error) {
        console.error('Error fetching attendees:', error)
        setAttendees([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAttendees()
  }, [eventId])

  const handleCheckIn = async (attendeeId: string, qrCode?: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      if (!token) {
        alert('Please sign in to check in attendees')
        return
      }

      const response = await fetch(`${apiUrl}/api/tickets/${attendeeId}/checkin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Update local state
          const updatedAttendees = attendees.map(att => 
            att.id === attendeeId 
              ? { ...att, checkInStatus: 'checked_in' as const }
              : att
          )
          setAttendees(updatedAttendees)
        } else {
          alert(data.message || 'Failed to check in attendee')
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to check in attendee' }))
        alert(errorData.message || 'Failed to check in attendee')
      }
    } catch (error) {
      console.error('Error checking in attendee:', error)
      alert('Failed to check in attendee. Please try again.')
    }
  }

  const handleNoShow = async (attendeeId: string) => {
    const attendee = attendees.find(att => att.id === attendeeId)
    if (!attendee) return

    const confirmed = window.confirm(
      `Mark ${attendee.name} as no-show?\n\n` +
      `This will:\n` +
      `• Cancel their ticket\n` +
      `• Free up the spot for waitlisted attendees\n` +
      `• Automatically promote the next person on the waitlist (if any)\n\n` +
      `This action can be undone if needed.`
    )

    if (!confirmed) return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      if (!token) {
        alert('Please sign in to manage attendees')
        return
      }

      const response = await fetch(`${apiUrl}/api/tickets/${attendeeId}/no-show`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Update local state
          const updatedAttendees = attendees.map(att => 
            att.id === attendeeId 
              ? { ...att, checkInStatus: 'no_show' as const, status: 'CANCELLED' as const, isNoShow: true }
              : att
          )
          setAttendees(updatedAttendees)

          // Show success message with promotion info
          let message = `${attendee.name} marked as no-show.`
          if (data.data.promotedUser) {
            message += `\n\n🎉 ${data.data.promotedUser.name} has been automatically promoted from the waitlist!`
          }
          alert(message)

          // Refresh attendee list to show any newly promoted attendees
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        } else {
          alert(data.message || 'Failed to mark attendee as no-show')
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to mark attendee as no-show' }))
        alert(errorData.message || 'Failed to mark attendee as no-show')
      }
    } catch (error) {
      console.error('Error marking attendee as no-show:', error)
      alert('Failed to mark attendee as no-show. Please try again.')
    }
  }

  const handleRestoreTicket = async (attendeeId: string) => {
    const attendee = attendees.find(att => att.id === attendeeId)
    if (!attendee) return

    const confirmed = window.confirm(
      `Restore ${attendee.name}'s ticket?\n\n` +
      `This will reactivate their ticket and they can attend the event again.`
    )

    if (!confirmed) return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      if (!token) {
        alert('Please sign in to manage attendees')
        return
      }

      const response = await fetch(`${apiUrl}/api/tickets/${attendeeId}/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Update local state
          const updatedAttendees = attendees.map(att => 
            att.id === attendeeId 
              ? { ...att, checkInStatus: 'pending' as const, status: 'CONFIRMED' as const, isNoShow: false }
              : att
          )
          setAttendees(updatedAttendees)
          alert(`${attendee.name}'s ticket has been restored.`)
        } else {
          alert(data.message || 'Failed to restore ticket')
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to restore ticket' }))
        alert(errorData.message || 'Failed to restore ticket')
      }
    } catch (error) {
      console.error('Error restoring ticket:', error)
      alert('Failed to restore ticket. Please try again.')
    }
  }

  const handleQRCheckIn = async (ticketId: string, qrCode: string) => {
    await handleCheckIn(ticketId, qrCode)
  }

  // Quick check-in by order number or ticket ID - much faster than manual QR entry!
  const handleQuickCheckIn = async (searchValue: string) => {
    if (!searchValue.trim()) return

    // Try to find by order number first (most common - e.g., "TIX-ABC123")
    const attendeeByOrder = attendees.find(
      att => att.orderNumber.toLowerCase() === searchValue.trim().toLowerCase() && att.checkInStatus === 'pending'
    )
    
    if (attendeeByOrder) {
      await handleCheckIn(attendeeByOrder.id)
      setSearchQuery('')
      return
    }

    // Try to find by ticket ID (QR code - UUID format)
    const attendeeById = attendees.find(
      att => (att.id.toLowerCase() === searchValue.trim().toLowerCase() || 
              att.qrCode.toLowerCase() === searchValue.trim().toLowerCase()) && 
              att.checkInStatus === 'pending'
    )
    
    if (attendeeById) {
      await handleCheckIn(attendeeById.id)
      setSearchQuery('')
      return
    }

    // If exact match not found, check if search matches any pending attendee
    const matchingAttendee = filteredAttendees.find(att => att.checkInStatus === 'pending')
    if (matchingAttendee) {
      await handleCheckIn(matchingAttendee.id)
      setSearchQuery('')
    } else {
      alert('No pending attendee found. Make sure you\'re searching for someone who hasn\'t checked in yet.')
    }
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
    noShow: attendees.filter(a => a.checkInStatus === 'no_show').length,
    revenue: attendees.filter(a => a.status === 'CONFIRMED').reduce((sum, a) => sum + a.price, 0)
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
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
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
              <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">No Shows</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.noShow}</p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Total Revenue</p>
              <p className="text-xl sm:text-2xl font-bold text-primary-600">${stats.revenue.toFixed(2)}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              <div className="flex-1 flex gap-2">
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                    placeholder="Type order number, name, or email... Press Enter to check in"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        e.preventDefault()
                        await handleQuickCheckIn(searchQuery)
                      }
                    }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleQuickCheckIn(searchQuery)}
                  disabled={!searchQuery.trim()}
                  title="Quick check-in (or press Enter)"
                  className="whitespace-nowrap"
                >
                  <CheckCircle size={16} className="mr-2" />
                  Quick Check In
                </Button>
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
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading attendees...</p>
              </div>
            ) : filteredAttendees.length === 0 ? (
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
                        <div className="flex gap-2">
                          {attendee.checkInStatus === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCheckIn(attendee.id)}
                                className="text-green-600 border-green-300 hover:bg-green-50"
                                title="Check in attendee"
                              >
                                <CheckCircle size={16} className="mr-1" />
                                Check In
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleNoShow(attendee.id)}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                                title="Mark as no-show (will promote waitlisted users)"
                              >
                                <UserX size={16} className="mr-1" />
                                No Show
                              </Button>
                            </>
                          )}
                          {attendee.checkInStatus === 'no_show' && attendee.isNoShow && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestoreTicket(attendee.id)}
                              className="text-blue-600 border-blue-300 hover:bg-blue-50"
                              title="Restore ticket (undo no-show)"
                            >
                              <RotateCcw size={16} className="mr-1" />
                              Restore
                            </Button>
                          )}
                        </div>
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
          onClose={async () => {
            setShowQRScanner(false)
            // Reload attendees after scanning
            try {
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
              const token = localStorage.getItem('token')
              
              if (token) {
                const response = await fetch(`${apiUrl}/api/tickets/event/${eventId}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                })
                
                if (response.ok) {
                  const data = await response.json()
                  if (data.success) {
                    const attendeeList: Attendee[] = (data.data || []).map((ticket: any) => ({
                      id: ticket.id,
                      name: ticket.attendee ? `${ticket.attendee.firstName} ${ticket.attendee.lastName}` : 'Guest',
                      email: ticket.attendee?.email || '',
                      ticketType: ticket.ticketTier?.name || ticket.ticketType || 'General',
                      purchaseDate: ticket.createdAt,
                      price: ticket.price || 0,
                      checkInStatus: ticket.checkedIn ? 'checked_in' : 'pending',
                      qrCode: ticket.qrCode || ticket.id,
                      orderNumber: ticket.orderNumber
                    }))
                    setAttendees(attendeeList)
                  }
                }
              }
            } catch (error) {
              console.error('Error reloading attendees:', error)
            }
          }}
          eventId={eventId}
          onCheckIn={handleQRCheckIn}
        />
      )}
    </AnimatePresence>
  )
}


'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Download, 
  Share2, 
  Calendar, 
  MapPin, 
  Clock, 
  QrCode,
  ArrowUp,
  RotateCcw,
  Ticket,
  CreditCard,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import QRCodeDisplay from '@/components/events/QRCodeDisplay'
import RefundRequestModal from '@/components/events/RefundRequestModal'
import { useRouter } from 'next/navigation'

interface TicketDetailModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: any // Can be a single ticket or an order group with tickets array
  onUpgrade?: (ticketId: string) => void
  onRefundRequest?: (ticketId: string, reason: string) => void
}

export default function TicketDetailModal({
  isOpen,
  onClose,
  ticket,
  onUpgrade,
  onRefundRequest
}: TicketDetailModalProps) {
  const router = useRouter()
  const [showQRCode, setShowQRCode] = React.useState(false)
  const [showRefundModal, setShowRefundModal] = React.useState(false)
  const [selectedTicketForQR, setSelectedTicketForQR] = React.useState<any>(null)

  if (!isOpen || !ticket) return null

  // Check if this is an order group (has tickets array) or a single ticket
  const isOrderGroup = ticket.tickets && Array.isArray(ticket.tickets)
  const tickets = isOrderGroup ? ticket.tickets : [ticket]
  
  // For order groups, use the order group object, but ensure eventId is available
  // Try multiple sources: order group eventId, first ticket eventId, or any ticket's eventId
  const getEventId = () => {
    if (isOrderGroup) {
      // Try order group first
      if (ticket.eventId) return ticket.eventId
      // Then try first ticket
      if (tickets[0]?.eventId) return tickets[0].eventId
      // Then try any ticket in the group
      const ticketWithEventId = tickets.find((t: any) => t.eventId)
      if (ticketWithEventId?.eventId) return ticketWithEventId.eventId
    } else {
      // Single ticket
      return ticket.eventId
    }
    return null
  }
  
  const eventId = getEventId()
  const displayTicket = isOrderGroup 
    ? { ...ticket, eventId }
    : { ...ticket, eventId: eventId || ticket.eventId }

  // Group tickets by tier
  const ticketsByTier = tickets.reduce((acc: Record<string, any[]>, t: any) => {
    const tierKey = t.ticketType || 'General'
    if (!acc[tierKey]) {
      acc[tierKey] = []
    }
    acc[tierKey].push(t)
    return acc
  }, {})

  const handleViewEvent = () => {
    const finalEventId = displayTicket.eventId || eventId
    if (!finalEventId) {
      console.error('Event ID not found in ticket', { ticket, tickets, displayTicket })
      alert('Event information not available. The event may have been removed.')
      return
    }
    router.push(`/events/${finalEventId}`)
    onClose()
  }

  const handleUpgrade = () => {
    const finalEventId = displayTicket.eventId || eventId
    if (!finalEventId) {
      console.error('Event ID not found in ticket', { ticket, tickets, displayTicket })
      alert('Event information not available. The event may have been removed.')
      return
    }
    // Navigate to event page to show current tickets and upgrade options
    router.push(`/events/${finalEventId}`)
    onClose()
  }

  const handleDownloadTicket = async (ticketId: string) => {
    console.log('Downloading ticket with ID:', ticketId)
    
    if (!ticketId) {
      alert('Ticket ID is missing. Please try again.')
      return
    }
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      if (!token) {
        alert('Please log in to download your ticket')
        return
      }

      const response = await fetch(`${apiUrl}/api/tickets/${ticketId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        // Get the filename from the response headers
        const contentDisposition = response.headers.get('content-disposition')
        let filename = `ticket_${ticketId}.pdf`
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/)
          if (filenameMatch) {
            filename = filenameMatch[1]
          }
        }

        // Create blob and download
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to download ticket' }))
        alert(errorData.message || 'Failed to download ticket')
      }
    } catch (error) {
      console.error('Error downloading ticket:', error)
      alert('Failed to download ticket. Please try again.')
    }
  }

  const handleDownloadAllTickets = async () => {
    console.log('Downloading tickets:', tickets)
    console.log('Ticket structure:', tickets.map((t: any) => ({ id: t.id, qrCode: t.qrCode })))
    
    if (tickets.length === 1) {
      // Single ticket - download directly
      const ticketId = tickets[0].id
      if (ticketId) {
        await handleDownloadTicket(ticketId)
      } else {
        console.error('Ticket ID not found in ticket:', tickets[0])
        alert('Ticket ID not found')
      }
    } else {
      // Multiple tickets - download each one
      for (const ticket of tickets) {
        if (ticket.id) {
          await handleDownloadTicket(ticket.id)
          // Add a small delay between downloads to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 500))
        } else {
          console.error('Ticket ID not found in ticket:', ticket)
        }
      }
    }
  }

  return (
    <>
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
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
              <div className="min-w-0 flex-1 pr-2">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 break-words">Ticket Details</h2>
                {isOrderGroup && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">
                    {tickets.length} {tickets.length === 1 ? 'Ticket' : 'Tickets'} in this order
                  </p>
                )}
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

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Left Column - Ticket Image & QR */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Event Image */}
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={displayTicket.image}
                      alt={displayTicket.eventTitle}
                      className="w-full h-48 object-cover"
                    />
                  </div>

                  {/* QR Code Section */}
                  {displayTicket.status === 'confirmed' && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-center mb-4">
                        <QrCode size={48} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-700">
                          {tickets.length} {tickets.length === 1 ? 'QR Code' : 'QR Codes'} Available
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setSelectedTicketForQR(tickets[0])}
                      >
                        <QrCode size={16} className="mr-2" />
                        View All QR Codes
                      </Button>
                    </div>
                  )}

                  {/* Ticket Status */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Status</p>
                    {displayTicket.status === 'confirmed' && (
                      <Badge className="bg-green-50 text-green-600 border-0 w-full justify-center">
                        Confirmed
                      </Badge>
                    )}
                    {displayTicket.status === 'pending' && (
                      <Badge className="bg-yellow-50 text-yellow-600 border-0 w-full justify-center">
                        Pending
                      </Badge>
                    )}
                    {displayTicket.status === 'cancelled' && (
                      <Badge className="bg-red-50 text-red-600 border-0 w-full justify-center">
                        Cancelled
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Right Column - Details & Actions */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Event Info */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{displayTicket.eventTitle}</h3>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2" />
                        {displayTicket.eventDate}
                      </div>
                      <div className="flex items-center">
                        <Clock size={16} className="mr-2" />
                        {displayTicket.eventTime}
                      </div>
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-2" />
                        {displayTicket.eventLocation}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleViewEvent}
                    >
                      View Event Details
                    </Button>
                  </div>

                  {/* Tickets Breakdown by Tier */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      Your Tickets ({tickets.length} {tickets.length === 1 ? 'Ticket' : 'Tickets'})
                    </h4>
                    <div className="space-y-4">
                      {Object.entries(ticketsByTier).map(([tierName, tierTickets]: [string, unknown]) => {
                        const tickets = tierTickets as any[]
                        const tierPrice = typeof tickets[0]?.price === 'string' 
                          ? parseFloat(tickets[0].price.replace('$', '')) 
                          : (tickets[0]?.price || 0)
                        return (
                          <div key={tierName} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h5 className="font-semibold text-gray-900">{tierName}</h5>
                                <p className="text-sm text-gray-600">
                                  {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'} × ${tierPrice.toFixed(2)}
                                </p>
                              </div>
                              <p className="text-lg font-bold text-gray-900">
                                ${(tierPrice * tickets.length).toFixed(2)}
                              </p>
                            </div>
                            <div className="space-y-2">
                              {tickets.map((t, idx) => (
                                <div key={t.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-900">
                                      Ticket {idx + 1} {t.attendeeName && `- ${t.attendeeName}`}
                                    </span>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedTicketForQR(t)}
                                        className="text-xs"
                                      >
                                        <QrCode size={12} className="mr-1" />
                                        QR
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          console.log('Individual ticket download:', t)
                                          handleDownloadTicket(t.id)
                                        }}
                                        className="text-xs"
                                        disabled={!t.id}
                                      >
                                        <Download size={12} className="mr-1" />
                                        PDF
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                    <div>
                                      <span className="text-gray-500">QR Code:</span>
                                      <p className="font-mono">{t.qrCode}</p>
                                    </div>
                                    {t.seatNumber && (
                                      <div>
                                        <span className="text-gray-500">Seat:</span>
                                        <p className="font-medium">{t.seatNumber}</p>
                                      </div>
                                    )}
                                    {t.attendeeEmail && (
                                      <div className="col-span-2">
                                        <span className="text-gray-500">Email:</span>
                                        <p>{t.attendeeEmail}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Order Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Order Number</p>
                        <p className="font-mono text-sm font-medium text-gray-900">{displayTicket.orderNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Purchase Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(displayTicket.purchaseDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Tickets</p>
                        <p className="font-medium text-gray-900">{tickets.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                        <p className="font-medium text-gray-900">
                          ${tickets.reduce((sum: number, t: any) => {
                            const price = typeof t.price === 'string' ? parseFloat(t.price.replace('$', '')) : (t.price || 0)
                            return sum + price
                          }, 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Actions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {displayTicket.status === 'confirmed' && (
                        <>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setSelectedTicketForQR(tickets[0])}
                          >
                            <QrCode size={16} className="mr-2" />
                            View All QR Codes
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleUpgrade}
                          >
                            <ArrowUp size={16} className="mr-2" />
                            Upgrade Ticket
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handleDownloadAllTickets()}
                          >
                            <Download size={16} className="mr-2" />
                            Download {tickets.length > 1 ? 'All Tickets' : 'Ticket'}
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full"
                          >
                            <Share2 size={16} className="mr-2" />
                            Share Ticket
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full text-orange-600 border-orange-300 hover:bg-orange-50"
                            onClick={() => setShowRefundModal(true)}
                          >
                            <RotateCcw size={16} className="mr-2" />
                            Request Refund
                          </Button>
                        </>
                      )}
                      {displayTicket.status === 'pending' && (
                        <Button
                          variant="outline"
                          className="w-full"
                          disabled
                        >
                          <Clock size={16} className="mr-2" />
                          Processing...
                        </Button>
                      )}
                      {displayTicket.status === 'cancelled' && (
                        <Button
                          variant="outline"
                          className="w-full text-red-600 border-red-300"
                          disabled
                        >
                          <X size={16} className="mr-2" />
                          Cancelled
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Additional Options */}
                  {ticket.status === 'confirmed' && (
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Additional Options</h4>
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={handleViewEvent}
                        >
                          <Ticket size={16} className="mr-2" />
                          View Event Page
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <CreditCard size={16} className="mr-2" />
                          Add to Wallet
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <User size={16} className="mr-2" />
                          Transfer Ticket
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* QR Code Modal */}
      {selectedTicketForQR && (
        <QRCodeDisplay
          isOpen={!!selectedTicketForQR}
          onClose={() => setSelectedTicketForQR(null)}
          ticketId={selectedTicketForQR.id}
          eventTitle={selectedTicketForQR.eventTitle || displayTicket.eventTitle}
          attendeeName={selectedTicketForQR.attendeeName || 'Guest'}
          qrCode={selectedTicketForQR.qrCode}
          seatNumber={selectedTicketForQR.seatNumber}
        />
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <RefundRequestModal
          isOpen={showRefundModal}
          onClose={() => setShowRefundModal(false)}
          ticketId={ticket.id}
          eventTitle={ticket.eventTitle}
          onConfirm={(reason) => {
            if (onRefundRequest) {
              onRefundRequest(ticket.id, reason)
            }
            setShowRefundModal(false)
          }}
        />
      )}
    </>
  )
}


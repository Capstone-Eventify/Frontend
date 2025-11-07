'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Ticket, 
  Download, 
  Share2, 
  Calendar, 
  MapPin, 
  Clock, 
  QrCode,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import QRCodeDisplay from '@/components/events/QRCodeDisplay'
import RefundRequestModal from '@/components/events/RefundRequestModal'
import TicketDetailModal from './TicketDetailModal'

// Mock data
const tickets = [
  {
    id: '1',
    eventTitle: 'Tech Innovation Summit 2024',
    eventDate: 'Dec 15, 2024',
    eventTime: '9:00 AM - 5:00 PM',
    eventLocation: 'San Francisco, CA',
    ticketType: 'General Admission',
    price: '$89',
    purchaseDate: 'Nov 20, 2024',
    status: 'confirmed',
    qrCode: 'TECH2024-001',
    seatNumber: 'A-15',
    orderNumber: 'ORD-12345',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  },
  {
    id: '2',
    eventTitle: 'Digital Marketing Masterclass',
    eventDate: 'Dec 20, 2024',
    eventTime: '2:00 PM - 6:00 PM',
    eventLocation: 'Online Event',
    ticketType: 'Virtual Pass',
    price: 'FREE',
    purchaseDate: 'Dec 1, 2024',
    status: 'confirmed',
    qrCode: 'DIGITAL2024-002',
    seatNumber: null,
    orderNumber: 'ORD-12346',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  },
  {
    id: '3',
    eventTitle: 'Global Design Conference',
    eventDate: 'Jan 5, 2025',
    eventTime: '10:00 AM - 6:00 PM',
    eventLocation: 'New York, NY',
    ticketType: 'VIP Pass',
    price: '$149',
    purchaseDate: 'Dec 10, 2024',
    status: 'pending',
    qrCode: 'DESIGN2025-003',
    seatNumber: 'VIP-8',
    orderNumber: 'ORD-12347',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  },
  {
    id: '4',
    eventTitle: 'Startup Pitch Competition',
    eventDate: 'Jan 12, 2025',
    eventTime: '1:00 PM - 4:00 PM',
    eventLocation: 'Austin, TX',
    ticketType: 'General Admission',
    price: '$25',
    purchaseDate: 'Dec 15, 2024',
    status: 'cancelled',
    qrCode: 'STARTUP2025-004',
    seatNumber: 'B-22',
    orderNumber: 'ORD-12348',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  }
]

const statusConfig = {
  confirmed: { color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle },
  pending: { color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: AlertCircle },
  cancelled: { color: 'text-red-600', bgColor: 'bg-red-50', icon: XCircle },
  refund_requested: { color: 'text-orange-600', bgColor: 'bg-orange-50', icon: RotateCcw }
}

export default function TicketsSection() {
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [allTickets, setAllTickets] = useState(tickets)
  const [selectedTicketForQR, setSelectedTicketForQR] = useState<any>(null)
  const [selectedTicketForRefund, setSelectedTicketForRefund] = useState<any>(null)
  const [selectedTicketDetail, setSelectedTicketDetail] = useState<any>(null)

  useEffect(() => {
    // Load tickets from localStorage
    if (typeof window !== 'undefined') {
      const storedTickets = JSON.parse(localStorage.getItem('eventify_tickets') || '[]')
      // Merge with mock data, prioritizing stored tickets
      const mergedTickets = [...storedTickets, ...tickets.filter(t => 
        !storedTickets.some((st: any) => st.id === t.id)
      )]
      setAllTickets(mergedTickets)
    }
  }, [])

  const handleRefundRequest = (ticketId: string, reason: string) => {
    // Update ticket status
    const updatedTickets = allTickets.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          status: 'refund_requested',
          refundRequestReason: reason,
          refundRequestDate: new Date().toISOString()
        }
      }
      return ticket
    })

    setAllTickets(updatedTickets)
    
    // Save to localStorage
    const storedTickets = JSON.parse(localStorage.getItem('eventify_tickets') || '[]')
    const updatedStored = storedTickets.map((t: any) => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'refund_requested',
          refundRequestReason: reason,
          refundRequestDate: new Date().toISOString()
        }
      }
      return t
    })
    localStorage.setItem('eventify_tickets', JSON.stringify(updatedStored))

    // Store refund request
    const refundRequests = JSON.parse(localStorage.getItem('eventify_refund_requests') || '[]')
    refundRequests.push({
      ticketId,
      reason,
      date: new Date().toISOString(),
      status: 'pending'
    })
    localStorage.setItem('eventify_refund_requests', JSON.stringify(refundRequests))
  }

  // Group tickets by orderId (tickets purchased together)
  const groupTicketsByOrder = (tickets: any[]) => {
    const grouped: Record<string, any[]> = {}
    
    tickets.forEach(ticket => {
      // Use orderId if available, otherwise use orderNumber as fallback
      const orderKey = ticket.orderId || ticket.orderNumber || `single_${ticket.id}`
      
      if (!grouped[orderKey]) {
        grouped[orderKey] = []
      }
      grouped[orderKey].push(ticket)
    })
    
    // Convert to array of groups, each group represents one purchase
    return Object.values(grouped).map(ticketGroup => {
      // Sort by ticket type and then by index
      const sorted = ticketGroup.sort((a, b) => {
        if (a.ticketType !== b.ticketType) {
          return a.ticketType.localeCompare(b.ticketType)
        }
        return a.id.localeCompare(b.id)
      })
      
      return {
        orderId: ticketGroup[0].orderId || ticketGroup[0].orderNumber,
        orderNumber: ticketGroup[0].orderNumber,
        tickets: sorted,
        // Use first ticket's info for display
        eventId: ticketGroup[0].eventId,
        eventTitle: ticketGroup[0].eventTitle,
        eventDate: ticketGroup[0].eventDate,
        eventTime: ticketGroup[0].eventTime,
        eventLocation: ticketGroup[0].eventLocation,
        image: ticketGroup[0].image,
        purchaseDate: ticketGroup[0].purchaseDate,
        status: ticketGroup[0].status, // Use first ticket's status (should all be same)
        totalPrice: ticketGroup.reduce((sum, t) => {
          const price = typeof t.price === 'string' ? parseFloat(t.price.replace('$', '')) : (t.price || 0)
          return sum + price
        }, 0),
        totalTickets: ticketGroup.length
      }
    })
  }

  const filteredTickets = allTickets.filter(ticket => {
    const matchesStatus = selectedStatus === 'all' || ticket.status === selectedStatus
    const matchesSearch = ticket.eventTitle.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Group tickets by order
  const groupedTickets = groupTicketsByOrder(filteredTickets)

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config.icon
    return (
      <Badge className={`${config.bgColor} ${config.color} border-0`}>
        <Icon size={14} className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-gray-600">Manage your event tickets and passes</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Download All
          </Button>
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
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedStatus === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('all')}
            >
              All
            </Button>
            <Button
              variant={selectedStatus === 'confirmed' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('confirmed')}
            >
              Confirmed
            </Button>
            <Button
              variant={selectedStatus === 'pending' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('pending')}
            >
              Pending
            </Button>
            <Button
              variant={selectedStatus === 'cancelled' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('cancelled')}
            >
              Cancelled
            </Button>
            <Button
              variant={selectedStatus === 'refund_requested' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('refund_requested')}
            >
              Refund Requested
            </Button>
          </div>
        </div>
      </div>

      {/* Tickets List - Grouped by Order */}
      <div className="space-y-4">
        {groupedTickets.map((orderGroup, index) => {
          // Group tickets by tier within this order
          const ticketsByTier = orderGroup.tickets.reduce((acc: Record<string, any[]>, ticket: any) => {
            const tierKey = ticket.ticketType || 'General'
            if (!acc[tierKey]) {
              acc[tierKey] = []
            }
            acc[tierKey].push(ticket)
            return acc
          }, {})

          return (
          <motion.div
            key={orderGroup.orderId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              // Pass the entire order group to the detail modal
              setSelectedTicketDetail(orderGroup)
            }}
          >
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Event Image */}
                <div className="lg:w-48 flex-shrink-0">
                  <img
                    src={orderGroup.image}
                    alt={orderGroup.eventTitle}
                    className="w-full h-32 lg:h-40 rounded-lg object-cover"
                  />
                </div>

                {/* Ticket Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{orderGroup.eventTitle}</h3>
                        <Badge variant="outline" size="sm">
                          {orderGroup.totalTickets} {orderGroup.totalTickets === 1 ? 'Ticket' : 'Tickets'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-2" />
                          {orderGroup.eventDate}
                        </div>
                        <div className="flex items-center">
                          <Clock size={16} className="mr-2" />
                          {orderGroup.eventTime}
                        </div>
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-2" />
                          {orderGroup.eventLocation}
                        </div>
                      </div>
                      
                      {/* Tickets by Tier Breakdown */}
                      <div className="mt-3 space-y-2">
                        {Object.entries(ticketsByTier).map(([tierName, tierTickets]: [string, any[]]) => {
                          const tierPrice = typeof tierTickets[0].price === 'string' 
                            ? parseFloat(tierTickets[0].price.replace('$', '')) 
                            : (tierTickets[0].price || 0)
                          return (
                            <div key={tierName} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                              <span className="text-gray-700">
                                <span className="font-medium">{tierTickets.length}x</span> {tierName}
                              </span>
                              <span className="text-gray-900 font-medium">
                                ${(tierPrice * tierTickets.length).toFixed(2)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(orderGroup.status)}
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">${orderGroup.totalPrice.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">Total</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Order Number</p>
                      <p className="text-sm text-gray-900">{orderGroup.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Purchase Date</p>
                      <p className="text-sm text-gray-900">
                        {new Date(orderGroup.purchaseDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Tickets</p>
                      <p className="text-sm text-gray-900">{orderGroup.totalTickets}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    {orderGroup.status === 'confirmed' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Show first ticket's QR for now (in detail modal, show all)
                            setSelectedTicketForQR(orderGroup.tickets[0])
                          }}
                        >
                          <QrCode size={16} className="mr-2" />
                          View QR Codes
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download size={16} className="mr-2" />
                          Download All
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            // For refund, we'll handle it in the detail modal
                            setSelectedTicketForRefund(orderGroup.tickets[0])
                          }}
                          className="text-orange-600 border-orange-300 hover:bg-orange-50"
                        >
                          <RotateCcw size={16} className="mr-2" />
                          Request Refund
                        </Button>
                      </>
                    )}
                    {orderGroup.status === 'refund_requested' && (
                      <Button variant="outline" size="sm" className="text-orange-600 border-orange-300">
                        <RotateCcw size={16} className="mr-2" />
                        Refund Requested
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Share2 size={16} className="mr-2" />
                      Share
                    </Button>
                    {orderGroup.status === 'pending' && (
                      <Button variant="outline" size="sm" className="text-yellow-600 border-yellow-300">
                        <Clock size={16} className="mr-2" />
                        Processing...
                      </Button>
                    )}
                    {orderGroup.status === 'cancelled' && (
                      <Button variant="outline" size="sm" className="text-red-600 border-red-300">
                        <XCircle size={16} className="mr-2" />
                        Cancelled
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <Ticket size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || selectedStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'You haven\'t purchased any tickets yet.'
            }
          </p>
          <Button>
            Browse Events
          </Button>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedTicketForQR && (
        <QRCodeDisplay
          isOpen={!!selectedTicketForQR}
          onClose={() => setSelectedTicketForQR(null)}
          ticketId={selectedTicketForQR.id}
          eventTitle={selectedTicketForQR.eventTitle}
          attendeeName={selectedTicketForQR.attendeeName || 'Guest'}
          qrCode={selectedTicketForQR.qrCode}
          seatNumber={selectedTicketForQR.seatNumber}
        />
      )}

      {/* Refund Request Modal */}
      {selectedTicketForRefund && (
        <RefundRequestModal
          isOpen={!!selectedTicketForRefund}
          onClose={() => setSelectedTicketForRefund(null)}
          ticketId={selectedTicketForRefund.id}
          eventTitle={selectedTicketForRefund.eventTitle}
          onConfirm={(reason) => {
            handleRefundRequest(selectedTicketForRefund.id, reason)
            setSelectedTicketForRefund(null)
          }}
        />
      )}

      {/* Ticket Detail Modal */}
      {selectedTicketDetail && (
        <TicketDetailModal
          isOpen={!!selectedTicketDetail}
          onClose={() => setSelectedTicketDetail(null)}
          ticket={selectedTicketDetail}
          onRefundRequest={(ticketId, reason) => {
            handleRefundRequest(ticketId, reason)
            setSelectedTicketDetail(null)
          }}
        />
      )}
    </div>
  )
}

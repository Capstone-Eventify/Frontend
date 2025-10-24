'use client'

import React, { useState } from 'react'
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
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

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
  cancelled: { color: 'text-red-600', bgColor: 'bg-red-50', icon: XCircle }
}

export default function TicketsSection() {
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = selectedStatus === 'all' || ticket.status === selectedStatus
    const matchesSearch = ticket.eventTitle.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

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
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket, index) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Event Image */}
                <div className="lg:w-48 flex-shrink-0">
                  <img
                    src={ticket.image}
                    alt={ticket.eventTitle}
                    className="w-full h-32 lg:h-40 rounded-lg object-cover"
                  />
                </div>

                {/* Ticket Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{ticket.eventTitle}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-2" />
                          {ticket.eventDate}
                        </div>
                        <div className="flex items-center">
                          <Clock size={16} className="mr-2" />
                          {ticket.eventTime}
                        </div>
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-2" />
                          {ticket.eventLocation}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(ticket.status)}
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{ticket.price}</p>
                        <p className="text-sm text-gray-500">{ticket.ticketType}</p>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Order Number</p>
                      <p className="text-sm text-gray-900">{ticket.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Purchase Date</p>
                      <p className="text-sm text-gray-900">{ticket.purchaseDate}</p>
                    </div>
                    {ticket.seatNumber && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Seat Number</p>
                        <p className="text-sm text-gray-900">{ticket.seatNumber}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-500">QR Code</p>
                      <p className="text-sm text-gray-900 font-mono">{ticket.qrCode}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    {ticket.status === 'confirmed' && (
                      <>
                        <Button variant="outline" size="sm">
                          <QrCode size={16} className="mr-2" />
                          Show QR Code
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download size={16} className="mr-2" />
                          Download Ticket
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm">
                      <Share2 size={16} className="mr-2" />
                      Share
                    </Button>
                    {ticket.status === 'pending' && (
                      <Button variant="outline" size="sm" className="text-yellow-600 border-yellow-300">
                        <Clock size={16} className="mr-2" />
                        Processing...
                      </Button>
                    )}
                    {ticket.status === 'cancelled' && (
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
        ))}
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
    </div>
  )
}

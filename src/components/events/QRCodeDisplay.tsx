'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { X, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface QRCodeDisplayProps {
  isOpen: boolean
  onClose: () => void
  ticketId: string
  eventTitle: string
  attendeeName: string
  qrCode: string
  seatNumber?: string | null
}

export default function QRCodeDisplay({
  isOpen,
  onClose,
  ticketId,
  eventTitle,
  attendeeName,
  qrCode,
  seatNumber
}: QRCodeDisplayProps) {
  const handleDownload = async () => {
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

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
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
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Ticket</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0"
            >
              <X size={16} />
            </Button>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center mb-6">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
              <QRCodeSVG
                value={qrCode}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-sm text-gray-600 font-mono">{qrCode}</p>
          </div>

          {/* Ticket Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            <div>
              <p className="text-xs text-gray-500">Event</p>
              <p className="font-semibold text-gray-900">{eventTitle}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Attendee</p>
              <p className="font-semibold text-gray-900">{attendeeName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Ticket ID</p>
              <p className="font-mono text-sm text-gray-900">{ticketId}</p>
            </div>
            {seatNumber && (
              <div>
                <p className="text-xs text-gray-500">Seat Number</p>
                <p className="font-semibold text-gray-900">{seatNumber}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDownload}
            >
              <Download size={16} className="mr-2" />
              Download
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}


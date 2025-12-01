'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, CheckCircle, XCircle, AlertCircle, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface QRCodeScannerProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  onCheckIn: (ticketId: string, qrCode: string) => Promise<void>
}

export default function QRCodeScanner({ isOpen, onClose, eventId, onCheckIn }: QRCodeScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [scannedCode, setScannedCode] = useState('')
  const [result, setResult] = useState<{ success: boolean; message: string; ticket?: any } | null>(null)
  const [manualCode, setManualCode] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (isOpen && scanning) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen, scanning])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setResult({
        success: false,
        message: 'Unable to access camera. Please use manual entry.'
      })
      setShowManualInput(true)
      setScanning(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const handleScan = async (qrCode: string) => {
    if (!qrCode || result) return

    setScannedCode(qrCode)
    setScanning(false)
    stopCamera()

    try {
      // Find ticket by QR code
      const tickets = JSON.parse(localStorage.getItem('eventify_tickets') || '[]')
      const ticket = tickets.find((t: any) => 
        t.qrCode === qrCode && 
        (eventId === 'all' || t.eventId === eventId || t.eventTitle)
      )

      if (!ticket) {
        setResult({
          success: false,
          message: eventId === 'all' 
            ? 'Ticket not found' 
            : 'Ticket not found for this event'
        })
        return
      }

      if (ticket.status !== 'confirmed') {
        setResult({
          success: false,
          message: `Ticket is ${ticket.status}. Only confirmed tickets can be checked in.`
        })
        return
      }

      if (ticket.checkInStatus === 'checked_in') {
        setResult({
          success: false,
          message: 'Ticket already checked in',
          ticket
        })
        return
      }

      // Call check-in handler
      await onCheckIn(ticket.id, qrCode)

      setResult({
        success: true,
        message: `Successfully checked in: ${ticket.attendeeName || 'Guest'}`,
        ticket
      })

      // Reset after 3 seconds
      setTimeout(() => {
        setResult(null)
        setScannedCode('')
        setScanning(true)
        startCamera()
      }, 3000)
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Failed to check in ticket'
      })
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualCode.trim()) return
    await handleScan(manualCode.trim())
    setManualCode('')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto z-50"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 break-words">Check-In Scanner</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">Scan QR code to check in attendees</p>
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
            {!showManualInput ? (
              <>
                {/* Camera View */}
                {scanning && (
                  <div className="relative mb-4">
                    <div className="aspect-square bg-black rounded-lg overflow-hidden relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      {/* Scanning overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 border-4 border-primary-500 rounded-lg relative">
                          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary-500 rounded-tl-lg"></div>
                          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary-500 rounded-tr-lg"></div>
                          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary-500 rounded-bl-lg"></div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary-500 rounded-br-lg"></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-2">
                      Position QR code within the frame
                    </p>
                  </div>
                )}

                {/* Result Display */}
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg mb-4 ${
                      result.success
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {result.success ? (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={`font-semibold ${
                          result.success ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {result.message}
                        </p>
                        {result.ticket && (
                          <div className="mt-2 text-sm text-gray-700">
                            <p><strong>Ticket Type:</strong> {result.ticket.ticketType}</p>
                            {result.ticket.attendeeName && (
                              <p><strong>Attendee:</strong> {result.ticket.attendeeName}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Controls */}
                <div className="space-y-3">
                  {!scanning && !result && (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => {
                        setScanning(true)
                        setResult(null)
                        startCamera()
                      }}
                    >
                      <Camera size={20} className="mr-2" />
                      Start Scanning
                    </Button>
                  )}

                  {scanning && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setScanning(false)
                        stopCamera()
                      }}
                    >
                      Stop Scanning
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowManualInput(true)}
                  >
                    <QrCode size={20} className="mr-2" />
                    Enter QR Code Manually
                  </Button>
                </div>
              </>
            ) : (
              /* Manual Input */
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Manual QR Code Entry</h3>
                  <p className="text-sm text-gray-600">Enter the QR code manually if scanning is not available</p>
                </div>

                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      QR Code
                    </label>
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="Enter QR code"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1"
                      disabled={!manualCode.trim()}
                    >
                      Check In
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowManualInput(false)
                        setManualCode('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}


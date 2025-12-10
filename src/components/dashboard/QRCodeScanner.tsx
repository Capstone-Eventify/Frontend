'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, CheckCircle, XCircle, AlertCircle, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Html5Qrcode } from 'html5-qrcode'

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
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only auto-start if scanning is true and modal is open
    // But we'll handle starting manually from button click for better error handling
    if (!isOpen || !scanning) {
      stopScanning()
    }

    return () => {
      stopScanning()
    }
  }, [isOpen, scanning])

  const startScanning = async () => {
    try {
      // Comprehensive check for camera API availability
      if (typeof window === 'undefined') {
        throw new Error('Window object not available')
      }

      if (!navigator) {
        throw new Error('Navigator API not available')
      }

      // Check if we're in a secure context (HTTPS or localhost)
      const isSecureContext = window.isSecureContext || 
                              window.location.protocol === 'https:' ||
                              window.location.hostname === 'localhost' ||
                              window.location.hostname === '127.0.0.1'

      if (!isSecureContext) {
        const currentUrl = window.location.href
        // For EC2/remote servers, camera requires HTTPS
        // Show helpful message and automatically enable manual entry
        setResult({
          success: false,
          message: 'Camera access requires HTTPS. Please use manual QR code entry below, or set up SSL certificate on the server for HTTPS access.'
        })
        setShowManualInput(true)
        setScanning(false)
        return // Exit early, don't throw error
      }

      // Polyfill for older browsers (though html5-qrcode should handle this)
      if (!navigator.mediaDevices) {
        // Try polyfill for older browsers
        const nav = navigator as any
        if (nav.getUserMedia || nav.webkitGetUserMedia || nav.mozGetUserMedia || nav.msGetUserMedia) {
          // @ts-ignore - polyfill for older browsers
          navigator.mediaDevices = {
            getUserMedia: (constraints: MediaStreamConstraints) => {
              return new Promise((resolve, reject) => {
                const getUserMedia = nav.getUserMedia || nav.webkitGetUserMedia || nav.mozGetUserMedia || nav.msGetUserMedia
                getUserMedia.call(navigator, constraints, resolve, reject)
              })
            }
          }
        } else {
          const currentUrl = window.location.href
          throw new Error(`Camera API not available. Please use HTTPS (or localhost) to access the camera. Current URL: ${currentUrl}. Browser: ${navigator.userAgent}`)
        }
      }

      if (typeof navigator.mediaDevices.getUserMedia !== 'function') {
        throw new Error('getUserMedia is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.')
      }

      if (!scannerContainerRef.current) {
        throw new Error('Scanner container not found')
      }

      // Check if element exists
      const qrReaderElement = document.getElementById('qr-reader')
      if (!qrReaderElement) {
        throw new Error('QR reader element not found')
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      }

      const html5QrCode = new Html5Qrcode('qr-reader')
      scannerRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: 'environment' }, // Use back camera on mobile
        config,
        (decodedText: string) => {
          // QR code successfully scanned
          console.log('QR Code scanned:', decodedText)
          handleScan(decodedText)
        },
        (errorMessage: string) => {
          // Ignore scanning errors (they're normal while scanning)
          // Only log if it's not a "NotFoundException" (which is normal)
          if (!errorMessage.includes('NotFoundException') && 
              !errorMessage.includes('No QR code found')) {
            console.debug('Scanning...', errorMessage)
          }
        }
      )
    } catch (error: any) {
      console.error('Error starting QR scanner:', error)
      const errorMessage = error.message || 'Unable to access camera. Please use manual entry or ensure you are on HTTPS (or localhost).'
      setResult({
        success: false,
        message: errorMessage
      })
      setShowManualInput(true)
      setScanning(false)
      
      // Ensure scanner is cleaned up
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop().catch(() => {})
          scannerRef.current.clear()
        } catch (e) {
          // Ignore cleanup errors
        }
        scannerRef.current = null
      }
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch (error) {
        console.error('Error stopping scanner:', error)
      }
      scannerRef.current = null
    }
  }

  const handleScan = async (qrCode: string) => {
    if (!qrCode || result) return

    // Stop scanning immediately when QR code is detected
    setScannedCode(qrCode)
    setScanning(false)
    await stopScanning()

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const token = localStorage.getItem('token')
      
      if (!token) {
        setResult({
          success: false,
          message: 'Please sign in to check in tickets'
        })
        return
      }

      // Use dedicated QR code lookup endpoint (QR code is now the ticket ID)
      const ticketResponse = await fetch(`${apiUrl}/api/tickets/qr/${qrCode}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!ticketResponse.ok) {
        if (ticketResponse.status === 404) {
          setResult({
            success: false,
            message: 'Ticket not found'
          })
        } else if (ticketResponse.status === 403) {
          const errorData = await ticketResponse.json().catch(() => ({}))
          setResult({
            success: false,
            message: errorData.message || 'This ticket belongs to an event organized by another organizer. You can only check in tickets for your own events.'
          })
        } else {
          setResult({
            success: false,
            message: 'Failed to lookup ticket'
          })
        }
        return
      }

      const ticketData = await ticketResponse.json()
      if (!ticketData.success || !ticketData.data) {
        setResult({
          success: false,
          message: 'Ticket not found'
        })
        return
      }

      const ticket = ticketData.data

      // No need to verify event - scanner works for any event
      // The backend will verify that the organizer has permission to check in tickets for this event

      if (ticket.status !== 'CONFIRMED') {
        setResult({
          success: false,
          message: `Ticket is ${ticket.status.toLowerCase()}. Only confirmed tickets can be checked in.`
        })
        return
      }

      if (ticket.checkedIn) {
        setResult({
          success: false,
          message: 'Ticket already checked in',
          ticket: {
            id: ticket.id,
            ticketType: ticket.ticketTier?.name || ticket.ticketType,
            attendeeName: ticket.attendee ? `${ticket.attendee.firstName} ${ticket.attendee.lastName}` : 'Guest'
          }
        })
        return
      }

      // Call check-in handler
      await onCheckIn(ticket.id, qrCode)

      setResult({
        success: true,
        message: `Successfully checked in: ${ticket.attendee ? `${ticket.attendee.firstName} ${ticket.attendee.lastName}` : 'Guest'}`,
        ticket: {
          id: ticket.id,
          ticketType: ticket.ticketTier?.name || ticket.ticketType,
          attendeeName: ticket.attendee ? `${ticket.attendee.firstName} ${ticket.attendee.lastName}` : 'Guest'
        }
      })

      // Reset after 3 seconds
      setTimeout(() => {
        setResult(null)
        setScannedCode('')
        setScanning(true)
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
            {/* Show info banner if HTTPS is not available */}
            {!window.isSecureContext && window.location.protocol !== 'https:' && 
             window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Camera access requires HTTPS. Please use manual QR code entry below, or set up SSL certificate on the server for HTTPS access.
                </p>
              </div>
            )}
            
            {!showManualInput ? (
              <>
                {/* Camera View */}
                {scanning && (
                  <div className="relative mb-4" ref={scannerContainerRef}>
                    <div className="aspect-square bg-black rounded-lg overflow-hidden relative">
                      <div 
                        id="qr-reader" 
                        className="w-full h-full"
                        style={{ minHeight: '300px' }}
                      ></div>
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
                      onClick={async () => {
                        try {
                          setResult(null)
                          setScannedCode('')
                          setScanning(true)
                          // Small delay to ensure DOM is ready
                          await new Promise(resolve => setTimeout(resolve, 100))
                          await startScanning()
                        } catch (error: any) {
                          console.error('Error in start scanning button:', error)
                          setScanning(false)
                          setResult({
                            success: false,
                            message: error.message || 'Failed to start camera. Please try manual entry.'
                          })
                          setShowManualInput(true)
                        }
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
                      onClick={async () => {
                        setScanning(false)
                        await stopScanning()
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


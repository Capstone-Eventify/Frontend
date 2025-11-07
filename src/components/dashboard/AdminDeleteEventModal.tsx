'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface AdminDeleteEventModalProps {
  isOpen: boolean
  onClose: () => void
  eventTitle: string
  organizerName: string
  organizerEmail: string
  onConfirm: (reason: string) => void
  isOwner?: boolean // If true, the current user owns the event (organizer deleting their own event)
}

export default function AdminDeleteEventModal({
  isOpen,
  onClose,
  eventTitle,
  organizerName,
  organizerEmail,
  onConfirm,
  isOwner = false
}: AdminDeleteEventModalProps) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    // Only require reason for admins (not for owners deleting their own event)
    if (!isOwner && !reason.trim()) {
      alert('Please provide a reason for deleting this event')
      return
    }

    setIsSubmitting(true)
    onConfirm(reason.trim() || 'Event deleted by organizer')
    setReason('')
    setIsSubmitting(false)
    onClose()
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
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-red-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Delete Event</h2>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
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

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Event Info */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Event to be deleted:</p>
              <p className="text-lg font-semibold text-gray-900">{eventTitle}</p>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Organizer:</span> {organizerName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {organizerEmail}
                </p>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-1">Important Notice</h4>
                  <p className="text-sm text-yellow-700">
                    {isOwner 
                      ? 'This action will permanently remove the event and all associated data. This cannot be undone.'
                      : 'The organizer will be notified about this deletion with the reason you provide below. This action will permanently remove the event and all associated data.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Reason Input - Only required for admins */}
            {!isOwner && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Deletion <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please provide a clear reason for deleting this event. This will be sent to the organizer..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  required
                />
                <p className="mt-2 text-xs text-gray-500">
                  This reason will be sent to the organizer via notification.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={(!isOwner && !reason.trim()) || isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 size={16} className="mr-2" />
              {isSubmitting ? 'Deleting...' : 'Delete Event'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}


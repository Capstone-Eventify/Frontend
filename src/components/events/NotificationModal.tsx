'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Mail, MessageSquare, Bell } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  eventTitle: string
  eventId: string
}

export default function NotificationModal({
  isOpen,
  onClose,
  eventTitle,
  eventId
}: NotificationModalProps) {
  const [notificationType, setNotificationType] = useState<'email' | 'sms' | 'push'>('email')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      alert('Please fill in both subject and message')
      return
    }

    setIsSending(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSending(false)
      alert(`Notification sent successfully to all attendees of "${eventTitle}"!`)
      onClose()
      // Reset form
      setSubject('')
      setMessage('')
    }, 1500)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Bell size={20} className="text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Send Notification</h2>
                <p className="text-sm text-gray-600">{eventTitle}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Notification Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Notification Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setNotificationType('email')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    notificationType === 'email'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Mail size={24} className={`mx-auto mb-2 ${notificationType === 'email' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <p className={`text-sm font-medium ${notificationType === 'email' ? 'text-primary-700' : 'text-gray-600'}`}>
                    Email
                  </p>
                </button>
                <button
                  onClick={() => setNotificationType('sms')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    notificationType === 'sms'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <MessageSquare size={24} className={`mx-auto mb-2 ${notificationType === 'sms' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <p className={`text-sm font-medium ${notificationType === 'sms' ? 'text-primary-700' : 'text-gray-600'}`}>
                    SMS
                  </p>
                </button>
                <button
                  onClick={() => setNotificationType('push')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    notificationType === 'push'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Bell size={24} className={`mx-auto mb-2 ${notificationType === 'push' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <p className={`text-sm font-medium ${notificationType === 'push' ? 'text-primary-700' : 'text-gray-600'}`}>
                    Push
                  </p>
                </button>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter notification subject"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your notification message"
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-semibold text-gray-900 mb-2">{subject || 'Subject will appear here'}</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{message || 'Message will appear here'}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSend}
              disabled={isSending || !subject.trim() || !message.trim()}
            >
              <Send size={16} className="mr-2" />
              {isSending ? 'Sending...' : 'Send Notification'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}


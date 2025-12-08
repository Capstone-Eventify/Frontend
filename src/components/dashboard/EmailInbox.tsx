'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  MailOpen,
  Trash2,
  X,
  Calendar,
  Users,
  DollarSign,
  Clock,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useUser } from '@/contexts/UserContext'
import {
  getOrganizerEmails,
  markEmailAsRead,
  deleteEmail,
  EmailNotification
} from '@/lib/emailNotifications'

export default function EmailInbox() {
  const { user } = useUser()
  const [emails, setEmails] = useState<EmailNotification[]>([])
  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'registration' | 'waitlist'>('all')

  useEffect(() => {
    if (user?.email) {
      const organizerEmails = getOrganizerEmails(user.email)
      // Sort by timestamp, newest first
      const sorted = organizerEmails.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      setEmails(sorted)
    }
  }, [user?.email])

  const filteredEmails = emails.filter(email => {
    if (filter === 'unread') return !email.isRead
    if (filter === 'registration') return email.type === 'registration'
    if (filter === 'waitlist') return email.type === 'waitlist'
    return true
  })

  const unreadCount = emails.filter(e => !e.isRead).length

  const handleEmailClick = (email: EmailNotification) => {
    if (!email.isRead) {
      markEmailAsRead(email.id)
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, isRead: true } : e))
    }
    setSelectedEmail(email)
  }

  const handleDeleteEmail = (emailId: string) => {
    deleteEmail(emailId)
    setEmails(prev => prev.filter(e => e.id !== emailId))
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (minutes < 1) return 'Just now'
      if (minutes < 60) return `${minutes}m ago`
      if (hours < 24) return `${hours}h ago`
      if (days < 7) return `${days}d ago`
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    } catch {
      return timestamp
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'registration': return CheckCircle
      case 'waitlist': return Clock
      case 'payment': return DollarSign
      default: return Mail
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'registration': return 'bg-green-50 text-green-700 border-green-200'
      case 'waitlist': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'payment': return 'bg-blue-50 text-blue-700 border-blue-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  if (selectedEmail) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedEmail(null)}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Inbox
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteEmail(selectedEmail.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 size={16} />
          </Button>
        </div>

        <div className="border-b border-gray-200 pb-4 mb-4">
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900 break-words">
              {selectedEmail.subject}
            </h2>
            <Badge className={getTypeColor(selectedEmail.type)}>
              {selectedEmail.type}
            </Badge>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-semibold">From:</span> {selectedEmail.from}</p>
            <p><span className="font-semibold">To:</span> {selectedEmail.to}</p>
            <p><span className="font-semibold">Date:</span> {formatTimestamp(selectedEmail.timestamp)}</p>
            {selectedEmail.attendeeName && (
              <p><span className="font-semibold">Attendee:</span> {selectedEmail.attendeeName}</p>
            )}
            {selectedEmail.ticketQuantity && (
              <p><span className="font-semibold">Tickets:</span> {selectedEmail.ticketQuantity} × {selectedEmail.ticketType}</p>
            )}
            {selectedEmail.amount && (
              <p><span className="font-semibold">Amount:</span> ${selectedEmail.amount.toFixed(2)}</p>
            )}
          </div>
        </div>

        <div className="prose max-w-none">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans bg-gray-50 p-4 rounded-lg">
            {selectedEmail.body}
          </pre>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mail size={24} className="text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Email Inbox</h2>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white border-0">
                {unreadCount} unread
              </Badge>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({emails.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === 'unread'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('registration')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === 'registration'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Registrations ({emails.filter(e => e.type === 'registration').length})
          </button>
          <button
            onClick={() => setFilter('waitlist')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === 'waitlist'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Waitlist ({emails.filter(e => e.type === 'waitlist').length})
          </button>
        </div>
      </div>

      {/* Email List */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {filteredEmails.length === 0 ? (
          <div className="p-8 text-center">
            <Mail size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">No emails found</p>
          </div>
        ) : (
          filteredEmails.map((email) => {
            const Icon = getTypeIcon(email.type)
            const colorClass = getTypeColor(email.type)

            return (
              <motion.div
                key={email.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                  !email.isRead ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleEmailClick(email)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 ${colorClass.split(' ')[0]} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={colorClass.split(' ')[1]} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {email.isRead ? (
                          <MailOpen size={16} className="text-gray-400 flex-shrink-0" />
                        ) : (
                          <Mail size={16} className="text-blue-600 flex-shrink-0" />
                        )}
                        <p className={`text-sm font-semibold ${email.isRead ? 'text-gray-600' : 'text-gray-900'} truncate`}>
                          {email.from}
                        </p>
                        {!email.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(email.timestamp)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteEmail(email.id)
                          }}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1 break-words">
                      {email.subject}
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-2 break-words">
                      {email.body.substring(0, 100)}...
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`${colorClass} text-xs`}>
                        {email.type}
                      </Badge>
                      {email.eventTitle && (
                        <span className="text-xs text-gray-500 truncate">
                          {email.eventTitle}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}


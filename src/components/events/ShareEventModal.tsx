'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, Twitter, Facebook, Linkedin, Mail, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EventDetail } from '@/types/event'

interface ShareEventModalProps {
  event: EventDetail
  onClose: () => void
}

export default function ShareEventModal({ event, onClose }: ShareEventModalProps) {
  const [copied, setCopied] = useState(false)
  const eventUrl = typeof window !== 'undefined' ? `${window.location.origin}/events/${event.id}` : ''

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareViaWebAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: eventUrl,
        })
        onClose()
      } catch (err) {
        // User cancelled or error occurred
      }
    }
  }

  const shareToTwitter = () => {
    const text = `Check out ${event.title}! ${eventUrl}`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`, '_blank')
  }

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`, '_blank')
  }

  const shareViaEmail = () => {
    const subject = `Check out this event: ${event.title}`
    const body = `I thought you might be interested in this event:\n\n${event.title}\n\n${event.description}\n\n${eventUrl}`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

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
            <h2 className="text-2xl font-bold text-gray-900">Share Event</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0"
            >
              <X size={16} />
            </Button>
          </div>

          {/* Event Preview */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
          </div>

          {/* Copy Link */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={eventUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
              />
              <Button
                variant={copied ? 'primary' : 'outline'}
                size="sm"
                onClick={copyToClipboard}
                className="flex-shrink-0"
              >
                {copied ? (
                  <>
                    <Check size={16} className="mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} className="mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            {navigator.share && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={shareViaWebAPI}
              >
                <Share2 size={20} className="mr-3" />
                Share via...
              </Button>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={shareToTwitter}
              >
                <Twitter size={20} className="mr-3 text-blue-400" />
                Twitter
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={shareToFacebook}
              >
                <Facebook size={20} className="mr-3 text-blue-600" />
                Facebook
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={shareToLinkedIn}
              >
                <Linkedin size={20} className="mr-3 text-blue-700" />
                LinkedIn
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={shareViaEmail}
              >
                <Mail size={20} className="mr-3 text-gray-600" />
                Email
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}


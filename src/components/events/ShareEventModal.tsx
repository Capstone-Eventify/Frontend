'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, Twitter, Facebook, Linkedin, Mail, Share2, MessageCircle, Instagram, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EventDetail } from '@/types/event'
import { useUser } from '@/contexts/UserContext'

interface ShareEventModalProps {
  event: EventDetail
  onClose: () => void
}

export default function ShareEventModal({ event, onClose }: ShareEventModalProps) {
  const [copied, setCopied] = useState(false)
  const [shareCount, setShareCount] = useState(0)
  const { user } = useUser()
  const eventUrl = typeof window !== 'undefined' ? `${window.location.origin}/events/${event.id}` : ''
  
  // Load share count from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const shares = JSON.parse(localStorage.getItem(`eventify_shares_${event.id}`) || '[]')
      setShareCount(shares.length)
    }
  }, [event.id])

  const trackShare = async (platform: string) => {
    // Track share in localStorage
    if (typeof window !== 'undefined') {
      const shares = JSON.parse(localStorage.getItem(`eventify_shares_${event.id}`) || '[]')
      const newShare = {
        platform,
        userId: user?.id || 'anonymous',
        timestamp: new Date().toISOString()
      }
      shares.push(newShare)
      localStorage.setItem(`eventify_shares_${event.id}`, JSON.stringify(shares))
      setShareCount(shares.length)
      
      // Track via API (commented out for now)
      // try {
      //   await fetch('/api/social/track', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({
      //       eventId: event.id,
      //       platform,
      //       userId: user?.id
      //     })
      //   })
      // } catch (err) {
      //   console.error('Failed to track share:', err)
      // }
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl)
      setCopied(true)
      trackShare('copy')
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
        trackShare('native')
        onClose()
      } catch (err) {
        // User cancelled or error occurred
      }
    }
  }

  const shareToTwitter = () => {
    const text = `🎉 Check out ${event.title}! ${eventUrl}`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
    trackShare('twitter')
  }

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`, '_blank')
    trackShare('facebook')
  }

  const shareToLinkedIn = () => {
    const summary = event.description?.substring(0, 200) || ''
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}&summary=${encodeURIComponent(summary)}`, '_blank')
    trackShare('linkedin')
  }

  const shareToWhatsApp = () => {
    const text = `Check out ${event.title}! ${eventUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    trackShare('whatsapp')
  }

  const shareToInstagram = () => {
    // Instagram doesn't support direct sharing, so copy link
    copyToClipboard()
    alert('Link copied! Paste it in your Instagram story or post.')
    trackShare('instagram')
  }

  const shareViaEmail = () => {
    const subject = `Check out this event: ${event.title}`
    const body = `I thought you might be interested in this event:\n\n${event.title}\n\n${event.description}\n\n${eventUrl}`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    trackShare('email')
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
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-4 sm:p-6 z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">Share Event</h2>
              {shareCount > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp size={14} className="text-primary-600" />
                  <span className="text-xs sm:text-sm text-gray-600">{shareCount} {shareCount === 1 ? 'share' : 'shares'}</span>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0 flex-shrink-0"
            >
              <X size={16} />
            </Button>
          </div>

          {/* Event Preview */}
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 break-words">{event.title}</h3>
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 break-words">{event.description}</p>
          </div>

          {/* Copy Link */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Event Link
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={eventUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-gray-50 break-all"
              />
              <Button
                variant={copied ? 'primary' : 'outline'}
                size="sm"
                onClick={copyToClipboard}
                className="flex-shrink-0 w-full sm:w-auto"
              >
                {copied ? (
                  <>
                    <Check size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-2 sm:space-y-3">
            {typeof navigator !== 'undefined' && navigator.share && (
              <Button
                variant="outline"
                className="w-full justify-start text-xs sm:text-sm"
                onClick={shareViaWebAPI}
              >
                <Share2 size={18} className="sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                Share via...
              </Button>
            )}

            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Social Media</p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  className="w-full justify-start text-xs sm:text-sm hover:bg-blue-50 hover:border-blue-300"
                  onClick={shareToTwitter}
                >
                  <Twitter size={18} className="sm:w-5 sm:h-5 mr-2 sm:mr-3 text-blue-400 flex-shrink-0" />
                  <span className="truncate">Twitter</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-xs sm:text-sm hover:bg-blue-50 hover:border-blue-300"
                  onClick={shareToFacebook}
                >
                  <Facebook size={18} className="sm:w-5 sm:h-5 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                  <span className="truncate">Facebook</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-xs sm:text-sm hover:bg-blue-50 hover:border-blue-300"
                  onClick={shareToLinkedIn}
                >
                  <Linkedin size={18} className="sm:w-5 sm:h-5 mr-2 sm:mr-3 text-blue-700 flex-shrink-0" />
                  <span className="truncate">LinkedIn</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-xs sm:text-sm hover:bg-green-50 hover:border-green-300"
                  onClick={shareToWhatsApp}
                >
                  <MessageCircle size={18} className="sm:w-5 sm:h-5 mr-2 sm:mr-3 text-green-600 flex-shrink-0" />
                  <span className="truncate">WhatsApp</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-xs sm:text-sm hover:bg-pink-50 hover:border-pink-300"
                  onClick={shareToInstagram}
                >
                  <Instagram size={18} className="sm:w-5 sm:h-5 mr-2 sm:mr-3 text-pink-600 flex-shrink-0" />
                  <span className="truncate">Instagram</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-xs sm:text-sm hover:bg-gray-50 hover:border-gray-300"
                  onClick={shareViaEmail}
                >
                  <Mail size={18} className="sm:w-5 sm:h-5 mr-2 sm:mr-3 text-gray-600 flex-shrink-0" />
                  <span className="truncate">Email</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}


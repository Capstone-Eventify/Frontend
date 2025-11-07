'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getEventById } from '@/data/eventDetails'
import { useUser } from '@/contexts/UserContext'
import { useAuth } from '@/contexts/AuthContext'
import CheckoutFlow from '@/components/events/CheckoutFlow'

function CheckoutContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useUser()
  const { openAuthModal } = useAuth()
  const [event, setEvent] = useState<any>(null)
  const upgradeTierId = searchParams?.get('upgrade')

  useEffect(() => {
    // Try to get event from eventDetails first
    let foundEvent = getEventById(params.id as string)
    
    // If not found, check organizer events in localStorage
    if (!foundEvent && typeof window !== 'undefined') {
      const organizerEvents = JSON.parse(localStorage.getItem('eventify_organizer_events') || '[]')
      foundEvent = organizerEvents.find((e: any) => e.id === params.id)
    }
    
    setEvent(foundEvent)
  }, [params.id])

  useEffect(() => {
    if (!isAuthenticated) {
      // Open auth modal with redirect URL
      const currentPath = `/events/${params.id}/checkout${upgradeTierId ? `?upgrade=${upgradeTierId}` : ''}`
      openAuthModal('signin', currentPath)
    }
  }, [isAuthenticated, openAuthModal, params.id, upgradeTierId])

  if (!isAuthenticated) {
    return null
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/events/${event.id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Event
          </Button>
        </div>
      </div>

      {/* Checkout Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {upgradeTierId ? 'Upgrade Tickets' : 'Checkout'}
          </h1>
          <p className="text-gray-600">
            {upgradeTierId 
              ? `Upgrade your tickets for ${event.title}`
              : `Complete your registration for ${event.title}`
            }
          </p>
        </div>

        <CheckoutFlow event={event} upgradeTierId={upgradeTierId || undefined} />
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}


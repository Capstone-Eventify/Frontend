'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
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
  const [isLoading, setIsLoading] = useState(true)
  const upgradeTierId = searchParams?.get('upgrade')

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        
        // Fetch event from API
        const response = await fetch(`${apiUrl}/api/events/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setEvent(data.data)
          } else {
            console.error('Event not found:', data.message)
            setEvent(null)
          }
        } else {
          console.error('Failed to fetch event:', response.status)
          setEvent(null)
        }
      } catch (error) {
        console.error('Error fetching event:', error)
        setEvent(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchEvent()
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 break-words">Event Not Found</h1>
          <p className="text-gray-600 mb-4">The event you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push('/')} className="w-full sm:w-auto">Go Home</Button>
            <Button variant="outline" onClick={() => router.push('/events')} className="w-full sm:w-auto">Browse Events</Button>
          </div>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-words">
            {upgradeTierId ? 'Upgrade Tickets' : 'Checkout'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 break-words">
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


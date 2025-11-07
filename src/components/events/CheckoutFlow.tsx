'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  CreditCard,
  User,
  Tag,
  FileText,
  Ticket,
  ArrowUp
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EventDetail, WaitlistEntry } from '@/types/event'
import TicketTierSelector from './TicketTierSelector'
import PromoCodeInput from './PromoCodeInput'
import PaymentForm from './PaymentForm'
import { useUser } from '@/contexts/UserContext'

interface TicketSelection {
  tierId: string
  tierName: string
  price: number
  quantity: number
}

interface AttendeeInfo {
  name: string
  email: string
}

type CheckoutStep = 'tickets' | 'attendees' | 'promo' | 'review' | 'payment'

interface CheckoutFlowProps {
  event: EventDetail
  upgradeTierId?: string
}

export default function CheckoutFlow({ event, upgradeTierId }: CheckoutFlowProps) {
  const router = useRouter()
  const { user } = useUser()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('tickets')
  const [ticketSelections, setTicketSelections] = useState<TicketSelection[]>([])
  const [attendees, setAttendees] = useState<AttendeeInfo[]>([])
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [promoApplied, setPromoApplied] = useState(false)
  const [willGoToWaitlist, setWillGoToWaitlist] = useState(false)
  const [currentAttendees, setCurrentAttendees] = useState(event.attendees || 0)

  const [isUpgrade, setIsUpgrade] = useState(false)
  const [currentTierPrice, setCurrentTierPrice] = useState(0)
  const [upgradeCost, setUpgradeCost] = useState(0)

  // Pre-select upgrade tier if provided
  useEffect(() => {
    if (upgradeTierId && event.ticketTiers) {
      const upgradeTier = event.ticketTiers.find(tier => tier.id === upgradeTierId)
      if (upgradeTier && typeof window !== 'undefined') {
        // Check if user has existing tickets for this event
        const tickets = JSON.parse(localStorage.getItem('eventify_tickets') || '[]')
        const eventTickets = tickets.filter((t: any) => 
          t.eventId === event.id && t.status === 'confirmed'
        )
        
        if (eventTickets.length > 0) {
          setIsUpgrade(true)
          // Get the highest price tier user currently has
          const userTierPrices = eventTickets
            .map((t: any) => {
              const price = typeof t.price === 'string' ? parseFloat(t.price.replace('$', '')) : (t.price || 0)
              return price
            })
            .filter((p: number) => !isNaN(p))
          
          const maxPrice = userTierPrices.length > 0 ? Math.max(...userTierPrices) : 0
          setCurrentTierPrice(maxPrice)
          setUpgradeCost(upgradeTier.price - maxPrice)
        }
        
        setTicketSelections([{
          tierId: upgradeTier.id,
          tierName: upgradeTier.name,
          price: upgradeTier.price,
          quantity: 1
        }])
        setAttendees([{ name: user?.name || '', email: user?.email || '' }])
      }
    }
  }, [upgradeTierId, event.ticketTiers, event.id, user])

  // Demo promo codes
  const validPromoCodes: Record<string, number> = {
    'SAVE10': 10,
    'WELCOME20': 20,
    'EARLYBIRD': 15,
    'STUDENT': 25
  }

  const steps = [
    { id: 'tickets', label: 'Select Tickets', icon: Ticket },
    { id: 'attendees', label: 'Attendee Info', icon: User },
    { id: 'promo', label: 'Promo Code', icon: Tag },
    { id: 'review', label: 'Review', icon: FileText },
    { id: 'payment', label: 'Payment', icon: CreditCard }
  ]

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep)
  }

  useEffect(() => {
    // Update current attendees from localStorage
    if (typeof window !== 'undefined') {
      const tickets = JSON.parse(localStorage.getItem('eventify_tickets') || '[]')
      const eventTickets = tickets.filter((t: any) => 
        t.eventId === event.id && t.status === 'confirmed'
      )
      setCurrentAttendees(eventTickets.length)
    }
  }, [event.id])

  const handleTicketSelection = (selections: TicketSelection[]) => {
    setTicketSelections(selections)
    // Generate attendee forms for total tickets
    const totalTickets = selections.reduce((sum, sel) => sum + sel.quantity, 0)
    const newAttendees: AttendeeInfo[] = Array(totalTickets).fill(null).map(() => ({
      name: '',
      email: ''
    }))
    setAttendees(newAttendees)
    
    // Check if registration will go to waitlist
    const totalRequested = totalTickets
    const remainingCapacity = event.maxAttendees - currentAttendees
    setWillGoToWaitlist(totalRequested > remainingCapacity)
  }

  const handleAttendeeChange = (index: number, field: keyof AttendeeInfo, value: string) => {
    const newAttendees = [...attendees]
    newAttendees[index] = { ...newAttendees[index], [field]: value }
    setAttendees(newAttendees)
  }

  const handlePromoApply = (code: string) => {
    const upperCode = code.toUpperCase()
    if (validPromoCodes[upperCode]) {
      setPromoCode(upperCode)
      setDiscount(validPromoCodes[upperCode])
      setPromoApplied(true)
    } else {
      alert('Invalid promo code')
    }
  }

  const calculateSubtotal = () => {
    return ticketSelections.reduce((sum, sel) => sum + (sel.price * sel.quantity), 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discountAmount = (subtotal * discount) / 100
    return subtotal - discountAmount
  }

  const canProceed = () => {
    switch (currentStep) {
      case 'tickets':
        return ticketSelections.length > 0 && ticketSelections.some(sel => sel.quantity > 0)
      case 'attendees':
        return attendees.every(att => att.name.trim() && att.email.trim())
      case 'promo':
        return true // Optional step
      case 'review':
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (!canProceed()) return

    const currentIndex = getCurrentStepIndex()
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as CheckoutStep)
    }
  }

  const handleBack = () => {
    const currentIndex = getCurrentStepIndex()
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id as CheckoutStep)
    }
  }

  const handlePaymentComplete = () => {
    const totalRequestedTickets = ticketSelections.reduce((sum, sel) => sum + sel.quantity, 0)
    const remainingCapacity = event.maxAttendees - currentAttendees
    
    if (totalRequestedTickets > remainingCapacity) {
      // Add to waitlist
      const waitlistEntries: WaitlistEntry[] = ticketSelections.flatMap((selection, selIndex) => {
        const startIndex = ticketSelections
          .slice(0, selIndex)
          .reduce((sum, s) => sum + s.quantity, 0)
        
        return Array(selection.quantity).fill(null).map((_, index) => {
          const attendeeIndex = startIndex + index
          return {
            id: `waitlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            eventId: event.id,
            userId: user?.id || '',
            userName: attendees[attendeeIndex]?.name || user?.name || '',
            userEmail: attendees[attendeeIndex]?.email || user?.email || '',
            ticketTierId: selection.tierId,
            ticketTierName: selection.tierName,
            quantity: 1,
            requestedAt: new Date().toISOString(),
            status: 'pending' as const,
            notes: ''
          }
        })
      })

      const existingWaitlist = JSON.parse(localStorage.getItem('eventify_waitlist') || '[]')
      localStorage.setItem('eventify_waitlist', JSON.stringify([...existingWaitlist, ...waitlistEntries]))
      
      // Show waitlist confirmation
      alert(`You've been added to the waitlist. The organizer will review your request and notify you.`)
      router.push('/dashboard?tab=tickets&waitlist=true')
    } else {
      // Create confirmed tickets
      const tickets = JSON.parse(localStorage.getItem('eventify_tickets') || '[]')
      
      // Create a single order ID for this purchase
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const purchaseTimestamp = Date.now()
      
      const newTickets = ticketSelections.flatMap(selection => {
        return Array(selection.quantity).fill(null).map((_, index) => {
          const attendeeIndex = ticketSelections
            .slice(0, ticketSelections.indexOf(selection))
            .reduce((sum, s) => sum + s.quantity, 0) + index
          
          // Generate seat number only if event has assigned seating
          const seatNumber = event.hasSeating 
            ? `${String.fromCharCode(65 + (index % 26))}-${Math.floor(index / 26) + 1}` // A-1, B-1, etc.
            : null

          return {
            id: `ticket_${purchaseTimestamp}_${index}_${Math.random().toString(36).substr(2, 9)}`,
            eventId: event.id,
            eventTitle: event.title,
            eventDate: event.date,
            eventTime: event.time,
            eventLocation: event.location,
            ticketType: selection.tierName,
            ticketTierId: selection.tierId,
            price: selection.price,
            purchaseDate: new Date().toISOString(),
            status: 'confirmed',
            attendeeName: attendees[attendeeIndex]?.name || '',
            attendeeEmail: attendees[attendeeIndex]?.email || '',
            qrCode: `EVENT-${event.id}-${purchaseTimestamp}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            orderNumber: orderId,
            orderId: orderId, // Add orderId for grouping
            image: event.image,
            seatNumber: seatNumber,
            checkInStatus: 'pending' as 'pending' | 'checked_in' | 'no_show'
          }
        })
      })

      localStorage.setItem('eventify_tickets', JSON.stringify([...tickets, ...newTickets]))
      
      // Update event attendees count
      const organizerEvents = JSON.parse(localStorage.getItem('eventify_organizer_events') || '[]')
      const updatedEvents = organizerEvents.map((e: any) => {
        if (e.id === event.id) {
          return { ...e, attendees: (e.attendees || 0) + totalRequestedTickets }
        }
        return e
      })
      localStorage.setItem('eventify_organizer_events', JSON.stringify(updatedEvents))
      
      // Redirect to success page
      router.push('/dashboard?tab=tickets&success=true')
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'tickets':
        return (
          <div className="space-y-4">
            {isUpgrade && upgradeTierId && (
              <div className="bg-gradient-to-r from-blue-50 to-primary-50 border-2 border-primary-300 rounded-lg p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0">
                    <ArrowUp className="w-6 h-6 text-primary-600 mt-0.5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2">Ticket Upgrade - Payment Required</h4>
                    <p className="text-sm text-gray-700 mb-3">
                      You're upgrading your ticket to a higher tier. Pay the price difference to complete the upgrade.
                    </p>
                    <div className="bg-white rounded-lg p-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Current Ticket Price:</span>
                        <span className="font-semibold text-gray-900">${currentTierPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">New Tier Price:</span>
                        <span className="font-semibold text-gray-900">${ticketSelections[0]?.price.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t-2 border-gray-200">
                        <span className="text-gray-900 font-bold">Amount to Pay (Upgrade Cost):</span>
                        <span className="text-primary-600 font-bold text-lg">${upgradeCost.toFixed(2)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-3 italic">
                      Note: This upgrade will be in addition to your existing ticket. Your original ticket will remain valid.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <TicketTierSelector
              tiers={event.ticketTiers}
              onSelectionChange={handleTicketSelection}
              initialSelections={ticketSelections}
            />
            {willGoToWaitlist && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-yellow-900 mb-1">Waitlist Required</h4>
                    <p className="text-sm text-yellow-700">
                      This event has reached capacity. Your registration will be added to the waitlist and requires organizer approval.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Current Capacity:</span>
                <span className="font-medium text-gray-900">
                  {currentAttendees} / {event.maxAttendees} attendees
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${Math.min((currentAttendees / event.maxAttendees) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )
      case 'attendees':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendee Information</h3>
            {ticketSelections.flatMap((selection, selIndex) => {
              const startIndex = ticketSelections
                .slice(0, selIndex)
                .reduce((sum, s) => sum + s.quantity, 0)
              
              return Array(selection.quantity).fill(null).map((_, ticketIndex) => {
                const attendeeIndex = startIndex + ticketIndex
                return (
                  <div key={`${selIndex}-${ticketIndex}`} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">
                        {selection.tierName} - Ticket {ticketIndex + 1}
                      </h4>
                      <Badge>${selection.price}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={attendees[attendeeIndex]?.name || ''}
                          onChange={(e) => handleAttendeeChange(attendeeIndex, 'name', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={attendees[attendeeIndex]?.email || ''}
                          onChange={(e) => handleAttendeeChange(attendeeIndex, 'email', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )
              })
            })}
          </div>
        )
      case 'promo':
        return (
          <PromoCodeInput
            onApply={handlePromoApply}
            appliedCode={promoCode}
            discount={discount}
            onRemove={() => {
              setPromoCode('')
              setDiscount(0)
              setPromoApplied(false)
            }}
          />
        )
      case 'review':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              {/* Tickets */}
              <div className="space-y-3 mb-4">
                {ticketSelections.filter(sel => sel.quantity > 0).map((selection, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">{selection.tierName}</p>
                      <p className="text-sm text-gray-600">Quantity: {selection.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ${(selection.price * selection.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                {promoApplied && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>Discount ({promoCode})</span>
                    <span>-${((calculateSubtotal() * discount) / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Event Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Event:</span> {event.title}</p>
                <p><span className="font-medium">Date:</span> {event.date} at {event.time}</p>
                <p><span className="font-medium">Location:</span> {event.location}</p>
              </div>
            </div>
          </div>
        )
      case 'payment':
        return (
          <PaymentForm
            total={calculateTotal()}
            onComplete={handlePaymentComplete}
            eventTitle={event.title}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const StepIcon = step.icon
            const isActive = step.id === currentStep
            const isCompleted = getCurrentStepIndex() > index
            const isAccessible = getCurrentStepIndex() >= index

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCompleted
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : isActive
                        ? 'bg-primary-50 border-primary-600 text-primary-600'
                        : 'bg-gray-50 border-gray-300 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle size={20} />
                    ) : (
                      <StepIcon size={20} />
                    )}
                  </div>
                  <p className={`text-xs mt-2 text-center ${isActive ? 'font-semibold text-primary-600' : 'text-gray-600'}`}>
                    {step.label}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      isCompleted ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={getCurrentStepIndex() === 0}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>

        {currentStep !== 'payment' ? (
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Continue
            <ArrowRight size={16} className="ml-2" />
          </Button>
        ) : null}
      </div>
    </div>
  )
}


'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import getStripe from '@/lib/stripe'

interface PaymentFormProps {
  total: number
  onComplete: () => void
  eventTitle: string
  eventId: string
  ticketTierId?: string
  quantity: number
  promoCode?: string
  discount?: number
  attendees?: Array<{ name: string; email: string }>
  paymentIntentId?: string
}

// Inner component that uses Stripe hooks
function PaymentFormInner({ 
  total, 
  onComplete, 
  eventTitle,
  eventId,
  ticketTierId,
  quantity,
  promoCode,
  discount,
  attendees = [],
  paymentIntentId
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      setError('Payment system not ready. Please wait...')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/dashboard?tab=tickets&success=true`
        }
      })

      if (stripeError) {
        setError(stripeError.message || 'Payment failed')
      setIsProcessing(false)
        return
      }

      if (paymentIntent?.status === 'succeeded' && paymentIntentId) {
        // Confirm payment with backend
        const token = localStorage.getItem('token')
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/payments/confirm`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              paymentIntentId,
              eventId,
              ticketTierId,
              quantity,
              attendees,
              promoCode,
              discount
            })
          }
        )

        const data = await response.json()

        if (data.success) {
      onComplete()
        } else {
          setError(data.message || 'Failed to confirm payment')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Payment processing failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 break-words">
          Payment Information
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 break-words">
          Complete your purchase for {eventTitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Stripe Payment Element */}
        <div className="bg-white border border-gray-300 rounded-lg p-4">
          <PaymentElement 
            options={{
              layout: 'tabs',
              business: {
                name: 'Eventify'
              },
              fields: {
                billingDetails: {
                  address: 'auto'
                }
              }
            }}
            onReady={() => {
              console.log('Payment Element is ready')
            }}
          />
        </div>

        {/* Total */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-base sm:text-lg font-semibold text-gray-900">
              Total Amount
            </span>
            <span className="text-xl sm:text-2xl font-bold text-primary-600">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
          >
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Security Notice */}
        <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
          <Lock size={14} className="sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
          <p className="break-words">
            Your payment information is secure and encrypted. Powered by Stripe.
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isProcessing || !stripe}
        >
          {isProcessing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
              />
              Processing Payment...
            </>
          ) : (
            <>
              <Lock size={16} className="mr-2" />
              Complete Payment ${total.toFixed(2)}
            </>
          )}
        </Button>
      </form>
    </div>
  )
}

// Wrapper component with Stripe Elements provider
export default function PaymentForm(props: PaymentFormProps) {
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initStripe = async () => {
      try {
        const stripe = await getStripe()
        setStripePromise(Promise.resolve(stripe))
      } catch (error) {
        console.error('Failed to initialize Stripe:', error)
        setError('Failed to initialize payment system')
        setIsLoading(false)
      }
    }
    initStripe()
  }, [])

  // Create payment intent once Stripe is loaded
  useEffect(() => {
    if (!stripePromise) return

    const createIntent = async () => {
      try {
        // Get token if available (optional in mock mode)
        const token = localStorage.getItem('token') || 'test_token'

        // Create payment intent - backend uses mock auth (no database required)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/payments/create-intent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              eventId: props.eventId,
              ticketTierId: props.ticketTierId,
              quantity: props.quantity,
              promoCode: props.promoCode,
              discount: props.discount,
              amount: props.total // Send total amount directly (no database needed)
            })
          }
        )

        const data = await response.json()

        if (data.success) {
          setClientSecret(data.data.clientSecret)
          setPaymentIntentId(data.data.paymentIntentId)
        } else {
          setError(data.message || 'Failed to initialize payment')
        }
      } catch (err) {
        setError('Network error. Please try again.')
        console.error('Error creating payment intent:', err)
      } finally {
        setIsLoading(false)
      }
    }

    createIntent()
  }, [stripePromise, props.eventId, props.ticketTierId, props.quantity, props.promoCode, props.discount, props.total])

  if (isLoading || !stripePromise) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="ml-3 text-gray-600">Initializing payment...</p>
      </div>
    )
  }

  if (error || !clientSecret) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-600 font-semibold">Payment Initialization Failed</p>
              <p className="text-red-600 text-sm mt-1">{error || 'Failed to initialize payment. Please try again.'}</p>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="w-full"
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <Elements 
      stripe={stripePromise} 
      options={{
        clientSecret: clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#8b5cf6',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#ef4444',
            fontFamily: 'Inter, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px'
          }
        },
        locale: 'en'
      }}
    >
      <PaymentFormInner 
        {...props} 
        paymentIntentId={paymentIntentId || undefined}
      />
    </Elements>
  )
}

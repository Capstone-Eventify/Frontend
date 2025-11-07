'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Lock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface PaymentFormProps {
  total: number
  onComplete: () => void
  eventTitle: string
}

export default function PaymentForm({ total, onComplete, eventTitle }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    zipCode: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value

    // Format card number (add spaces every 4 digits)
    if (field === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
      if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19)
    }

    // Format expiry date (MM/YY)
    if (field === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '')
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4)
      }
    }

    // Format CVV (3-4 digits only)
    if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4)
    }

    // Format ZIP (5 digits)
    if (field === 'zipCode') {
      formattedValue = value.replace(/\D/g, '').slice(0, 5)
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.cardNumber.replace(/\s/g, '').match(/^\d{13,16}$/)) {
      newErrors.cardNumber = 'Invalid card number'
    }

    if (!formData.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      newErrors.expiryDate = 'Invalid expiry date (MM/YY)'
    }

    if (!formData.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = 'Invalid CVV'
    }

    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Cardholder name is required'
    }

    if (!formData.zipCode.match(/^\d{5}$/)) {
      newErrors.zipCode = 'Invalid ZIP code'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsProcessing(true)

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    setIsProcessing(false)
    onComplete()
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Information</h3>
        <p className="text-gray-600 text-sm">Complete your purchase for {eventTitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Number
          </label>
          <div className="relative">
            <CreditCard size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              placeholder="1234 5678 9012 3456"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.cardNumber ? 'border-red-300' : 'border-gray-300'
              }`}
              maxLength={19}
            />
          </div>
          {errors.cardNumber && (
            <p className="text-sm text-red-600 mt-1">{errors.cardNumber}</p>
          )}
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            value={formData.cardName}
            onChange={(e) => handleInputChange('cardName', e.target.value)}
            placeholder="John Doe"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.cardName ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.cardName && (
            <p className="text-sm text-red-600 mt-1">{errors.cardName}</p>
          )}
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date
            </label>
            <input
              type="text"
              value={formData.expiryDate}
              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
              placeholder="MM/YY"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.expiryDate ? 'border-red-300' : 'border-gray-300'
              }`}
              maxLength={5}
            />
            {errors.expiryDate && (
              <p className="text-sm text-red-600 mt-1">{errors.expiryDate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVV
            </label>
            <input
              type="text"
              value={formData.cvv}
              onChange={(e) => handleInputChange('cvv', e.target.value)}
              placeholder="123"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.cvv ? 'border-red-300' : 'border-gray-300'
              }`}
              maxLength={4}
            />
            {errors.cvv && (
              <p className="text-sm text-red-600 mt-1">{errors.cvv}</p>
            )}
          </div>
        </div>

        {/* ZIP Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ZIP Code
          </label>
          <input
            type="text"
            value={formData.zipCode}
            onChange={(e) => handleInputChange('zipCode', e.target.value)}
            placeholder="12345"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.zipCode ? 'border-red-300' : 'border-gray-300'
            }`}
            maxLength={5}
          />
          {errors.zipCode && (
            <p className="text-sm text-red-600 mt-1">{errors.zipCode}</p>
          )}
        </div>

        {/* Total */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">Total Amount</span>
            <span className="text-2xl font-bold text-primary-600">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <Lock size={16} className="mt-0.5 flex-shrink-0" />
          <p>
            Your payment information is secure. This is a demo transaction and no actual payment will be processed.
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isProcessing}
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
              Complete Payment
            </>
          )}
        </Button>
      </form>
    </div>
  )
}


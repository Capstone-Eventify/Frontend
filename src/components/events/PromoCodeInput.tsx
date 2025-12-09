'use client'

import React, { useState } from 'react'
import { Tag, X, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface PromoCodeInputProps {
  onApply: (code: string) => void
  appliedCode?: string
  discount?: number
  onRemove?: () => void
}

export default function PromoCodeInput({
  onApply,
  appliedCode,
  discount = 0,
  onRemove
}: PromoCodeInputProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleApply = () => {
    if (!code.trim()) {
      setError('Please enter a promo code')
      return
    }
    setError('')
    onApply(code)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Promo Code</h3>
        <p className="text-gray-600 text-sm">Enter a promo code to get discounts on your tickets</p>
      </div>

      {appliedCode ? (
        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} className="text-green-600" />
              <div>
                <p className="font-semibold text-gray-900">Promo Code Applied</p>
                <p className="text-sm text-gray-600">
                  Code: <span className="font-mono font-semibold">{appliedCode}</span> - {discount}% off
                </p>
              </div>
            </div>
            {onRemove && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRemove}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <X size={16} className="mr-2" />
                Remove
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Promo Code
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Tag size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase())
                    setError('')
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleApply()
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase"
                  placeholder="SAVE10"
                />
              </div>
              <Button onClick={handleApply}>
                Apply
              </Button>
            </div>
            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
          </div>

          {/* Demo Promo Codes */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Demo Promo Codes:</p>
            <div className="flex flex-wrap gap-2">
              {['SAVE10', 'WELCOME20', 'EARLYBIRD', 'STUDENT'].map((demoCode) => (
                <Badge
                  key={demoCode}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary-50 hover:border-primary-300"
                  onClick={() => {
                    setCode(demoCode)
                    onApply(demoCode)
                  }}
                >
                  {demoCode}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { TicketTier } from '@/types/event'

interface TicketSelection {
  tierId: string
  tierName: string
  price: number
  quantity: number
}

interface TicketTierSelectorProps {
  tiers: TicketTier[]
  onSelectionChange: (selections: TicketSelection[]) => void
  initialSelections?: TicketSelection[]
}

export default function TicketTierSelector({
  tiers,
  onSelectionChange,
  initialSelections = []
}: TicketTierSelectorProps) {
  const [selections, setSelections] = useState<TicketSelection[]>(
    initialSelections.length > 0
      ? initialSelections
      : tiers.map(tier => ({
          tierId: tier.id,
          tierName: tier.name,
          price: tier.price,
          quantity: 0
        }))
  )

  // Use ref to track if component is mounted and avoid calling onSelectionChange during initial render
  const isMountedRef = useRef(false)
  const onSelectionChangeRef = useRef(onSelectionChange)
  const initialSelectionsRef = useRef(initialSelections)

  // Update ref when callback changes
  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange
  }, [onSelectionChange])

  // Sync selections with initialSelections prop when it changes externally
  // Use JSON.stringify for deep comparison to prevent infinite loops
  useEffect(() => {
    const currentInitialStr = JSON.stringify(initialSelections)
    const prevInitialStr = JSON.stringify(initialSelectionsRef.current)
    
    if (initialSelections.length > 0 && currentInitialStr !== prevInitialStr) {
      initialSelectionsRef.current = initialSelections
      setSelections(initialSelections)
    }
  }, [initialSelections])

  // Call onSelectionChange only when selections actually change (not on initial mount)
  useEffect(() => {
    if (isMountedRef.current) {
      onSelectionChangeRef.current(selections.filter(sel => sel.quantity > 0))
    } else {
      isMountedRef.current = true
    }
  }, [selections])

  const updateQuantity = (tierId: string, change: number) => {
    setSelections(prev => prev.map(sel => {
      if (sel.tierId === tierId) {
        const newQuantity = Math.max(0, sel.quantity + change)
        return { ...sel, quantity: newQuantity }
      }
      return sel
    }))
  }

  const getTotalTickets = () => {
    return selections.reduce((sum, sel) => sum + sel.quantity, 0)
  }

  const getTotalPrice = () => {
    return selections.reduce((sum, sel) => sum + (sel.price * sel.quantity), 0)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Your Tickets</h3>
        <p className="text-gray-600 text-sm">Choose the ticket types and quantities you need</p>
      </div>

      <div className="space-y-4">
        {tiers.map((tier, index) => {
          const selection = selections.find(s => s.tierId === tier.id)
          const quantity = selection?.quantity || 0

          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border rounded-lg p-6 transition-all ${
                quantity > 0
                  ? 'border-primary-500 bg-primary-50/30'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{tier.name}</h4>
                    {tier.price === 0 && (
                      <Badge className="bg-green-50 text-green-700 border-green-200">
                        FREE
                      </Badge>
                    )}
                  </div>
                  {tier.description && (
                    <p className="text-sm text-gray-600 mb-3">{tier.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Price: </span>
                      <span className="font-semibold text-gray-900">
                        {tier.price === 0 ? 'FREE' : `$${tier.price}`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600 mb-2">
                    {tier.price === 0 ? 'FREE' : `$${tier.price}`}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">Quantity</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(tier.id, -1)}
                    disabled={quantity === 0}
                    className="w-10 h-10 p-0"
                  >
                    <Minus size={16} />
                  </Button>
                  <span className="w-12 text-center font-semibold text-gray-900">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(tier.id, 1)}
                    className="w-10 h-10 p-0"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>

              {quantity > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({quantity} {quantity === 1 ? 'ticket' : 'tickets'})</span>
                    <span className="font-semibold text-gray-900">
                      ${(tier.price * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Summary */}
      {getTotalTickets() > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-50 rounded-lg p-6 border border-primary-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalTickets()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Price</p>
              <p className="text-2xl font-bold text-primary-600">
                ${getTotalPrice().toFixed(2)}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}


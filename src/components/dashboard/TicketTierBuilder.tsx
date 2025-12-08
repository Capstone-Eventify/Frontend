'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, DollarSign, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TicketTier } from '@/types/event'

interface TicketTierBuilderProps {
  tiers: TicketTier[]
  onTiersChange: (tiers: TicketTier[]) => void
}

export default function TicketTierBuilder({ tiers, onTiersChange }: TicketTierBuilderProps) {
  // Ensure tiers is always an array
  const safeTiers = tiers || []

  const addTier = () => {
    const newTier: TicketTier = {
      id: `tier_${Date.now()}`,
      name: '',
      price: 0,
      description: ''
    }
    onTiersChange([...safeTiers, newTier])
  }

  const removeTier = (tierId: string) => {
    onTiersChange(safeTiers.filter(tier => tier.id !== tierId))
  }

  const updateTier = (tierId: string, field: keyof TicketTier, value: any) => {
    onTiersChange(safeTiers.map(tier => {
      if (tier.id === tierId) {
        return { ...tier, [field]: value }
      }
      return tier
    }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Ticket Tiers</h3>
          <p className="text-sm text-gray-600">Configure different ticket types and pricing</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={addTier}
        >
          <Plus size={16} className="mr-2" />
          Add Tier
        </Button>
      </div>

      <div className="space-y-4">
        {safeTiers.map((tier, index) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            <div className="flex items-start justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Tier {index + 1}</h4>
              {safeTiers.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeTier(tier.id)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tier Name *
                </label>
                <input
                  type="text"
                  value={tier.name}
                  onChange={(e) => updateTier(tier.id, 'name', e.target.value)}
                  placeholder="e.g., General Admission, VIP, Early Bird"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($) *
                </label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={tier.price}
                    onChange={(e) => updateTier(tier.id, 'price', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={tier.description || ''}
                  onChange={(e) => updateTier(tier.id, 'description', e.target.value)}
                  placeholder="e.g., Includes networking dinner"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Note: Tickets are first-come-first-served. Capacity is managed at the event level.
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {safeTiers.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-600 mb-4">No ticket tiers configured</p>
          <Button variant="outline" onClick={addTier}>
            <Plus size={16} className="mr-2" />
            Add Your First Tier
          </Button>
        </div>
      )}
    </div>
  )
}


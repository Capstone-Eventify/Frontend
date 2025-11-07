'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { TicketTier } from '@/types/event'

interface UpgradeTicketModalProps {
  isOpen: boolean
  onClose: () => void
  currentTier: {
    name: string
    price: number
    description?: string
  }
  availableUpgrades: TicketTier[]
  ticketQuantity: number
  onUpgrade: (tierId: string) => void
}

export default function UpgradeTicketModal({
  isOpen,
  onClose,
  currentTier,
  availableUpgrades,
  ticketQuantity,
  onUpgrade
}: UpgradeTicketModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Upgrade Ticket</h2>
              <p className="text-sm text-gray-600 mt-1">Choose an upgrade option for your {currentTier.name}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0"
            >
              <X size={16} />
            </Button>
          </div>

          {/* Current Ticket Info */}
          <div className="p-6 border-b border-gray-200 bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Current Ticket</h3>
                <p className="text-sm text-gray-600">{currentTier.name}</p>
                {currentTier.description && (
                  <p className="text-xs text-gray-500 mt-1">{currentTier.description}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-700">${currentTier.price.toFixed(2)}</p>
                <p className="text-xs text-gray-500">per ticket</p>
                {ticketQuantity > 1 && (
                  <p className="text-xs text-gray-600 mt-1">{ticketQuantity} tickets</p>
                )}
              </div>
            </div>
          </div>

          {/* Available Upgrades */}
          <div className="p-6">
            {availableUpgrades.length === 0 ? (
              <div className="text-center py-12">
                <ArrowUp size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Upgrades Available</h3>
                <p className="text-gray-600">
                  You already have the highest tier ticket for this event.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Upgrades</h3>
                <div className="space-y-4">
                  {availableUpgrades.map((tier) => {
                    const upgradeCost = tier.price - currentTier.price
                    const totalUpgradeCost = upgradeCost * ticketQuantity

                    return (
                      <motion.div
                        key={tier.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-2 border-primary-200 rounded-lg p-5 bg-gradient-to-r from-primary-50 to-blue-50 hover:border-primary-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">{tier.name}</h4>
                              <Badge className="bg-primary-100 text-primary-700 border-primary-200">
                                Upgrade
                              </Badge>
                            </div>
                            {tier.description && (
                              <p className="text-sm text-gray-600 mb-3">{tier.description}</p>
                            )}
                            
                            {/* Pricing Breakdown */}
                            <div className="bg-white rounded-lg p-3 space-y-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">New Tier Price:</span>
                                <span className="font-semibold text-gray-900">${tier.price.toFixed(2)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Current Tier Price:</span>
                                <span className="font-semibold text-gray-900">${currentTier.price.toFixed(2)}</span>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                <span className="text-gray-700 font-medium">Upgrade Cost per Ticket:</span>
                                <span className="font-bold text-green-600">+${upgradeCost.toFixed(2)}</span>
                              </div>
                              {ticketQuantity > 1 && (
                                <div className="flex items-center justify-between pt-1">
                                  <span className="text-gray-600">Total Upgrade Cost ({ticketQuantity} tickets):</span>
                                  <span className="font-bold text-primary-600">${totalUpgradeCost.toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="primary"
                          size="lg"
                          className="w-full"
                          onClick={() => {
                            onUpgrade(tier.id)
                            onClose()
                          }}
                        >
                          <ArrowUp size={18} className="mr-2" />
                          Upgrade {ticketQuantity > 1 ? `All ${ticketQuantity} Tickets` : 'Ticket'} to {tier.name}
                        </Button>
                      </motion.div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}


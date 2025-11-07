'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Ticket,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Download,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface EventAnalyticsProps {
  eventId: string | null
  eventTitle?: string
}

export default function EventAnalytics({ eventId, eventTitle }: EventAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {
    if (!eventId || typeof window === 'undefined') return

    // Load tickets for this event
    const tickets = JSON.parse(localStorage.getItem('eventify_tickets') || '[]')
    const eventTickets = tickets.filter((t: any) => 
      t.eventId === eventId || t.eventTitle === eventTitle
    )

    // Calculate analytics
    const confirmedTickets = eventTickets.filter((t: any) => t.status === 'confirmed')
    const checkedInTickets = eventTickets.filter((t: any) => 
      t.status === 'confirmed' && t.checkInStatus === 'checked_in'
    )
    const pendingTickets = eventTickets.filter((t: any) => t.status === 'pending')
    const refundedTickets = eventTickets.filter((t: any) => t.status === 'refunded')

    // Calculate revenue
    const totalRevenue = confirmedTickets.reduce((sum: number, ticket: any) => {
      const price = parseFloat(ticket.price?.replace('$', '').replace('FREE', '0') || '0')
      return sum + price
    }, 0)

    // Group by ticket tier
    const tierStats = confirmedTickets.reduce((acc: any, ticket: any) => {
      const tier = ticket.ticketType || 'General'
      if (!acc[tier]) {
        acc[tier] = { count: 0, revenue: 0 }
      }
      acc[tier].count++
      const price = parseFloat(ticket.price?.replace('$', '').replace('FREE', '0') || '0')
      acc[tier].revenue += price
      return acc
    }, {})

    // Registration timeline (last 30 days)
    const registrationTimeline = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      const dateStr = date.toISOString().split('T')[0]
      const count = confirmedTickets.filter((t: any) => {
        const ticketDate = new Date(t.purchaseDate || t.createdAt || Date.now())
        return ticketDate.toISOString().split('T')[0] === dateStr
      }).length
      return { date: dateStr, count }
    })

    // Check-in rate
    const checkInRate = confirmedTickets.length > 0
      ? (checkedInTickets.length / confirmedTickets.length) * 100
      : 0

    setAnalytics({
      totalTickets: eventTickets.length,
      confirmedTickets: confirmedTickets.length,
      checkedInTickets: checkedInTickets.length,
      pendingTickets: pendingTickets.length,
      refundedTickets: refundedTickets.length,
      totalRevenue,
      checkInRate,
      tierStats,
      registrationTimeline,
      averageTicketPrice: confirmedTickets.length > 0
        ? totalRevenue / confirmedTickets.length
        : 0
    })
  }, [eventId, eventTitle])

  if (!eventId) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select an Event</h3>
        <p className="text-gray-600">Choose an event to view detailed analytics</p>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading analytics...</p>
      </div>
    )
  }

  const maxTimelineCount = Math.max(...analytics.registrationTimeline.map((d: any) => d.count), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Event Analytics</h2>
          {eventTitle && (
            <p className="text-gray-600 mt-1">{eventTitle}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border border-gray-300 rounded-lg">
            {(['7d', '30d', '90d', 'all'] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className="rounded-none first:rounded-l-lg last:rounded-r-lg border-r-0 last:border-r"
              >
                {period === 'all' ? 'All Time' : period.toUpperCase()}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
            <DollarSign size={20} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${analytics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {analytics.confirmedTickets} confirmed tickets
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Total Tickets</p>
            <Ticket size={20} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.totalTickets}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="success" size="sm">{analytics.confirmedTickets} confirmed</Badge>
            {analytics.pendingTickets > 0 && (
              <Badge variant="warning" size="sm">{analytics.pendingTickets} pending</Badge>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Check-in Rate</p>
            <CheckCircle size={20} className="text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {analytics.checkInRate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {analytics.checkedInTickets} of {analytics.confirmedTickets} checked in
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Avg. Ticket Price</p>
            <TrendingUp size={20} className="text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${analytics.averageTicketPrice.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Per confirmed ticket
          </p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Timeline */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Timeline</h3>
          <div className="space-y-2">
            {analytics.registrationTimeline.map((day: any, index: number) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-16 text-xs text-gray-500">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(day.count / maxTimelineCount) * 100}%` }}
                    transition={{ delay: index * 0.02, duration: 0.5 }}
                    className="bg-primary-600 h-full rounded-full"
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                    {day.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Tier Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Tier Performance</h3>
          <div className="space-y-4">
            {Object.entries(analytics.tierStats).map(([tier, stats]: [string, any]) => {
              const percentage = analytics.confirmedTickets > 0
                ? (stats.count / analytics.confirmedTickets) * 100
                : 0
              return (
                <div key={tier}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{tier}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">{stats.count} tickets</span>
                      <span className="font-semibold text-gray-900">
                        ${stats.revenue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="bg-primary-600 h-2 rounded-full"
                    />
                  </div>
                </div>
              )
            })}
            {Object.keys(analytics.tierStats).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No ticket data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle size={24} className="text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-700">{analytics.confirmedTickets}</p>
            <p className="text-sm text-green-600">Confirmed</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <CheckCircle size={24} className="text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-700">{analytics.checkedInTickets}</p>
            <p className="text-sm text-blue-600">Checked In</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <Clock size={24} className="text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-700">{analytics.pendingTickets}</p>
            <p className="text-sm text-yellow-600">Pending</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <XCircle size={24} className="text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-700">{analytics.refundedTickets}</p>
            <p className="text-sm text-red-600">Refunded</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Conversion Rate</h3>
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {analytics.totalTickets > 0
              ? ((analytics.confirmedTickets / analytics.totalTickets) * 100).toFixed(1)
              : 0}%
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Confirmed tickets / Total tickets
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue per Ticket</h3>
            <DollarSign size={20} className="text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ${analytics.averageTicketPrice.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Average across all confirmed tickets
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Attendance Rate</h3>
            <Users size={20} className="text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {analytics.checkInRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Checked in / Confirmed tickets
          </p>
        </div>
      </div>
    </div>
  )
}


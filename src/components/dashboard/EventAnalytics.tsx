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
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts'

interface EventAnalyticsProps {
  eventId: string | null
  eventTitle?: string
}

export default function EventAnalytics({ eventId, eventTitle }: EventAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!eventId) return

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        const token = localStorage.getItem('token')
        
        if (!token) {
          setAnalytics(null)
          return
        }

        const response = await fetch(`${apiUrl}/api/analytics/event/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            // Format analytics data to match component expectations
            const analyticsData = {
              totalTickets: data.data.totalTickets,
              confirmedTickets: data.data.confirmedTickets,
              checkedInTickets: data.data.checkedInTickets,
              pendingTickets: data.data.totalTickets - data.data.confirmedTickets - data.data.refundedTickets,
              refundedTickets: data.data.refundedTickets,
              totalRevenue: data.data.totalRevenue,
              checkInRate: data.data.checkInRate,
              tierStats: data.data.ticketTypeStats || {},
              registrationTimeline: data.data.registrationTimeline || [],
              averageTicketPrice: data.data.averageTicketPrice || 0
            }
            setAnalytics(analyticsData)
          } else {
            setAnalytics(null)
          }
        } else {
          setAnalytics(null)
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
        setAnalytics(null)
      }
    }

    fetchAnalytics()
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">Event Analytics</h2>
          {eventTitle && (
            <p className="text-sm sm:text-base text-gray-600 mt-1 break-words truncate">{eventTitle}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            {(['7d', '30d', '90d', 'all'] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className="rounded-none first:rounded-l-lg last:rounded-r-lg border-r-0 last:border-r text-xs sm:text-sm px-2 sm:px-3"
              >
                {period === 'all' ? 'All' : period.toUpperCase()}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
            <Download size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Revenue</p>
            <DollarSign size={16} className="sm:w-5 sm:h-5 text-green-600 flex-shrink-0 ml-1" />
          </div>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 break-words">
            ${analytics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1 truncate">
            {analytics.confirmedTickets} confirmed tickets
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Tickets</p>
            <Ticket size={16} className="sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 ml-1" />
          </div>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{analytics.totalTickets}</p>
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
            <Badge variant="success" size="sm" className="text-xs">{analytics.confirmedTickets} confirmed</Badge>
            {analytics.pendingTickets > 0 && (
              <Badge variant="warning" size="sm" className="text-xs">{analytics.pendingTickets} pending</Badge>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Check-in Rate</p>
            <CheckCircle size={16} className="sm:w-5 sm:h-5 text-purple-600 flex-shrink-0 ml-1" />
          </div>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            {analytics.checkInRate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1 truncate">
            {analytics.checkedInTickets} of {analytics.confirmedTickets} checked in
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Avg. Ticket Price</p>
            <TrendingUp size={16} className="sm:w-5 sm:h-5 text-orange-600 flex-shrink-0 ml-1" />
          </div>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            ${analytics.averageTicketPrice.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1 truncate">
            Per confirmed ticket
          </p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Registration Timeline - Line Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 break-words">Registration Timeline</h3>
          {analytics.registrationTimeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={analytics.registrationTimeline.map((day: any) => ({
                  date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  registrations: day.count,
                  fullDate: day.date
                }))}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                  labelStyle={{ color: '#374151', fontWeight: '600' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="registrations"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={{ fill: '#4f46e5', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Registrations"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-xs sm:text-sm text-gray-500">No registration data available</p>
            </div>
          )}
        </div>

        {/* Ticket Tier Performance - Bar Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 break-words">Ticket Tier Performance</h3>
          {Object.keys(analytics.tierStats).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={Object.entries(analytics.tierStats).map(([tier, stats]: [string, any]) => ({
                  tier: tier.length > 15 ? tier.substring(0, 15) + '...' : tier,
                  tickets: stats.count,
                  revenue: parseFloat(stats.revenue.toFixed(2)),
                  fullTier: tier
                }))}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="tier"
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                  labelStyle={{ color: '#374151', fontWeight: '600' }}
                  formatter={(value: any, name: string) => {
                    if (name === 'revenue') return `$${value.toFixed(2)}`
                    return value
                  }}
                />
                <Legend />
                <Bar
                  dataKey="tickets"
                  fill="#4f46e5"
                  name="Tickets Sold"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="revenue"
                  fill="#10b981"
                  name="Revenue ($)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-xs sm:text-sm text-gray-500">No ticket data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 break-words">Ticket Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle size={20} className="sm:w-6 sm:h-6 text-green-600 mx-auto mb-1.5 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-green-700">{analytics.confirmedTickets}</p>
            <p className="text-xs sm:text-sm text-green-600 truncate">Confirmed</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <CheckCircle size={20} className="sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1.5 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-blue-700">{analytics.checkedInTickets}</p>
            <p className="text-xs sm:text-sm text-blue-600 truncate">Checked In</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <Clock size={20} className="sm:w-6 sm:h-6 text-yellow-600 mx-auto mb-1.5 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-yellow-700">{analytics.pendingTickets}</p>
            <p className="text-xs sm:text-sm text-yellow-600 truncate">Pending</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200">
            <XCircle size={20} className="sm:w-6 sm:h-6 text-red-600 mx-auto mb-1.5 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-red-700">{analytics.refundedTickets}</p>
            <p className="text-xs sm:text-sm text-red-600 truncate">Refunded</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">Conversion Rate</h3>
            <TrendingUp size={18} className="sm:w-5 sm:h-5 text-green-600 flex-shrink-0 ml-2" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {analytics.totalTickets > 0
              ? ((analytics.confirmedTickets / analytics.totalTickets) * 100).toFixed(1)
              : 0}%
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 break-words">
            Confirmed tickets / Total tickets
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">Revenue per Ticket</h3>
            <DollarSign size={18} className="sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 ml-2" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            ${analytics.averageTicketPrice.toFixed(2)}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 break-words">
            Average across all confirmed tickets
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">Attendance Rate</h3>
            <Users size={18} className="sm:w-5 sm:h-5 text-purple-600 flex-shrink-0 ml-2" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {analytics.checkInRate.toFixed(1)}%
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 break-words">
            Checked in / Confirmed tickets
          </p>
        </div>
      </div>
    </div>
  )
}


'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Users,
  DollarSign,
  Ticket,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Download,
  Loader2
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
  ResponsiveContainer
} from 'recharts'

interface EventAnalyticsProps {
  eventId: string | null
  eventTitle?: string
}

export default function EventAnalytics({ eventId, eventTitle }: EventAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [analytics, setAnalytics] = useState<any>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportMessage, setExportMessage] = useState<string | null>(null)
  const lineChartRef = useRef<HTMLDivElement>(null)
  const barChartRef = useRef<HTMLDivElement>(null)

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
            const totalTickets = Number(data.data.totalTickets) || 0
            const confirmedTickets = Number(data.data.confirmedTickets) || 0
            const checkedInTickets = Number(data.data.checkedInTickets) || 0
            const refundedTickets = Number(data.data.refundedTickets) || 0
            const totalRevenue = Number(data.data.totalRevenue) || 0
            const checkInRate = Number(data.data.checkInRate) || 0
            const averageTicketPrice = Number(data.data.averageTicketPrice) || 0

            // Ensure ticketTypeStats is an object
            const tierStats = data.data.ticketTypeStats && typeof data.data.ticketTypeStats === 'object'
              ? data.data.ticketTypeStats
              : {}

            // Ensure registrationTimeline is an array with valid data
            const registrationTimeline = Array.isArray(data.data.registrationTimeline)
              ? data.data.registrationTimeline.filter((item: any) => item && item.date)
              : []

            const analyticsData = {
              totalTickets,
              confirmedTickets,
              checkedInTickets,
              pendingTickets: Math.max(0, totalTickets - confirmedTickets - refundedTickets),
              refundedTickets,
              totalRevenue,
              checkInRate,
              tierStats,
              registrationTimeline,
              averageTicketPrice
            }

            console.log('Analytics data loaded:', {
              tierStatsKeys: Object.keys(tierStats),
              tierStats: tierStats,
              registrationTimelineLength: registrationTimeline.length,
              sampleTimeline: registrationTimeline.slice(0, 5),
              allTimelineData: registrationTimeline,
              hasNonZeroCounts: registrationTimeline.some((day: any) => day.count > 0),
              totalTickets,
              confirmedTickets,
              totalRevenue
            })

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

  // Filter registration timeline by selected period
  const getFilteredTimeline = () => {
    if (!analytics.registrationTimeline || analytics.registrationTimeline.length === 0) {
      console.log('No timeline data available')
      return []
    }

    console.log('Original timeline data:', analytics.registrationTimeline)

    const now = new Date()
    let cutoffDate = new Date()

    switch (selectedPeriod) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case '30d':
        cutoffDate.setDate(now.getDate() - 30)
        break
      case '90d':
        cutoffDate.setDate(now.getDate() - 90)
        break
      case 'all':
      default:
        // Return all data for 'all' period
        const allData = analytics.registrationTimeline.filter((day: any) => {
          return day && day.date
        })
        console.log('Filtered timeline (all):', allData)
        return allData
    }

    cutoffDate.setHours(0, 0, 0, 0)

    const filtered = analytics.registrationTimeline.filter((day: any) => {
      if (!day || !day.date) return false
      const dayDate = new Date(day.date)
      dayDate.setHours(0, 0, 0, 0)
      return dayDate >= cutoffDate && dayDate <= now
    })

    console.log('Filtered timeline:', filtered, 'Period:', selectedPeriod)
    return filtered
  }

  const filteredTimeline = getFilteredTimeline()

  // Export analytics data to CSV
  const handleExport = () => {
    if (!analytics || !eventTitle) return

    setIsExporting(true)

    try {
      // Prepare CSV data
      const csvData = []

      // Header
      csvData.push(['Event Analytics Report'])
      csvData.push(['Event:', eventTitle])
      csvData.push(['Generated:', new Date().toLocaleDateString()])
      csvData.push(['Period:', selectedPeriod === 'all' ? 'All Time' : selectedPeriod.toUpperCase()])
      csvData.push([]) // Empty row

      // Summary metrics
      csvData.push(['SUMMARY METRICS'])
      csvData.push(['Metric', 'Value'])
      csvData.push(['Total Tickets', analytics.totalTickets])
      csvData.push(['Confirmed Tickets', analytics.confirmedTickets])
      csvData.push(['Checked In Tickets', analytics.checkedInTickets])
      csvData.push(['Pending Tickets', analytics.pendingTickets])
      csvData.push(['Refunded Tickets', analytics.refundedTickets])
      csvData.push(['Total Revenue', `$${analytics.totalRevenue.toFixed(2)}`])
      csvData.push(['Average Ticket Price', `$${analytics.averageTicketPrice.toFixed(2)}`])
      csvData.push(['Check-in Rate', `${analytics.checkInRate.toFixed(1)}%`])
      csvData.push([]) // Empty row

      // Ticket tier performance
      if (analytics.tierStats && Object.keys(analytics.tierStats).length > 0) {
        csvData.push(['TICKET TIER PERFORMANCE'])
        csvData.push(['Tier', 'Tickets Sold', 'Revenue', 'Checked In'])
        Object.entries(analytics.tierStats).forEach(([tier, stats]: [string, any]) => {
          csvData.push([
            tier,
            stats.count || 0,
            `$${(stats.revenue || 0).toFixed(2)}`,
            stats.checkedIn || 0
          ])
        })
        csvData.push([]) // Empty row
      }

      // Registration timeline
      if (filteredTimeline && filteredTimeline.length > 0) {
        csvData.push(['REGISTRATION TIMELINE'])
        csvData.push(['Date', 'Registrations'])
        filteredTimeline.forEach((day: any) => {
          csvData.push([
            new Date(day.date).toLocaleDateString(),
            day.count || 0
          ])
        })
      }

      // Convert to CSV string
      const csvContent = csvData.map(row =>
        row.map(cell => {
          // Escape quotes and wrap in quotes if contains comma
          const cellStr = String(cell)
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`
          }
          return cellStr
        }).join(',')
      ).join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `${eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analytics_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        // Show success message
        setExportMessage('Analytics exported successfully!')
        setTimeout(() => setExportMessage(null), 3000)
      }
    } catch (error) {
      console.error('Error exporting analytics:', error)
      setExportMessage('Failed to export analytics. Please try again.')
      setTimeout(() => setExportMessage(null), 3000)
    } finally {
      setIsExporting(false)
    }
  }

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
          <Button
            variant="outline"
            size="sm"
            className="text-xs sm:text-sm"
            onClick={handleExport}
            disabled={!analytics || isExporting}
          >
            {isExporting ? (
              <Loader2 size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
            ) : (
              <Download size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            )}
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export'}</span>
          </Button>
        </div>
      </div>

      {/* Export Message */}
      {exportMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`p-3 rounded-lg text-sm ${exportMessage.includes('Failed')
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
            }`}
        >
          {exportMessage}
        </motion.div>
      )}

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
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Registration Timeline</h3>
          {filteredTimeline && filteredTimeline.length > 0 ? (
            <>
              <div ref={lineChartRef} className="w-full" style={{ height: '300px', minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={(() => {
                      const chartData = filteredTimeline
                        .filter((day: any) => day && day.date)
                        .map((day: any) => {
                          const count = Number(day.count) || 0
                          return {
                            date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                            registrations: count,
                            fullDate: day.date
                          }
                        })

                      console.log('Chart data for LineChart:', chartData, 'Period:', selectedPeriod, 'Data length:', chartData.length, 'Has data:', chartData.some((d: any) => d.registrations > 0), 'Max value:', Math.max(...chartData.map((d: any) => d.registrations), 0))

                      // Always return data, even if all zeros
                      if (chartData.length === 0) {
                        return [{ date: 'No Data', registrations: 0, fullDate: new Date().toISOString() }]
                      }

                      return chartData
                    })()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      stroke="#6b7280"
                      fontSize={11}
                      tick={{ fill: '#6b7280' }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                    />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      tick={{ fill: '#6b7280' }}
                      allowDecimals={false}
                      domain={[0, (dataMax: number) => Math.max(dataMax, 1)]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '8px'
                      }}
                      labelStyle={{ color: '#374151', fontWeight: '600' }}
                      formatter={(value: any) => [value, 'Registrations']}
                    />
                    <Line
                      type="monotone"
                      dataKey="registrations"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      dot={{ fill: '#4f46e5', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Registrations"
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center mt-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-0.5 bg-indigo-600"></div>
                  <span>Registrations</span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-xs sm:text-sm text-gray-500">No registration data available</p>
            </div>
          )}
        </div>

        {/* Ticket Tier Performance - Bar Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Ticket Tier Performance</h3>
          {analytics.tierStats && Object.keys(analytics.tierStats).length > 0 ? (
            <>
              <div ref={barChartRef} className="w-full" style={{ height: '300px', minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(() => {
                      const chartData = Object.entries(analytics.tierStats)
                        .filter(([_, stats]: [string, any]) => stats && typeof stats === 'object')
                        .map(([tier, stats]: [string, any]) => ({
                          tier: tier.length > 12 ? tier.substring(0, 12) + '...' : tier,
                          tickets: Number(stats.count) || 0,
                          revenue: Number(stats.revenue) || 0,
                          fullTier: tier
                        }))

                      console.log('Ticket Tier chart data:', chartData, 'tierStats:', analytics.tierStats, 'Data length:', chartData.length)

                      // Always return data, even if all zeros
                      if (chartData.length === 0) {
                        return [{ tier: 'No Data', tickets: 0, revenue: 0, fullTier: 'No Data' }]
                      }

                      return chartData
                    })()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="tier"
                      stroke="#6b7280"
                      fontSize={11}
                      tick={{ fill: '#6b7280' }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#6b7280"
                      fontSize={12}
                      tick={{ fill: '#6b7280' }}
                      allowDecimals={false}
                      domain={[0, (dataMax: number) => Math.max(dataMax, 1)]}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#10b981"
                      fontSize={12}
                      tick={{ fill: '#10b981' }}
                      allowDecimals={false}
                      domain={[0, (dataMax: number) => Math.max(dataMax, 1)]}
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
                        if (name === 'revenue' || name === 'Revenue ($)') {
                          const numValue = Number(value) || 0
                          return [`$${numValue.toFixed(2)}`, name]
                        }
                        return [Number(value) || 0, name]
                      }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="tickets"
                      fill="#4f46e5"
                      name="Tickets Sold"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="revenue"
                      fill="#10b981"
                      name="Revenue ($)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 bg-indigo-600 rounded"></div>
                  <span>Tickets Sold</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Revenue ($)</span>
                </div>
              </div>
            </>
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


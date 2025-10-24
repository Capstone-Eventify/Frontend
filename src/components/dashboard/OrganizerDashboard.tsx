'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

// Mock data for organizer dashboard
const organizerStats = {
  totalEvents: 8,
  totalRevenue: 12500,
  totalAttendees: 2450,
  activeEvents: 3,
  revenueGrowth: 12.5,
  attendeeGrowth: 8.2
}

const recentEvents = [
  {
    id: '1',
    title: 'Tech Innovation Summit 2024',
    date: 'Dec 15, 2024',
    attendees: 2847,
    revenue: 253383,
    status: 'live',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '2',
    title: 'Digital Marketing Masterclass',
    date: 'Dec 20, 2024',
    attendees: 1234,
    revenue: 0,
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '3',
    title: 'Global Design Conference',
    date: 'Jan 5, 2025',
    attendees: 5621,
    revenue: 837429,
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
  }
]

const recentActivity = [
  { action: 'New registration for Tech Innovation Summit', time: '2 hours ago', type: 'registration' },
  { action: 'Payment received for Global Design Conference', time: '4 hours ago', type: 'payment' },
  { action: 'Event "Startup Pitch Competition" published', time: '1 day ago', type: 'publish' },
  { action: 'Analytics report generated', time: '2 days ago', type: 'analytics' }
]

export default function OrganizerDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  const getStatusBadge = (status: string) => {
    const config = {
      live: { color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle },
      upcoming: { color: 'text-blue-600', bgColor: 'bg-blue-50', icon: Clock },
      ended: { color: 'text-gray-600', bgColor: 'bg-gray-50', icon: Calendar }
    }
    const statusConfig = config[status as keyof typeof config]
    const Icon = statusConfig.icon
    return (
      <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}>
        <Icon size={14} className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizer Dashboard</h1>
          <p className="text-gray-600">Manage your events and track performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <BarChart3 size={16} className="mr-2" />
            Analytics
          </Button>
          <Button>
            <Plus size={16} className="mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{organizerStats.totalEvents}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Calendar size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <ArrowUpRight size={16} className="text-green-600 mr-1" />
            <span className="text-sm text-green-600">+2 this month</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${organizerStats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <ArrowUpRight size={16} className="text-green-600 mr-1" />
            <span className="text-sm text-green-600">+{organizerStats.revenueGrowth}%</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Attendees</p>
              <p className="text-2xl font-bold text-gray-900">{organizerStats.totalAttendees.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <ArrowUpRight size={16} className="text-green-600 mr-1" />
            <span className="text-sm text-green-600">+{organizerStats.attendeeGrowth}%</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active Events</p>
              <p className="text-2xl font-bold text-gray-900">{organizerStats.activeEvents}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Activity size={24} className="text-orange-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <span className="text-sm text-gray-600">Currently running</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Events</h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {recentEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{event.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>{event.date}</span>
                    <span>{event.attendees.toLocaleString()} attendees</span>
                    <span>${event.revenue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(event.status)}
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm">
                      <Edit size={14} />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6 space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Activity size={16} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <Plus size={24} />
            <span>Create Event</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <BarChart3 size={24} />
            <span>View Analytics</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <Users size={24} />
            <span>Manage Attendees</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <DollarSign size={24} />
            <span>Revenue Report</span>
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Performance Overview</h2>
          <div className="flex space-x-2">
            <Button
              variant={selectedPeriod === '7d' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('7d')}
            >
              7 Days
            </Button>
            <Button
              variant={selectedPeriod === '30d' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('30d')}
            >
              30 Days
            </Button>
            <Button
              variant={selectedPeriod === '90d' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('90d')}
            >
              90 Days
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp size={24} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Revenue Growth</h3>
            <p className="text-3xl font-bold text-green-600">+{organizerStats.revenueGrowth}%</p>
            <p className="text-sm text-gray-600">vs last period</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users size={24} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Attendee Growth</h3>
            <p className="text-3xl font-bold text-green-600">+{organizerStats.attendeeGrowth}%</p>
            <p className="text-sm text-gray-600">vs last period</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <PieChart size={24} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Conversion Rate</h3>
            <p className="text-3xl font-bold text-blue-600">12.5%</p>
            <p className="text-sm text-gray-600">ticket sales</p>
          </div>
        </div>
      </div>
    </div>
  )
}

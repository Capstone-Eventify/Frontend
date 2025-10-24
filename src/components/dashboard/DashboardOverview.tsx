'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Ticket, 
  TrendingUp, 
  Users, 
  Clock,
  MapPin,
  Star,
  ArrowRight,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import RoleBasedAccess from './RoleBasedAccess'

// Mock data - in real app, this would come from API
const stats = [
  { label: 'Events Attended', value: '12', icon: Calendar, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { label: 'Active Tickets', value: '3', icon: Ticket, color: 'text-green-600', bgColor: 'bg-green-50' },
  { label: 'Total Spent', value: '$450', icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { label: 'Networking Score', value: '8.5', icon: Users, color: 'text-orange-600', bgColor: 'bg-orange-50' },
]

const upcomingEvents = [
  {
    id: '1',
    title: 'Tech Innovation Summit 2024',
    date: 'Dec 15, 2024',
    time: '9:00 AM',
    location: 'San Francisco, CA',
    price: '$89',
    status: 'confirmed',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '2',
    title: 'Digital Marketing Masterclass',
    date: 'Dec 20, 2024',
    time: '2:00 PM',
    location: 'Online Event',
    price: 'FREE',
    status: 'confirmed',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '3',
    title: 'Global Design Conference',
    date: 'Jan 5, 2025',
    time: '10:00 AM',
    location: 'New York, NY',
    price: '$149',
    status: 'pending',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
  }
]

const recentActivity = [
  { action: 'Registered for Tech Innovation Summit', time: '2 hours ago', type: 'registration' },
  { action: 'Downloaded ticket for Digital Marketing Masterclass', time: '1 day ago', type: 'download' },
  { action: 'Left review for Global Design Conference', time: '3 days ago', type: 'review' },
  { action: 'Added event to favorites', time: '1 week ago', type: 'favorite' },
]

export default function DashboardOverview() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, John! 👋</h1>
        <p className="text-primary-100 mb-4">Here's what's happening with your events today.</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" size="sm">
            <Plus size={16} className="mr-2" />
            Create Event
          </Button>
          <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-primary-600">
            Browse Events
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon size={24} className={stat.color} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
              <Button variant="outline" size="sm">
                View All
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {upcomingEvents.map((event, index) => (
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
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {event.date} at {event.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-1" />
                      {event.location}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{event.price}</p>
                  <Badge 
                    variant={event.status === 'confirmed' ? 'success' : 'warning'}
                    size="sm"
                  >
                    {event.status}
                  </Badge>
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
                  <Star size={16} className="text-primary-600" />
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

      {/* Role-Based Access Demo */}
      <RoleBasedAccess />

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <Calendar size={24} />
            <span>Browse Events</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <Ticket size={24} />
            <span>My Tickets</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <Plus size={24} />
            <span>Create Event</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <Users size={24} />
            <span>Network</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

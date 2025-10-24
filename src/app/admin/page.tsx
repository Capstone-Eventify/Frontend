'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  UserPlus,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Filter,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

// Mock data for admin dashboard
const adminStats = {
  totalUsers: 1247,
  totalEvents: 89,
  totalRevenue: 125000,
  pendingApprovals: 12,
  userGrowth: 15.2,
  revenueGrowth: 23.5,
  eventGrowth: 8.7
}

const pendingApprovals = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    appliedDate: 'Dec 15, 2024',
    status: 'pending',
    reason: 'Tech entrepreneur with 5+ years experience',
    events: 0
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    appliedDate: 'Dec 14, 2024',
    status: 'pending',
    reason: 'Event management company owner',
    events: 0
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike@example.com',
    appliedDate: 'Dec 13, 2024',
    status: 'pending',
    reason: 'Conference organizer with 10+ years experience',
    events: 0
  }
]

const recentUsers = [
  {
    id: '1',
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'attendee',
    joinDate: 'Dec 15, 2024',
    eventsAttended: 3,
    status: 'active'
  },
  {
    id: '2',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    role: 'organizer',
    joinDate: 'Dec 10, 2024',
    eventsCreated: 2,
    status: 'active'
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol@example.com',
    role: 'attendee',
    joinDate: 'Dec 8, 2024',
    eventsAttended: 1,
    status: 'active'
  }
]

const recentEvents = [
  {
    id: '1',
    title: 'Tech Innovation Summit',
    organizer: 'John Smith',
    date: 'Dec 20, 2024',
    attendees: 250,
    revenue: 12500,
    status: 'approved'
  },
  {
    id: '2',
    title: 'Digital Marketing Workshop',
    organizer: 'Sarah Johnson',
    date: 'Dec 22, 2024',
    attendees: 150,
    revenue: 7500,
    status: 'pending'
  },
  {
    id: '3',
    title: 'Startup Pitch Competition',
    organizer: 'Mike Chen',
    date: 'Dec 25, 2024',
    attendees: 300,
    revenue: 15000,
    status: 'approved'
  }
]

type AdminSection = 'dashboard' | 'users' | 'events' | 'analytics' | 'settings'

const adminNavigation = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings }
]

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const handleApprove = (userId: string) => {
    // In real app, this would call API
    console.log('Approving user:', userId)
  }

  const handleReject = (userId: string) => {
    // In real app, this would call API
    console.log('Rejecting user:', userId)
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{adminStats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <TrendingUp size={16} className="text-green-600 mr-1" />
            <span className="text-sm text-green-600">+{adminStats.userGrowth}%</span>
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
              <p className="text-sm font-medium text-gray-600 mb-1">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{adminStats.totalEvents}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Calendar size={24} className="text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <TrendingUp size={16} className="text-green-600 mr-1" />
            <span className="text-sm text-green-600">+{adminStats.eventGrowth}%</span>
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
              <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${adminStats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <DollarSign size={24} className="text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <TrendingUp size={16} className="text-green-600 mr-1" />
            <span className="text-sm text-green-600">+{adminStats.revenueGrowth}%</span>
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
              <p className="text-sm font-medium text-gray-600 mb-1">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">{adminStats.pendingApprovals}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Clock size={24} className="text-orange-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <AlertTriangle size={16} className="text-orange-600 mr-1" />
            <span className="text-sm text-orange-600">Requires attention</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
              <Badge className="bg-orange-50 text-orange-700">{adminStats.pendingApprovals}</Badge>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {pendingApprovals.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">{user.reason}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(user.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle size={16} className="mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReject(user.id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <XCircle size={16} className="mr-1" />
                    Reject
                  </Button>
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
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                <UserPlus size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-900">New user registration</p>
                <p className="text-xs text-gray-500">Alice Brown joined the platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                <Calendar size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-900">Event created</p>
                <p className="text-xs text-gray-500">Tech Innovation Summit by John Smith</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center">
                <DollarSign size={16} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-900">Revenue generated</p>
                <p className="text-xs text-gray-500">$12,500 from Tech Innovation Summit</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderUsers = () => (
    <div className="space-y-6">
      {/* Users Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage users and organizer approvals</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Users size={20} className="text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={user.role === 'organizer' ? 'success' : 'outline'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.joinDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.role === 'organizer' 
                      ? `${user.eventsCreated} events created`
                      : `${user.eventsAttended} events attended`
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="success" size="sm">Active</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye size={16} />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit size={16} />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard()
      case 'users':
        return renderUsers()
      case 'events':
        return <div className="p-6 text-center text-gray-500">Events management coming soon...</div>
      case 'analytics':
        return <div className="p-6 text-center text-gray-500">Analytics coming soon...</div>
      case 'settings':
        return <div className="p-6 text-center text-gray-500">Settings coming soon...</div>
      default:
        return renderDashboard()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield size={24} className="text-red-600" />
              <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <Badge className="bg-red-50 text-red-700 border-red-200">Admin Only</Badge>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Settings size={16} className="mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" className="text-red-600 border-red-300">
              <Shield size={16} className="mr-2" />
              Admin Panel
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Admin Sidebar */}
        <div className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="flex flex-col h-full">
            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {adminNavigation.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as AdminSection)}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                      ${isActive 
                        ? 'bg-red-50 text-red-700 border border-red-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              })}
            </nav>

            {/* Admin Info */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Shield size={20} className="text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                  <p className="text-xs text-gray-500 truncate">admin@eventify.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 p-4 lg:p-6">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderSection()}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  )
}

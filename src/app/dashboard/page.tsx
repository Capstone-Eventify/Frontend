'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Calendar, 
  Ticket, 
  User, 
  Settings, 
  Plus,
  Menu,
  X,
  LogOut,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useUser } from '@/contexts/UserContext'
import DashboardOverview from '@/components/dashboard/DashboardOverview'
import EventsSection from '@/components/dashboard/EventsSection'
import TicketsSection from '@/components/dashboard/TicketsSection'
import ProfileSection from '@/components/dashboard/ProfileSection'
import OrganizerDashboard from '@/components/dashboard/OrganizerDashboard'

type DashboardSection = 'overview' | 'events' | 'tickets' | 'profile' | 'organizer'

const getNavigationItems = (canCreateEvents: boolean) => [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'tickets', label: 'My Tickets', icon: Ticket },
  { id: 'profile', label: 'Profile', icon: User },
  ...(canCreateEvents ? [{ id: 'organizer', label: 'Organizer', icon: Plus }] : []),
]

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user, isOrganizer, canCreateEvents } = useUser()

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview />
      case 'events':
        return <EventsSection />
      case 'tickets':
        return <TicketsSection />
      case 'profile':
        return <ProfileSection />
      case 'organizer':
        return <OrganizerDashboard />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar - Always visible on desktop */}
        <div className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-primary-600">Eventify</h2>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {getNavigationItems(canCreateEvents).map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as DashboardSection)}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                      ${isActive 
                        ? 'bg-primary-50 text-primary-700 border border-primary-200' 
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

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-200 space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Settings size={16} className="mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-red-600 hover:text-red-700">
                <LogOut size={16} className="mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
              <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-primary-600">Eventify</h2>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User size={20} className="text-primary-600" />
                    </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                </div>
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                  {getNavigationItems(canCreateEvents).map((item) => {
                    const Icon = item.icon
                    const isActive = activeSection === item.id
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id as DashboardSection)
                          setIsSidebarOpen(false)
                        }}
                        className={`
                          w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                          ${isActive 
                            ? 'bg-primary-50 text-primary-700 border border-primary-200' 
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

                {/* Bottom Actions */}
                <div className="p-4 border-t border-gray-200 space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Settings size={16} className="mr-2" />
                    Settings
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-red-600 hover:text-red-700">
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Content Area */}
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

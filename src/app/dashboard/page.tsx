'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  ChevronDown,
  Heart,
  Shield,
  ChevronLeft,
  ChevronRight,
  Zap,
  BarChart3,
  Users,
  FileText,
  CheckCircle,
  MessageSquare,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useUser } from '@/contexts/UserContext'
import { useAuth } from '@/contexts/AuthContext'
import DashboardOverview from '@/components/dashboard/DashboardOverview'
import EventsSection from '@/components/dashboard/EventsSection'
import TicketsSection from '@/components/dashboard/TicketsSection'
import ProfileSection from '@/components/dashboard/ProfileSection'
import FavoritesSection from '@/components/dashboard/FavoritesSection'
import OrganizerDashboard from '@/components/dashboard/OrganizerDashboard'
import SettingsModal from '@/components/dashboard/SettingsModal'
import AdminDashboard from '@/components/dashboard/AdminDashboard'

type DashboardSection = 'overview' | 'events' | 'tickets' | 'favorites' | 'profile' | 'organizer' | 'admin'

const getNavigationItems = (canCreateEvents: boolean, isAdmin: boolean) => {
  if (isAdmin) {
    // Admin only sees: Overview, Events, Profile, Admin
    return [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'events', label: 'Events', icon: Calendar },
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'admin', label: 'Admin', icon: Shield },
    ]
  }
  
  // Regular users see: Overview, Events, Tickets, Favorites, Profile, Organizer (if approved)
  return [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'tickets', label: 'My Tickets', icon: Ticket },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'profile', label: 'Profile', icon: User },
    ...(canCreateEvents ? [{ id: 'organizer', label: 'Organizer', icon: Plus }] : []),
  ]
}

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const { user, isOrganizer, canCreateEvents, isAuthenticated, isAdmin, logout } = useUser()
  const { openAuthModal } = useAuth()

  // Check for query params to set active section - updates when URL changes
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['overview', 'events', 'tickets', 'favorites', 'profile', 'organizer', 'admin'].includes(tab)) {
      setActiveSection(tab as DashboardSection)
    } else {
      setActiveSection('overview')
    }
  }, [searchParams])

  // Update URL when section changes via sidebar click
  const handleSectionChange = (section: DashboardSection) => {
    setActiveSection(section)
    router.replace(`/dashboard?tab=${section}`)
  }

  // Redirect to home and open auth modal if not authenticated (but not if we're logging out)
  useEffect(() => {
    if (!isAuthenticated && !isLoggingOut) {
      router.replace('/')
      // Small delay to ensure navigation completes before opening modal
      setTimeout(() => {
        openAuthModal('signin', '/dashboard')
      }, 100)
    }
  }, [isAuthenticated, isLoggingOut, router, openAuthModal])

  const handleLogout = () => {
    setIsLoggingOut(true)
    logout()
    // Use replace to ensure we go to home and prevent back navigation
    router.replace('/')
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview />
      case 'events':
        return <EventsSection />
      case 'tickets':
        return <TicketsSection />
      case 'favorites':
        return <FavoritesSection />
      case 'profile':
        return <ProfileSection />
      case 'organizer':
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <OrganizerDashboard />
          </Suspense>
        )
      case 'admin':
        return <AdminDashboard />
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
        {/* Sidebar - Always visible on desktop, collapsible */}
        <div className={`hidden lg:block bg-white border-r border-gray-200 min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
          <div className="flex flex-col h-full relative">
            {/* Collapse Toggle */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="absolute -right-3 top-6 z-10 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 shadow-sm"
            >
              {isSidebarCollapsed ? (
                <ChevronRight size={14} className="text-gray-600" />
              ) : (
                <ChevronLeft size={14} className="text-gray-600" />
              )}
            </button>

            {/* Logo */}
            <div className={`p-6 border-b border-gray-200 ${isSidebarCollapsed ? 'px-2' : ''}`}>
              {isSidebarCollapsed ? (
                <button
                  onClick={() => router.push('/')}
                  className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mx-auto hover:bg-primary-700 transition-colors cursor-pointer"
                >
                  <span className="text-white font-bold text-sm">E</span>
                </button>
              ) : (
                <h2 
                  onClick={() => router.push('/')}
                  className="text-2xl font-bold text-primary-600 cursor-pointer hover:text-primary-700 transition-colors"
                >
                  Eventify
                </h2>
              )}
            </div>

            {/* User Info */}
            {!isSidebarCollapsed && (
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'User'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User size={20} className="text-primary-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </div>
              </div>
            )}

            {isSidebarCollapsed && (
              <div className="p-2 border-b border-gray-200 flex justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'User'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-primary-600" />
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <nav className={`flex-1 space-y-2 ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
              {getNavigationItems(canCreateEvents, isAdmin).map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                
                return (
                  <div key={item.id} className="relative group">
                    <button
                      onClick={() => handleSectionChange(item.id as DashboardSection)}
                      className={`
                        w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'space-x-3 px-3'} py-2 rounded-lg text-left transition-colors
                        ${isActive 
                          ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                      title={isSidebarCollapsed ? item.label : ''}
                    >
                      <Icon size={20} className="flex-shrink-0" />
                      {!isSidebarCollapsed && (
                        <span className="font-medium">{item.label}</span>
                      )}
                    </button>
                    {/* Tooltip for collapsed state */}
                    {isSidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>

            {/* Bottom Actions */}
            <div className={`border-t border-gray-200 space-y-2 ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
              <div className="relative group">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`w-full ${isSidebarCollapsed ? 'justify-center px-2' : 'justify-start'}`}
                  onClick={() => setShowSettingsModal(true)}
                  title={isSidebarCollapsed ? 'Settings' : ''}
                >
                  <Settings size={16} className={isSidebarCollapsed ? '' : 'mr-2'} />
                  {!isSidebarCollapsed && 'Settings'}
                </Button>
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                    Settings
                  </div>
                )}
              </div>
              <div className="relative group">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`w-full ${isSidebarCollapsed ? 'justify-center px-2' : 'justify-start'} text-red-600 hover:text-red-700`}
                  onClick={handleLogout}
                  title={isSidebarCollapsed ? 'Sign Out' : ''}
                >
                  <LogOut size={16} className={isSidebarCollapsed ? '' : 'mr-2'} />
                  {!isSidebarCollapsed && 'Sign Out'}
                </Button>
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                    Sign Out
                  </div>
                )}
              </div>
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
                  <h2 
                    onClick={() => {
                      router.push('/')
                      setIsSidebarOpen(false)
                    }}
                    className="text-2xl font-bold text-primary-600 cursor-pointer hover:text-primary-700 transition-colors"
                  >
                    Eventify
                  </h2>
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
                  {getNavigationItems(canCreateEvents, isAdmin).map((item) => {
                    const Icon = item.icon
                    const isActive = activeSection === item.id
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          handleSectionChange(item.id as DashboardSection)
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => {
                      setShowSettingsModal(true)
                      setIsSidebarOpen(false)
                    }}
                  >
                    <Settings size={16} className="mr-2" />
                    Settings
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-red-600 hover:text-red-700"
                    onClick={handleLogout}
                  >
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
              <main className="flex-1 p-4 lg:p-6 pb-24">
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

        {/* Circular Quick Actions at Bottom */}
        <>
          {/* Backdrop - Transparent click area only */}
          {isQuickActionsOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQuickActionsOpen(false)}
              className="fixed inset-0 z-40"
            />
          )}

          <div className="fixed bottom-6 right-6 z-50">
            {/* Action Buttons */}
            {isQuickActionsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ duration: 0.2, staggerChildren: 0.05 }}
                className="absolute bottom-20 right-0 flex flex-col-reverse items-end space-y-reverse space-y-3 mb-3 z-50 pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
              {(() => {
                let actions: Array<{ id: string; label: string; icon: any; onClick: () => void }> = []
                
                // Admin-specific actions
                if (isAdmin) {
                  actions = [
                    { 
                      id: 'approve-organizers', 
                      label: 'Approve Organizers', 
                      icon: CheckCircle, 
                      onClick: () => handleSectionChange('admin' as DashboardSection) 
                    },
                    { 
                      id: 'manage-users', 
                      label: 'Manage Users', 
                      icon: Users, 
                      onClick: () => handleSectionChange('admin' as DashboardSection) 
                    },
                    { 
                      id: 'view-reports', 
                      label: 'View Reports', 
                      icon: FileText, 
                      onClick: () => handleSectionChange('admin' as DashboardSection) 
                    },
                    { 
                      id: 'system-settings', 
                      label: 'System Settings', 
                      icon: Settings, 
                      onClick: () => setShowSettingsModal(true) 
                    },
                  ]
                } 
                // Organizer-specific actions (users who can create events)
                else if (canCreateEvents || isOrganizer) {
                  actions = [
                    { 
                      id: 'create-event', 
                      label: 'Create Event', 
                      icon: Plus, 
                      onClick: () => {
                        router.replace('/dashboard?tab=organizer&create=true')
                        handleSectionChange('organizer' as DashboardSection)
                      } 
                    },
                    { 
                      id: 'manage-events', 
                      label: 'Manage Events', 
                      icon: Calendar, 
                      onClick: () => handleSectionChange('organizer' as DashboardSection) 
                    },
                    { 
                      id: 'view-analytics', 
                      label: 'View Analytics', 
                      icon: BarChart3, 
                      onClick: () => {
                        handleSectionChange('organizer' as DashboardSection)
                        // Switch to analytics tab
                        setTimeout(() => {
                          const analyticsTab = document.querySelector('[data-analytics-tab]') as HTMLElement
                          analyticsTab?.click()
                        }, 100)
                      } 
                    },
                    { 
                      id: 'manage-attendees', 
                      label: 'Manage Attendees', 
                      icon: Users, 
                      onClick: () => handleSectionChange('organizer' as DashboardSection) 
                    },
                  ]
                } 
                // Regular user actions
                else {
                  actions = [
                    { 
                      id: 'browse-events', 
                      label: 'Browse Events', 
                      icon: Search, 
                      onClick: () => router.push('/events') 
                    },
                    { 
                      id: 'register-event', 
                      label: 'Register for Event', 
                      icon: Plus, 
                      onClick: () => handleSectionChange('events' as DashboardSection) 
                    },
                    { 
                      id: 'my-tickets', 
                      label: 'My Tickets', 
                      icon: Ticket, 
                      onClick: () => handleSectionChange('tickets' as DashboardSection) 
                    },
                    { 
                      id: 'contact-support', 
                      label: 'Contact Support', 
                      icon: MessageSquare, 
                      onClick: () => {
                        // Could open a support modal or navigate to support page
                        alert('Contact support feature coming soon!')
                      } 
                    },
                  ]
                }

                return actions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <motion.button
                      key={action.id}
                      initial={{ opacity: 0, scale: 0, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        action.onClick()
                        setIsQuickActionsOpen(false)
                      }}
                      className="group relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all pointer-events-auto bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                      title={action.label}
                    >
                      <Icon size={22} />
                      {/* Tooltip */}
                      <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {action.label}
                      </span>
                    </motion.button>
                  )
                })
              })()}
              </motion.div>
            )}

            {/* Main Toggle Button */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
                setIsQuickActionsOpen(!isQuickActionsOpen)
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all pointer-events-auto z-50 ${
                isQuickActionsOpen 
                  ? 'bg-red-500 hover:bg-red-600 text-white rotate-45' 
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
              title="Quick Actions"
            >
              {isQuickActionsOpen ? (
                <X size={28} />
              ) : (
                <Zap size={28} />
              )}
            </motion.button>
          </div>
        </>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}

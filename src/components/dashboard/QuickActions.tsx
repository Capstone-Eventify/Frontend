'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  Ticket, 
  Heart, 
  Plus, 
  BarChart3, 
  Users, 
  DollarSign,
  User,
  Settings,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useUser } from '@/contexts/UserContext'

interface QuickActionsProps {
  activeSection?: string
  onNavigate?: (section: string) => void
}

export default function QuickActions({ activeSection, onNavigate }: QuickActionsProps) {
  const router = useRouter()
  const { isOrganizer, isAdmin, canCreateEvents } = useUser()

  const handleNavigate = (section: string) => {
    if (onNavigate) {
      onNavigate(section)
    } else {
      router.replace(`/dashboard?tab=${section}`)
    }
  }

  const handleCreateEvent = () => {
    if (canCreateEvents) {
      router.replace('/dashboard?tab=organizer&create=true')
    } else {
      // Open organizer application or show message
      handleNavigate('profile')
    }
  }

  const handleViewAnalytics = () => {
    if (isOrganizer || canCreateEvents) {
      handleNavigate('organizer')
      // Analytics will be shown in organizer dashboard
    }
  }

  // Common actions for all users
  const commonActions = [
    {
      id: 'events',
      label: 'Browse Events',
      icon: Calendar,
      onClick: () => handleNavigate('events')
    },
    {
      id: 'tickets',
      label: 'My Tickets',
      icon: Ticket,
      onClick: () => handleNavigate('tickets')
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: Heart,
      onClick: () => handleNavigate('favorites')
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      onClick: () => handleNavigate('profile')
    }
  ]

  // Organizer-specific actions
  const organizerActions = [
    {
      id: 'create-event',
      label: 'Create Event',
      icon: Plus,
      onClick: handleCreateEvent
    },
    {
      id: 'analytics',
      label: 'View Analytics',
      icon: BarChart3,
      onClick: handleViewAnalytics
    },
    {
      id: 'attendees',
      label: 'Manage Attendees',
      icon: Users,
      onClick: () => handleNavigate('organizer')
    },
    {
      id: 'revenue',
      label: 'Revenue Report',
      icon: DollarSign,
      onClick: () => handleNavigate('organizer')
    }
  ]

  // Admin-specific actions
  const adminActions = [
    {
      id: 'admin',
      label: 'Admin Panel',
      icon: Shield,
      onClick: () => handleNavigate('admin')
    },
    {
      id: 'events',
      label: 'All Events',
      icon: Calendar,
      onClick: () => handleNavigate('events')
    }
  ]

  // Get actions based on user role
  const getActions = () => {
    if (isAdmin) {
      return [...adminActions, ...commonActions.filter(a => a.id !== 'tickets' && a.id !== 'favorites')]
    }
    if (isOrganizer || canCreateEvents) {
      return [...commonActions, ...organizerActions]
    }
    return commonActions
  }

  const actions = getActions()

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Button
              key={action.id}
              variant="outline"
              className="w-full justify-start h-auto py-3 px-4 hover:bg-primary-50 hover:border-primary-300 transition-colors"
              onClick={action.onClick}
            >
              <Icon size={20} className="text-primary-600 mr-3 flex-shrink-0" />
              <span className="text-sm font-medium text-left">{action.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}


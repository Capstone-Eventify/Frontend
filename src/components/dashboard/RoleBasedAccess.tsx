'use client'

import React from 'react'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Shield, User, Calendar, Plus, AlertCircle } from 'lucide-react'

export default function RoleBasedAccess() {
  const { user, isOrganizer, isAdmin, canCreateEvents, canAccessAdmin } = useUser()

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Account Status</h2>
      
      {/* Current User Status */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <User size={20} className="text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {user?.name || 'Not logged in'}
            </p>
            <p className="text-xs text-gray-500">
              {user?.email || 'Please log in to see your role'}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant={isAdmin ? 'success' : 'outline'}>
            {isAdmin ? 'Admin' : 'Not Admin'}
          </Badge>
          <Badge variant={isOrganizer ? 'success' : 'outline'}>
            {isOrganizer ? 'Organizer' : 'Not Organizer'}
          </Badge>
          <Badge variant={canCreateEvents ? 'success' : 'outline'}>
            {canCreateEvents ? 'Can Create Events' : 'Cannot Create Events'}
          </Badge>
        </div>
      </div>

      {/* Role-Based Features */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-900">Available Features:</h3>
        
        {/* Attendee Features */}
        <div className="flex items-center space-x-3">
          <Calendar size={20} className="text-blue-600" />
          <span className="text-sm text-gray-900">Browse Events</span>
          <Badge variant="success" size="sm">Available</Badge>
        </div>

        <div className="flex items-center space-x-3">
          <User size={20} className="text-blue-600" />
          <span className="text-sm text-gray-900">View Tickets</span>
          <Badge variant="success" size="sm">Available</Badge>
        </div>

        {/* Organizer Features */}
        <div className="flex items-center space-x-3">
          <Plus size={20} className={canCreateEvents ? "text-green-600" : "text-gray-400"} />
          <span className={`text-sm ${canCreateEvents ? "text-gray-900" : "text-gray-500"}`}>
            Create Events
          </span>
          <Badge variant={canCreateEvents ? "success" : "outline"} size="sm">
            {canCreateEvents ? "Available" : "Requires Approval"}
          </Badge>
        </div>

        <div className="flex items-center space-x-3">
          <Calendar size={20} className={canCreateEvents ? "text-green-600" : "text-gray-400"} />
          <span className={`text-sm ${canCreateEvents ? "text-gray-900" : "text-gray-500"}`}>
            Manage Events
          </span>
          <Badge variant={canCreateEvents ? "success" : "outline"} size="sm">
            {canCreateEvents ? "Available" : "Requires Approval"}
          </Badge>
        </div>

        {/* Admin Features */}
        <div className="flex items-center space-x-3">
          <Shield size={20} className={canAccessAdmin ? "text-red-600" : "text-gray-400"} />
          <span className={`text-sm ${canAccessAdmin ? "text-gray-900" : "text-gray-500"}`}>
            Admin Dashboard
          </span>
          <Badge variant={canAccessAdmin ? "error" : "outline"} size="sm">
            {canAccessAdmin ? "Available" : "Admin Only"}
          </Badge>
        </div>
      </div>


      {/* Quick Access Links */}
      {isAdmin && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield size={16} className="text-red-600" />
              <span className="text-sm text-red-800">
                Admin access detected! You can manage the platform.
              </span>
            </div>
            <Button 
              size="sm" 
              className="bg-red-600 hover:bg-red-700"
              disabled
              title="Admin panel not available in demo mode"
            >
              <Shield size={14} className="mr-1" />
              Admin Panel (Coming Soon)
            </Button>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {!isOrganizer && !isAdmin && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle size={16} className="text-yellow-600" />
            <span className="text-sm text-yellow-800">
              To create events, you need to apply for organizer status and get admin approval.
            </span>
          </div>
        </div>
      )}

      {isOrganizer && !isAdmin && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-green-600" />
            <span className="text-sm text-green-800">
              You are an approved organizer! You can create and manage events.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

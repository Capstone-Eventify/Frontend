'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Shield, User, LogOut, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'

const DEMO_USERS = {
  admin: {
    id: 'demo_admin_001',
    name: 'Admin User',
    email: 'admin@eventify.com',
    role: 'admin' as const,
    isAdmin: true,
    organizerStatus: undefined,
    joinDate: new Date('2024-01-01').toISOString(),
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
  },
  organizer: {
    id: 'demo_organizer_001',
    name: 'Event Organizer',
    email: 'organizer@eventify.com',
    role: 'organizer' as const,
    isAdmin: false,
    organizerStatus: 'approved' as const,
    joinDate: new Date('2024-02-15').toISOString(),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
  },
  attendee: {
    id: 'demo_attendee_001',
    name: 'John Attendee',
    email: 'attendee@eventify.com',
    role: 'attendee' as const,
    isAdmin: false,
    organizerStatus: undefined,
    joinDate: new Date('2024-03-01').toISOString(),
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
  }
}

interface DemoUserSwitcherProps {
  isOpen: boolean
  onClose: () => void
}

export default function DemoUserSwitcher({ isOpen, onClose }: DemoUserSwitcherProps) {
  const { login, logout } = useUser()
  const router = useRouter()
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  const handleSwitchUser = (userType: keyof typeof DEMO_USERS) => {
    const user = DEMO_USERS[userType]
    login(user)
    setSelectedUser(userType)
    
    // Redirect to dashboard
    setTimeout(() => {
      router.push('/dashboard')
      onClose()
    }, 300)
  }

  const handleLogout = () => {
    logout()
    setSelectedUser(null)
    router.push('/')
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <Users size={24} className="text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">Demo User Switcher</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0"
            >
              <X size={16} />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-sm text-gray-600 mb-6">
              Switch between different user roles to test the application. Each user has different permissions and access levels.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Admin User */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="border-2 border-red-200 rounded-lg p-6 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                onClick={() => handleSwitchUser('admin')}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-red-200 flex items-center justify-center mb-4">
                    <Shield size={32} className="text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin User</h3>
                  <p className="text-sm text-gray-600 mb-4">admin@eventify.com</p>
                  <div className="space-y-2 text-xs text-gray-700">
                    <p>✓ Full platform access</p>
                    <p>✓ Manage organizer applications</p>
                    <p>✓ Create and manage events</p>
                    <p>✓ View all user data</p>
                  </div>
                </div>
              </motion.div>

              {/* Organizer User */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="border-2 border-green-200 rounded-lg p-6 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer"
                onClick={() => handleSwitchUser('organizer')}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-green-200 flex items-center justify-center mb-4">
                    <User size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Organizer</h3>
                  <p className="text-sm text-gray-600 mb-4">organizer@eventify.com</p>
                  <div className="space-y-2 text-xs text-gray-700">
                    <p>✓ Create and manage events</p>
                    <p>✓ View event analytics</p>
                    <p>✓ Manage attendees</p>
                    <p>✓ Track ticket sales</p>
                  </div>
                </div>
              </motion.div>

              {/* Attendee User */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                onClick={() => handleSwitchUser('attendee')}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center mb-4">
                    <User size={32} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Attendee</h3>
                  <p className="text-sm text-gray-600 mb-4">attendee@eventify.com</p>
                  <div className="space-y-2 text-xs text-gray-700">
                    <p>✓ Browse events</p>
                    <p>✓ Purchase tickets</p>
                    <p>✓ View my tickets</p>
                    <p>✓ Apply to become organizer</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 flex-shrink-0">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <LogOut size={16} className="mr-2" />
              Logout All
            </Button>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}


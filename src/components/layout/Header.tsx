'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { NAVIGATION_ITEMS } from '@/lib/constants'
import { useAuth } from '@/contexts/AuthContext'
import { useUser } from '@/contexts/UserContext'
import DemoUserSwitcher from '@/components/demo/DemoUserSwitcher'
import NotificationBell from './NotificationBell'

const Header = () => {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [showDemoSwitcher, setShowDemoSwitcher] = useState(false)
  const { openAuthModal } = useAuth()
  const { isAuthenticated, user, logout } = useUser()

  const handleLogout = () => {
    logout()
    setIsProfileDropdownOpen(false)
    // Use replace to ensure we go to home and prevent back navigation
    router.replace('/')
  }

  const handleDashboardClick = () => {
    setIsProfileDropdownOpen(false)
    router.push('/dashboard')
  }

  return (
    <motion.header 
      className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0"
          >
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Eventify
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {NAVIGATION_ITEMS.map((item) => (
              <motion.div key={item.name} whileHover={{ y: -2 }}>
                <Link
                  href={item.href}
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <NotificationBell />
                
                {/* Profile Dropdown */}
                <div 
                  className="relative"
                  onMouseEnter={() => setIsProfileDropdownOpen(true)}
                  onMouseLeave={() => setIsProfileDropdownOpen(false)}
                >
                  {/* Profile Icon */}
                  <button
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 hover:bg-primary-200 transition-colors border-2 border-primary-300"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name || 'User'}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User size={20} className="text-primary-600" />
                    )}
                  </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {user?.email || 'user@example.com'}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          onClick={handleDashboardClick}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LayoutDashboard size={16} className="text-gray-500" />
                          <span>Dashboard</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowDemoSwitcher(true)
                            setIsProfileDropdownOpen(false)
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User size={16} className="text-gray-500" />
                          <span>Switch User (Demo)</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={16} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openAuthModal('signin')}
                >
                  Sign In
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => openAuthModal('signup')}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 py-4"
          >
            <div className="flex flex-col space-y-4">
              {NAVIGATION_ITEMS.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    {/* Notification Bell for Mobile */}
                    <div className="px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Notifications</span>
                        <NotificationBell />
                      </div>
                    </div>
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">
                        Dashboard
                      </Button>
                    </Link>
                    <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-primary-50 border border-primary-200">
                      <User size={16} className="text-primary-600" />
                      <span className="text-sm font-medium text-primary-700">
                        {user?.name || 'User'}
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        openAuthModal('signin')
                        setIsMenuOpen(false)
                      }}
                    >
                      Sign In
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        openAuthModal('signup')
                        setIsMenuOpen(false)
                      }}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Demo User Switcher */}
      <DemoUserSwitcher
        isOpen={showDemoSwitcher}
        onClose={() => setShowDemoSwitcher(false)}
      />
    </motion.header>
  )
}

export default Header

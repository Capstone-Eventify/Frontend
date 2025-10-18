'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

type AuthMode = 'signin' | 'signup'
type UserType = 'attendee' | 'organizer'

interface AuthFormProps {
  onAuth?: (mode: AuthMode, userType: UserType, data: AuthData) => void
  className?: string
  initialMode?: AuthMode
  initialUserType?: UserType
}

interface AuthData {
  email: string
  password: string
  confirmPassword?: string
  firstName?: string
  lastName?: string
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuth, className, initialMode = 'signin', initialUserType = 'attendee' }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [userType, setUserType] = useState<UserType>(initialUserType)
  const [formData, setFormData] = useState<AuthData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  })
  const [errors, setErrors] = useState<Partial<AuthData>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name as keyof AuthData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<AuthData> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (mode === 'signup') {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required'
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required'
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onAuth?.(mode, userType, formData)
    }
  }

  const userTypeOptions = [
    { value: 'attendee', label: 'Attendee' },
    { value: 'organizer', label: 'Organiser' }
  ] as const

  return (
    <div className={cn("w-full max-w-sm mx-auto", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-primary-50 via-white to-primary-100/30 rounded-3xl shadow-2xl overflow-hidden border border-primary-200/50"
      >
        {/* Header */}
        <div className="px-8 py-8 text-center border-b border-primary-200/30 bg-gradient-to-r from-primary-600 to-primary-700 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent"></div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-white mb-1">Welcome to Eventify</h1>
            <p className="text-primary-100 text-sm">Sign in to your account or create a new one</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gradient-to-r from-primary-50/80 to-primary-100/50">
          <button
            onClick={() => setMode('signin')}
            className={cn(
              "flex-1 py-3 px-6 text-center font-medium text-sm transition-all duration-300 relative",
              mode === 'signin'
                ? "text-primary-700 bg-white shadow-lg border-b-2 border-primary-600"
                : "text-gray-600 hover:text-primary-600 hover:bg-white/50"
            )}
          >
            Sign In
            {mode === 'signin' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 to-primary-700"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
          <button
            onClick={() => setMode('signup')}
            className={cn(
              "flex-1 py-3 px-6 text-center font-medium text-sm transition-all duration-300 relative",
              mode === 'signup'
                ? "text-primary-700 bg-white shadow-lg border-b-2 border-primary-600"
                : "text-gray-600 hover:text-primary-600 hover:bg-white/50"
            )}
          >
            Sign Up
            {mode === 'signup' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 to-primary-700"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        </div>

        {/* Form Content */}
        <div className="p-8 bg-gradient-to-b from-white to-primary-50/30">
          {/* User Type Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 mb-4">
              I am an:
            </label>
            <div className="flex gap-3">
              {userTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setUserType(option.value)}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 border-2 relative overflow-hidden",
                    userType === option.value
                      ? "bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-600/25"
                      : "bg-white border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600 hover:shadow-md"
                  )}
                >
                  <span className="relative z-10">{option.label}</span>
                  {userType === option.value && (
                    <motion.div
                      layoutId="userTypeBg"
                      className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="signup-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="block text-sm font-semibold text-gray-900">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full px-4 py-3.5 border rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-gray-50/50",
                          errors.firstName ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-gray-300"
                        )}
                        placeholder="John"
                      />
                      {errors.firstName && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-xs font-medium"
                        >
                          {errors.firstName}
                        </motion.p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="block text-sm font-semibold text-gray-900">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full px-4 py-3.5 border rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-gray-50/50",
                          errors.lastName ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-gray-300"
                        )}
                        placeholder="Doe"
                      />
                      {errors.lastName && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-xs font-medium"
                        >
                          {errors.lastName}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={cn(
                  "w-full px-4 py-3.5 border rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-gray-50/50",
                  errors.email ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-gray-300"
                )}
                placeholder="john@example.com"
              />
              {errors.email && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs font-medium"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={cn(
                  "w-full px-4 py-3.5 border rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-gray-50/50",
                  errors.password ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-gray-300"
                )}
                placeholder="••••••••"
              />
              {errors.password && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs font-medium"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Confirm Password (Sign Up only) */}
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="confirm-password"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="space-y-2"
                >
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full px-4 py-3.5 border rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-gray-50/50",
                      errors.confirmPassword ? "border-red-300 bg-red-50/50" : "border-gray-200 hover:border-gray-300"
                    )}
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs font-medium"
                    >
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="pt-2"
            >
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary-600/25 transition-all duration-300"
              >
                {mode === 'signin' 
                  ? `Sign In as ${userType === 'attendee' ? 'Attendee' : 'Organiser'}`
                  : `Sign Up as ${userType === 'attendee' ? 'Attendee' : 'Organiser'}`
                }
              </Button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default AuthForm

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'live' | 'starting' | 'day' | 'success' | 'warning' | 'error' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'live', size = 'md', children, ...props }, ref) => {
    const baseClasses = "inline-flex items-center rounded-full font-semibold"
    
    const sizeClasses = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-3 py-1 text-xs",
      lg: "px-4 py-1.5 text-sm"
    }
    
    const variants = {
      live: "bg-primary-600 text-white",
      starting: "bg-primary-600 text-white",
      day: "bg-primary-600 text-white",
      success: "bg-green-100 text-green-800",
      warning: "bg-yellow-100 text-yellow-800",
      error: "bg-red-100 text-red-800",
      outline: "border border-gray-300 text-gray-700 bg-white"
    }

    return (
      <motion.div
        ref={ref}
        className={cn(baseClasses, sizeClasses[size], variants[variant], className)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

Badge.displayName = "Badge"

export { Badge }

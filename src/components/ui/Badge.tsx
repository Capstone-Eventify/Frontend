'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'live' | 'starting' | 'day'
  className?: string
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'live', children, ...props }, ref) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
    
    const variants = {
      live: "bg-primary-600 text-white",
      starting: "bg-primary-600 text-white",
      day: "bg-primary-600 text-white"
    }

    return (
      <motion.div
        ref={ref}
        className={cn(baseClasses, variants[variant], className)}
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

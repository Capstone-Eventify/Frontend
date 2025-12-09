'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { useAuth } from '@/contexts/AuthContext'
import { useUser } from '@/contexts/UserContext'

const CTASection = () => {
  const router = useRouter()
  const { openAuthModal } = useAuth()
  const { isAuthenticated, canCreateEvents, isOrganizer } = useUser()
  const [confettiPositions, setConfettiPositions] = useState<Array<{left: number, top: number, x: number, duration: number, delay: number}>>([])

  // Generate random positions only on client to avoid hydration mismatch
  useEffect(() => {
    setConfettiPositions(
      Array.from({ length: 20 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        x: Math.random() * 20 - 10,
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 2,
      }))
    )
  }, [])

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800" />
      
      {/* Confetti Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confettiPositions.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-60"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, pos.x, 0],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: pos.duration,
              repeat: Infinity,
              delay: pos.delay,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="space-y-8"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight px-4"
          >
            Ready to Create Your Next Event?
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-primary-100 max-w-3xl mx-auto leading-relaxed px-4"
          >
            Join thousands of successful event organizers who trust Eventify to bring their vision to life.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="pt-8"
          >
            <Button
              variant="outline"
              size="lg"
              className="bg-white text-primary-600 hover:bg-primary-50 border-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold w-full sm:w-auto"
              onClick={() => {
                if (isAuthenticated && (canCreateEvents || isOrganizer)) {
                  // Navigate directly to dashboard create event page
                  router.push('/dashboard?tab=organizer&create=true')
                } else if (isAuthenticated) {
                  // User is logged in but not an organizer - navigate to profile to apply
                  router.push('/dashboard?tab=profile')
                } else {
                  // Not logged in - open signup modal
                  openAuthModal('signup')
                }
              }}
            >
              Start Creating Events
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default CTASection

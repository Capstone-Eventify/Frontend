'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { useAuth } from '@/contexts/AuthContext'
import { useUser } from '@/contexts/UserContext'
import DemoUserSwitcher from '@/components/demo/DemoUserSwitcher'
import { Users } from 'lucide-react'

const HeroSection = () => {
  const router = useRouter()
  const { openAuthModal } = useAuth()
  const { isAuthenticated } = useUser()
  const [showDemoSwitcher, setShowDemoSwitcher] = useState(false)

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
          >
            Professional Event Management
            <br />
            <span className="text-primary-400">Made Simple</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed"
          >
            Create, manage, and sell tickets for events of any size. From intimate gatherings to large conferences, Eventify provides all the tools you need.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
          >
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 text-lg"
              onClick={() => {
                if (isAuthenticated) {
                  router.push('/dashboard?tab=events')
                } else {
                  // Scroll to events section on home page
                  const eventsSection = document.getElementById('live-events-section')
                  if (eventsSection) {
                    eventsSection.scrollIntoView({ behavior: 'smooth' })
                  } else {
                    router.push('/#live-events-section')
                  }
                }
              }}
            >
              Find Events
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg"
              onClick={() => openAuthModal('signup')}
            >
              Create Event
            </Button>
            {!isAuthenticated && (
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white/50 text-white/90 hover:bg-white/10 hover:text-white px-8 py-4 text-lg"
                onClick={() => setShowDemoSwitcher(true)}
              >
                <Users size={20} className="mr-2" />
                Try Demo Users
              </Button>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Demo User Switcher */}
      <DemoUserSwitcher
        isOpen={showDemoSwitcher}
        onClose={() => setShowDemoSwitcher(false)}
      />

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-10 w-4 h-4 bg-primary-400 rounded-full opacity-60"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-40 right-20 w-6 h-6 bg-white rounded-full opacity-40"
        />
        <motion.div
          animate={{
            y: [0, -15, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-40 left-20 w-3 h-3 bg-primary-300 rounded-full opacity-50"
        />
      </div>
    </section>
  )
}

export default HeroSection

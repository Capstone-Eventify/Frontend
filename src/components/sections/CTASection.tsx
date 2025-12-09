'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { fadeInUp, staggerContainer } from '@/lib/motion'

const CTASection = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800" />
      
      {/* Confetti Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
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
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
          >
            Ready to Create Your Next Event?
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto leading-relaxed"
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
              className="bg-white text-primary-600 hover:bg-primary-50 border-white px-8 py-4 text-lg font-semibold"
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

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { MapPin, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { liveEvents } from '@/data/events'
import { fadeInUp, staggerContainer } from '@/lib/motion'

const LiveEventsSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="space-y-12"
        >
          {/* Section Header */}
          <motion.div
            variants={fadeInUp}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-600 font-semibold text-sm uppercase tracking-wider">
                Live Events
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Happening Now
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join these exciting events currently taking place.
            </p>
          </motion.div>

          {/* Events Grid */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {liveEvents.map((event, index) => (
              <motion.div
                key={event.id}
                variants={fadeInUp}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Event Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="live">
                      {event.status}
                    </Badge>
                  </div>
                </div>

                {/* Event Content */}
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {event.description}
                    </p>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={16} />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={16} />
                      <span>{event.timeInfo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users size={16} />
                      <span>{event.attendees.toLocaleString()} attending</span>
                    </div>
                  </div>

                  {/* Price and Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-2xl font-bold text-primary-600">
                      {event.price}
                    </div>
                    <Button
                      variant={event.buttonVariant}
                      size="sm"
                      className="flex-shrink-0"
                    >
                      {event.buttonText}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* View All Button */}
          <motion.div
            variants={fadeInUp}
            className="text-center"
          >
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-3"
            >
              View All Live Events
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default LiveEventsSection

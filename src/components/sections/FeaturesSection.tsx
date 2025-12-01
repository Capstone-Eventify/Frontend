'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  BarChart3, 
  Smartphone, 
  Globe, 
  Shield, 
  Headphones 
} from 'lucide-react'
import { features } from '@/data/features'
import { fadeInUp, staggerContainer } from '@/lib/motion'

const FeaturesSection = () => {
  const iconMap = {
    checkmark: CheckCircle,
    chart: BarChart3,
    mobile: Smartphone,
    globe: Globe,
    shield: Shield,
    support: Headphones
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="space-y-16"
        >
          {/* Section Header */}
          <motion.div
            variants={fadeInUp}
            className="text-center space-y-4"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 px-4">
              Everything You Need to Succeed
            </h2>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => {
              const IconComponent = iconMap[feature.icon as keyof typeof iconMap]
              
              return (
                <motion.div
                  key={feature.id}
                  variants={fadeInUp}
                  className="group text-center space-y-4 p-6 rounded-2xl hover:bg-gray-50 transition-colors duration-300"
                >
                  {/* Icon */}
                  <motion.div
                    className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary-200 transition-colors duration-300"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <IconComponent className="w-8 h-8 text-primary-600" />
                  </motion.div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturesSection

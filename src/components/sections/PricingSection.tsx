'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { pricingPlans } from '@/data/pricing'
import { fadeInUp, staggerContainer } from '@/lib/motion'

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section id="pricing" className="py-20 bg-white">
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
              Choose Your Plan
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Start for free and scale as you grow. No hidden fees, no long-term contracts.
            </p>
          </motion.div>

          {/* Pricing Toggle */}
          <motion.div
            variants={fadeInUp}
            className="flex items-center justify-center"
          >
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  !isYearly
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isYearly
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
              </button>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                variants={fadeInUp}
                className={`relative rounded-2xl p-6 sm:p-8 ${
                  plan.popular
                    ? 'bg-primary-600 text-white shadow-2xl sm:scale-105'
                    : 'bg-white border border-gray-200 shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Plan Header */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className={`text-sm ${
                      plan.popular ? 'text-primary-100' : 'text-gray-600'
                    }`}>
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-center">
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold">{plan.price}</span>
                      <span className={`text-xl ml-1 ${
                        plan.popular ? 'text-primary-100' : 'text-gray-600'
                      }`}>
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <Check
                          className={`w-5 h-5 flex-shrink-0 ${
                            plan.popular ? 'text-primary-200' : 'text-primary-600'
                          }`}
                        />
                        <span className={`text-sm ${
                          plan.popular ? 'text-primary-100' : 'text-gray-600'
                        }`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Button */}
                  <Button
                    variant={plan.popular ? 'secondary' : 'primary'}
                    size="lg"
                    className={`w-full ${
                      plan.popular
                        ? 'bg-white text-primary-600 hover:bg-gray-100'
                        : ''
                    }`}
                  >
                    {plan.buttonText}
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default PricingSection

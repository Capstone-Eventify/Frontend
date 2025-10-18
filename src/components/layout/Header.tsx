'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { NAVIGATION_ITEMS } from '@/lib/constants'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false) 
  const [activeSection, setActiveSection] = useState<string>("home")

  useEffect(() => {
    const sectionsIds = NAVIGATION_ITEMS.map((item) => item.href.replace("#", ""))
    const footerEl = document.getElementById('footer')
  
    // We'll track which sections are currently visible
    const visibleSections = new Set<string>()
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute('id')
        if (!id) return
  
        if (entry.isIntersecting) {
          visibleSections.add(id)
        } else {
          visibleSections.delete(id)
        }
      })
  
      // Remove footer from activeSection if visible
      if (visibleSections.has('footer')) {
        setActiveSection('')
        return
      }
  
      // Check if any section (excluding footer) is visible, if yes set the one with highest visibility
      const visibleSectionIds = sectionsIds.filter(id => visibleSections.has(id))
  
      if (visibleSectionIds.length > 0) {
        // Optionally, pick the first visible section or do some prioritization
        setActiveSection(visibleSectionIds[0])
      } else {
        // If no sections visible (like top of page or footer), clear active
        setActiveSection('')
      }
  
    }, { threshold: 0.5 })
  
    // Observe all sections
    sectionsIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
  
    // Observe footer as well
    if (footerEl) observer.observe(footerEl)
  
    return () => {
      sectionsIds.forEach((id) => {
        const el = document.getElementById(id)
        if (el) observer.unobserve(el)
      })
      if (footerEl) observer.unobserve(footerEl)
    }
  }, [])
  
  
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
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
                    activeSection === item.href.replace('#', '')
                      ? 'border-primary-600 text-primary-600 font-semibold'
                      : 'border-transparent text-gray-700 hover:border-primary-600 hover:text-primary-600'
                  }`}
                >
                  {item.name}
                </Link>


              </motion.div>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
            <Button variant="primary" size="sm">
              Get Started
            </Button>
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
                onClick={() => setIsMenuOpen(false)}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
                  activeSection === item.href.replace('#', '')
                    ? 'border-primary-600 text-primary-600 font-semibold'
                    : 'border-transparent text-gray-700 hover:border-primary-600 hover:text-primary-600'
                }`}
              >
                {item.name}
              </Link>
              
              
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                <Button variant="outline" size="sm" className="w-full">
                  Sign In
                </Button>
                <Button variant="primary" size="sm" className="w-full">
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}

export default Header

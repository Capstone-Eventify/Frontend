import { Suspense } from 'react'
import HeroSection from '@/components/sections/HeroSection'
import LiveEventsSection from '@/components/sections/LiveEventsSection'
import FeaturesSection from '@/components/sections/FeaturesSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import PricingSection from '@/components/sections/PricingSection'
import CTASection from '@/components/sections/CTASection'
import AuthModalHandler from '@/components/auth/AuthModalHandler'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={null}>
        <AuthModalHandler />
      </Suspense>
      <HeroSection />
      <LiveEventsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
    </div>
  )
}

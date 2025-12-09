'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function AddTestEventsPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Adding events...')
  const [eventsAdded, setEventsAdded] = useState(0)

  useEffect(() => {
    const addEvents = () => {
      try {
        const today = new Date()
        const events = []

        // Generate 8 events spread over the next 2 weeks
        const eventTemplates = [
          {
            title: 'Tech Innovation Workshop',
            description: 'Join us for an exciting tech innovation workshop featuring industry experts and networking opportunities.',
            category: 'Technology',
            location: 'San Francisco, CA',
            address: '123 Innovation Drive',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            isOnline: false,
            price: 85,
            image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
          },
          {
            title: 'Business Networking Mixer',
            description: 'Join us for an exciting business networking mixer featuring industry experts and networking opportunities.',
            category: 'Business',
            location: 'New York, NY',
            address: '456 Broadway',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            isOnline: false,
            price: 0,
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
          },
          {
            title: 'Yoga & Wellness Retreat',
            description: 'Join us for an exciting yoga & wellness retreat featuring industry experts and networking opportunities.',
            category: 'Health & Wellness',
            location: 'Los Angeles, CA',
            address: '789 Sunset Blvd',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90028',
            isOnline: false,
            price: 45,
            image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
          },
          {
            title: 'Art Gallery Opening',
            description: 'Join us for an exciting art gallery opening featuring industry experts and networking opportunities.',
            category: 'Arts & Culture',
            location: 'Chicago, IL',
            address: '321 Michigan Ave',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            isOnline: false,
            price: 35,
            image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
          },
          {
            title: 'Startup Pitch Night',
            description: 'Join us for an exciting startup pitch night featuring industry experts and networking opportunities.',
            category: 'Business',
            location: 'Austin, TX',
            address: '654 Congress Ave',
            city: 'Austin',
            state: 'TX',
            zipCode: '78701',
            isOnline: false,
            price: 25,
            image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
          },
          {
            title: 'Photography Masterclass',
            description: 'Join us for an exciting photography masterclass featuring industry experts and networking opportunities.',
            category: 'Entertainment',
            location: 'Seattle, WA',
            address: '987 Pike St',
            city: 'Seattle',
            state: 'WA',
            zipCode: '98101',
            isOnline: false,
            price: 95,
            image: 'https://images.unsplash.com/photo-1478146896981-0b1410c32746?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
          },
          {
            title: 'Food & Wine Tasting',
            description: 'Join us for an exciting food & wine tasting featuring industry experts and networking opportunities.',
            category: 'Food & Drink',
            location: 'Online Event',
            isOnline: true,
            meetingLink: 'https://zoom.us/j/123456789',
            price: 120,
            image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
          },
          {
            title: 'Music Festival',
            description: 'Join us for an exciting music festival featuring industry experts and networking opportunities.',
            category: 'Entertainment',
            location: 'Online Event',
            isOnline: true,
            meetingLink: 'https://zoom.us/j/123456789',
            price: 55,
            image: 'https://images.unsplash.com/photo-1478146896981-0b1410c32746?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
          }
        ]

        const formatDate = (date: Date): string => {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
        }

        const getRandomTime = (): string => {
          const hours = Math.floor(Math.random() * 8) + 9 // 9 AM to 5 PM
          const minutes = Math.random() < 0.5 ? 0 : 30
          const period = hours >= 12 ? 'PM' : 'AM'
          const displayHour = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours)
          return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`
        }

        const getEndTime = (startTime: string): string => {
          const [hour, min, period] = startTime.split(/[: ]/)
          let endHour = parseInt(hour)
          if (period === 'PM' && endHour !== 12) endHour += 12
          if (period === 'AM' && endHour === 12) endHour = 0
          endHour += 2 // 2 hours duration
          const displayHour = endHour > 12 ? endHour - 12 : (endHour === 0 ? 12 : endHour)
          return `${displayHour}:${min} ${endHour >= 12 ? 'PM' : 'AM'}`
        }

        // Create events spread over next 2 weeks
        for (let i = 0; i < 8; i++) {
          const eventDate = new Date(today)
          eventDate.setDate(today.getDate() + Math.floor(i * 2) + Math.floor(Math.random() * 2))
          
          if (eventDate > new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)) break
          
          const template = eventTemplates[i]
          const time = getRandomTime()
          const endTime = getEndTime(time)
          
          const event = {
            id: `event_${Date.now()}_${i}`,
            title: template.title,
            description: template.description,
            fullDescription: `This comprehensive event brings together professionals and enthusiasts in ${template.category.toLowerCase()}. Learn from industry leaders, network with peers, and gain valuable insights. Perfect for anyone looking to expand their knowledge and connections.`,
            date: formatDate(eventDate),
            time: time,
            endTime: endTime,
            location: template.location,
            address: template.address,
            city: template.city,
            state: template.state,
            zipCode: template.zipCode,
            country: 'USA',
            isOnline: template.isOnline,
            meetingLink: template.meetingLink,
            category: template.category,
            image: template.image,
            price: template.price === 0 ? 'FREE' : `$${template.price}`,
            ticketTiers: template.price === 0 ? [
              {
                id: `tier_${i}_1`,
                name: 'Free Pass',
                price: 0,
                quantity: 500,
                available: Math.floor(Math.random() * 300) + 100,
                description: 'Access to all sessions'
              }
            ] : [
              {
                id: `tier_${i}_1`,
                name: 'Early Bird',
                price: Math.floor(template.price * 0.8),
                quantity: 100,
                available: Math.floor(Math.random() * 60) + 20,
                description: 'Limited time offer'
              },
              {
                id: `tier_${i}_2`,
                name: 'General Admission',
                price: template.price,
                quantity: 500,
                available: Math.floor(Math.random() * 300) + 100,
                description: 'Standard ticket'
              },
              {
                id: `tier_${i}_3`,
                name: 'VIP Pass',
                price: Math.floor(template.price * 2),
                quantity: 50,
                available: Math.floor(Math.random() * 30) + 10,
                description: 'Includes exclusive perks'
              }
            ],
            maxAttendees: Math.floor(Math.random() * 1000) + 200,
            attendees: Math.floor(Math.random() * 200) + 50,
            status: 'upcoming' as const,
            isFavorite: false,
            rating: parseFloat((Math.random() * 1 + 4).toFixed(1)),
            hasSeating: Math.random() < 0.3,
            organizer: {
              id: 'org1',
              name: 'Eventify Organizers',
              email: 'organizers@eventify.com',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
              bio: 'Creating amazing events for the community'
            },
            tags: [template.category, 'Networking'],
            requirements: 'No special requirements',
            refundPolicy: 'Full refund available up to 7 days before the event',
            createdAt: new Date().toISOString(),
            organizerId: 'org1'
          }

          events.push(event)
        }

        // Create events via API
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
        const token = localStorage.getItem('token')
        
        if (!token) {
          setStatus('error')
          setMessage('Please sign in to create events. This page requires authentication.')
          return
        }

        let successCount = 0
        let errorCount = 0

        // Create each event via API
        for (const event of events) {
          try {
            // Format event for API
            const eventPayload: any = {
              title: event.title,
              description: event.description,
              fullDescription: event.fullDescription || event.description,
              category: event.category,
              eventType: event.category,
              date: event.date,
              time: event.time,
              endDate: event.endDate || null,
              endTime: event.endTime || null,
              isOnline: event.isOnline,
              venueName: event.location,
              address: event.address,
              city: event.city,
              state: event.state,
              zipCode: event.zipCode,
              country: event.country,
              meetingLink: event.meetingLink || null,
              image: event.image,
              price: typeof event.price === 'string' ? parseFloat(event.price.replace('$', '').replace('FREE', '0')) : (event.price || 0),
              maxAttendees: event.maxAttendees,
              ticketTiers: event.ticketTiers || [],
              tags: event.tags || [],
              requirements: event.requirements,
              refundPolicy: event.refundPolicy,
              hasSeating: event.hasSeating || false,
              status: 'LIVE' // Set as LIVE so they're visible
            }

            const response = await fetch(`${apiUrl}/api/events`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(eventPayload)
            })

            if (response.ok) {
              successCount++
            } else {
              errorCount++
              const errorData = await response.json().catch(() => ({}))
              console.error(`Failed to create event "${event.title}":`, errorData.message || 'Unknown error')
            }
          } catch (error) {
            errorCount++
            console.error(`Error creating event "${event.title}":`, error)
          }
        }

        if (successCount > 0) {
          setEventsAdded(successCount)
          setMessage(`Successfully created ${successCount} ${successCount === 1 ? 'event' : 'events'}${errorCount > 0 ? ` (${errorCount} failed)` : ''}!`)
          setStatus('success')
        } else {
          setStatus('error')
          setMessage(`Failed to create events. ${errorCount > 0 ? 'Please check the console for details.' : 'Please ensure you are signed in as an organizer.'}`)
        }
      } catch (error: any) {
        setStatus('error')
        setMessage(`Error: ${error.message}`)
      }
    }

    addEvents()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
      >
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Events Added!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard
                <ArrowRight className="ml-2" size={16} />
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/')}
              >
                Go to Homepage
              </Button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}


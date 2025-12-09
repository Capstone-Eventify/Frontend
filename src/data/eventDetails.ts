import { EventDetail } from '@/types/event'

export const eventDetails: EventDetail[] = [
  {
    id: '1',
    title: 'Tech Innovation Summit 2024',
    description: 'Explore the latest in AI, blockchain, and emerging technologies with industry leaders.',
    fullDescription: 'Join us for the most comprehensive technology conference of the year. This three-day summit brings together industry leaders, innovators, and entrepreneurs to explore cutting-edge technologies including artificial intelligence, blockchain, quantum computing, and more. Network with peers, attend hands-on workshops, and gain insights from keynote speakers from top tech companies.',
    date: 'Dec 15, 2024',
    time: '9:00 AM',
    endDate: 'Dec 17, 2024',
    endTime: '6:00 PM',
    location: 'San Francisco, CA',
    address: '123 Innovation Drive',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'USA',
    isOnline: false,
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    price: '$89',
    ticketTiers: [
      { id: 'tier1', name: 'Early Bird', price: 69, quantity: 500, available: 234, description: 'Limited time offer' },
      { id: 'tier2', name: 'General Admission', price: 89, quantity: 2000, available: 1523, description: 'Standard ticket' },
      { id: 'tier3', name: 'VIP Pass', price: 199, quantity: 500, available: 90, description: 'Includes networking dinner' }
    ],
    maxAttendees: 3000,
    attendees: 2847,
    status: 'upcoming',
    isFavorite: false,
    rating: 4.8,
    hasSeating: false, // General admission - no assigned seats
    organizer: {
      id: 'org1',
      name: 'Tech Events Inc.',
      email: 'contact@techevents.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      bio: 'Leading technology event organizer with 10+ years of experience'
    },
    tags: ['AI', 'Blockchain', 'Innovation', 'Networking'],
    requirements: 'Laptop recommended for workshops',
    refundPolicy: 'Full refund available up to 7 days before the event',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    title: 'Digital Marketing Masterclass',
    description: 'Learn advanced strategies for social media, SEO, and content marketing from experts.',
    fullDescription: 'A comprehensive one-day masterclass covering all aspects of digital marketing. Learn from industry experts about social media strategies, SEO optimization, content creation, email marketing, and paid advertising. Perfect for marketers, business owners, and entrepreneurs looking to grow their online presence.',
    date: 'Dec 20, 2024',
    time: '2:00 PM',
    endTime: '6:00 PM',
    location: 'Online Event',
    isOnline: true,
    meetingLink: 'https://zoom.us/j/123456789',
    category: 'Marketing',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    price: 'FREE',
    ticketTiers: [
      { id: 'tier1', name: 'Free Pass', price: 0, quantity: 2000, available: 766, description: 'Access to all sessions' }
    ],
    maxAttendees: 2000,
    attendees: 1234,
    status: 'upcoming',
    isFavorite: false,
    rating: 4.6,
    hasSeating: false, // Online event - no seating
    organizer: {
      id: 'org2',
      name: 'Marketing Pro',
      email: 'hello@marketingpro.com',
      bio: 'Digital marketing experts helping businesses grow online'
    },
    tags: ['Marketing', 'SEO', 'Social Media', 'Content'],
    refundPolicy: 'Free event - no refunds needed',
    createdAt: '2024-02-01T00:00:00Z'
  },
  {
    id: '3',
    title: 'Global Design Conference',
    description: 'Three days of inspiring talks, workshops, and networking with top designers worldwide.',
    fullDescription: 'The premier design conference bringing together creative professionals from around the world. Experience inspiring keynote presentations, hands-on workshops, portfolio reviews, and networking opportunities with leading designers in UX/UI, graphic design, product design, and more.',
    date: 'Jan 5, 2025',
    time: '10:00 AM',
    endDate: 'Jan 7, 2025',
    endTime: '6:00 PM',
    location: 'New York, NY',
    address: '456 Design Avenue',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
    isOnline: false,
    category: 'Design',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    price: '$149',
    ticketTiers: [
      { id: 'tier1', name: 'Student Pass', price: 99, quantity: 200, available: 45, description: 'Valid student ID required' },
      { id: 'tier2', name: 'General Admission', price: 149, quantity: 5000, available: 3789, description: 'Full conference access' },
      { id: 'tier3', name: 'VIP Experience', price: 299, quantity: 200, available: 67, description: 'Includes exclusive dinner and meet & greet' }
    ],
    maxAttendees: 6000,
    attendees: 5621,
    status: 'upcoming',
    isFavorite: false,
    rating: 4.9,
    hasSeating: true, // Conference with assigned seating
    organizer: {
      id: 'org3',
      name: 'Design Collective',
      email: 'info@designcollective.com',
      bio: 'Celebrating design excellence worldwide'
    },
    tags: ['Design', 'UX/UI', 'Creative', 'Workshop'],
    requirements: 'Portfolio review available for VIP ticket holders',
    refundPolicy: '50% refund up to 14 days before event',
    createdAt: '2024-03-10T00:00:00Z'
  },
  {
    id: '4',
    title: 'Startup Pitch Competition',
    description: 'Watch innovative startups pitch their ideas to a panel of investors and industry experts.',
    fullDescription: 'An exciting afternoon of innovation where early-stage startups compete for funding and mentorship opportunities. Watch live pitches, network with investors, and connect with fellow entrepreneurs. Winners receive cash prizes and mentorship from top VCs.',
    date: 'Jan 12, 2025',
    time: '1:00 PM',
    endTime: '4:00 PM',
    location: 'Austin, TX',
    address: '789 Startup Street',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    country: 'USA',
    isOnline: false,
    category: 'Business',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    price: '$25',
    ticketTiers: [
      { id: 'tier1', name: 'General Admission', price: 25, quantity: 500, available: 44, description: 'Watch the competition' }
    ],
    maxAttendees: 500,
    attendees: 456,
    status: 'upcoming',
    isFavorite: false,
    rating: 4.7,
    hasSeating: false, // Networking event - general admission
    organizer: {
      id: 'org4',
      name: 'Startup Hub',
      email: 'contact@startuphub.com',
      bio: 'Supporting the next generation of entrepreneurs'
    },
    tags: ['Startup', 'Pitch', 'Investment', 'Networking'],
    refundPolicy: 'Full refund up to 24 hours before event',
    createdAt: '2024-04-05T00:00:00Z'
  }
]

export const getEventById = (id: string): EventDetail | undefined => {
  return eventDetails.find(event => event.id === id)
}


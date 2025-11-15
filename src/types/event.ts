export interface TicketTier {
  id: string
  name: string
  price: number
  description?: string
  quantity?: number // Total quantity available for this tier
  available?: number // Remaining quantity available for this tier
}

export interface WaitlistEntry {
  id: string
  eventId: string
  userId: string
  userName: string
  userEmail: string
  ticketTierId: string
  ticketTierName: string
  quantity: number
  requestedAt: string
  status: 'pending' | 'approved' | 'rejected'
  notes?: string
}

export interface EventDetail {
  id: string
  title: string
  description: string
  fullDescription: string
  date: string
  time: string
  endDate?: string
  endTime?: string
  location: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  isOnline: boolean
  meetingLink?: string
  category: string
  image: string
  images?: string[]
  price: string
  ticketTiers: TicketTier[]
  maxAttendees: number
  attendees: number
  status: 'upcoming' | 'live' | 'ended' | 'cancelled'
  isFavorite?: boolean
  rating?: number
  hasSeating?: boolean // Whether the event has assigned seating
  organizer: {
    id: string
    name: string
    email: string
    avatar?: string
    bio?: string
  }
  tags?: string[]
  requirements?: string
  refundPolicy?: string
  createdAt: string
}


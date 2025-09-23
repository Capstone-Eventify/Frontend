export interface Event {
  id: string
  title: string
  description: string
  location: string
  price: string
  attendees: number
  status: "LIVE NOW" | "STARTING NOW" | "DAY 2 LIVE"
  timeInfo: string
  image: string
  buttonText: string
  buttonVariant: "primary" | "secondary"
}

export const liveEvents: Event[] = [
  {
    id: "1",
    title: "Tech Innovation Summit 2024",
    description: "Explore the latest in AI, blockchain, and emerging technologies with industry leaders.",
    location: "San Francisco, CA",
    price: "$89",
    attendees: 2847,
    status: "LIVE NOW",
    timeInfo: "Started 2 hours ago",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    buttonText: "Start Creating Events",
    buttonVariant: "primary"
  },
  {
    id: "2",
    title: "Digital Marketing Masterclass",
    description: "Learn advanced strategies for social media, SEO, and content marketing from experts.",
    location: "Online Event",
    price: "FREE",
    attendees: 1234,
    status: "STARTING NOW",
    timeInfo: "Starts in 16 minutes",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    buttonText: "Register Now",
    buttonVariant: "secondary"
  },
  {
    id: "3",
    title: "Global Design Conference",
    description: "Three days of inspiring talks, workshops, and networking with top designers worldwide.",
    location: "New York, NY",
    price: "$149",
    attendees: 5621,
    status: "DAY 2 LIVE",
    timeInfo: "Day 2 of 3",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    buttonText: "Get Day Pass",
    buttonVariant: "primary"
  }
]

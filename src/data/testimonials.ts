export interface Testimonial {
  id: string
  name: string
  title: string
  content: string
  avatar: string
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    title: "Conference Director",
    content: "Eventify made organizing our annual conference incredibly smooth. The ticketing system is intuitive and the analytics helped us understand our audience better.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
  },
  {
    id: "2",
    name: "Michael Chen",
    title: "Festival Organizer",
    content: "Eventify made organizing our annual conference incredibly smooth. The ticketing system is intuitive and the analytics helped us understand our audience better.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    title: "Corporate Events",
    content: "Eventify made organizing our annual conference incredibly smooth. The ticketing system is intuitive and the analytics helped us understand our audience better.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  }
]
